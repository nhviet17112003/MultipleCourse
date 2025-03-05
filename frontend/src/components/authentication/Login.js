import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // Cho thông báo tài khoản/mật khẩu
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatarUrl] = useState(false);
  const key = "6LcI9ukqAAAAAGiqY3Yy7D43OWEXNXPxpcakTefC";

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (token && role) {
      navigate(
        role.toLowerCase() === "tutor" ? "/courses-list-tutor" : "/homescreen"
      );
    }
  }, []);

  useEffect(() => {
    if (isSubmitting) {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("role");

      if (token && role) {
        navigate(
          role.toLowerCase() === "tutor" ? "/courses-list-tutor" : "/homescreen"
        );
      }
    }
  }, [isSubmitting, navigate]);

  // // Hàm kiểm tra Username
  // const validateUsername = (username) => {
  //   if (username.trim().length === 0) {
  //     return "Username cannot be blank.";
  //   }
  //   if (username.length < 4) {
  //     return "Username must be at least 4 characters.";
  //   }
  //   return "";
  // };

  // // Hàm kiểm tra Password
  // const validatePassword = (password) => {
  //   if (password.length < 6) {
  //     return "Password must be at least 6 characters.";
  //   }
  //   return "";
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Ngăn spam nút đăng nhập

    if (!username || username.length < 4) {
      setError("Username must be at least 4 characters.");
      return;
    }

    if (!password || password.length < 3) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!captchaValue) {
      setError("Please complete reCAPTCHA.");
      return;
    }
    setError("");
    setIsLoading(true);
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        { username, password, recaptchaToken: captchaValue }
      );

      if (response.status === 200) {
        const { user_id, token, role, fullname, status, tutor_certificates } =
          response.data;

        if (!status) {
          setError("Account has been BANNED");
          setIsSubmitting(false);
          setIsLoading(false);
          return;
        }

        localStorage.setItem("authToken", token);
        localStorage.setItem("fullname", fullname);
        localStorage.setItem("role", role);

        setSuccessMessage("Login successfully!");
        console.log("Cert: ", tutor_certificates);

        setTimeout(() => {
          if (
            role.toLowerCase() === "tutor" &&
            (!tutor_certificates || tutor_certificates.length === 0)
          ) {
            navigate(`/uploadtutorcertificate/${user_id}`, { replace: true });
          } else {
            navigate("/courses-list-tutor");
          }
        }, 500);
      }
    } catch (err) {
      setError("Incorrect account or password.");
      setIsSubmitting(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpForStudent = () => {
    navigate("/signup", { state: { role: "Student" } });
  };

  const handleSignUpForTutor = () => {
    navigate("/signup", { state: { role: "Tutor" } });
  };

  const handleGoogleLogin = () => {
    // Mở trang đăng nhập Google
    window.open("http://localhost:3000/api/users/google/login", "_self");

    // Dùng polling để kiểm tra token trong cookie
    const checkToken = setInterval(() => {
      const token = getCookie("token"); // Hàm lấy token từ cookie
      if (token) {
        clearInterval(checkToken); // Dừng kiểm tra khi đã có token
        console.log("Đăng nhập thành công! Token:", token);
        window.location.href = "/homescreen"; // Chuyển đến trang Home
      }
    }, 500); // Kiểm tra mỗi 500ms
  };

  // Hàm để lấy cookie theo tên
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="bg-white rounded-2xl shadow-2xl flex w-2/3 max-w-4xl">
          <div className="w-3/5 p-5">
            <div className="text-left font-bold">
              <span className="text-green-500">Welcome to</span> MultiCourse
            </div>
            <div className="py-10">
              <h2 className="text-3xl font-bold text-green-500 mb-2">LOGIN</h2>
              <div className="border-2 w-10 border-green-500 inline-block mb-2"></div>
              <div className="flex justify-center my-2">
                {/* 
              login with gg */}
                <div className="flex justify-center mt-4 mb-4">
                  <button
                    className="flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    onClick={handleGoogleLogin}
                  >
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb3JJON85iCMGiuY2-fwef-kegI10la8ClXg&s"
                      alt="Google Logo"
                      className="w-5 h-5 mr-2"
                    />
                    Sign in with Google
                  </button>
                </div>

                {/* 
              login with gg */}
              </div>
              <p className="text-gray-400 my-3">or use your UserName account</p>
              <div className="flex flex-col items-center">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-600"
                    ></label>
                    <input
                      type="text"
                      id="username"
                      className="mt-2 p-3 pr-10 w-full border border-green-500 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your Username"
                      required
                    />
                  </div>

                  <div className="mb-2 relative">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-600"
                    ></label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="mt-2 p-3 pr-10 w-full border border-green-500 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Password"
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <div className="flex justify-between mb-6">
                    <button
                      type="button"
                      onClick={() => navigate("/forgetpassword")}
                      className="text-green-500 hover:underline focus:outline-none"
                    >
                      Forgot Password
                    </button>
                  </div>
                  {/* Thêm reCAPTCHA */}
                  <div className="mb-4">
                    <ReCAPTCHA
                      sitekey={key}
                      explicit={true}
                      onChange={(value) => setCaptchaValue(value)}
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm mb-4">{error}</div>
                  )}
                  {successMessage && (
                    <div className="text-green-500 text-sm mb-4">
                      {successMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="border-2 border-green-500 text-green-500 rounded-full px-12 py-2 inline-block font-semibold hover:bg-green-500 hover:text-white"
                  >
                    {isLoading ? "Loading..." : "Login"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="w-2/5 bg-green-500 text-white rounded-tr-2xl rounded-br-2xl py-36 px-12">
            <h2 className="text-3xl font-bold mb-2">HELLO</h2>
            <div className="border-2 w-10 border-white inline-block mb-2"></div>
            <p className="mb-10">
              Fill up personal information and start journey with us.
            </p>
            <button
              type="button"
              onClick={handleSignUpForStudent}
              className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-green-500 mb-4"
            >
              SIGN UP FOR STUDENT
            </button>
            <button
              type="button"
              onClick={handleSignUpForTutor}
              className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-green-500"
            >
              SIGN UP FOR TUTOR
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
