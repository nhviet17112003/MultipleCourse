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
  "/course-of-tutor",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.getCourseOfTutor
);
router.get(
  "/detail/:id",
  cors.corsWithOptions,
  auth.verifyUser,
  courseController.getCourseById
);
//Request to create course
router.post(
  "/create-course",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.processCreateCourse
);
//Process request to create course
router.post(
  "/process-create-course/:process_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  courseController.processCreateCourse
);
//Request to update course
router.put(
  "/update-course/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.requestUpdateCourse
);
//Process request to update course
router.put(
  "/process-update-course/:process_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  courseController.processUpdateCourse
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
  auth.verifyAdmin,
  courseController.changeCourseStatus
);
module.exports = router;
