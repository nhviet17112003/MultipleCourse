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
  withdrawal_request: {
    type: Number,
    default: undefined,
  },
  withdrawal_status: {
    type: String,
    default: undefined,
    enum: ["Pending", "Approved", "Rejected"],
  },
});

module.exports = mongoose.model("Wallet", WalletSchema);
