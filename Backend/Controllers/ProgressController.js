const Progress = require("../Models/Progress");
const Course = require("../Models/Courses");
const Lesson = require("../Models/Lessons");

// Create a new progress
exports.createProgress = async (req, res) => {
  try {
    const user_id = req.user._id;
    const course_id = req.body.course_id;
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const lessons = await Lesson.find({ course_id: course_id });
    const progress = new Progress({
      student_id: user_id,
      course_id: course_id,
      lesson: lessons.map((lesson) => {
        return { lesson_id: lesson._id };
      }),
    });
    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all progress
exports.getAllProgress = async (req, res) => {
  try {
    const progress = await Progress.find();
    res.status(200).json(progress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    res.status(200).json(progress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    progress.lesson = req.body.lesson;
    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
