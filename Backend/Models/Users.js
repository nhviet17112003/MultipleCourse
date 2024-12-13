const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  googleId: {
    type: String,
    default: undefined,
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "Other",
    enum: ["Male", "Female", "Other"],
  },
  birthday: {
    type: Date,
    default: undefined,
  },
  address: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    default: "Student",
    enum: ["Student", "Admin", "Tutor"],
  },
  tutor_certificates: [
    {
      title: { type: String, required: true },
      certificate_url: { type: String, required: true },
    },
  ],
  resetPasswordOTP: {
    type: String,
    default: undefined,
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Users", UserSchema);
