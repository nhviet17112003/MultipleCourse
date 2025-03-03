import React, { useState, useEffect } from "react";
import axios from "axios";
import { set, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Spin } from 'antd';
import { useTheme } from "../context/ThemeContext";
const CreateCourse = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [percent, setPercent] = useState(0);
  const { theme } = useTheme();

useEffect(() => {
 
    let ptg = -10;
    const interval = setInterval(() => {
      ptg += 5;
      setPercent(ptg);
      if (ptg > 120) {
        clearInterval(interval);
        setSpinning(false);
        setPercent(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      setTimeout(() => {
        navigate("/login"); // Redirect to login page if no token
      }, 2000); // Wait 2 seconds before redirecting
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (!data.title || !data.description || !data.price || !data.category) {
      toast.error("All fields are required!");
      return;
    }
    if (data.price < 0) {
      toast.error("Price must be greater than or equal to 0!");
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
      if (data.image?.[0]) {
        formData.append("image", data.image[0]);
      }
  
      const response = await axios.post(
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

  const handleFormSubmit = (data) => {
    console.log("Form data:", data); // Kiểm tra dữ liệu form
    if (!data.title) {
      toast.error("Course title is required!");
      return;
    }
    if (!data.description) {
      toast.error("Course description is required!");
      return;
    }
    if (!data.price || data.price < 0) {
      toast.error("Please enter a valid price!");
      return;
    }
    if (!data.category) {
      toast.error("Please select a category!");
      return;
    }
  
    onSubmit(data);
  };
  
  
  

  return (
    
    
    <div className={`min-h-screen px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
    <ToastContainer position="top-right" autoClose={3000} />
        <Spin spinning={spinning} percent={percent} fullscreen />
     {/* <form
  className={`w-full p-8 rounded-lg shadow-lg 
    ${theme === "dark" ? "border border-gray-600" : "border border-gray-300"}`}
  onSubmit={handleSubmit(onSubmit)}
> */}
<form
 className={`w-full p-8 rounded-lg shadow-lg 
  ${theme === "dark" ? "border border-gray-600" : "border border-gray-300"}`}

onSubmit={handleSubmit(handleFormSubmit)}>
  

<div className="flex justify-between items-center">        <h1 className="text-4xl font-bold text-left mb-8">
          Create New Course
        </h1>

        <div className="flex justify-center mb-8">
        <button
  type="submit"
  className={`font-semibold py-4 px-6 rounded-lg transition duration-300 
    ${theme === "dark" 
      ? "bg-green-700 hover:bg-green-600 text-white" 
      : "bg-green-600 hover:bg-green-700 text-white"}`}
  disabled={isSubmitting}
>
  
  {isSubmitting ? "Submitting..." : "Create Course"}
</button>

</div></div>

        {errorMessage && (
          <p className="text-red-500 text-center font-semibold mb-6">{errorMessage}</p>
        )}
<div className="border border-gray-300 p-6 rounded-lg shadow-sm">

<div className="mb-6">
        <label
  className={`block text-lg font-medium mb-2 ${
    theme === "dark" ? "text-gray-300" : "text-gray-700"
  }`}
>
  Course Title
</label>

          <input
            type="text"
            id="title"
            {...register("title", { required: true })}
            placeholder="Enter course title"
            className={`w-full px-6 py-4 rounded-lg border 
              ${theme === "dark" 
                ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
              focus:outline-none`}
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            {...register("description", { required: true })}
            placeholder="Enter course description"
            className={`w-full px-6 py-4 rounded-lg border 
              ${theme === "dark" 
                ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
              focus:outline-none`}
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Price
          </label>
          <input
            type="number"
            id="price"
            {...register("price", { required: true, min: 0 })}
            placeholder="Enter course price"
            className={`w-full px-6 py-4 rounded-lg border 
              ${theme === "dark" 
                ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
              focus:outline-none`}
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            {...register("category", { required: true })}
            className={`w-full px-6 py-4 rounded-lg border 
              ${theme === "dark" 
                ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
              focus:outline-none`}
          >
            <option value="">Select category</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <input
  type="file"
  id="image"
  accept="image/*"
  {...register("image")}
  onChange={handleImageChange}
  className={`block w-full text-sm rounded-lg cursor-pointer 
    ${theme === "dark" 
      ? " text-white focus:ring-teal-400" 
      : " text-gray-900 focus:ring-teal-500"} 
    focus:outline-none`}
/>
          {imagePreview && (
            <img
            src={imagePreview}
            alt="Preview"
            className={`mt-4 w-full h-48 object-cover border rounded-md ${
              theme === "dark" ? "border-gray-600" : "border-gray-300"
            }`}
          />
          
          )}
        </div>


</div>
       
      

      </form>

      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />

    </div>
  );
};

export default CreateCourse;
