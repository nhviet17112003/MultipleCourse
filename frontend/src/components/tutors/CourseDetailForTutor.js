import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import UpdateLessonModal from "./lesson/UpdateLessonModal";

const CourseDetailForTutor = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null); // Bài học được chọn
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái modal
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

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
            "Content-Type": "multipart/form-data",  // Chỉ định Content-Type
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
      if (!token) {
        setErrorMessage("Please log in to view the course details.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/courses/detail/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setCourse(response.data.courseDetail);
          setLessons(response.data.lessons);
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "An error occurred while fetching course details."
        );
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
    <div className={`course-detail p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
    
      {course && (
        <div className={`p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
             <div className="flex mt-8 justify-center items-center">
             <p className=" text-yellow-600 bg-yellow-300 px-2 py-1 rounded-lg mr-2">{course.category}</p>
             <p className="text-green-600 bg-green-300 px-2 py-1 rounded-lg mr-2">${course.price}</p>
       
       
             <p className={` mr-2 ${course.status ? "text-green-600 bg-green-300" : "text-red-600 bg-red-300"} px-2 py-1 rounded-lg`}>
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
<h2 className="text-[70px] text-center font-semibold">{course.title} </h2>


  
   </div>
        <div className="flex justify-center items-center mt-4 ml-4">
          
        
          
      
          
           </div>
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

      {isModalOpen && selectedLesson && (
        <UpdateLessonModal
          lesson={selectedLesson}
          onClose={closeModal}
          onUpdate={handleUpdateLesson}
        />
      )}
    <div>
      <h2 className="text-2xl font-semibold mt-6">Course Exams</h2>
      <button
        onClick={() => navigate(`/create-exam/${courseId}`)}
        className="bg-teal-500 text-white px-4 py-2 rounded-lg mt-4"
      >
        Create Exam
      </button>
    </div>
      <h2 className="text-2xl font-semibold mt-6">Course Lessons</h2>
  <button
        onClick={() => navigate(`/create-lesson/${courseId}`)}
        className="bg-teal-500 text-white px-4 py-2 rounded-lg mt-4"
      >
        Create Lesson
      </button>
      {lessons.length > 0 ? (
        <div className="lessons mt-6">
          <h3 className="text-xl font-semibold">Lessons</h3>
        
          <ul>
            {lessons.map((lesson) => (
              <li
                key={lesson._id}
                className={`p-4 rounded-lg shadow-md mt-4 ${
                  theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
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
                <button
                  onClick={() => openModal(lesson)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 ml-2"
                >
                  Update Lesson
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No lessons available for this course.</p>
      )}

   
    </div>
  );
};

export default CourseDetailForTutor;
