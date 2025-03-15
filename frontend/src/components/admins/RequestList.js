import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Dropdown, Spin, Table, Tag } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("authToken");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();
    const { theme } = useTheme();
  

    const [spinning, setSpinning] = useState(false);
    const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (token) {
      fetchRequests();
      console.log("token", token);
    } else {
      setError("User not authenticated.");
    }
  }, []);
  console.log(requests, "requests");
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
        ? data.sort(
            (a, b) => new Date(b.request_date) - new Date(a.request_date)
          )
        : [];

      setRequests(sortedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (
    requestId,
    status,
    requestType,
    message = ""
  ) => {
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

      // alert("Successfully processed request.");
      toast.success("Successfully processed request.");
      setIsModalOpen(false);
      setRejectReason("");
      await fetchRequests();
    } catch (err) {
      console.error("Error processing request:", err);
      // alert("Failed to process request");
      toast.error("Failed to process request");
    }
    finally {
   
      setSpinning(false);
      setPercent(100);
    }
    console.log("requestId", requestId);
    console.log("status", status);
    console.log("requestType", requestType);
    console.log("message", message);
  };

  const columns = [ 
    {
      title: "Course Name",
      dataIndex: "course_title",
      key: "course_title",
    },
    {
      title: "Request Type",
      dataIndex: "request_type",
      key: "request_type",
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (content) => (
        <div>
          {content.map((item, index) => (
            <div key={index} className="text-sm">
              <strong>{item.title}:</strong> {item.value}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
       status === "Pending" ? <Tag color="yellow">{status}</Tag> : status === "Approved" ? <Tag color="green">{status}</Tag> : <Tag color="red">{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
      
        record.status === "Pending"  &&   <DropDownMenu handleProcessRequest={handleProcessRequest} setIsModalOpen={setIsModalOpen} setSelectedRequest={setSelectedRequest}  record={record} />  
      ),
    },
  ];

  const data = requests.map((request) => ({
    key: request._id,
    course_title: request.course_title || "N/A",
    request_type: request.request_type || "N/A",
    content: request.content || [],
    status: request.status,
  }));

  return (
    <div className="container mx-auto p-6 max-h-screen">
       <Spin spinning={spinning} percent={percent} fullscreen />
      <h1 className="text-3xl font-bold text-center mb-6">Request List</h1>
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">

        <Table columns={columns} dataSource={data} />
      
      </div>
      {isModalOpen && (
           <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-md z-50">
           <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 border border-gray-100 dark:border-gray-700 transform transition-all">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                 Rejection Reason
               </h2>
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
             
             <div className="mb-6">
               <textarea
                 className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white transition duration-300 resize-none"
                 value={rejectReason}
                 onChange={(e) => setRejectReason(e.target.value)}
                 placeholder="Please provide a detailed reason for rejection..."
                 rows="4"
               />
             </div>
             
             <div className="flex justify-end space-x-3">
               <button
                 className="px-5 py-2.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 font-medium"
                 onClick={() => setIsModalOpen(false)}
               >
                 Cancel
               </button>
               <button
                 className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition duration-300 shadow-lg hover:shadow-xl font-medium flex items-center"
                 onClick={() => {
                   handleProcessRequest(
                     selectedRequest.key,
                     "Rejected",
                     selectedRequest.request_type,
                     rejectReason
                   );
                 }}
               >
                 Reject
               </button>
             </div>
           </div>
         </div>
      )}
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
    </div>
  );
}

const DropDownMenu = ({record ,handleProcessRequest, setIsModalOpen , setSelectedRequest}) =>{
  const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage
    // const toggleCommentStatus = async (type, commentId) => {
      
   
    //   try {
    //     console.log('Toggling comment status:', type, commentId);
    //     const url = type === 'course' 
    //       ? `http://localhost:3000/api/comments/change-course-comment-status/${commentId}`
    //       : `http://localhost:3000/api/comments/change-lesson-comment-status/${commentId}`;
    //     await axios.put(url, {}, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //  fetchComments();
    //     console.log('Comment status updated successfully');
    //     toast.success('Comment status updated successfully');
    //   } catch (error) {
    //     console.error('Error updating comment status:', error);
    //     toast.error('Error updating comment status');
    //   }
    // };
  
    const items = [
      {
        key: '1',
        label: (
            <div  onClick={() => {
              handleProcessRequest(record.key, "Approved", record.request_type)
            }}>{record.status === "Pending" && "Approve"}</div>
        ),
  
  
      },
      {
        key: '2',
        label: (
            <div  onClick={() => { 
              setIsModalOpen(true);
              setSelectedRequest(record);
            }}>{record.status === "Pending" && "Reject"}</div>
        ),
  
  
      },
    ]
    return(
      <div>
  
  <Dropdown menu={{items}}>
            <EllipsisOutlined />
          </Dropdown>
  
   
      </div>
     
          
    )
  }
