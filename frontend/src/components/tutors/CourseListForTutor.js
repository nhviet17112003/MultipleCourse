import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UpdateCourseModal from "./UpdateCourseModal"; // Import modal
import { useTheme } from "../context/ThemeContext"; // Import context
import { Button, Spin, Breadcrumb } from "antd";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import { ArrowRight } from "lucide-react";
import { Modal, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react";

const CourseListForTutor = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const token = localStorage.getItem("authToken");
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loadingImage, setLoadingImage] = useState({});


  useEffect(() => {
    setSpinning(true);
    let ptg = -10;
    const interval = setInterval(() => {
      ptg += 5;
      setPercent(ptg);
      if (ptg > 120) {
        clearInterval(interval);
        setSpinning(false);
        setPercent(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTutorCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErrorMessage("Please log in to view your courses.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/api/courses/course-of-tutor",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setCourses(response.data);
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "An error occurred while fetching courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTutorCourses();
  }, [navigate]);

  const handleDeleteCourse = async (courseId) => {
    Modal.confirm({
      title: "Confirm Course Deletion",
      content: "Are you sure you want to delete this course?",
      okText: "Delete",
      cancelText: "Cancel",
      okType: "danger",

      centered: true, // Giữ modal ở giữa màn hình
      maskClosable: true, // Cho phép bấm ra ngoài để đóng modal

      className: "custom-modal",
      onOk: async () => {
        try {
          const response = await axios.delete(
            `http://localhost:3000/api/courses/delete-course/${courseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 201) {
            toast.success("Request delete course successfully.");
            setCourses((prevCourses) =>
              prevCourses.filter((course) => course._id !== courseId)
            );
          }
        } catch (error) {
          console.error("Error deleting course:", error);
          toast.error(
            error.response?.data?.message || "Failed to request delete course."
          );
        }
      },
    });
  };

  const handleOpenModal = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
    setIsModalOpen(false);
  };

  const handleUpdateCourse = async (updatedCourse) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `http://localhost:3000/api/courses/update-course/${updatedCourse._id}`,
        updatedCourse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        // setCourses((prevCourses) =>
        //   prevCourses.map((course) =>
        //     course._id === updatedCourse._id ? response.data : course
        //   )
        // );

        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === updatedCourse._id
              ? { ...course, ...response.data } // Giữ lại dữ liệu cũ nếu thiếu
              : course
          )
        );

        handleCloseModal();
        toast.success("Send request to admin successfully!");
      }
    } catch (error) {
      setErrorMessage(
        // error.response?.data?.message || "An error occurred while updating the course."
        toast.error(
          error.response?.data?.message || "Send request to admin fail."
        )
      );
    }
  };

  const handleUpdateImage = async (courseId, imageFile) => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("image", imageFile);
    if (!imageFile) return;

    setLoadingImage((prev) => ({ ...prev, [courseId]: true })); // Bắt đầu loading

    try {
      const response = await axios.put(
        `http://localhost:3000/api/courses/update-course-image/${courseId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === courseId ? response.data : course
          )
        );
        setLoadingImage((prev) => ({ ...prev, [courseId]: false })); // Tắt loading sau khi upload xong
        toast.success("Update image successfully!");
      }
    } catch (error) {
      // setErrorMessage(
      //   error.response?.data?.message || "An error occurred while updating the image."
      // );
      setLoadingImage((prev) => ({ ...prev, [courseId]: false })); // Tắt loading nếu lỗi
      toast.error("Update image fail.");
    }
  };

  return (
    <div
      className={`course-list-tutor p-6 h-full ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <Spin spinning={spinning} fullscreen />
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Course List</h1>
      {errorMessage && <p className="text-red-500 mb-4"></p>}
      {loading ? (
        <p className="text-lg">Loading courses...</p>
      ) : courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className={`flex items-center rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
            <div className="flex-shrink-0 w-36 h-36 rounded-2xl overflow-hidden relative border-2 border-teal-500">
      {/* Input file ẩn */}
      <input
        type="file"
        accept="image/*"
        id={`upload-image-${course._id}`}
        className="hidden"
        onChange={(e) => handleUpdateImage(course._id, e.target.files[0])}
      />

      {/* Hình ảnh hoặc loading */}
      <div
        className="w-full h-full flex items-center justify-center cursor-pointer relative"
        onClick={() =>
          document.getElementById(`upload-image-${course._id}`).click()
        }
      >
        {loadingImage[course._id] ? (
          <Spin size="large" />
        ) : (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        )}
      </div>
    </div>

              <div className="ml-6 flex-1">
                <h2 className="text-xl font-semibold text-teal-600">
                  {course.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{course.category}</p>
                <p className="text-gray-700 mt-2 line-clamp-2">
                  {course.description}
                </p>
                <p className="text-teal-700 font-bold mt-2">{course.price} VND</p>
                <p
                  className={`mt-2 font-bold ${
                    course.status ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {course.status ? "Available" : "Not Available"}
                </p>
              </div>

              {/* cho tutor */}
              <Dropdown
  menu={{
    items: [
      {
        label: (
          <span className="flex items-center space-x-2 text-blue-500 hover:text-blue-600">
            <Edit size={16} /> <span>Update Info</span>
          </span>
        ),
        key: "1",
        onClick: () => handleOpenModal(course),
      },
      {
        label: (
          <span className="flex items-center space-x-2 text-red-500 hover:text-red-600">
            <Trash2 size={16} /> <span>Delete</span>
          </span>
        ),
        key: "2",
        onClick: () => handleDeleteCourse(course._id),
      },

      // pop confirm

      // {
      //   label: (
      //     <Popconfirm
      //       title="Delete Course"
      //       description="Are you sure you want to delete this course?"
      //       onConfirm={() => handleDeleteCourse(course._id)}
      //       okText="Yes"
      //       cancelText="No"
      //       okButtonProps={{ danger: true }}
      //     >
      //       <span className="flex items-center space-x-2 text-red-500 hover:text-red-600 cursor-pointer">
      //         <Trash2 size={16} /> <span>Delete</span>
      //       </span>
      //     </Popconfirm>
      //   ),
      //   key: "2",
      // },

      {
        label: (
          <span className="flex items-center space-x-2 text-green-500 hover:text-green-600">
            <Eye size={16} /> <span>View Details</span>
          </span>
        ),
        key: "3",
        onClick: () => navigate(`/courses-list-tutor/${course._id}`),
      },
    ],
  }}
>
  <a
    className="p-2 hover:shadow-lg hover:rounded-lg transition-all flex items-center cursor-pointer ml-6"
    onClick={(e) => e.preventDefault()}
  >
    <MoreVertical className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" />
  </a>
</Dropdown>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg font-medium text-gray-600 mt-4">
          You have no courses at the moment.
        </p>
      )}

      {isModalOpen && selectedCourse && (
        <UpdateCourseModal
          course={selectedCourse}
          onClose={handleCloseModal}
          onUpdate={handleUpdateCourse}
        />
      )}
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
    </div>
  );
};

export default CourseListForTutor;
