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
    default:
      "https://www.google.com.vn/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Fpremium-vector%2Fdefault-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_136210460.htm&psig=AOvVaw0iy-Yx1A33fESvMObkeIXC&ust=1731565501739000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKjnharW2IkDFQAAAAAdAAAAABAo",
  },
  role: {
    type: String,
    default: "Student",
    enum: ["Student", "Admin", "Tutor"],
  },
  tutor_certificates: [
    {
      type: String,
      default: undefined,
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
