const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  order_code: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: "Orders",
    required: true,
  },
  payment_status: {
    type: String,
    enum: ["Pending", "Cancelled", "Paid"],
    required: true,
  },
  description: {
    type: String,
    default: undefined,
  },
  payment_amount: {
    type: Number,
    required: true,
  },
  payment_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
