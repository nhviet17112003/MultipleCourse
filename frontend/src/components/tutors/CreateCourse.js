import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const CreateCourse = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      setTimeout(() => {
        navigate("/login"); // Điều hướng đến trang đăng nhập nếu không có token
      }, 2000); // Đợi 2 giây trước khi chuyển hướng
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
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("category", data.category);
      if (data.image[0]) {
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

      alert("Course created successfully!");
      reset();
      setImagePreview(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-course">
      <h1>Create a New Course</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="title">Course Title</label>
          <input
            type="text"
            id="title"
            {...register("title", { required: true })}
            placeholder="Enter course title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            {...register("description", { required: true })}
            placeholder="Enter course description"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            {...register("price", { required: true, min: 0 })}
            placeholder="Enter course price"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            {...register("category", { required: true })}
            placeholder="Enter course category"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Course Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            {...register("image")}
            onChange={handleImageChange}
          />
          {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create Course"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
