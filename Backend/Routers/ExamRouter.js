const express = require("express");
const ExamController = require("../Controllers/ExamController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/create-exam",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  ExamController.createExam
);

router.get(
  "/take-exam/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  ExamController.createStudentExam
);


router.post(
  "/submit-exam/:exam_id",
  cors.corsWithOptions,
  auth.verifyUser,
  ExamController.submitExam
);
module.exports = router;
