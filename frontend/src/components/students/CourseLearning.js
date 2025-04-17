import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  LockClosedIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const CourseLearningPage = ({ isCourseCompleted }) => {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [isContentCollapsed, setIsContentCollapsed] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const videoRef = useRef(null);
  const location = useLocation();
  const progressId = new URLSearchParams(location.search).get("progressId");
  const [progressData, setProgressData] = useState(null);
  const [activeTab, setActiveTab] = useState("Description");
  const [isExamStarted, setIsExamStarted] = useState(false);
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        console.log("User profile data:", data);
        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);
  useEffect(() => {
    const fetchProgress = async () => {
      if (!progressId) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/progress/${progressId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProgressData(data);

          if (data.final_exam?.status === "Completed") {
            setIsCompleted(true);
          }
        } else {
          setError("Failed to fetch progress data.");
        }
      } catch (error) {
        setError("Failed to fetch progress data.");
      }
    };

    fetchProgress();
  }, [progressId]);

  useEffect(() => {
    if (
      isCompleted &&
      currentLesson?.type === "exam" &&
      currentLesson.title === "Final Exam"
    ) {
      confetti({
        particleCount: 150,
        spread: 80,
        startVelocity: 40,
        origin: { y: 0.6 },
      });
    }
  }, [isCompleted, currentLesson]);

  useEffect(() => {
    if (isCompleted) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [isCompleted]);

  const fetchExamScore = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/exams/get-exam-score/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExamScore(data.Score);
      } else if (response.status === 404) {
        setExamScore(0);
      } else {
        setError("Failed to fetch exam score.");
      }
    } catch (error) {
      setError("Failed to fetch exam score.");
    }
  };

  useEffect(() => {
    fetchExamScore();
  }, [courseId]);

  const handleEditComment = async (commentId, newComment) => {
    try {
      const lessonId = currentLesson._id;
      const response = await fetch(
        "http://localhost:3000/api/comments/update-lesson-comment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            comment: newComment,
            commentId,
            lessonId,
          }),
        }
      );
      const updatedComment = await response.json();

      setCurrentLesson((prevLesson) => ({
        ...prevLesson,
        comments: prevLesson.comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, comment: newComment }
            : comment
        ),
      }));
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const lessonId = currentLesson._id; // Lấy ID bài học
      // Lấy ID bình luận
      console.log("Sending lessonId:", lessonId, "and commentId:", commentId);

      // Gọi API xóa bình luận
      const response = await fetch(
        "http://localhost:3000/api/comments/delete-lesson-comment",
        {
          method: "DELETE", // Sử dụng phương thức DELETE
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Token xác thực
          },
          body: JSON.stringify({
            courseId, // ID của khóa học
            lessonId, // ID của bài học
            commentId, // ID của bình luận cần xóa
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Nếu xóa thành công, xóa bình luận khỏi danh sách
        setCurrentLesson((prevLesson) => ({
          ...prevLesson,
          comments: prevLesson.comments.filter(
            (comment) => comment._id !== commentId
          ),
        }));
        console.log("Comment deleted successfully");
      } else {
        console.error(data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!note) return;

    try {
      const response = await fetch(
        "http://localhost:3000/api/comments/create-lesson-comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            lessonId: currentLesson._id,
            comment: note,
            rating: 5, // Add logic for rating if required
          }),
        }
      );
      const newComment = await response.json();

      setNote(""); // Clear the input after posting
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  useEffect(() => {
    const fetchLessonsAndProgress = async () => {
      try {
        const [lessonsResponse, progressResponse] = await Promise.all([
          fetch(`http://localhost:3000/api/lessons/all-lessons/${courseId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }),
          progressId
            ? fetch(`http://localhost:3000/api/progress/${progressId}`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              })
            : Promise.resolve({ json: () => ({ lesson: [] }) }),
        ]);

        const lessonsData = await lessonsResponse.json();
        const progressData = await progressResponse.json();

        const updatedLessons = [
          ...lessonsData,
          {
            _id: "exam_final",
            title: "Final Exam",
            type: "exam",
            // questions: exams,
          },
        ];

        setLessons(updatedLessons);
        setProgressData(progressData);

        if (updatedLessons.length > 0) {
          setCurrentLesson(updatedLessons[0]);
        }
      } catch (err) {
        setError("Failed to fetch lessons or progress.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonsAndProgress();
  }, [courseId, progressId]);

  const isLessonCompleted = (lessonId) => {
    return (
      progressData &&
      progressData.lesson.some(
        (lesson) =>
          lesson.lesson_id === lessonId && lesson.status === "Completed"
      )
    );
  };

  const currentNote = progressData?.lesson.find(
    (lesson) => lesson.lesson_id === currentLesson?._id
  )?.note;

  const isLessonInProgress = (lessonId) => {
    return (
      progressData &&
      progressData.lesson.some(
        (lesson) =>
          lesson.lesson_id === lessonId && lesson.status === "In Progress"
      )
    );
  };

  const canAccessLesson = (index) => {
    if (index === 0) return true;
    return isLessonCompleted(lessons[index - 1]._id);
  };

  const updateLessonProgress = async (status, note = "") => {
    try {
      await fetch(
        `http://localhost:3000/api/progress/lesson/${currentLesson._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status, note }),
        }
      );

      if (status === "Completed") {
        setProgressData((prev) => ({
          ...prev,
          lesson: [
            ...prev.lesson.filter((l) => l.lesson_id !== currentLesson._id),
            { lesson_id: currentLesson._id, status: "Completed" },
          ],
        }));

        setCurrentLesson((prev) => ({ ...prev, status: "Completed" }));

        setLessons((prevLessons) =>
          prevLessons.map((lesson, index) => {
            if (lesson._id === currentLesson._id) {
              return { ...lesson, status: "Completed" };
            } else if (
              index ===
              prevLessons.findIndex((l) => l._id === currentLesson._id) + 1
            ) {
              updateNextLessonProgress(lesson._id);
              return { ...lesson, status: "In Progress" };
            }
            return lesson;
          })
        );
      }
    } catch (error) {
      console.error("Failed to update lesson progress", error);
    }
  };

  const updateNextLessonProgress = async (lessonId) => {
    try {
      await fetch(`http://localhost:3000/api/progress/lesson/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ status: "In Progress" }),
      });

      setProgressData((prev) => ({
        ...prev,
        lesson: [
          ...prev.lesson.filter((l) => l.lesson_id !== lessonId),
          { lesson_id: lessonId, status: "In Progress" },
        ],
      }));
    } catch (error) {
      console.error("Failed to update next lesson progress", error);
    }
  };

  const handleVideoEnd = () => {
    if (currentLesson.status !== "Completed") {
      updateLessonProgress("Completed", "");
    }
  };

  const handleNoteSubmit = async () => {
    if (!note) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/progress/lesson/${currentLesson._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status: currentLesson.status, note }),
        }
      );

      const updatedProgressData = await response.json();
      setProgressData(updatedProgressData);
      setNotes((prevNotes) => [...prevNotes, { content: note }]);
      setNote("");
    } catch (error) {
      console.error("Failed to save note", error);
    }
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/certificates/get-all-certificates",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();
        const certificates = data.certificates;

        const isCourseCompleted = certificates.some((certificate) => {
          return certificate.course._id === courseId && certificate.isPassed;
        });

        setIsCompleted(isCourseCompleted);
      } catch (error) {
        console.error("Failed to fetch certificates", error);
      }
    };

    fetchCertificates();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-500">
        Loading lessons...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 relative">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          <div
            className={`w-full ${isVideoExpanded ? "lg:w-full" : "lg:w-2/3"}`}
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transform transition-all duration-300 hover:shadow-2xl border border-white/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 group"
                >
                  <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="text-sm sm:text-base font-medium">
                    Back to Courses
                  </span>
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg transition duration-300 ease-in-out text-sm sm:text-base"
                  >
                    {isVideoExpanded ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="hidden sm:inline">Collapse Video</span>
                        <span className="sm:hidden">Collapse</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="hidden sm:inline">Expand Video</span>
                        <span className="sm:hidden">Expand</span>
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>

              {currentLesson ? (
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                      {currentLesson.title}
                      {currentLesson.status === "Completed" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                          }}
                        >
                          <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-500 animate-pulse" />
                        </motion.div>
                      )}
                    </h1>
                  </div>

                  {currentLesson?.type === "exam" &&
                  currentLesson.title === "Final Exam" ? (
                    <div className="mt-4 sm:mt-6 flex flex-col justify-center">
                      {examScore > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6 border border-indigo-200/50"
                        >
                          <p className="text-base sm:text-lg font-bold text-gray-700 text-center">
                            Your Score:
                            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 ml-2">
                              {examScore}
                            </span>
                          </p>
                        </motion.div>
                      )}
                      {isCompleted ? (
                        <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl mb-6 sm:mb-8 flex flex-col items-center border border-green-200/50 backdrop-blur-md"
                        >
                          <motion.svg
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              duration: 0.5,
                              type: "spring",
                              stiffness: 100,
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 text-green-600 drop-shadow-lg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.431-1.307 12.02 12.02 0 002.643 2.679a1 1 0 001-1.51l-1.214-1.214 3.5-3.5a1 1 0 001.5 1.5l-1.5 1.5-3.5-3.5a3.42 3.42 0 00-1.43 1.306"
                            />
                          </motion.svg>

                          <h3 className="text-xl sm:text-2xl lg:text-3xl text-green-700 font-extrabold mb-3 sm:mb-4 tracking-wide">
                            🎉 Congratulations! 🎉
                          </h3>

                          <p className="text-base sm:text-lg text-gray-700 text-center mb-4 sm:mb-6">
                            You have successfully completed the course!
                          </p>

                          <motion.a
                            href="http://localhost:3001/my-certificate"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transition duration-300 ease-in-out text-base sm:text-lg transform hover:scale-105"
                            whileHover={{ scale: 1.05, rotate: 1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            🎓 View Certificate
                          </motion.a>
                        </motion.div>
                      ) : examScore > 0 && examScore < 8 ? (
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          onClick={() => navigate(`/final-exam/${courseId}`)}
                          className="w-full sm:w-auto max-w-xs mx-auto bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
                        >
                          Try Again
                        </motion.button>
                      ) : (
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          onClick={() => navigate(`/final-exam/${courseId}`)}
                          className="w-full sm:w-auto max-w-xs mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
                        >
                          Start Exam
                        </motion.button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="relative rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
                        <video
                          ref={videoRef}
                          src={currentLesson.video_url}
                          controls
                          className="w-full"
                          onEnded={handleVideoEnd}
                        ></video>
                      </div>

                      {currentLesson.document_url && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="flex justify-center"
                        >
                          <a
                            href={currentLesson.document_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            Download Document
                          </a>
                        </motion.div>
                      )}

                      <div className="border-b border-gray-200 mb-4 sm:mb-6">
                        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto">
                          {["Description", "Note", "Comment"].map((tab) => (
                            <motion.button
                              key={tab}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`py-2 px-3 sm:py-3 sm:px-4 font-medium transition-all duration-200 text-sm sm:text-base ${
                                activeTab === tab
                                  ? "text-indigo-600 border-b-2 border-indigo-600"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                              onClick={() => setActiveTab(tab)}
                            >
                              {tab}
                            </motion.button>
                          ))}
                        </nav>
                      </div>

                      <div className="space-y-4 sm:space-y-6">
                        {activeTab === "Description" && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100/50"
                          >
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
                              Lesson Description
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                              {currentLesson.description}
                            </p>
                          </motion.div>
                        )}

                        {activeTab === "Note" && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-4 sm:space-y-6"
                          >
                            {currentNote && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                                <h3 className="font-semibold text-indigo-600 mb-2 text-sm sm:text-base">
                                  Your Note:
                                </h3>
                                <p className="text-sm sm:text-base text-gray-700">
                                  {currentNote}
                                </p>
                              </div>
                            )}
                            <div className="space-y-3 sm:space-y-4">
                              <textarea
                                className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out text-sm sm:text-base"
                                placeholder="Write your notes here..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows="4"
                              ></textarea>
                              <div className="flex justify-end">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleNoteSubmit}
                                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 rounded-xl shadow-lg transition duration-300 ease-in-out text-sm sm:text-base"
                                >
                                  Save Note
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === "Comment" && currentLesson && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-4 sm:space-y-6"
                          >
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
                              Comments
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                              <textarea
                                className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out text-sm sm:text-base"
                                placeholder="Write your comment..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows="3"
                              ></textarea>
                              <div className="flex justify-end">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    if (note.trim()) {
                                      handleCommentSubmit();
                                    }
                                  }}
                                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 rounded-xl shadow-lg transition duration-300 ease-in-out text-sm sm:text-base"
                                >
                                  Post Comment
                                </motion.button>
                              </div>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                              {currentLesson.comments &&
                              currentLesson.comments.length > 0 ? (
                                currentLesson.comments.map((comment) => (
                                  <motion.div
                                    key={comment._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white/50 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100/50"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                                      <div>
                                        <p className="font-semibold text-gray-800 text-sm sm:text-base">
                                          {comment.author}
                                        </p>
                                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                                          {comment.comment}
                                        </p>
                                      </div>
                                      <span className="text-xs sm:text-sm text-gray-500">
                                        {new Date(
                                          comment.date
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                    {comment.author ===
                                      userProfile?.fullname && (
                                      <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => {
                                            const newComment = prompt(
                                              "Edit your comment:",
                                              comment.comment
                                            );
                                            if (newComment)
                                              handleEditComment(
                                                comment._id,
                                                newComment
                                              );
                                          }}
                                          className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-medium"
                                        >
                                          Edit
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() =>
                                            handleDeleteComment(comment._id)
                                          }
                                          className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
                                        >
                                          Delete
                                        </motion.button>
                                      </div>
                                    )}
                                  </motion.div>
                                ))
                              ) : (
                                <p className="text-sm sm:text-base text-gray-500 text-center py-4">
                                  No comments yet.
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-base sm:text-lg text-gray-600 text-center py-6 sm:py-8">
                  No lessons have been selected yet.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <motion.div
            className={`w-full ${isVideoExpanded ? "hidden" : "lg:w-1/3"}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              width: "33.333333%",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 sticky top-4 sm:top-8 border border-white/20">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                📚 Course Content
                <span className="text-indigo-600 text-base sm:text-lg">
                  ({lessons.length})
                </span>
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {lessons.map((lesson, index) => {
                  const isFinalExam = lesson._id === "exam_final";
                  const isFinalExamCompleted =
                    isFinalExam && isLessonCompleted("exam_final");
                  const completedLessons = lessons.filter((l) =>
                    isLessonCompleted(l._id)
                  );
                  const onlyFinalExamLeft =
                    completedLessons.length === lessons.length - 1 &&
                    !isFinalExamCompleted;

                  return (
                    <motion.li
                      key={lesson._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        canAccessLesson(index)
                          ? "bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 cursor-pointer transform hover:scale-105"
                          : "bg-gray-100 cursor-not-allowed opacity-70"
                      } ${
                        currentLesson?._id === lesson._id
                          ? "ring-2 ring-indigo-500"
                          : ""
                      }`}
                      onClick={() =>
                        canAccessLesson(index) && setCurrentLesson(lesson)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 text-sm sm:text-base break-words whitespace-normal max-w-[200px] sm:max-w-[250px]">
                          {lesson.title}
                        </span>
                        {isLessonCompleted(lesson._id) ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                            }}
                          >
                            <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                          </motion.div>
                        ) : !canAccessLesson(index) ? (
                          <LockClosedIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        ) : isFinalExam && isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                            }}
                          >
                            <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                          </motion.div>
                        ) : null}
                      </div>
                      {isFinalExam &&
                        onlyFinalExamLeft &&
                        !isLessonCompleted(lesson._id) &&
                        !isCompleted && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-2 relative"
                          >
                            <div className="bg-indigo-100 text-indigo-800 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg rounded-tl-none relative">
                              <div className="absolute -left-2 top-2 w-2 h-2 bg-indigo-100 transform rotate-45"></div>
                              Please start final exam to complete course
                            </div>
                          </motion.div>
                        )}
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;
