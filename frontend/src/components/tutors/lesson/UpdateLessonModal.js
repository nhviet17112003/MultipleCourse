import React, { useState } from "react";
import axios from "axios";

const UpdateLessonModal = ({ lesson, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ ...lesson });
  
console.log(lesson);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        `http://localhost:3000/api/lessons/${lesson._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdate(formData);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit} className="p-4">
        <h1>Update Lesson</h1>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
        <input
          type="text"
          value={formData.video_url}
          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
          required
        />
        <input
          type="text"
          value={formData.document_url}
          onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
          required
        />
        <button type="submit">Update</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default UpdateLessonModal;