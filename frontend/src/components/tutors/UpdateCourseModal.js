import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const UpdateCourseModal = ({ course, onClose, onUpdate }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    price: course.price,
    category: course.category,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...formData, _id: course._id });
  };

  return (
<div
  className={`fixed inset-0 flex items-center justify-center ${
    theme === "dark" ? "bg-gray-900 bg-opacity-80" : "bg-black bg-opacity-50"
  } z-50`}
>
  <div
    className={`rounded-lg shadow-lg p-6 w-96 ${
      theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
    }`}
  >
        <h2 className="text-2xl font-semibold border-b-2 border-teal-500 pb-4 mb-4">Update Course</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-6 py-4 rounded-lg border 
                ${theme === "dark" 
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
                focus:outline-none`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-6 py-4 rounded-lg border 
                ${theme === "dark" 
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
                focus:outline-none`}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-6 py-4 rounded-lg border 
                ${theme === "dark" 
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
                focus:outline-none`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-6 py-4 rounded-lg border 
                ${theme === "dark" 
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
                focus:outline-none`}
            >
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 ${
                theme === "dark" ? "bg-gray-500 text-white" : "bg-gray-300 text-gray-900"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCourseModal;
