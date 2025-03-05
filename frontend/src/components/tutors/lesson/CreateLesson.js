import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  ColorPicker,
  Form,
  InputNumber,
  Radio,
  Rate,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Upload,
  Spin,
} from 'antd';
import { toast, ToastContainer } from "react-toastify";

const CreateLesson = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme(); // Lấy theme từ context
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);

  const [formData, setFormData] = useState({
    number: "",
    title: "",
    description: "",
    video: null,
    document: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    const formDataToSend = new FormData();
    
    formDataToSend.append("number", formData.number);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    if (formData.video) formDataToSend.append("video", formData.video);
    if (formData.document) formDataToSend.append("document", formData.document);

    try {

      setSpinning(true);

      setPercent(0);
      
      let ptg = 0;
      const interval = setInterval(() => {
        ptg += 5;
        setPercent(ptg);
        if (ptg >= 100) {
          clearInterval(interval);
        }
      }, 100);

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
      toast.success("Lesson created successfully!");
      navigate(`/courses-list-tutor/${courseId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      console.error("Lỗi khi tạo bài học: ", err.response?.data?.message || err.message);
    }
    finally {
      setSpinning(false);
      setPercent(100);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
   <div className={`min-h-screen px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <Spin spinning={spinning} percent={percent} fullscreen />
      <h1 className="mb-4 text-xl font-semibold">Create New Lesson</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="number"
          placeholder="Lesson Number"
          value={formData.number}
          onChange={handleChange}
          required
          className={`w-full p-3 mb-3 rounded-md ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : " border-gray-300 text-gray-900"} border`}
        />
        <input
          type="text"
          name="title"
          placeholder="Lesson Title"
          value={formData.title}
          onChange={handleChange}
          required
          className={`w-full p-3 mb-3 rounded-md ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : " border-gray-300 text-gray-900"} border`}
        />
        <textarea
          name="description"
          placeholder="Lesson Description"
          value={formData.description}
          onChange={handleChange}
          required
          className={`w-full p-3 mb-3 rounded-md ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : " border-gray-300 text-gray-900"} border`}
        />
        <div className="mb-3">
          <label htmlFor="video" className="form-label">Upload Video:</label>
          <input
            type="file"
            name="video"
            accept="video/*"
            onChange={handleChange}
            className={`w-full p-3 mb-3 rounded-md ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : " border-gray-300 text-gray-900"} border`}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="document" className="form-label">Upload Document:</label>
          <input
            type="file"
            name="document"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className={`w-full p-3 mb-3 rounded-md ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : " border-gray-300 text-gray-900"} border`}
          />
        </div>
        
        <button 
          type="submit" 
          className={`w-full py-3 rounded-md ${theme === "dark" ? "bg-teal-500" : "bg-blue-500"} text-white`}
        >
          Create Lesson
        </button>
      </form>
    </div>
  );
};

export default CreateLesson;
