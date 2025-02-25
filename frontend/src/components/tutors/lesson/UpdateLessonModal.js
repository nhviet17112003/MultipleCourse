import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const UpdateLessonModal = ({ lesson, onClose }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleDocumentChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  const handleUpdateClick = () => {
    setShowConfirmModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowConfirmModal(false);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (videoFile) formData.append("video", videoFile);
    if (documentFile) formData.append("document", documentFile);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:3000/api/lessons/${lesson._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update lesson");
      }

      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${
        theme === "dark"
          ? "bg-gray-900 bg-opacity-80"
          : "bg-black bg-opacity-50"
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

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-6 py-4 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400"
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"
              } focus:outline-none`}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-6 py-4 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-600 focus:ring-teal-400"
                  : "bg-white text-gray-900 border-gray-300 focus:ring-teal-500"
              } focus:outline-none`}
              required
            ></textarea>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Video Upload
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full px-6 py-4 rounded-lg border bg-white text-gray-900"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Document Upload
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleDocumentChange}
              className="w-full px-6 py-4 rounded-lg border bg-white text-gray-900"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg mr-2 bg-gray-300 text-gray-900 hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateClick}
              disabled={loading}
              className={`px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <p>Are you sure you want to update?</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 mr-2 bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-teal-500 text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <p>Lesson updated successfully!</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                className="px-4 py-2 bg-teal-500 text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateLessonModal;
