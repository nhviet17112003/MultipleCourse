const Wallet = require("../Models/Wallet");
const mongoose = require("mongoose");
// Show số tiền
exports.showBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ tutor: req.user._id }).select(
      "current_balance"
    );
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    } else {
      res.status(200).json({ current_balance: wallet.current_balance });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Rút tiền
exports.withdrawRequest = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount." });
    }

    // Tìm Wallet của tutor
    const wallet = await Wallet.findOne({ tutor: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found." });
    }

    // Kiểm tra nếu đã có yêu cầu rút tiền đang chờ xử lý
    const hasPendingRequest = wallet.withdrawals.some(
      (withdrawal) => withdrawal.status === "Pending"
    );

    if (hasPendingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending withdrawal request." });
    }

    if (wallet.current_balance < amount) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Thêm yêu cầu rút tiền vào mảng
    wallet.withdrawals.push({
      amount,
      status: "Pending",
    });

    await wallet.save();

    res.status(200).json({
      message: "Withdrawal request submitted successfully.",
      withdrawals: wallet.withdrawals,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lịch sử rút tiền
exports.withdrawHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ tutor: req.user._id }).select(
      "withdrawals"
    );

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found." });
    }

    res.status(200).json({ withdrawals: wallet.withdrawals });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Show lệnh rút (Admin)
exports.showAllWithdrawRequests = async (req, res) => {
  try {
    // Tìm tất cả Wallet có yêu cầu rút tiền
    const wallets = await Wallet.find()
      .populate("tutor", "fullname email phone bankAccount") // Populate thông tin ngân hàng từ User
      .select("withdrawals");

    // Format kết quả
    const pendingRequests = wallets.flatMap((wallet) =>
      wallet.withdrawals.map((withdrawal) => ({
        withdrawal_id: withdrawal._id,
        tutor: {
          fullname: wallet.tutor.fullname,
          email: wallet.tutor.email,
          phone: wallet.tutor.phone,
        },
        amount: withdrawal.amount,
        date: withdrawal.date,
        bank_account: wallet.tutor.bankAccount, // Thông tin ngân hàng lấy từ User
        status: withdrawal.status,
      }))
    );

    res.status(200).json({ pendingRequests });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Xác nhận chuyển tiền và trừ tiền vào ví (Admin)
exports.confirmWithdrawRequest = async (req, res) => {
  try {
    const { withdrawalId } = req.body; // Chỉ cần ID của lệnh rút

    // Tìm Wallet chứa lệnh rút
    const wallet = await Wallet.findOne({
      "withdrawals._id": new mongoose.Types.ObjectId(withdrawalId),
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Tìm lệnh rút trong wallet
    const withdrawal = wallet.withdrawals.id(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status === "Approved") {
      return res
        .status(400)
        .json({ message: "Withdrawal request already completed" });
    }

    // Cập nhật trạng thái lệnh rút và trừ tiền từ ví của tutor
    withdrawal.status = "Approved";
    wallet.current_balance -= withdrawal.amount; // Trừ tiền vào ví của tutor

    // Chỉ cộng vào `total_withdrawal` khi lệnh rút được duyệt
    wallet.total_withdrawal =
      (wallet.total_withdrawal || 0) + withdrawal.amount;

    await wallet.save();

    res
      .status(200)
      .json({ message: "Withdrawal request confirmed successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Từ chối lệnh rút (Admin)
exports.rejectWithdrawRequest = async (req, res) => {
  try {
    const { withdrawalId } = req.body; // Chỉ cần ID của lệnh rút

    // Tìm Wallet chứa lệnh rút
    const wallet = await Wallet.findOne({
      "withdrawals._id": new mongoose.Types.ObjectId(withdrawalId),
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Tìm lệnh rút trong wallet
    const withdrawal = wallet.withdrawals.id(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status === "Approved") {
      return res
        .status(400)
        .json({ message: "Withdrawal request already completed" });
    }

    // Cập nhật trạng thái lệnh rút
    withdrawal.status = "Rejected";

    await wallet.save();

    res
      .status(200)
      .json({ message: "Withdrawal request rejected successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
