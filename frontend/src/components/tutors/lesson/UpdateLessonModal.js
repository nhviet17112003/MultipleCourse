import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";  // Giả sử bạn có context ThemeContext

const UpdateLessonModal = ({ lesson, onClose, onUpdate }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    setDocumentFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Tạo FormData để gửi dữ liệu
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    
    if (videoFile) formData.append("video", videoFile);
    if (documentFile) formData.append("document", documentFile);

    // Gửi dữ liệu cho hàm cập nhật
    onUpdate(formData);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900 bg-opacity-80" : "bg-black bg-opacity-50"
      } z-50`}
    >
      <div
        className={`rounded-lg shadow-lg p-8 w-full sm:w-96 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-2xl font-semibold border-b-2 border-teal-500 pb-4 mb-4">
          Update Lesson
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-6 py-4 rounded-lg border 
                ${theme === "dark" 
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
                focus:outline-none`}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-6 py-4 rounded-lg border 
                ${theme === "dark" 
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
                focus:outline-none`}
              required
            ></textarea>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Video Upload</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className={`w-full px-6 py-4 rounded-lg border 
                ${theme === "dark" 
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
                focus:outline-none`}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Document Upload</label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleDocumentChange}
              className={`w-full px-6 py-4 rounded-lg border 
                ${theme === "dark" 
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"} 
                focus:outline-none`}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg mr-2 transition 
                ${theme === "dark" 
                  ? "bg-gray-500 text-white hover:bg-gray-400" 
                  : "bg-gray-300 text-gray-900 hover:bg-gray-400"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateLessonModal;
