const Course = require("../Models/Courses");
const Lesson = require("../Models/Lessons");
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

//Course with status true
exports.getActiveCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: true });
    res.status(200).json(courses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get All Courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get Course By ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const lessons = await Lesson.find({ course_id: req.params.id });
    res.status(200).json({ courseDetail: course, lessons: lessons });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Create Course
exports.createCourse = async (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
      }

      const tutor = req.user._id;
      const title = req.body.title;
      const description = req.body.description;
      const price = Number(req.body.price);
      const category = req.body.category;

      // Kiểm tra xem file hình ảnh có tồn tại không
      let imageUrl = null;
      if (req.file) {
        // Upload hình ảnh lên Firebase Storage
        const folderPath = "Courses/" + title + "/"; // Thay đổi theo cấu trúc thư mục bạn muốn
        imageUrl = await uploadFileToStorage(req.file, folderPath);
      }

      const newCourse = new Course({
        tutor,
        title,
        description,
        price,
        image: imageUrl,
        category,
      });

      await newCourse.save();
      res.status(201).json(newCourse);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
