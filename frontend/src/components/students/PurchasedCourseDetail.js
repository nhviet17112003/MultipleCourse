import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaFileAlt,
  FaStar,
  FaBook,
  FaComments,
  FaEdit,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaVideo,
  FaFilePdf,
  FaMoneyBillWave,
  FaLayerGroup,
} from "react-icons/fa";

const PurchasedCourseDetail = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showTutorPopup, setShowTutorPopup] = useState(false);
  const toggleTutorPopup = () => {
    setShowTutorPopup(!showTutorPopup);
  };
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
    const fetchCourseDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/courses/detail/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch course detail");
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        "http://localhost:3000/api/comments/create-course-comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            courseId,
            rating,
            comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit comment");
      }

      const updatedResponse = await fetch(
        `http://localhost:3000/api/courses/detail/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setCourse(updatedData);
        setComment("");
        setRating(5);
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditComment(comment.comment);
    setEditRating(comment.rating);
    setShowEditModal(true);
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        "http://localhost:3000/api/comments/update-course-comment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            courseId,
            commentId: editingComment._id,
            rating: editRating,
            comment: editComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update comment");
      }

      const updatedResponse = await fetch(
        `http://localhost:3000/api/courses/detail/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setCourse(updatedData);
        setShowEditModal(false);
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/comments/delete-course-comment",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            courseId,
            commentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete comment");
      }

      // Refresh course data
      const updatedResponse = await fetch(
        `http://localhost:3000/api/courses/detail/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setCourse(updatedData);
      }
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;

  const { courseDetail, lessons } = course;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Courses
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="md:w-1/2">
                <img
                  src={courseDetail.image}
                  alt={courseDetail.title}
                  className="w-full h-80 object-cover rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
                />
                <div>
                  {/* Thông tin tutor */}
                  {courseDetail.tutor && (
                    <div className="flex justify-center mt-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            courseDetail.tutor.avatar || "default-avatar.png"
                          }
                          alt={courseDetail.tutor.fullname || "Unknown Tutor"}
                          className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-teal-500"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Tutor</span>
                          <span
                            onClick={toggleTutorPopup} // Thêm sự kiện click để toggle popup
                            className="text-teal-700 font-bold text-base cursor-pointer hover:underline"
                          >
                            {courseDetail.tutor.fullname}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Popup hiển thị thông tin tutor */}
                  {showTutorPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative">
                        <button
                          onClick={toggleTutorPopup}
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                          ✖
                        </button>

                        <h2 className="text-2xl font-bold text-center mb-4">
                          Tutor Details
                        </h2>

                        <div className="flex flex-col items-center">
                          <img
                            src={
                              courseDetail.tutor.avatar || "default-avatar.png"
                            }
                            alt={courseDetail.tutor.fullname || "Unknown Tutor"}
                            className="w-24 h-24 rounded-full mb-2"
                          />
                          <h3 className="text-xl font-semibold">
                            {courseDetail.tutor.fullname}
                          </h3>
                          <p className="text-gray-500">
                            {courseDetail.tutor.email}
                          </p>
                        </div>

                        <hr className="my-4" />

                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Tutor Information
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                              <p className="font-semibold">Address</p>
                              <p>{courseDetail.tutor.address || "N/A"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Phone</p>
                              <p>{courseDetail.tutor.phone || "N/A"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Gender</p>
                              <p>{courseDetail.tutor.gender || "N/A"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Birthday</p>
                              <p>
                                {courseDetail.tutor.birthday
                                  ? new Date(
                                      courseDetail.tutor.birthday
                                    ).toLocaleDateString("en-GB")
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end mt-6">
                          <button
                            onClick={toggleTutorPopup}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin khóa học bên phải hình ảnh */}
              <div className="md:w-1/2">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {courseDetail.title}
                </h1>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {courseDetail.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl">
                    <FaBook className="mr-3 text-xl" />
                    <div>
                      <p className="text-sm text-indigo-600">Lessons</p>
                      <p className="font-semibold">
                        {course?.lessons?.length || 0} lessons
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-purple-100 text-purple-700 px-4 py-3 rounded-xl">
                    <FaMoneyBillWave className="mr-3 text-xl" />
                    <div>
                      <p className="text-sm text-purple-600">Price</p>
                      <p className="font-semibold">
                        {course?.courseDetail?.price.toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-green-100 text-green-700 px-4 py-3 rounded-xl">
                    <FaLayerGroup className="mr-3 text-xl" />
                    <div>
                      <p className="text-sm text-green-600">Category</p>
                      <p className="font-semibold">
                        {course?.courseDetail?.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-blue-100 text-blue-700 px-4 py-3 rounded-xl">
                    <FaCalendarAlt className="mr-3 text-xl" />
                    <div>
                      <p className="text-sm text-blue-600">Created At</p>
                      <p className="font-semibold">
                        {new Date(courseDetail.createAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-500 text-2xl mr-2" />
                    <div>
                      <p className="text-sm text-yellow-600">Average Rating</p>
                      <p className="font-semibold text-yellow-700">
                        {courseDetail.average_rating.toFixed(1)}/5.0
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaComments className="text-indigo-500 text-xl mr-2" />
                    <div>
                      <p className="text-sm text-indigo-600">Total Reviews</p>
                      <p className="font-semibold text-indigo-700">
                        {courseDetail.comments.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  Course Lessons
                </h2>
                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-semibold">
                  {lessons.length} Lessons
                </span>
              </div>

              <div className="space-y-6">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-indigo-600 font-semibold text-lg">
                          {lesson.number}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-800">
                            {lesson.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {lesson.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mb-4">
                          {lesson.document_url && (
                            <a
                              href={lesson.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                            >
                              <FaFilePdf className="mr-2" />
                              View Materials
                            </a>
                          )}
                        </div>

                        {lesson.comments && lesson.comments.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-800 mb-4">
                              Lesson Feedback ({lesson.comments.length})
                            </h4>
                            <div className="space-y-4">
                              {lesson.comments.map((comment) => (
                                <div
                                  key={comment._id}
                                  className="bg-gray-50 p-4 rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                        <FaUser className="text-indigo-600 text-sm" />
                                      </div>
                                      <div>
                                        <span className="font-semibold text-gray-800 text-sm">
                                          {comment.author}
                                        </span>
                                        <div className="flex items-center text-yellow-500 mt-1">
                                          <FaStar className="mr-1 text-sm" />
                                          <span className="text-xs">
                                            {comment.rating}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        comment.date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm">
                                    {comment.comment}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {courseDetail.comments && courseDetail.comments.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center mb-8">
                  <FaComments className="text-indigo-600 mr-3 text-2xl" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Course Reviews
                  </h2>
                  <span className="ml-4 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    {courseDetail.comments.length} reviews
                  </span>
                </div>
                <div className="space-y-6">
                  {courseDetail.comments
                    .slice(0, showAllComments ? undefined : 5)
                    .map((comment) => (
                      <div
                        key={comment._id}
                        className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-full mr-3">
                              <FaUser className="text-indigo-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800">
                                {comment.author}
                              </span>
                              <div className="flex items-center text-yellow-500 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`mr-1 ${
                                      i < comment.rating
                                        ? "text-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              {new Date(comment.date).toLocaleDateString()}
                            </span>
                            {comment.author === userProfile?.fullname && (
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleEditComment(comment)}
                                  className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 p-2 rounded-full hover:bg-indigo-50"
                                  title="Edit comment"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                                  title="Delete comment"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                </div>
                {courseDetail.comments.length > 5 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setShowAllComments(!showAllComments)}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      {showAllComments ? (
                        <>
                          <span>Show Less</span>
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Show More</span>
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {showEditModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Edit Review
                  </h2>
                  <form onSubmit={handleUpdateComment} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Rating
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className={`text-3xl transition-transform duration-200 hover:scale-110 ${
                              star <= editRating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            <FaStar />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Comment
                      </label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        rows="4"
                        required
                      />
                    </div>
                    {submitError && (
                      <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                        {submitError}
                      </div>
                    )}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 transform hover:scale-105"
                      >
                        {submitting ? "Updating..." : "Update Review"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mt-12 border border-gray-100">
              <div className="flex items-center mb-8">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <FaComments className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Add Your Review
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Share your experience with this course
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitComment} className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-gray-700 font-medium">
                    Your Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-3xl transition-all duration-200 hover:scale-110 ${
                          star <= rating ? "text-yellow-500" : "text-gray-300"
                        }`}
                      >
                        <FaStar />
                      </button>
                    ))}
                    <span className="ml-4 text-gray-600 font-medium">
                      {rating}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-gray-700 font-medium">
                    Your Review
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 min-h-[150px] resize-none"
                    placeholder="Share your thoughts about this course..."
                    required
                  />
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    {submitError}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 transform hover:scale-105"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaComments className="mr-2" />
                        Submit Review
                      </>
                    )}
                  </button>
                  {/* Popup hiển thị thông tin tutor */}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasedCourseDetail;
