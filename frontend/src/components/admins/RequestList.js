import React, { useState, useEffect } from "react";

import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("authToken");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchRequests();
      console.log("token", token);
    } else {
      setError("User not authenticated.");
    }
  }, []);
console.log(requests,"requests");
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        
        "http://localhost:3000/api/requests/all-requests",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      
      const data = await response.json();
      console.log("API Response:", data);

      const sortedRequests = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.request_date) - new Date(a.request_date))
        : [];
      
      setRequests(sortedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId, status, requestType, message = "") => {
    let endpoint = "";
    let method = "POST";

    switch (true) {
      case requestType.includes("Created new course"):
        endpoint = "process-create-course";
        break;
      case requestType.includes("Updated course"):
        endpoint = "process-update-course";
        method = "PUT";
        break;
      case requestType.includes("Deleted course"):
        endpoint = "process-delete-course";
        method = "DELETE";
        break;
      default:
        alert("Invalid request type: " + requestType);
        return;
    }
    console.log("endpoint", endpoint);

    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/${endpoint}/${requestId}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, message }),
        }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      alert("Successfully processed request.");
      setIsModalOpen(false);
      setRejectReason("");
      await fetchRequests();
    } catch (err) {
      console.error("Error processing request:", err);
      alert("Failed to process request");
    }
    console.log("requestId", requestId);
    console.log("status", status);
    console.log("requestType", requestType);
    console.log("message", message);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Request List</h1>
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="px-4 py-2 border">Course ID</th>
              <th className="px-4 py-2 border">Request Type</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border">{request.course || "N/A"}</td>
                  <td className="px-4 py-2 border">{request.request_type || "N/A"}</td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-2 py-1 text-sm font-medium rounded-md ${
                        request.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex space-x-2">
                    {request.status === "Pending" && (
                      <>
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          onClick={() => handleProcessRequest(request._id, "Approved", request.request_type)}
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsModalOpen(true);
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-lg font-bold mb-4">Enter rejection reason</h2>
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="4"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={() => handleProcessRequest(selectedRequest._id, "Rejected", selectedRequest.request_type, rejectReason)}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
