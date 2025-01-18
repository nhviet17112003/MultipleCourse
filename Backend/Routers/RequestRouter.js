const express = require("express");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();
const requestController = require("../Controllers/RequestController");

router.get(
  "/all-requests",
  cors.cors,
  auth.verifyUser,
  auth.verifyAdmin,
  requestController.getAllRequests
);
router.get(
  "/request-detail/:request_id",
  cors.cors,
  auth.verifyUser,
  auth.verifyAdmin,
  requestController.getRequestById
);

module.exports = router;
