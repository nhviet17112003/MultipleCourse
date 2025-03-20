import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const [orders, setOrders] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [image, setImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/certificates/get-all-certificates`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.status === 404) {
          return;
        }

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setCertificates(data.certificates);
      } catch (error) {
        if (error.message !== "Failed to fetch") {
        }
      }
    };

    fetchCertificates();
  }, []);
  useEffect(() => {
    const fetchOrdersAndProgress = async () => {
      try {
        const [ordersResponse, progressResponse] = await Promise.all([
          fetch("http://localhost:3000/api/orders/my-orders", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }),
          fetch("http://localhost:3000/api/progress", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }),
        ]);

        const ordersData = await ordersResponse.json();
        const progressDataResponse = await progressResponse.json();

        if (progressDataResponse && progressDataResponse.length > 0) {
          setProgressData(progressDataResponse);
        } else {
          setProgressData([]);
        }

        setOrders(ordersData);
      } catch (err) {
        setError("Failed to fetch orders or progress.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndProgress();
  }, []);

  const handleCourseClick = (courseId) => {
    if (!isEnrolled(courseId)) {
      setModalContent({
        title: "Enrollment Required",
        message: "You need to enroll in this course before accessing it.",
      });
      return;
    }

    if (Array.isArray(progressData)) {
      const courseProgress = progressData.find(
        (progress) => progress.course_id === courseId
      );

      if (courseProgress) {
        navigate(`/courses/${courseId}?progressId=${courseProgress._id}`);
      } else {
        navigate(`/courses/${courseId}`);
      }
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/progress/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setModalContent({
          title: "Success",
          message: "Enrollment successful!",
        });
        setProgressData((prev) => [...prev, data]);
      } else {
        setModalContent({
          title: "Enrollment Failed",
          message: data.message,
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      setModalContent({
        title: "Error",
        message: "An error occurred while enrolling.",
      });
    }
  };

  const getProgressForCourse = (courseId) => {
    if (Array.isArray(progressData)) {
      const courseProgress = progressData.find(
        (progress) => progress.course_id === courseId
      );

      if (courseProgress && courseProgress.lesson.length > 0) {
        const totalLessons = courseProgress.lesson.length + 1;
        const completedLessons = courseProgress.lesson.filter(
          (lesson) => lesson.status === "Completed"
        ).length;

        if (courseProgress.final_exam.status === "Completed") {
          return 100;
        }

        const progress = (completedLessons / totalLessons) * 100;
        return progress;
      }
    }

    console.log("No progress found for course");
    return 0;
  };
  const isEnrolled = (courseId) => {
    if (Array.isArray(progressData)) {
      const result = progressData.some(
        (progress) => progress.course_id === courseId
      );
      return result;
    } else {
      console.error("progressData is not an array:", progressData);
      return false;
    }
  };

  const filteredOrders = orders.map((order) => ({
    ...order,
    order_items: order.order_items.filter((item) =>
      item.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#14b8a6] to-indigo-200">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-black drop-shadow-md">
        My Courses
      </h1>

      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-gray-200 text-lg">
          No successful orders found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOrders.map((order) =>
            order.order_items.map((item) => (
              <div
                key={item._id}
                className="bg-white shadow-md rounded-xl overflow-hidden transform transition duration-300 hover:shadow-2xl hover:scale-105 relative"
                onClick={() => handleCourseClick(item.course._id)}
              >
                <img
                  src={item.course.image || ""}
                  alt={item.course.title}
                  className="w-full h-52 object-cover"
                />
                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-800 truncate">
                    {item.course.title}
                  </h2>
                  {isEnrolled(item.course._id) ? (
                    <div className="mt-4">
                      <div className="w-full bg-gray-300 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${getProgressForCourse(item.course._id)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        Progress:{" "}
                        {getProgressForCourse(item.course._id).toFixed(0)}%
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(item.course._id);
                      }}
                      className="mt-4 w-full py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition duration-300"
                    >
                      Enroll
                    </button>
                  )}
                </div>
                {certificates.some(
                  (certificate) =>
                    certificate.course._id === item.course._id &&
                    certificate.isPassed
                ) && (
                  <img
                    src={require("../../assets/passed44.png")}
                    alt="Passed"
                    className="absolute top-3 right-3 w-14 h-14"
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center w-96 transform scale-95 transition duration-200 ease-in-out">
            <h2 className="text-xl font-bold text-blue-600 mb-4">
              {modalContent.title}
            </h2>
            <p className="text-gray-700">{modalContent.message}</p>
            <button
              onClick={() => setModalContent(null)}
              className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
