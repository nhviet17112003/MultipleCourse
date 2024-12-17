import React, { useEffect, useState } from "react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Lấy giỏ hàng từ API
    const fetchCartItems = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/cart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();

        console.log("API Response:", data); // Kiểm tra phản hồi từ API

        if (response.ok && data.cart_items && Array.isArray(data.cart_items)) {
          setCartItems(data.cart_items);
          setTotalPrice(data.total_price); // Cập nhật tổng giá trị
        } else {
          console.log(
            "Lỗi khi lấy giỏ hàng:",
            data.message || "Không có giỏ hàng"
          );
          setCartItems([]); // Trả về giỏ hàng trống nếu không có dữ liệu
        }
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        setCartItems([]); // Trả về giỏ hàng trống nếu có lỗi
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveItem = async (itemId) => {
    console.log('Xóa sản phẩm có Course ID:', itemId);
    try {
      const response = await fetch(`http://localhost:3000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Đã xóa sản phẩm thành công:', data);
  
        // Cập nhật giỏ hàng sau khi xóa
        setCartItems(prevItems => {
          const updatedItems = prevItems.filter(item => item.course._id !== itemId);
  
          // Tính lại tổng tiền
          const updatedTotalPrice = updatedItems.reduce((total, item) => total + item.course.price, 0);
          setTotalPrice(updatedTotalPrice); // Cập nhật tổng tiền sau khi xóa sản phẩm
  
          return updatedItems;
        });
      } else {
        const errorData = await response.json();
        console.error('Lỗi khi xóa sản phẩm:', errorData.message || 'Không rõ lỗi');
      }
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Giỏ Hàng</h1>

        {cartItems.length === 0 ? (
          <p>Giỏ hàng của bạn đang trống.</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ul>
              {cartItems.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="flex items-center">
                    <img
                      src={item.course.image}
                      alt={item.course.title}
                      className="w-16 h-16 object-cover mr-4"
                    />
                    <span>{item.course.title}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.course._id)} // Sử dụng item.course._id
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-6">
              <p className="text-xl font-bold">Tổng tiền: {totalPrice} VND</p>
              <button className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600">
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
