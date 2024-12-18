const express = require("express");
const paymentController = require("../Controllers/PaymentController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/create-payment/:cart_id",
  cors.corsWithOptions,
  auth.verifyUser,
  paymentController.createPayment
);

router.get(
  "/check-payment/:orderCode",
  cors.corsWithOptions,
  paymentController.checkPayment
);

module.exports = router;
