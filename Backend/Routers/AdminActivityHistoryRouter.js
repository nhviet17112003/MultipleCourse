const express = require("express");
const AdminActivityHistoryController = require("../Controllers/AdminActivityHistoryController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.get(
  "/",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  AdminActivityHistoryController.getAllAdminActivityHistory
);

module.exports = router;
