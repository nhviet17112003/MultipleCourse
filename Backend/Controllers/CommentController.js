const Course = require("../Models/Courses");
const Lesson = require("../Models/Lessons");

//Comment For Course

// Create Comment
exports.createCourseComment = async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const newComment = {
      author: req.user.fullname,
      rating: req.body.rating,
      comment: req.body.comment,
      date: Date.now(),
    };

    course.comments.push(newComment);
    await course.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Comment
exports.updateCourseComment = async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const comment = course.comments.id(req.body.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the comment belongs to the current user
    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this comment" });
    }

    comment.rating = req.body.rating || comment.rating;
    comment.comment = req.body.comment || comment.comment;
    await course.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Comment
exports.deleteCourseComment = async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Tìm comment bằng commentId
    const comment = course.comments.id(req.body.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Sử dụng updateOne với $pull để xóa comment khỏi mảng
    await Course.updateOne(
      { _id: req.body.courseId },
      { $pull: { comments: { _id: req.body.commentId } } }
    );

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Show Course Comment
exports.showCourseComment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ comments: course.comments });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Comment for Lesson

// Create Comment for Lesson
exports.createLessonComment = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.body.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const newComment = {
      author: req.user.fullname,
      rating: req.body.rating,
      comment: req.body.comment,
      date: Date.now(),
    };

    lesson.comments.push(newComment);
    await lesson.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Comment for Lesson
exports.updateLessonComment = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.body.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const comment = lesson.comments.id(req.body.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the comment belongs to the current user
    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this comment" });
    }

    comment.rating = req.body.rating || comment.rating;
    comment.comment = req.body.comment || comment.comment;
    await lesson.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Delete Comment for Lesson
exports.deleteLessonComment = async (req, res) => {
  try {
    // Kiểm tra nếu comment thuộc về user hiện tại
    const lesson = await Lesson.findById(req.body.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const comment = lesson.comments.id(req.body.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Sử dụng updateOne với $pull để xóa comment khỏi mảng
    await Lesson.updateOne(
      { _id: req.body.lessonId },
      { $pull: { comments: { _id: req.body.commentId } } }
    );

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Show Lesson Comment
exports.showLessonComment = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json({ comments: lesson.comments });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Comment Status (toggle status) without Course ID
exports.updateCommentStatusById = async (req, res) => {
  try {
    const { comment_id } = req.params;

    // Tìm khóa học chứa comment theo ID
    const course = await Course.findOne({ "comments._id": comment_id });

    if (!course) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Tìm comment trong khóa học
    const comment = course.comments.id(comment_id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Toggle trạng thái comment
    comment.status = !comment.status;
    await course.save();

    res.status(200).json({
      
      message: `Comment is now ${comment.status ? "active" : "inactive"}`,
      comment: comment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Lesson Comment Status (toggle status) without Lesson ID
exports.updateLessonCommentStatusById = async (req, res) => {
  try {
    const { comment_id } = req.params;

    // Tìm bài học chứa comment theo ID
    const lesson = await Lesson.findOne({ "comments._id": comment_id });

    if (!lesson) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Tìm comment trong bài học
    const comment = lesson.comments.id(comment_id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Toggle trạng thái comment
    comment.status = !comment.status;
    await lesson.save();

    res.status(200).json({
      message: `Comment is now ${comment.status ? "active" : "inactive"}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all comments for admin
exports.getAllCommentsForAdmin = async (req, res) => {
  try {
    // Lấy tất cả các khóa học có bình luận
    const courses = await Course.find({}, "title comments");
    const lessons = await Lesson.find({}, "title comments");

    // Xử lý dữ liệu bình luận từ khóa học
    const courseComments = courses.flatMap((course) =>
      course.comments.map((comment) => ({
        type: "course",
        courseTitle: course.title,
        commentId: comment._id,
        author: comment.author,
        rating: comment.rating,
        comment: comment.comment,
        date: comment.date,
        status: comment.status,
      }))
    );

    // Xử lý dữ liệu bình luận từ bài học
    const lessonComments = lessons.flatMap((lesson) =>
      lesson.comments.map((comment) => ({
        type: "lesson",
        lessonTitle: lesson.title,
        commentId: comment._id,
        author: comment.author,
        rating: comment.rating,
        comment: comment.comment,
        date: comment.date,
        status: comment.status,
      }))
    );

    // Gộp tất cả bình luận
    const allComments = [...courseComments, ...lessonComments];

    res
      .status(200)
      .json({ totalComments: allComments.length, comments: allComments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
