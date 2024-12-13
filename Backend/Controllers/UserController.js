const auth = require("../Loaders/Authenticate");
const passport = require("passport");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Users = require("../Models/Users");
const config = require("../Configurations/Config");

//Sign up
exports.signUp = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }
    Users.register(
      new Users({
        email: req.body.email.toLowerCase(),
        username: req.body.username,
        fullname: req.body.fullname,
        role: req.body.role || "Student",
        status: req.body.status || true,
      }),
      req.body.password,
      (err, user) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        } else {
          res.status(200).json({ message: "User created", user_id: user._id });
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Login
exports.login = async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await Users.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json({ message: "Username not found" });
    }

    const authenticate = Users.authenticate(); //passport-local-mongoose
    authenticate(req.body.username, req.body.password, (err, user) => {
      if (err || !user) {
        return res.status(400).json({ message: "Incorrect password" });
      }
      const token = auth.getToken({ _id: user._id });
      res.status(200).json({ message: "Login successful", token });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Change password
exports.changePassword = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    user.changePassword(oldPassword, newPassword, (err) => {
      if (err) {
        return res.status(400).json({ message: "Incorrect password" });
      }
      user.save();
      res.status(200).json({ message: "Password changed" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    //create otp
    const otp = crypto.randomBytes(3).toString("hex");
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 600000; //10 minutes
    user.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email || "datnptce171966@fpt.edu.vn",
        pass: config.password || "dmua zsks gsdl brlb",
      },
    });

    const mailOptions = {
      to: user.email,
      from: config.email,
      subject: "OTP for reset password",
      html: `
          <p>Dear ${user.fullname},</p>

          <p>You are receiving this message because a password reset was requested for your account.</p>

          <p>Please use the following <strong style="font-size: 1em;">OTP</strong> to reset your password:</p>

          <strong style="font-size: 1.5em;">${otp}</strong>

          <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>

          <p>Thank you,</p>

          <p>Multi Course</p>
`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      res.status(200).json({ message: "OTP sent to your email" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//confirm otp and reset password
exports.confirmOTP = async (req, res) => {
  try {
    const user = await Users.findOne({
      resetPasswordOTP: req.body.otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.setPassword(req.body.newPassword, (err) => {
      if (err) {
        return res.status(400).json({ message: "Invalid password" });
      }
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpires = undefined;
      user.save();
      res.status(200).json({ message: "Password reset successful" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get all users EXCEPT ADMIN
exports.getAllUsersExceptAdmin = async (req, res) => {
  try {
    const users = await Users.find({ role: { $ne: "Admin" } });
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({});
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get user by id
exports.getUserById = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//update user
exports.updateUser = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const fullname = req.body.fullname;
    const phone = req.body.phone;
    const address = req.body.address;
    const birthday = req.body.birthday;
    const gender = req.body.gender;

    user.fullname = fullname || user.fullname;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.birthday = birthday || user.birthday;
    user.gender = gender || user.gender;

    user.save();

    res.status(200).json({ message: "User updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.uploadCertificate = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.tutor_certificates = req.body.certificate;
    user.save();
    res.status(200).json({ message: "Certificate uploaded" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.banAndUnbanUser = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.role === "Admin") {
      return res.status(400).json({ message: "Cannot ban or unban admin" });
    }
    user.status = !user.status;
    user.save();
    if (user.status) {
      res.status(200).json({ message: "User unbanned" });
    } else {
      res.status(200).json({ message: "User banned" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
