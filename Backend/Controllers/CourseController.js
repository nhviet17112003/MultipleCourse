const Course = require("../Models/Courses");
const Lesson = require("../Models/Lessons");
const Request = require("../Models/Requests");
const AdminActivityHistory = require("../Models/AdminActivityHistory");
const multer = require("multer");
const admin = require("firebase-admin");
const { request } = require("express");

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
    const activeCourses = await Course.find({ status: true })
      .populate("tutor", "fullname")
      .exec();
    res.json(activeCourses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get All Courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("tutor", "fullname").exec();
    res.status(200).json(courses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get Course of Tutor
exports.getCourseOfTutor = async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.user._id })
      .populate("tutor", "fullname")
      .exec();
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

//Request Create Course
exports.requetsCreateCourse = async (req, res) => {
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

      const newRequest = new Request({
        tutor,
        course: newCourse._id,
        request_type: "Created new course and waiting for approval",
        status: "Pending",
      });

      await newRequest.save();
      await newCourse.save();
      res.status(201).json(newCourse);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Process Create Course Request
exports.processCreateCourse = async (req, res) => {
  try {
    const status = req.body.status;
    const request = await Request.findById(req.params.request_id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    } else if (request.status === "Rejected") {
      return res.status(400).json({ message: "Request has been rejected" });
    }

    const newAdminActivity = new AdminActivityHistory({
      admin: req.user._id,
    });

    if (status === "Rejected") {
      request.status = "Rejected";
      newAdminActivity.description = `Rejected the request to create a new course with ID: ${request.course}`;
      await request.save();
      return res.status(200).json({ message: "Request has been rejected" });
    }

    if (status === "Approved") {
      const course = await Course.findById(request.course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      course.status = true;
      request.status = "Approved";
      newAdminActivity.description = `Approved the request to create a new course with ID: ${request.course}`;
      await course.save();
      await request.save();
      await newAdminActivity.save();
      res
        .status(200)
        .json({ message: "Course has been created", course: course });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Request Update Course
exports.requestUpdateCourse = async (req, res) => {
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

    const existingRequest = await Request.findOne({
      course: req.params.course_id,
      request_type: "Updated course and waiting for approval",
      status: "Pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Request is already pending" });
    }

    const newRequest = new Request({
      tutor: req.user._id,
      course: course._id,
      request_type: "Updated course and waiting for approval",
      content: [
        { title: "NewTitle", value: newTitle },
        { title: "NewDescription", value: description },
        { title: "Price", value: price },
        { title: "Category", value: category },
      ],
      status: "Pending",
    });

    await newRequest.save();
    res.status(201).json({ message: "Request sent to admin" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Admin process update course request
exports.processUpdateCourse = async (req, res) => {
  try {
    const status = req.body.status;
    const request = await Request.findById(req.params.request_id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    } else if (request.status === "Rejected") {
      return res.status(400).json({ message: "Request has been rejected" });
    }

    const newAdminActivity = new AdminActivityHistory({
      admin: req.user._id,
    });

    if (status === "Rejected") {
      request.status = "Rejected";
      newAdminActivity.description = `Rejected the request to update course with ID: ${request.course}`;
      await request.save();
      return res.status(200).json({ message: "Request has been rejected" });
    }

    if (status === "Approved") {
      const newTitle = request.content.find(
        (item) => item.title === "NewTitle"
      ).value;
      const description = request.content.find(
        (item) => item.title === "NewDescription"
      ).value;
      const price = request.content.find(
        (item) => item.title === "Price"
      ).value;
      const category = request.content.find(
        (item) => item.title === "Category"
      ).value;

      const course = await Course.findById(request.course);
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
            const newFilePath = oldFilePath.replace(
              oldFolderPath,
              newFolderPath
            );

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
      request.status = "Approved";
      newAdminActivity.description = `Approved the request to update course with ID: ${request.course}`;
      await course.save();
      await request.save();
      await newAdminActivity.save();
      res.status(200).json(course);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Request Delete Course
exports.requestDeleteCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.course_id,
      tutor: req.user._id,
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.status === true) {
      return res
        .status(400)
        .json({ message: "Course is active, you can not delete." });
    }

    const existingRequest = await Request.findOne({
      course: req.params.course_id,
      request_type: "Deleted course and waiting for approval",
      status: "Pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Request is already pending" });
    }

    const newRequest = new Request({
      tutor: req.user._id,
      course: course._id,
      request_type: "Deleted course and waiting for approval",
      status: "Pending",
    });

    await newRequest.save();
    res.status(201).json({ message: "Request sent to admin" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Admin process delete course request
exports.processDeleteCourse = async (req, res) => {
  try {
    const status = req.body.status;
    const request = await Request.findById(req.params.request_id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    } else if (request.status === "Rejected") {
      return res.status(400).json({ message: "Request has been rejected" });
    }

    const newAdminActivity = new AdminActivityHistory({
      admin: req.user._id,
    });

    if (status === "Rejected") {
      request.status = "Rejected";
      newAdminActivity.description = `Rejected the request to delete course with ID: ${request.course}`;
      await request.save();
      return res.status(200).json({ message: "Request has been rejected" });
    }

    if (status === "Approved") {
      const course = await Course.findById(request.course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Xóa tất cả các bài học của khóa học
      await Lesson.deleteMany({ course_id: req.params.course_id });

      // Xóa folder chứa tất cả các file của khóa học
      const bucket = admin.storage().bucket();
      const folderPath = `Courses/${course.title}/`;
      const [files] = await bucket.getFiles({ prefix: folderPath });
      if (files.length > 0) {
        for (const file of files) {
          const filePath = file.name;
          await bucket.file(filePath).delete();
        }
      }

      // Xóa khóa học
      await course.deleteOne();
      request.status = "Approved";
      newAdminActivity.description = `Approved the request to delete course with ID: ${request.course}`;
      await request.save();
      await newAdminActivity.save();
      res.status(200).json({ message: "Course has been deleted" });
    }
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

    const newAdminActivity = new AdminActivityHistory({
      admin: req.user._id,
      description: `Changed the status of course with ID: ${
        req.params.course_id
      } form ${course.status} to ${!course.status}`,
    });

    course.status = !course.status;
    await course.save();
    await newAdminActivity.save();
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

//Get top 5 course
exports.getTop5Course = async (req, res) => {
  try {
    const top5Courses = await Course.find({ status: true })
      .sort({ rating: -1 })
      .limit(5)
      .populate("tutor", "fullname")
      .exec();
    res.status(200).json(top5Courses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get top 5 tutor
exports.getTop5Tutor = async (req, res) => {
  try {
    const top5Tutors = await Course.aggregate([
      {
        $match: { status: true, "comments.0": { $exists: true } }, // Chỉ lấy khóa học có ít nhất 1 comment
      },
      {
        $unwind: "$comments", // Tách từng comment thành một document riêng
      },
      {
        $match: { "comments.rating": { $gte: 1, $lte: 5 } }, // Lọc các comment có rating hợp lệ
      },
      {
        $group: {
          _id: "$tutor",
          averageRating: { $avg: "$comments.rating" }, // Tính trung bình rating của từng tutor
          totalReviews: { $sum: 1 }, // Đếm số lượng đánh giá
        },
      },
      {
        $match: { totalReviews: { $gt: 0 } }, // Chỉ lấy tutor có ít nhất 1 đánh giá
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "tutor",
        },
      },
      { $unwind: "$tutor" },
      { $sort: { averageRating: -1 } }, // Sắp xếp theo rating giảm dần
      { $limit: 5 }, // Chỉ lấy top 5
      {
        $project: { tutor: { fullname: 1 }, averageRating: 1, totalReviews: 1 },
      }, // Chỉ lấy fullname, averageRating, totalReviews
    ]);

    res.status(200).json(top5Tutors);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
