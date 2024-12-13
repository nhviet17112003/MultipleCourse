const express = require("express");
const courseController = require("../Controllers/CourseController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.get("/active-courses", cors.cors, courseController.getActiveCourses);
router.get(
  "/all-courses",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdminOrTutor,
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
router.put(
  "/update-course/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.updateCourse
);
router.put(
  "/update-course-image/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.updateCourseImage
);
router.put(
  "/change-course-status/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdminOrTutor,
  courseController.changeCourseStatus
);
module.exports = router;
