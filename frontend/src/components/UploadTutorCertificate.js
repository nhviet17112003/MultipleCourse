import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Thêm hook useParams

const UploadTutorCertificate = () => {
  const { userId } = useParams(); // Lấy userId từ URL
  const [certificateUrl, setCertificateUrl] = useState(""); // Lưu URL chứng chỉ
  const [title, setTitle] = useState(""); // Lưu tên chứng chỉ
  const [loading, setLoading] = useState(false); // Trạng thái đang tải lên
  const [message, setMessage] = useState(""); // Thông báo lỗi hoặc thành công
  const [certificates, setCertificates] = useState([]); // Mảng lưu chứng chỉ

  useEffect(() => {
    if (userId) {
      console.log("User ID từ URL: ", userId); // Xác nhận userId đã lấy đúng
    }
  }, [userId]);

  // Hàm xử lý khi người dùng nhập URL chứng chỉ
  const handleUrlChange = (e) => {
    setCertificateUrl(e.target.value);
  };

  // Hàm xử lý khi người dùng nhập tiêu đề chứng chỉ
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Hàm gửi yêu cầu upload chứng chỉ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certificateUrl || !title) {
      setMessage("Please provide both certificate title and URL.");
      return;
    }

    const newCertificate = { title, certificate_url: certificateUrl };

    // Kiểm tra chứng chỉ có trong mảng chưa
    const isExist = certificates.some(
      (cert) =>
        cert.title === newCertificate.title && cert.certificate_url === newCertificate.certificate_url
    );

    if (!isExist) {
      setCertificates([...certificates, newCertificate]); // Thêm chứng chỉ mới vào mảng
      setCertificateUrl(""); // Clear URL input
      setTitle(""); // Clear Title input
    } else {
      setMessage("This certificate already exists.");
      return;
    }

    setLoading(true);
    try {
      // Gửi dữ liệu tới API, truyền userId vào endpoint
      const response = await axios.post(
        `http://localhost:3000/api/users/upload-certificate/${userId}`, // Sử dụng userId trong URL
        { certificates: [...certificates, newCertificate] }, // Gửi mảng chứng chỉ
        {
          headers: {
            "Content-Type": "application/json", // Đảm bảo gửi dưới dạng JSON
          },
        }
      );

      setLoading(false);
      setMessage(response.data.message);

      // Cập nhật lại danh sách chứng chỉ từ dữ liệu trả về từ API
      setCertificates(response.data.certificates); // Cập nhật danh sách chứng chỉ sau khi upload thành công
    } catch (error) {
      setLoading(false);
      setMessage("Failed to upload certificates. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Upload Tutor Certificates</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Certificate Title:</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter certificate title"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Certificate URL:</label>
          <input
            type="text"
            value={certificateUrl}
            onChange={handleUrlChange}
            placeholder="Enter certificate URL"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Upload Certificates"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}

      {/* Hiển thị các chứng chỉ đã thêm */}
      {certificates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Uploaded Certificates:</h3>
          <ul className="space-y-2">
            {certificates.map((cert, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="font-medium">{cert.title}</span> -{" "}
                <a
                  href={cert.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {cert.certificate_url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadTutorCertificate;
