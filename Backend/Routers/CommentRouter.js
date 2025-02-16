const express = require("express");
const commentController = require("../Controllers/CommentController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/create-course-comment",
  cors.corsWithOptions,
  auth.verifyUser,
  commentController.createCourseComment
);

router.put(
  "/update-course-comment",
  cors.corsWithOptions,
  auth.verifyUser,
  commentController.updateCourseComment
);

router.delete(
  "/delete-course-comment",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdminOrStudent,
  commentController.deleteCourseComment
);

router.post(
  "/create-lesson-comment",
  cors.corsWithOptions,
  auth.verifyUser,
  commentController.createLessonComment
);

router.put(
  "/update-lesson-comment",
  cors.corsWithOptions,
  auth.verifyUser,
  commentController.updateLessonComment
);

router.delete(
  "/delete-lesson-comment",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdminOrStudent,
  commentController.deleteLessonComment
);

router.put(
  "/change-course-comment-status/:course_id/:comment_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  commentController.updateCourseCommentStatus
);

router.put(
  "/change-lesson-comment-status/:lesson_id/:comment_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  commentController.updateLessonCommentStatus
);

router.get(
  "/show-all-comments",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  commentController.getAllCommentsForAdmin
);
module.exports = router;
