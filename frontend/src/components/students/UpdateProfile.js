import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    gender: "",
    address: "",
    birthday: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { fullname, phone, gender, address, birthday } = response.data;
        setFormData({
          fullname: fullname || "",
          phone: phone || "",
          gender: gender || "",
          address: address || "",
          birthday: birthday || "",
        });
      } catch (error) {
        setErrorMessage("Unable to retrieve user information.");
      }
    };

    fetchUserData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("User profile updated successfully!");
      setErrorMessage("");
      navigate("/userprofile"); // Redirect to UserProfile page after successful update
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Failed to update profile. Please try again.");
      } else {
        setErrorMessage("Network error occurred. Please check your connection.");
      }

      setSuccessMessage("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-700 mb-6">Update Profile</h2>

      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              className="mt-2 p-3 w-full border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-2 p-3 w-full border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-2 p-3 w-full border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-2 p-3 w-full border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Birthday</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              className="mt-2 p-3 w-full border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="submit"
            className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 focus:outline-none"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
