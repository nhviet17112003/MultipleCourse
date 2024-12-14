import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); // State để hiển thị pop-up
  const [oldPassword, setOldPassword] = useState(""); // Mật khẩu cũ
  const [newPassword, setNewPassword] = useState(""); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // Xác nhận mật khẩu mới
  // Hàm fetch lại dữ liệu người dùng
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Vui lòng đăng nhập để xem thông tin người dùng.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
    } catch (err) {
      setError("Không thể lấy thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      fetchUserProfile();
    };
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("avatar", file);
  
    const token = localStorage.getItem("authToken");
  
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/users/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Kiểm tra phản hồi từ API, đảm bảo response.data.avatar có đường dẫn đúng
      if (response.data && response.data.avatar) {
        setUserData({ ...userData, avatar: response.data.avatar });
      } else {
        setError("Không thể tải ảnh lên.");
      }
    } catch (err) {
      setError("Không thể cập nhật ảnh đại diện.");
    } finally {
      setLoading(false);
    }
  };

   // Hàm xử lý thay đổi mật khẩu
   const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
  
    const token = localStorage.getItem("authToken");
  
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/users/change-password",
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log(response);  // In ra response để kiểm tra
  
      // Kiểm tra kỹ thông tin trong response
      if (response.data && response.data.success) {
        alert("Mật khẩu đã được thay đổi thành công.");
        setShowChangePasswordModal(false); // Đóng modal sau khi thay đổi mật khẩu thành công
      } else {
        setError(response.data.message || "Không thể thay đổi mật khẩu. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error changing password:", err);  // In lỗi nếu có
      setError("Có lỗi xảy ra khi thay đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-700 mb-6">Thông tin người dùng</h2>
  
      {userData ? (
        <div className="flex items-center mb-6">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <img
              src={userData.avatar || "/default-avatar.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover shadow-lg mr-6"
            />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }} // Ẩn input file đi
          />
          <div>
            <p className="text-xl font-semibold text-gray-800">{userData.fullname}</p>
            <p className="text-sm text-gray-500">{userData.username}</p>
          </div>
        </div>
      ) : (
        <p>Đang tải thông tin người dùng...</p>
      )}
  
      {userData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Số điện thoại:</strong> {userData.phone || "Chưa cập nhật"}</p>
            <p><strong>Giới tính:</strong> {userData.gender}</p>
          </div>
  
          <div>
            <p><strong>Địa chỉ:</strong> {userData.address || "Chưa cập nhật"}</p>
            <p><strong>Chức vụ:</strong> {userData.role}</p>
            <p><strong>Tình trạng:</strong> {userData.status ? "Kích hoạt" : "Không kích hoạt"}</p>
          </div>
        </div>
      )}
  
  <div className="mt-6 text-center">
        <button
          className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 focus:outline-none"
          onClick={() => navigate("/updateprofile")}
        >
          Chỉnh sửa thông tin
        </button>
        <button
          className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
          onClick={() => setShowChangePasswordModal(true)} // Hiển thị pop-up khi bấm nút
        >
          Thay đổi mật khẩu
        </button>
      </div>

      {/* Pop-up thay đổi mật khẩu */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Thay đổi mật khẩu</h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">Mật khẩu cũ</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nhập mật khẩu cũ"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Xác nhận mật khẩu mới"
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded"
                onClick={handleChangePassword}
              >
                Lưu
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowChangePasswordModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;