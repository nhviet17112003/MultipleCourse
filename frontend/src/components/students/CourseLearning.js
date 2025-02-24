import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const CourseLearningPage = () => {
  const { courseId } = useParams();
  console.log(courseId);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const videoRef = useRef(null);
  const location = useLocation();
  const progressId = new URLSearchParams(location.search).get("progressId");
  const [progressData, setProgressData] = useState(null);
  const [activeTab, setActiveTab] = useState("Description");
  const [isExamStarted, setIsExamStarted] = useState(false);
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [examScore, setExamScore] = useState(0);
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
      const lessonId = currentLesson._id; // Lấy ID bài học
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="w-full md:w-2/3 p-6 bg-white shadow-xl rounded-lg">
        {currentLesson ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              {currentLesson.title}
              {currentLesson.status === "Completed" && (
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              )}
            </h1>
            {/* <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
              <span className="text-blue-500">
                <i className="fas fa-calendar-alt"></i>
              </span>
              <strong>Created At:</strong>{" "}
              <span className="text-gray-600">
                {new Date(currentLesson.created_at).toLocaleString()}
              </span>
            </div> */}
            {currentLesson?.type === "exam" &&
            currentLesson.title === "Final Exam" ? (
              <div className="mt-6 flex flex-col justify-center">
                {examScore > 0 && (
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="text-lg font-bold text-gray-600 text-center">
                      Score:
                      <span className="text-2xl font-bold text-blue-600">
                        {examScore}
                      </span>
                    </p>
                  </div>
                )}
                {isCompleted ? (
                  <div className="bg-green-100 p-8 rounded-lg shadow-md mb-8 flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-green-600"
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
                    </svg>
                    <h3 className="text-green-600 font-bold mb-4 text-2xl">
                      Congratulations!
                    </h3>
                    <p className="text-gray-600 text-center mb-8 text-xl">
                      You have completed the course...
                    </p>
                    <a
                      href="http://localhost:3001/my-certificate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
                    >
                      View your certificate here
                    </a>
                  </div>
                ) : examScore > 0 && examScore < 8 ? (
                  <button
                    onClick={() => navigate(`/final-exam/${courseId}`)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 max-w-xs mx-auto"
                  >
                    Try Again
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/final-exam/${courseId}`)}
                    className="bg-blue-600 text-white px-4 py-2 mx-auto rounded-lg font-bold shadow-md hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 max-w-xs"
                  >
                    Start Exam
                  </button>
                )}
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={currentLesson.video_url}
                  controls
                  className="w-full rounded-xl shadow-lg mt-4"
                  onEnded={handleVideoEnd}
                ></video>
                {currentLesson.document_url && (
                  <div className="flex justify-center">
                    <a
                      href={currentLesson.document_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className=" mt-3 py-3 px-6 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download document
                      </span>
                    </a>
                  </div>
                )}
                <div className="border-b mb-4">
                  <nav className="flex space-x-4">
                    {["Description", "Note", "Comment"].map((tab) => (
                      <button
                        key={tab}
                        className={`py-2 px-4 ${
                          activeTab === tab
                            ? "border-b-2 border-blue-500 font-semibold"
                            : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </nav>
                </div>
                <div>
                  {activeTab === "Description" && (
                    <div className="mt-6 space-y-6">
                      <div className="mt-4">
                        <h3 className="text-2xl font-semibold text-gray-800">
                          Lesson Description
                        </h3>
                        <p className="text-base text-gray-600 mt-2">
                          {currentLesson.description}
                        </p>
                      </div>
                    </div>
                  )}
                  {activeTab === "Note" && (
                    <div className="mt-6 space-y-6">
                      {currentNote && (
                        <div className="bg-gray-50 p-4 border-l-4 border-blue-500 text-lg text-gray-700 shadow-sm rounded-md">
                          <h3 className="font-semibold text-blue-600">Note:</h3>
                          <p className="text-gray-600">{currentNote}</p>
                        </div>
                      )}
                      <div className="space-y-3">
                        <textarea
                          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                          placeholder="Lesson notes..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end">
                          <button
                            onClick={handleNoteSubmit}
                            className="py-3 px-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "Comment" && currentLesson && (
                    <div className="mt-6 space-y-6">
                      <h3 className="text-2xl font-semibold text-gray-800">
                        Comments
                      </h3>

                      {/* Form để viết comment */}
                      <div className="space-y-4">
                        <textarea
                          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                          placeholder="Write your comment..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                        <button
                          onClick={() => {
                            if (note.trim()) {
                              handleCommentSubmit();
                            }
                          }}
                          className="py-3 px-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                        >
                          Post Comment
                        </button>
                      </div>

                      {/* Hiển thị danh sách comment */}
                      {currentLesson.comments &&
                      currentLesson.comments.length > 0 ? (
                        currentLesson.comments.map((comment) => (
                          <div key={comment._id} className="p-4 border-b">
                            <p className="text-sm">{comment.author}</p>
                            <p className="text-gray-700">{comment.comment}</p>
                            <div className="text-sm text-gray-500">
                              {new Date(comment.date).toLocaleString()}
                            </div>

                            {/* Chỉnh sửa và xóa comment */}
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => {
                                  const newComment = prompt(
                                    "Edit your comment:",
                                    comment.comment
                                  );
                                  if (newComment)
                                    handleEditComment(comment._id, newComment);
                                }}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No comments yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-lg text-gray-600">
            No lessons have been selected yet.
          </p>
        )}
      </div>
      <div className="w-full md:w-1/3 bg-white p-6 border-l shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          List of lessons
        </h2>
        <ul className="space-y-3">
          {lessons.map((lesson, index) => (
            <li
              key={lesson._id}
              className={`p-4 rounded-lg flex items-center justify-between transition duration-300 shadow-sm ${
                canAccessLesson(index)
                  ? "cursor-pointer bg-gray-100 hover:bg-gray-200"
                  : "bg-gray-300 cursor-not-allowed opacity-70"
              }`}
              onClick={() => canAccessLesson(index) && setCurrentLesson(lesson)}
            >
              <span className="text-gray-700 font-medium">{lesson.title}</span>
              {lesson._id === "exam_final" && isCompleted ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              ) : isLessonCompleted(lesson._id) ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              ) : !canAccessLesson(index) ? (
                <LockClosedIcon className="h-6 w-6 text-gray-500" />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseLearningPage;
