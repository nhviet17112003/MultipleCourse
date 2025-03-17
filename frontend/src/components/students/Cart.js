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
  const [deleteItemId, setDeleteItemId] = useState(null); // Thêm state mới
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Thêm state mới
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
        setCartItems((prevItems) => {
          const updatedItems = prevItems.filter(
            (item) => item.course._id !== itemId
          );

          const updatedTotalPrice = updatedItems.reduce(
            (total, item) => total + item.course.price,
            0
          );
          setTotalPrice(updatedTotalPrice);

          return updatedItems;
        });
        toast.success("Deleted successfully!"); // Thêm thông báo toast
      } else {
        const errorData = await response.json();
        toast.error("Failed to delete item!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast.error("Failed to delete item!");
    }
    setIsDeleteModalOpen(false); // Đóng modal sau khi xóa
  };

  // Thêm hàm mới để xử lý việc mở modal xác nhận xóa
  const openDeleteConfirmation = (itemId) => {
    setDeleteItemId(itemId);
    setIsDeleteModalOpen(true);
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
        setIsModalOpen(true);
      } else {
        const errorData = await response.json();
        console.error(
          "Lỗi khi tạo đơn hàng:",
          errorData.message || "Không rõ lỗi"
        );
        if (errorData.message === "Not enough balance") {
          toast.error("Not enough balance! ");
        } else {
          console.log(errorData.message);
          toast.error("Payment failed!");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      toast.error("Payment failed!");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🛒 My Cart</h1>

        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back to Home
        </button>

        {cartItems.length === 0 ? (
          <div className="mt-10 flex flex-col items-center">
            <p className="text-lg text-gray-600">Your cart is empty. 🛍️</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center">
                    <img
                      src={item.course.image}
                      alt={item.course.title}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm mr-4"
                    />
                    <div>
                      <p className="text-gray-800 text-lg font-medium">
                        {item.course.title}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Price:{" "}
                        <span className="text-teal-600 font-semibold">
                          {item.course.price} VND
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openDeleteConfirmation(item.course._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center mt-6 border-t pt-4">
              <p className="text-xl font-semibold text-gray-800">
                Total: <span className="text-teal-600">{totalPrice} VND</span>
              </p>
              <button
                onClick={handlePayment}
                className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition shadow-lg"
              >
                Pay Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal xác nhận xóa */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl text-center transform scale-105 w-[400px]">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-8">
              Are you sure you want to remove this course from your cart? This
              action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveItem(deleteItemId)}
                className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo mua hàng thành công */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl text-center transform scale-105">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🎉 Purchase Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully purchased this course. 🎓
            </p>
            <button
              onClick={() => {
                setIsModalOpen(false);
                navigate("/my-courses");
              }}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              🎯 Go to My Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
