const express = require("express");
const lessonController = require("../Controllers/LessonController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/create-lesson/:course_id",
  auth.verifyUser,
  auth.verifyTutor,
  lessonController.createLesson
);

router.get(
  "/all-lessons/:course_id",
  auth.verifyUser,
  lessonController.getAllLessons
);

router.get("/:lesson_id", auth.verifyUser, lessonController.getLessonById);

module.exports = router;
