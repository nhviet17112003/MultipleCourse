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

//Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    // Middleware xử lý 1 video và 1 document
    const uploadMiddleware = upload.fields([
      { name: "video", maxCount: 1 },
      { name: "document", maxCount: 1 },
    ]);

    uploadMiddleware(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "File upload error" });
      }

      const course_id = req.params.course_id;
      const course = await Course.findById({
        _id: course_id,
        teacher_id: req.user._id,
      });
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const { number, title, description } = req.body;
      const existLesson = await Lesson.findOne({ course_id, number });
      if (existLesson) {
        return res.status(400).json({ message: "Lesson already exists" });
      }
      if (!number || !title || !description) {
        return res.status(400).json({
          message: "All fields (number, title, description) are required",
        });
      }

      let videoUrl = null;
      let documentUrl = null;

      // Upload video nếu tồn tại
      if (req.files?.video && req.files.video.length > 0) {
        const videoFolderPath = `Courses/${course.title}/Lesson_${number}_${title}/Videos/`;
        videoUrl = await uploadFileToStorage(
          req.files.video[0],
          videoFolderPath
        );
      }

      // Upload document nếu tồn tại
      if (req.files?.document && req.files.document.length > 0) {
        const documentFolderPath = `Courses/${course.title}/Lesson_${number}_${title}/Documents/`;
        documentUrl = await uploadFileToStorage(
          req.files.document[0],
          documentFolderPath
        );
      }

      // Tạo bài học mới
      const lesson = new Lesson({
        course_id,
        number,
        title,
        description,
        video_url: videoUrl,
        document_url: documentUrl,
      });

      await lesson.save();
      res.status(201).json(lesson);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get all lessons of a course
exports.getAllLessons = async (req, res) => {
  try {
    const course_id = req.params.course_id;
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lessons = await Lesson.find({ course_id });
    res.json(lessons);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get a lesson by id
exports.getLessonById = async (req, res) => {
  try {
    const lesson_id = req.params.lesson_id;
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.json(lesson);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Update a lesson
