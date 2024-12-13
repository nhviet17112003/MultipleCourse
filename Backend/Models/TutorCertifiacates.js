const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentCertificateSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  tutor_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  certificate_url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("TutorCertificates", StudentCertificateSchema);
