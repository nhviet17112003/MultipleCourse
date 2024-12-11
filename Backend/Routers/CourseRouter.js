const express = require("express");
const courseController = require("../Controllers/CourseController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.get(
  "/active-courses",
  auth.verifyUser,
  courseController.getActiveCourses
);
router.get(
  "/all-courses",
  auth.verifyUser,
  auth.verifyAdmin,
  auth.verifyTutor,
  courseController.getAllCourses
);
router.get("/detail/:id", auth.verifyUser, courseController.getCourseById);
router.post(
  "/create-course",
  auth.verifyUser,
  auth.verifyTutor,
  courseController.createCourse
);
module.exports = router;
