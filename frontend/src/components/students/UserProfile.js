import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user data
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("You are not logged in. Please log in again.");
      navigate("/login"); // Redirect to login page
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserData(response.data); // Save user data
    } catch (err) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("authToken"); // Remove token
      navigate("/login"); // Redirect to login page
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle case when user tries to go back to login page after logging in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && window.location.pathname === "/login") {
      navigate("/userprofile"); // Redirect to UserProfile if already logged in
    }
  }, [navigate]);

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

      if (response.data && response.data.avatar) {
        setUserData({ ...userData, avatar: response.data.avatar });
      } else {
        setError("Failed to upload the avatar.");
      }
    } catch (err) {
      setError("Unable to update avatar.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
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

      if (response.data && response.data.success) {
        alert("Password has been changed successfully.");
        setShowChangePasswordModal(false);
      } else {
        setError(
          response.data.message || "Unable to change password. Please try again."
        );
      }
    } catch (err) {
      setError("An error occurred while changing the password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove token from localStorage
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg transition-all hover:shadow-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        User Information
      </h2>

      {userData ? (
        <div className="flex items-center mb-6 space-x-6">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <img
              src={userData.avatar || "/default-avatar.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover shadow-lg transition-transform transform hover:scale-105"
            />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }} // Hide file input
          />
          <div>
            <p className="text-xl font-semibold text-gray-700">
              {userData.name || "User's Name"}
            </p>
            <p className="text-gray-500">
              {userData.email || "email@example.com"}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No user information available.</p>
      )}

      {userData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Phone number:</strong>{" "}
              {userData.phone || "Not updated"}
            </p>
            <p>
              <strong>Gender:</strong> {userData.gender}
            </p>
          </div>

          <div>
            <p>
              <strong>Address:</strong> {userData.address || "Not updated"}
            </p>
            <p>
              <strong>Role:</strong> {userData.role}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {userData.status ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 focus:outline-none"
          onClick={() => navigate("/updateprofile")}
        >
          Edit Profile
        </button>
        <button
          className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
          onClick={() => setShowChangePasswordModal(true)} // Show pop-up when clicked
        >
          Change Password
        </button>
        <button
          className="ml-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
          onClick={handleLogout} // Add logout functionality
        >
          Logout
        </button>
      </div>

      {/* Change password pop-up */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Old Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter old password"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter new password"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Confirm new password"
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded"
                onClick={handleChangePassword}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowChangePasswordModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
