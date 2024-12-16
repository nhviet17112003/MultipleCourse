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

//Get Course of Tutor
exports.getCourseOfTutor = async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.user._id });
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

//Update Course
exports.updateCourse = async (req, res) => {
  try {
    const newTitle = req.body.title;
    const description = req.body.description;
    const price = Number(req.body.price);
    const category = req.body.category;

    const course = await Course.findOne({
      _id: req.params.course_id,
      tutor: req.user._id,
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Nếu tiêu đề mới khác với tiêu đề cũ
    if (course.title !== newTitle) {
      const oldFolderPath = `Courses/${course.title}/`;
      const newFolderPath = `Courses/${newTitle}/`;

      // Move all files in the old folder to the new folder
      const bucket = admin.storage().bucket();
      const [files] = await bucket.getFiles({ prefix: oldFolderPath });
      if (files.length > 0) {
        for (const file of files) {
          const oldFilePath = file.name;

          // Tạo đường dẫn mới cho file
          const newFilePath = oldFilePath.replace(oldFolderPath, newFolderPath);

          // Sao chép file sang folder mới
          await bucket.file(oldFilePath).copy(bucket.file(newFilePath));
          // Công khai file mới
          await bucket.file(newFilePath).makePublic();
          // Xóa file cũ
          await bucket.file(oldFilePath).delete();
        }
      }

      if (course.image) {
        course.image = course.image.replace(
          `Courses/${course.title}/`,
          `Courses/${newTitle}/`
        );
      }

      const lessons = await Lesson.find({ course_id: req.params.course_id });
      for (const lesson of lessons) {
        lesson.video_url = lesson.video_url.replace(
          `Courses/${course.title}/`,
          `Courses/${newTitle}/`
        );
        lesson.document_url = lesson.document_url.replace(
          `Courses/${course.title}/`,
          `Courses/${newTitle}/`
        );
        await lesson.save();
      }

      course.title = newTitle;
    }

    course.description = description;
    course.price = price;
    course.category = category;

    await course.save();
    res.status(200).json(course);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Update Course Image
exports.updateCourseImage = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.course_id,
      tutor: req.user._id,
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const bucket = admin.storage().bucket();

    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
      }

      let imageUrl = null;
      if (req.file) {
        const folderPath = "Courses/" + course.title + "/";
        imageUrl = await uploadFileToStorage(req.file, folderPath);

        // Xóa hình ảnh cũ

        if (course.image) {
          const oldFilePath = course.image.split("firebasestorage.app/")[1]; // Lấy đường dẫn file từ URL
          if (oldFilePath) {
            const file = bucket.file(oldFilePath);
            await file.delete().catch((err) => {
              console.log("Error deleting old image:", err);
            });
          }
        }
      }

      course.image = imageUrl;
      await course.save();
      res.status(200).json(course);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Update Course status
exports.changeCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.status = !course.status;
    await course.save();
    if (course.status == false) {
      res.status(200).json({ message: "Course now is not available" });
    } else {
      res.status(200).json({ message: "Course now is available" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
