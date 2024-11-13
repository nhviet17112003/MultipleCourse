const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
  resetPasswordOTP: {
    type: String,
    default: undefined,
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined,
  },
});

module.exports = mongoose.model("Users", UserSchema);
