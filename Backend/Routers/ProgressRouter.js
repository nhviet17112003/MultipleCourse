const express = require("express");
const progressController = require("../Controllers/ProgressController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/",
  cors.corsWithOptions,
  auth.verifyUser,
  progressController.createProgress
);
router.get(
  "/",
  cors.corsWithOptions,
  auth.verifyUser,
  progressController.getAllProgress
);
router.get(
  "/:id",
  cors.corsWithOptions,
  auth.verifyUser,
  progressController.getProgressById
);
router.put(
  "/:id",
  cors.corsWithOptions,
  auth.verifyUser,
  progressController.updateProgress
);

module.exports = router;
