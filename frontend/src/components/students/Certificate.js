import React, { useEffect, useState } from "react";

export default function Certificate() {
  const [certificates, setCertificates] = useState([]);
  const token = localStorage.getItem("authToken");

  const fetchCertificates = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/certificates/get-all-certificates",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Fetched certificates:", data);
      setCertificates(data.certificates); // Lấy mảng `certificates` từ JSON
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Certificate List</h1>

      {certificates.length > 0 ? (
        <div>
          {certificates.map((certificate) => (
            <div key={certificate._id} className="mb-4 p-4 border-b">
              <h2 className="text-xl font-semibold">
                {certificate.course.title}
              </h2>
              <p className="text-gray-600">
                <strong>Status:</strong> {certificate.isPassed ? "Passed" : "Failed"}
              </p>
              <p className="text-gray-600">
                <strong>Issued on:</strong>{" "}
                {new Date(certificate.issue_date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <strong>Certificate URL:</strong>{" "}
                <a
                  href={certificate.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Certificate
                </a>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No certificates available.</p>
      )}
    </div>
  );
}
