import React, { useEffect, useState } from "react";

export default function Certificate() {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterName, setFilterName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const certificatesPerPage = 6;
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
      setCertificates(data.certificates);
      setFilteredCertificates(data.certificates);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Certificate URL copied to clipboard!");
  };

  const handleFilterChange = (date, name) => {
    let filtered = certificates;

    if (date) {
      filtered = filtered.filter(
        (cert) => new Date(cert.issue_date).toISOString().split("T")[0] === date
      );
    }

    if (name) {
      filtered = filtered.filter((cert) =>
        cert.course.title.toLowerCase().includes(name.toLowerCase())
      );
    }

    setFilteredCertificates(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(
    filteredCertificates.length / certificatesPerPage
  );
  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * certificatesPerPage,
    currentPage * certificatesPerPage
  );

  return (
    <div className="min-h-screen flex flex-col justify-start items-center bg-gradient-to-b from-[#14b8a6] to-indigo-200 p-6">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          📜 Certificate List
        </h1>

        <div className="mb-6 flex flex-col md:flex-row justify-center gap-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              handleFilterChange(e.target.value, filterName);
            }}
            className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="text"
            placeholder="Search by course name..."
            value={filterName}
            onChange={(e) => {
              setFilterName(e.target.value);
              handleFilterChange(filterDate, e.target.value);
            }}
            className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {paginatedCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedCertificates.map((certificate) => (
              <div
                key={certificate._id}
                className="p-6 bg-gradient-to-r from-teal-100 to-indigo-100 shadow-md rounded-lg transition-transform transform hover:scale-105"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {certificate.course.title}
                </h2>
                <p className="text-gray-700">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-md text-white ${
                      certificate.isPassed ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {certificate.isPassed ? "Passed" : "Failed"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <strong>Issued on:</strong>{" "}
                  {new Date(certificate.issue_date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 flex items-center">
                  <strong>Certificate URL:</strong>{" "}
                  <a
                    href={certificate.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold underline hover:text-blue-800 ml-2"
                  >
                    View Certificate
                  </a>
                  <button
                    onClick={() => copyToClipboard(certificate.certificate_url)}
                    className="ml-3 px-2 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                  >
                    Copy
                  </button>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-lg">
            ❌ No certificates available.
          </p>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 mx-2 rounded-lg ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {filteredCertificates.length > 0 ? currentPage : 0} of{" "}
            {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={
              currentPage === totalPages || filteredCertificates.length === 0
            }
            className={`px-4 py-2 mx-2 rounded-lg ${
              currentPage === totalPages || filteredCertificates.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
