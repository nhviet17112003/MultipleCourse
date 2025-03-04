import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import UpdateLessonModal from "./lesson/UpdateLessonModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CourseDetailForTutor = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [exams, setExams] = useState(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteLessonOpen, setIsDeleteLessonOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [students, setStudents] = useState([])
  const token = localStorage.getItem("authToken");
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
 

  useEffect(() => {
        const fetchStudents = async () => {
          try {
            const response = await fetch(
              `http://localhost:3000/api/progress/students/${courseId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
            if (!response.ok) {
              throw new Error("Failed to fetch students");
            }
    
            const data = await response.json();
            setStudents(data);
          } catch (error) {
            setError(error.message);
          } finally {
            setLoading(false);
          }
        };
    
        fetchStudents();
      }, [courseId]);

  const handleDeleteLesson = async () => {
    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(
        `http://localhost:3000/api/lessons/${selectedLesson._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLessons((prevLessons) =>
        prevLessons.filter((lesson) => lesson._id !== selectedLesson._id)
      );
      toast.success("Lesson deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsDeleteLessonOpen(false);
    } catch (err) {
      console.error("Failed to delete lesson", err);
    }
  };

  const handleDeleteExam = async () => {
    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(
        `http://localhost:3000/api/exams/delete-exam/${exams._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete exam", err);
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
  };

  const toggleShowQuestions = () => {
    setShowAllQuestions((prev) => !prev);
  };

  const openModal = (lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLesson(null);
    setIsModalOpen(false);
  };

  const handleUpdateLesson = async (formData) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.put(
        `http://127.0.0.1:3000/api/lessons/${selectedLesson._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Chỉ định Content-Type
          },
        }
      );

      if (response.status === 200) {
        setLessons((prevLessons) =>
          prevLessons.map((lesson) =>
            lesson._id === selectedLesson._id ? response.data.lesson : lesson
          )
        );
        closeModal();
      }
    } catch (error) {
      console.error("Failed to update lesson", error);
    }
  };

  useEffect(() => {
    const fetchCourseDetail = async () => {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("role");
      setRole(role);
      if (!token) {
        setErrorMessage("Please log in to view the course details.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      try {
        console.log(`Fetching course details for courseId: ${courseId}`);
        const courseResponse = await axios.get(
          `http://localhost:3000/api/courses/detail/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Course Response:", courseResponse.data);

        if (courseResponse.status === 200) {
          setCourse(courseResponse.data.courseDetail);
          setLessons(courseResponse.data.lessons);
        }

        console.log(`Fetching exams for courseId: ${courseId}`);
        const examResponse = await axios.get(
          `http://localhost:3000/api/exams/get-exam/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Exam Response:", examResponse.data);

        if (examResponse.status === 200) {
          setExams(examResponse.data);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn("No exam found for this course.");
          setExams(null); // Không có bài thi nhưng không gây lỗi toàn trang
        } else {
          console.error("Error fetching exam data:", error);
          setErrorMessage(
            error.response?.data?.message || "An error occurred."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId, navigate]);

  if (loading) {
    return <p>Loading course details...</p>;
  }

  if (errorMessage) {
    return <p className="text-red-500">{errorMessage}</p>;
  }

  return (
    <div
      className={`course-detail p-6 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg mt-4"
      >
        Back
      </button>
      {course && (
        <div className={`p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex mt-8 justify-center items-center">
            <p className=" text-yellow-600 bg-yellow-300 px-2 py-1 rounded-lg mr-2">
              {course.category}
            </p>
            <p className="text-green-600 bg-green-300 px-2 py-1 rounded-lg mr-2">
              ${course.price}
            </p>

            <p
              className={` mr-2 ${
                course.status
                  ? "text-green-600 bg-green-300"
                  : "text-red-600 bg-red-300"
              } px-2 py-1 rounded-lg`}
            >
              {course.status ? "Available" : "Not Available"}
            </p>
            <p className="text-gray-500">
              {new Date(course.createAt).toLocaleDateString("en-US", {
                month: "long",

                day: "2-digit",

                year: "numeric",
              })}
            </p>
          </div>
          
          <div className="flex justify-center items-center mt-4">
            <h2 className="text-[70px] text-center font-semibold">
              {course.title}{" "}
            </h2>
          </div>
          <div className="flex justify-center items-center mt-4 ml-4"></div>
          <p className="mt-4 text-center mb-[60px]">{course.description}</p>
          <div className=" justify-center items-center flex mb-8 mt-8">
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="w-[1000px] h-[700px] object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}

      {/* student ne */}

<h2 className="text-2xl font-semibold mt-6">Students Enrolled</h2>
{loading ? (
  <p>Loading students...</p>
) : error ? (
  <p className="text-red-500">{error}</p>
) : students.length > 0 ? (
  <div className="overflow-x-auto mt-4">
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2 border">Avatar</th>
          <th className="px-4 py-2 border">Full Name</th>
          <th className="px-4 py-2 border">Status</th>
          <th className="px-4 py-2 border">Progress</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.student._id} className="text-center">
            <td className="border px-4 py-2">
              <img
                src={student.student.avatar}
                alt={student.student.fullname}
                className="w-12 h-12 rounded-full mx-auto"
              />
            </td>
            <td className="border px-4 py-2">{student.student.fullname}</td>
            <td className="border px-4 py-2">
              <span
                className={`px-2 py-1 rounded ${
                  student.status === "Enrolled"
                    ? "bg-green-200 text-green-700"
                    : "bg-red-200 text-red-700"
                }`}
              >
                {student.status}
              </span>
            </td>
            <td className="border px-4 py-2">{student.percent.toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
  <p className="text-gray-500 mt-2">No students enrolled in this course.</p>
)}

      

      {isModalOpen && selectedLesson && (
        <UpdateLessonModal
          lesson={selectedLesson}
          onClose={closeModal}
          onUpdate={handleUpdateLesson}
        />
      )}
      <div>
        <h2 className="text-2xl font-semibold mt-6">Course Exams</h2>
        {role !== "Admin" && !exams && (
          <button
            onClick={() => navigate(`/create-exam/${courseId}`)}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg mt-4"
          >
            Create Exam
          </button>
        )}

        {exams ? (
          <ul className="mt-4">
            <li className="p-4 rounded-lg shadow-md mt-4 bg-gray-100">
              <h3 className="font-semibold">{exams.title}</h3>
              <p className="text-gray-700">Total Marks: {exams.totalMark}</p>
              <p className="text-gray-700">
                Duration: {exams.duration} minutes
              </p>

              <h4 className="mt-4 font-semibold">Questions:</h4>
              <ul className="mt-2">
                {(showAllQuestions
                  ? exams.questions
                  : exams.questions.slice(0, 3)
                ).map((question, index) => (
                  <li key={question._id} className="mt-2">
                    <p className="text-gray-800 font-semibold">
                      {index + 1}. {question.question}
                    </p>
                    <ul className="ml-4">
                      {question.answers.map((answer) => (
                        <li
                          key={answer._id}
                          className={
                            answer.isCorrect ? "text-green-600" : "text-red-600"
                          }
                        >
                          - {answer.answer}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              {exams.questions.length > 3 && (
                <span
                  className="mt-4 text-blue-500 underline cursor-pointer"
                  onClick={() => setShowAllQuestions(!showAllQuestions)}
                >
                  {showAllQuestions ? "Less than" : "More than"}
                </span>
              )}
            </li>
            {role !== "Admin" && (
              <>
                <button
                  onClick={() => navigate(`/update-exam/${courseId}`)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg mt-2 ml-2"
                >
                  Update Exam
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2 ml-2"
                >
                  Delete Exam
                </button>
              </>
            )}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">No exams found for this course.</p>
        )}
      </div>

      <h2 className="text-2xl font-semibold mt-6">Course Lessons</h2>
      {role !== "Admin" && (
        <button
          onClick={() => navigate(`/create-lesson/${courseId}`)}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg mt-4"
        >
          Create Lesson
        </button>
      )}
      {lessons.length > 0 ? (
        <div className="lessons mt-6">
          <h3 className="text-xl font-semibold">Lessons</h3>

          <ul>
            {lessons.map((lesson) => (
              <li
                key={lesson._id}
                className={`p-4 rounded-lg shadow-md mt-4 ${
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                <p className="font-semibold text-teal-600">{lesson.title}</p>
                <p className="text-gray-600">{lesson.description}</p>
                <button
                  onClick={() => navigate(`/lesson-detail/${lesson._id}`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
                >
                  View Details
                </button>
                {role !== "Admin" && (
                  <>
                    <button
                      onClick={() => openModal(lesson)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 ml-2"
                    >
                      Update Lesson
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setIsDeleteLessonOpen(true);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2 ml-2"
                    >
                      Delete Lesson
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>

          {isDeleteLessonOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                <h2 className="text-lg font-bold mb-2">
                  Are you sure you want to delete this lesson?
                </h2>
                <div className="flex space-x-4">
                  <button
                    onClick={handleDeleteLesson}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>

                  <button
                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
                    onClick={() => setIsDeleteLessonOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDeleteModalOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                <h2 className="text-lg font-bold mb-2">
                  Are you sure you want to delete this exam?
                </h2>
                <div className="flex space-x-4">
                  <button
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                    onClick={handleDeleteExam}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
                    onClick={handleDeleteModalClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      ) : (
        <p className="mt-4 text-gray-500">
          No lessons available for this course.
        </p>
      )}
    </div>
  );
};

export default CourseDetailForTutor;
