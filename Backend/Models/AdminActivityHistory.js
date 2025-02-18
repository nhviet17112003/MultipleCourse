const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminActivityHistorySchema = new Schema({
  admin: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  entry_date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(
  "AdminActivityHistory",
  AdminActivityHistorySchema
);
