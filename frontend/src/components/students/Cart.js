import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartId, setCartId] = useState(null); // Lưu trữ cartId
  const navigate = useNavigate(); // Khởi tạo navigate
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          setCartId(data._id); // Lưu cartId từ API response
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
    console.log("Xóa sản phẩm có Course ID:", itemId);
    try {
      const response = await fetch(`http://localhost:3000/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Đã xóa sản phẩm thành công:", data);

        setCartItems((prevItems) => {
          const updatedItems = prevItems.filter(
            (item) => item.course._id !== itemId
          );

          // Tính lại tổng tiền
          const updatedTotalPrice = updatedItems.reduce(
            (total, item) => total + item.course.price,
            0
          );
          setTotalPrice(updatedTotalPrice);

          return updatedItems;
        });
      } else {
        const errorData = await response.json();
        console.error(
          "Lỗi khi xóa sản phẩm:",
          errorData.message || "Không rõ lỗi"
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/orders/create-order/${cartId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsModalOpen(true); // Mở modal khi thanh toán thành công
      } else {
        const errorData = await response.json();
        console.error(
          "Lỗi khi tạo đơn hàng:",
          errorData.message || "Không rõ lỗi"
        );
        toast.error("Payment failed!");
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      toast.error("Payment failed!");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Giỏ Hàng</h1>
        <button
          onClick={() => navigate("/")} // Quay lại HomeScreen
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Back
        </button>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
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
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-6">
              <p className="text-xl font-bold">TOTAL: {totalPrice} VND</p>
              <button
                onClick={handlePayment}
                className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600"
              >
                Pay
              </button>
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4">
              You have successfully purchased this course!
            </h2>
            <button
              onClick={() => {
                setIsModalOpen(false);
                navigate("/my-courses");
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
