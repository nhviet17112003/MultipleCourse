const express = require("express");
const walletController = require("../Controllers/WalletController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.get(
  "/show-balance",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  walletController.showBalance
);

router.post(
  "/withdrawal-request",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  walletController.withdrawRequest
);

router.get(
  "/requests-history",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  walletController.withdrawHistory
);

router.get(
  "/all-withdrawal-requests",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  walletController.showAllWithdrawRequests
);

router.put(
  "/approve-withdrawal-request",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  walletController.confirmWithdrawRequest
);

router.put(
  "/reject-withdrawal-request",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  walletController.rejectWithdrawRequest
);
module.exports = router;
