import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";

const CourseLearningPage = () => {
  const { courseId } = useParams();
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

        setLessons(lessonsData);
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
      updateLessonProgress("Completed", "Understood well");
    }
  };

  const handleNoteSubmit = () => {
    setNotes([...notes, { content: note }]);
    setNote("");
  };

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
      {/* Phần hiển thị bài học */}
      <div className="w-full md:w-2/3 p-6 bg-white shadow-xl rounded-lg">
        {currentLesson ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              {currentLesson.title}
              {currentLesson.status === "Completed" && (
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              )}
            </h1>
            <video
              ref={videoRef}
              src={currentLesson.video_url}
              controls
              className="w-full rounded-xl shadow-lg mt-4"
              onEnded={handleVideoEnd}
            ></video>

            <div className="mt-6">
              <textarea
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú bài học..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
              <button
                onClick={handleNoteSubmit}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Lưu ghi chú
              </button>
            </div>
          </div>
        ) : (
          <p className="text-lg text-gray-600">
            Chưa có bài học nào được chọn.
          </p>
        )}
      </div>

      {/* Danh sách bài học */}
      <div className="w-full md:w-1/3 bg-white p-6 border-l shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Danh sách bài học
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
              <span className="text-gray-700 font-medium">
                <strong>Bài {lesson.number}:</strong> {lesson.title}
              </span>
              {isLessonCompleted(lesson._id) ? (
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
