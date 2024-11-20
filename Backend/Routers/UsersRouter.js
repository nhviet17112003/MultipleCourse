const express = require("express");
const userController = require("../Controllers/UserController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post("/signup", cors.corsWithOptions, userController.signUp);
router.post("/login", cors.corsWithOptions, userController.login);
router.post(
  "/change-password",
  cors.corsWithOptions,
  auth.verifyUser,
  userController.changePassword
);
router.post(
  "/forgot-password",
  cors.corsWithOptions,
  userController.forgotPassword
);
router.post("/reset-password", cors.corsWithOptions, userController.confirmOTP);
router.post(
  "/update-profile",
  cors.corsWithOptions,
  auth.verifyUser,
  userController.updateUser
);
router.get(
  "/profile",
  cors.corsWithOptions,
  auth.verifyUser,
  userController.getUserById
);
router.get(
  "/all-users",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  userController.getAllUsers
);

module.exports = router;
