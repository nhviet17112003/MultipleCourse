const express = require("express");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();
const certificateController = require("../Controllers/CertificateController");

router.post(
  "/create-certificate/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  certificateController.generateCertificate
);

module.exports = router;
