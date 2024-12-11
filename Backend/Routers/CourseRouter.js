const express = require("express");
const courseController = require("../Controllers/CourseController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.get(
  "/active-courses",
  cors.cors,
  auth.verifyUser,
  courseController.getActiveCourses
);
router.get(
  "/all-courses",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  auth.verifyTutor,
  courseController.getAllCourses
);
router.get(
  "/detail/:id",
  cors.corsWithOptions,
  auth.verifyUser,
  courseController.getCourseById
);
router.post(
  "/create-course",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.createCourse
);
module.exports = router;
