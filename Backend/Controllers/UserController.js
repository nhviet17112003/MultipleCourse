const auth = require("../Loaders/Authenticate");
const passport = require("passport");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Users = require("../Models/Users");
const Wallet = require("../Models/Wallet");
const config = require("../Configurations/Config");
const multer = require("multer");
const admin = require("firebase-admin");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function uploadFileToStorage(file, folderPath) {
  const bucket = admin.storage().bucket();
  const blob = bucket.file(folderPath + file.originalname);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });
  blobStream.on("error", (err) => {
    console.log(err);
  });
  blobStream.on("finish", async () => {
    await blob.makePublic();
  });
  blobStream.end(file.buffer);

  // Wait for the blob upload to complete
  await new Promise((resolve, reject) => {
    blobStream.on("finish", resolve);
    blobStream.on("error", reject);
  });

  // Return the public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  return publicUrl;
}

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
      async (err, user) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        } else {
          user.phone = req.body.phone;
          user.gender = req.body.gender;
          user.birthday = req.body.birthday;
          user.address = req.body.address;
          await user.save();

          if (user.role === "Tutor") {
            const wallet = new Wallet({
              tutor: user._id,
            });
            await wallet.save();
          }
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

      // Tạo token
      const token = auth.getToken({ _id: user._id });

      // Trả về token và fullname trong phản hồi
      res.status(200).json({
        message: "Login successful",
        token: token,
        fullname: user.fullname, // Thêm fullname vào đây
        role: user.role,
        status:user.status
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//get user by id
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json(user);
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

    res.status(200).json({ message: "User updated", user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    upload.single("avatar")(req, res, async (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
      }

      if (user.avatar) {
        // Xoá hình ảnh cũ trên Firebase Storage
        const bucket = admin.storage().bucket();
        const filename = user.avatar
          .split("Avatar/" + user.fullname + "/")
          .pop();
        const file = bucket.file("Avatar/" + user.fullname + "/" + filename);
        await file.delete().catch((err) => {
          console.log(err);
        });
      }

      let avatarUrl = null;
      if (req.file) {
        // Upload hình ảnh lên Firebase Storage
        const folderPath = "Avatar/" + user.fullname + "/"; // Thay đổi theo cấu trúc thư mục bạn muốn
        avatarUrl = await uploadFileToStorage(req.file, folderPath);
      }

      user.avatar = avatarUrl;
      user.save();
      res.status(200).json({ message: "Avatar uploaded", avatar: avatarUrl });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//update tutor cetificate
exports.uploadCertificate = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const newCertificates = req.body.certificates;

    // Kiểm tra nếu `tutor_certificates` đã tồn tại, thêm các chứng chỉ chưa có
    if (user.tutor_certificates && user.tutor_certificates.length > 0) {
      for (let newCert of newCertificates) {
        // Kiểm tra xem chứng chỉ đã tồn tại chưa trước khi thêm vào
        const exists = user.tutor_certificates.some(
          (cert) =>
            cert.title === newCert.title &&
            cert.certificate_url === newCert.certificate_url
        );
        if (!exists) {
          user.tutor_certificates.push(newCert);
        }
      }
    } else {
      // Nếu `tutor_certificates` chưa tồn tại, gán trực tiếp mảng mới
      user.tutor_certificates = newCertificates;
    }

    user.save();
    res.status(200).json({
      message: "Certificate uploaded",
      certificates: user.tutor_certificates,
    });
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

//log out
exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.updateBankAccount = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const { bank_name, account_number, account_name } = req.body;

    if (!bank_name || !account_number || !account_name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!user.bankAccount || user.bankAccount.length < 1) {
      // Thêm mới tài khoản ngân hàng
      user.bankAccount.push({ bank_name, account_number, account_name });
    } else {
      // Cập nhật tài khoản ngân hàng hiện có
      user.bankAccount[0].bank_name = bank_name;
      user.bankAccount[0].account_number = account_number;
      user.bankAccount[0].account_name = account_name;
    }

    await user.save();

    res.status(200).json({ message: "Bank account updated", user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
