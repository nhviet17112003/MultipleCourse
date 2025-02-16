const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const Course = require("../Models/Courses");
const StudentCertificate = require("../Models/StudentCertificates");
const User = require("../Models/Users");
const StudentExamRS = require("../Models/StudentExamResults");

const width = 800;
const height = 600;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

const multer = require("multer");
const admin = require("firebase-admin");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function uploadFileToStorage(buffer, fileName) {
  const bucket = admin.storage().bucket();
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    metadata: { contentType: "image/png" },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (err) => reject(err));
    blobStream.on("finish", async () => {
      await blob.makePublic();
      resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
    });

    blobStream.end(buffer);
  });
}

exports.generateCertificate = async (req, res) => {
  try {
    const fullname = req.user.fullname;
    const course_id = req.params.course_id;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const studentExamRS = await StudentExamRS.findOne({
      student: req.user._id,
      course: course_id,
    });
    if (!studentExamRS) {
      return res.status(404).json({ message: "Exam result not found" });
    }

    const certificate = await StudentCertificate.findOne({
      student: req.user._id,
      course: course_id,
    });
    if (certificate) {
      return res.status(400).json({ message: "Certificate already exists" });
    }

    //nếu score < 80% của total mark thì không cấp chứng chỉ
    if (studentExamRS.score < 0.8 * studentExamRS.total_mark) {
      return res.status(400).json({ message: "You are not passed" });
    }

    // Nền sáng
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Viền chứng chỉ
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Logo góc trên trái
    const logo = await loadImage("./public/images/logo.png"); // Thay đường dẫn logo
    ctx.drawImage(logo, 50, 50, 150, 150);

    // Tiêu đề
    ctx.fillStyle = "#000000";
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CERTIFICATE OF COMPLETION", width / 2, 150);

    // Họ tên người nhận
    ctx.fillStyle = "#003366";
    ctx.font = "bold 36px Arial";
    ctx.fillText(fullname || "John Doe", width / 2, 250);

    // Văn bản chứng nhận
    ctx.fillStyle = "#000000";
    ctx.font = "24px Arial";
    ctx.fillText("has successfully completed the course", width / 2, 300);
    ctx.fillText(`"${course.title}"`, width / 2, 350);

    // Chữ ký giảng viên
    ctx.fillText("Instructor", width - 200, height - 120);
    ctx.beginPath();
    ctx.moveTo(width - 250, height - 140);
    ctx.lineTo(width - 100, height - 140);
    ctx.stroke();

    // Tạo buffer từ canvas
    const buffer = Buffer.from(canvas.toBuffer("image/png").buffer);
    const filename = `certificate_${Date.now()}.png`;
    const folderPath = `Certificate/${course.title}/`;

    // Upload lên Firebase Storage
    const publicUrl = await uploadFileToStorage(
      buffer,
      `certificates/${filename}`
    );

    // Lưu thông tin chứng chỉ vào database
    const newCertificate = new StudentCertificate({
      title: "Certificate of Achievement",
      course: course_id,
      student: req.user._id,
      totalMark: studentExamRS.totalMark,
      isPassed: true,
      issue_date: new Date(),
      certificate_url: publicUrl,
    });
    await newCertificate.save();

    res.status(201).json({ certificateUrl: publicUrl });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const course_id = req.params.course_id;
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const certificate = await StudentCertificate.findOne({
      student: req.user._id,
      course: course_id,
    })
      .populate("course", "title")
      .exec();

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.status(200).json({ certificate });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllStudentCertificates = async (req, res) => {
  try {
    const certificates = await StudentCertificate.find({
      student: req.user._id,
    })
      .populate("course", "title")
      .exec();
    res.status(200).json({ certificates });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getTutorCertificate = async (req, res) => {
  try {
    const tutor = await User.findById(req.user._id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    res.status(200).json({ certificates: tutor.tutor_certificates });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Upload tutor certificate
exports.uploadTutorCertificate = async (req, res) => {
  try {
    const newCertificates = req.body.certificates;
    const tutor = await User.findById(req.user._id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const existsCertificate = [];

    if (tutor.tutor_certificates && tutor.tutor_certificates.length > 0) {
      for (let newCert of newCertificates) {
        // Kiểm tra xem chứng chỉ đã tồn tại chưa trước khi thêm vào
        const exists = tutor.tutor_certificates.some(
          (cert) => cert.title === newCert.title
        );
        if (exists) {
          existsCertificate.push(newCert.title);
        } else {
          tutor.tutor_certificates.push(newCert);
        }
      }

      if (existsCertificate.length > 0) {
        return res.status(400).json({
          message:
            "Certificate" +
            existsCertificate.map((cert) => " " + cert) +
            " already exists",
        });
      }
    } else {
      // Nếu `tutor_certificates` chưa tồn tại, gán trực tiếp mảng mới
      tutor.tutor_certificates = newCertificates;
    }
    await tutor.save();
    res.status(200).json({
      message: "Certificate uploaded",
      certificates: tutor.tutor_certificates,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Delete tutor certificate
exports.deleteTutorCertificate = async (req, res) => {
  try {
    const certificate_id = req.params.certificate_id;
    const tutor = await User.findById(req.user._id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    tutor.tutor_certificates = tutor.tutor_certificates.filter(
      (cert) => cert._id.toString() !== certificate_id
    );
    await tutor.save();
    res.status(200).json({
      message: "Certificate deleted",
      certificates: tutor.tutor_certificates,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
