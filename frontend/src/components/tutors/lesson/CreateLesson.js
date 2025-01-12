import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CreateLesson = () => {
  const { courseId } = useParams(); // Lấy courseId từ URL
  const navigate = useNavigate(); // Điều hướng sau khi tạo bài học

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    number: "",
    title: "",
    description: "",
    video: null, // Định dạng file video
    document: null, // Định dạng file tài liệu
  });

  // Hàm xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    const formDataToSend = new FormData(); // Tạo đối tượng FormData để gửi dữ liệu

    // Thêm dữ liệu vào FormData
    formDataToSend.append("number", formData.number);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    if (formData.video) {
      formDataToSend.append("video", formData.video);
    }
    if (formData.document) {
      formDataToSend.append("document", formData.document);
    }

    try {
      // Gửi yêu cầu POST tới server
      await axios.post(
        `http://localhost:3000/api/lessons/create-lesson/${courseId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Điều hướng về trang course sau khi tạo bài học thành công
      navigate(`/courses-list-tutor/${courseId}`);
    } catch (err) {
      console.error("Lỗi khi tạo bài học: ", err.response?.data?.message || err.message);
    }
  };

  // Hàm xử lý thay đổi giá trị form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] }); // Lưu file vào state
    } else {
      setFormData({ ...formData, [name]: value }); // Lưu text input vào state
    }
  };

  return (
    <div className="create-lesson-container p-4">
      <h1 className="mb-4">Create New Lesson</h1>
      <form onSubmit={handleSubmit}>
        {/* Số bài học */}
        <input
          type="number"
          name="number"
          placeholder="Lesson Number"
          value={formData.number}
          onChange={handleChange}
          required
          className="form-input mb-3"
        />

        {/* Tiêu đề bài học */}
        <input
          type="text"
          name="title"
          placeholder="Lesson Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="form-input mb-3"
        />

        {/* Mô tả bài học */}
        <textarea
          name="description"
          placeholder="Lesson Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="form-textarea mb-3"
        />

        {/* Upload video */}
        <div className="mb-3">
          <label htmlFor="video" className="form-label">
            Upload Video:
          </label>
          <input
            type="file"
            name="video"
            accept="video/*"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {/* Upload tài liệu */}
        <div className="mb-3">
          <label htmlFor="document" className="form-label">
            Upload Document:
          </label>
          <input
            type="file"
            name="document"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {/* Nút tạo bài học */}
        <button type="submit" className="btn btn-primary">
          Create Lesson
        </button>
      </form>
    </div>
  );
};

export default CreateLesson;
