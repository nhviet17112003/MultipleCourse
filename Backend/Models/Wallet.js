const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  tutor: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  current_balance: {
    type: Number,
    default: 0,
  },
  total_earning: {
    type: Number,
    default: 0,
  },
  total_withdrawal: {
    type: Number,
    default: 0,
  },
  withdrawals: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
    },
  ],
});

module.exports = mongoose.model("Wallet", WalletSchema);
