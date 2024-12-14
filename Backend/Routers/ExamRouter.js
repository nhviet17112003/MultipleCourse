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

module.exports = router;
