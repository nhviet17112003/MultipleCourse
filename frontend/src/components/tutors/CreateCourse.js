import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spin } from "antd";
import { useTheme } from "../context/ThemeContext";

const CreateCourse = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG images are allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (!data.image || data.image.length === 0) {
      setImageError("Please upload an image.");
      toast.error("Please upload an image.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSpinning(true);
      setErrorMessage(null);
      setPercent(0);
      
      let ptg = 0;
      const interval = setInterval(() => {
        ptg += 5;
        setPercent(ptg);
        if (ptg >= 100) {
          clearInterval(interval);
        }
      }, 100);
  
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("category", data.category);
      formData.append("image", data.image[0]);
  
      await axios.post(
        "http://localhost:3000/api/courses/create-course",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
  
      toast.success("Course created successfully!");
      reset();
      setImagePreview(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "An error occurred");
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
      setSpinning(false);
      setPercent(100);
    }
  };
  

  return (
    <div className={`min-h-screen px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <Spin spinning={spinning} percent={percent} fullscreen />
      <form className={`w-full p-8 rounded-lg shadow-lg border ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`} onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-4xl font-bold text-left mb-8">Create New Course</h1>

        {errorMessage && <p className="text-red-500 text-center font-semibold mb-6">{errorMessage}</p>}

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">Course Title</label>
          <input
            type="text"
            {...register("title", { required: "Title is required" })}
            className="w-full px-6 py-4 rounded-lg border focus:outline-none"
          />
          {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className="w-full px-6 py-4 rounded-lg border focus:outline-none"
          ></textarea>
          {errors.description && <p className="text-red-500">{errors.description.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">Price</label>
          <input
            type="number"
            {...register("price", { required: "Price is required", min: { value: 0, message: "Price cannot be negative" } })}
            className="w-full px-6 py-4 rounded-lg border focus:outline-none"
          />
          {errors.price && <p className="text-red-500">{errors.price.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">Category</label>
          <select {...register("category", { required: "Please select a category" })} className="w-full px-6 py-4 rounded-lg border focus:outline-none">
            <option value="">Select category</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
          {errors.category && <p className="text-red-500">{errors.category.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">Upload Image</label>
          <input type="file" accept="image/*" {...register("image")} onChange={handleImageChange} className="block w-full text-sm rounded-lg cursor-pointer focus:outline-none" />
          {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 w-full h-48 object-cover border rounded-md" />}
        </div>

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-300" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create Course"}
        </button>
      </form>

      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
    </div>
  );
};

export default CreateCourse;
