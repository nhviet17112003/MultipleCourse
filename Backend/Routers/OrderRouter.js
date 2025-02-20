const express = require("express");
const orderController = require("../Controllers/OrderController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/create-order/:cart_id",
  cors.corsWithOptions,
  auth.verifyUser,
  orderController.createOrder
);

router.get(
  "/all-orders",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getAllOrders
);

router.get(
  "/my-orders",
  cors.corsWithOptions,
  auth.verifyUser,
  orderController.getMyOrders
);

router.get(
  "/revenue",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getRevenueForAdmin
);

router.get(
  "/revenue-each-month",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getRevenueEachMonthForAdmin
);

router.get(
  "/revenue-day",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getRevenueForToday
);

router.get(
  "/revenue-year",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getRevenueForThisYear
);

router.get(
  "/total-course-sold/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getCourseSalesCountById
);

module.exports = router;
