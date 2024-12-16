  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";
  
  import { FaEye, FaEyeSlash } from "react-icons/fa";
  const Signup = () => {
    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsError, setTermsError] = useState("");
    const [role, setRole] = useState("Student"); // Thêm state role
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Hiển thị popup
    const [usernameError, setUsernameError] = useState("");  // State for username error
  const [emailError, setEmailError] = useState("");
    const navigate = useNavigate();
    
    const handleViewTerms = () => {
      alert(
        "Điều khoản và nội quy: \n1. Không được chia sẻ thông tin đăng nhập.\n2. Tôn trọng người dùng khác.\n3. Tuân thủ quy định của hệ thống."
      );
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      // Kiểm tra điều khoản trước
      if (!agreeTerms) {
        setTermsError("Bạn phải đồng ý với điều khoản để tiếp tục.");
        return;
      } else {
        setTermsError(""); // Reset thông báo điều khoản
      }
    
      if (password !== confirmPassword) {
        setError("Mật khẩu không khớp.");
        setTimeout(() => {
          setError(""); // Reset thông báo sau 3 giây
        }, 3000);
        return;
      }
    
      try {
        const response = await axios.post(
          "http://localhost:3000/api/users/signup",
          {
            fullname,
            username,
            email,
            phone,
            gender,
            birthday,
            address,
            password,
            role
          }
        );
    
        // Lưu ID người dùng
        const userId = response.data.user_id;  // Lấy ID từ response
        console.log(userId);
        setSuccessMessage("Đăng ký thành công!");
        setShowSuccessPopup(true); // Hiển thị popup
        setTimeout(() => {
          setShowSuccessPopup(false);
    
          // Kiểm tra lại role trước khi điều hướng
          if (role === "Tutor") {
            // Chuyển đến trang UploadTutorCertificate với id người dùng
            navigate(`/uploadtutorcertificate/${userId}`);
          } else {
            navigate("/login"); // Chuyển về trang đăng nhập nếu role là student
          }
        }, 3000); // 3 giây
      } catch (err) {
        setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
        setTimeout(() => {
          setError(""); // Reset thông báo sau 3 giây
        }, 3000);
      }
    };

    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 relative">
        {/* Popup thông báo */}
        {showSuccessPopup && (
          <div className="absolute top-10 bg-teal-500 text-white py-4 px-6 rounded-lg shadow-lg animate-fadeIn">
            Đăng ký thành công! Mời bạn đăng nhập.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg"
        >
          <h2 className="text-2xl font-semibold text-center mb-6">
            Sign Up
          </h2>

          {error && <div className="text-red-500 mb-4">{error}</div>}
          {successMessage && (
            <div className="text-green-500 mb-4">{successMessage}</div>
          )}

          <div className="mb-4">
            <label
              htmlFor="fullname"
              className="block text-sm font-medium text-gray-700"
            >
              Full name
            </label>
            <input
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Number Phone
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Order</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="birthday"
              className="block text-sm font-medium text-gray-700"
            >
              Birthday
            </label>
            <input
              type="date"
              id="birthday"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
                placeholder="Nhập mật khẩu"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[56%] transform -translate-y-1/2 text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="mb-4 relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[67%] transform -translate-y-1/2 text-gray-600 focus:outline-none"
              >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Choose Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
            required
          >
            <option value="Student">Student</option>
            <option value="Tutor">Tutor</option>
          </select>
        </div>

          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="agreeTerms"
              className="mr-2"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="agreeTerms" className="text-sm text-gray-600">
            I agree to the
              <button
                type="button"
                className="text-teal-400 hover:underline focus:outline-none ml-1"
                onClick={handleViewTerms}
              >
                terms
              </button>
            </label>
          </div>

          {termsError && (
            <p className="text-red-500 text-sm mt-2">{termsError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-teal-400 text-white py-3 rounded-full hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-300 mt-6"
          >
            SIGN UP
          </button>
        </form>
      </div>
    );
  };

  export default Signup;
