import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartId, setCartId] = useState(null); // Lưu trữ cartId
  const navigate = useNavigate(); // Khởi tạo navigate

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
    if (!cartId) {
      alert("Giỏ hàng không hợp lệ!");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/payment/create-payment/${cartId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Kiểm tra xem phản hồi có phải là một URL không
      const contentType = response.headers.get("Content-Type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json(); // Nếu là JSON, xử lý như trước
      } else {
        const text = await response.text(); // Nếu không phải JSON, đọc như text
        console.log("Response không phải JSON:", text);

        // Kiểm tra nếu phản hồi chứa một URL thanh toán
        if (text && text.startsWith("http")) {
          // Mở link thanh toán trong tab mới
          window.open(text, "_blank");
        } else {
          alert("Lỗi: Dữ liệu trả về không phải một URL hợp lệ.");
        }
        return;
      }

      if (response.ok) {
        console.log("Thanh toán thành công:", data);
        // Điều hướng tới trang thanh toán thành công hoặc trang khác nếu cần
        // navigate("/payment-success");
      } else {
        console.error("Lỗi khi thanh toán:", data.message || "Không rõ lỗi");
        alert(data.message || "Có lỗi xảy ra trong quá trình thanh toán.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API thanh toán:", error);
      alert("Có lỗi xảy ra khi gọi API thanh toán.");
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
          Quay lại
        </button>

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
              <button
                onClick={handlePayment}
                className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600"
              >
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
