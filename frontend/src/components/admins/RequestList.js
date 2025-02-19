// import React, { useState, useEffect } from "react";

// export default function RequestList() {
//     const [requests, setRequests] = useState([]);
//     const token = localStorage.getItem("authToken");
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         fetchRequests();
//     }, []);

//     const fetchRequests = async () => {
//         setLoading(true);
//         try {
//             const response = await fetch("http://localhost:3000/api/requests/all-requests", {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error(`Error: ${response.status}`);
//             }

//             const data = await response.json();
//             console.log("Fetched requests:", data);
            
//             setRequests(Array.isArray(data) ? data : []);
//         } catch (err) {
//             console.error("Error fetching requests:", err);
//             setError("Failed to fetch requests.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleProcessRequest = async (requestId, status) => {
//         try {
//             console.log("requestId", requestId);
//             const response = await fetch(`http://localhost:3000/api/requests/process-create-course/${requestId}`, {
             
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ status }),
//             });

//             const result = await response.json();
//             if (response.ok) {
//                 alert(result.message);
//                 fetchRequests(); // Refresh the request list after processing
//             } else {
//                 alert(result.message);
//             }
//         } catch (err) {
//             console.error("Error processing request:", err);
//             alert("Failed to process request");
//         }
//     };

//     return (
//         <div className="container mx-auto p-6">
//             <h1 className="text-2xl font-bold mb-4">Request List</h1>
//             {loading && <p className="text-blue-500">Loading...</p>}
//             {error && <p className="text-red-500">{error}</p>}
//             <div className="overflow-x-auto">
//                 <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
//                     <thead className="bg-gray-100">
//                         <tr className="text-left">
//                             <th className="px-4 py-2 border">Request ID</th>
//                             <th className="px-4 py-2 border">Course ID</th>
//                             <th className="px-4 py-2 border">Request Type</th>
//                             <th className="px-4 py-2 border">Content</th>
//                             <th className="px-4 py-2 border">Status</th>
//                             <th className="px-4 py-2 border">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {requests.length > 0 ? (
//                             requests.map((request) => (
//                                 <tr key={request._id} className="border-t hover:bg-gray-50">
//                                     <td className="px-4 py-2 border">{request._id}</td>
//                                     <td className="px-4 py-2 border">{request.course}</td>
//                                     <td className="px-4 py-2 border">{request.request_type}</td>
//                                     <td className="px-4 py-2 border">
//                                         {request.content.length > 0
//                                             ? request.content.map((item, index) => (
//                                                   <div key={index} className="text-sm">
//                                                       <strong>{item.title}:</strong> {item.value}
//                                                   </div>
//                                               ))
//                                             : "No content"}
//                                     </td>
//                                     <td className="px-4 py-2 border">
//                                         <span
//                                             className={`px-2 py-1 text-sm font-medium rounded-md ${
//                                                 request.status === "Pending"
//                                                     ? "bg-yellow-100 text-yellow-800"
//                                                     : request.status === "Approved"
//                                                     ? "bg-green-100 text-green-800"
//                                                     : "bg-red-100 text-red-800"
//                                             }`}
//                                         >
//                                             {request.status}
//                                         </span>
//                                     </td>
//                                     <td className="px-4 py-2 border flex space-x-2">
//                                         {request.status === "Pending" && (
//                                             <>
//                                                 <button
//                                                     className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
//                                                     onClick={() => handleProcessRequest(request._id, "Approved")}
//                                                 >
//                                                     Approve
//                                                 </button>
//                                                 <button
//                                                     className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                                                     onClick={() => handleProcessRequest(request._id, "Rejected")}
//                                                 >
//                                                     Reject
//                                                 </button>
//                                             </>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td colSpan="6" className="px-4 py-2 text-center text-gray-500">
//                                     No requests found
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }


import React, { useState, useEffect } from "react";

export default function RequestList() {
    const [requests, setRequests] = useState([]);
    const token = localStorage.getItem("authToken");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            fetchRequests();
        } else {
            setError("User not authenticated.");
        }
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:3000/api/requests/all-requests", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("Failed to fetch requests.");
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRequest = async (requestId, status, requestType) => {
        let endpoint = "";
        let method = "POST";

        switch (true) {
            case requestType.includes("Created new course"):
                endpoint = "process-create-course";
                method = "POST";
                break;
            case requestType.includes("Update new course"):
                endpoint = "process-update-course";
                method = "PUT";
                break;
            case requestType.includes("Delete new course"):
                endpoint = "process-delete-course";
                method = "DELETE";
                break;
            default:
                alert("Invalid request type: " + requestType);
                return;
        }

        // const url = `http://localhost:3000/api/requests/${endpoint}/${requestId}`;

        try {
            const response = await fetch(`http://localhost:3000/api/requests/${endpoint}/${requestId}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: method !== "DELETE" ? JSON.stringify({ status }) : null,
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const result = await response.json();
            alert(result.message);
            await fetchRequests(); 
        } catch (err) {
            console.error("Error processing request:", err);
            alert("Failed to process request");
        }
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
                            <th className="px-4 py-2 border">Request ID</th>
                            <th className="px-4 py-2 border">Course ID</th>
                            <th className="px-4 py-2 border">Request Type</th>
                            <th className="px-4 py-2 border">Content</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map((request) => (
                                <tr key={request._id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2 border">{request._id}</td>
                                    <td className="px-4 py-2 border">{request.course || "N/A"}</td>
                                    <td className="px-4 py-2 border">{request.request_type || "N/A"}</td>
                                    <td className="px-4 py-2 border">
                                        {request.content && request.content.length > 0 ? (
                                            request.content.map((item, index) => (
                                                <div key={index} className="text-sm">
                                                    <strong>{item.title}:</strong> {item.value}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-gray-500">No content</span>
                                        )}
                                    </td>
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
                                                    onClick={() =>
                                                        handleProcessRequest(request._id, "Approved", request.request_type)
                                                    }
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                    onClick={() =>
                                                        handleProcessRequest(request._id, "Rejected", request.request_type)
                                                    }
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
                                <td colSpan="6" className="px-4 py-2 text-center text-gray-500">
                                    No requests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
