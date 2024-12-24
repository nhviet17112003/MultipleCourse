const express = require("express");
const progressController = require("../Controllers/ProgressController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post("/", cors, auth.verifyUser, progressController.createProgress);
router.get("/", cors, auth.verifyUser, progressController.getAllProgress);
router.get("/:id", cors, auth.verifyUser, progressController.getProgressById);
router.put("/:id", cors, auth.verifyUser, progressController.updateProgress);

module.exports = router;
