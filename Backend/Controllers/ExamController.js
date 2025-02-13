const Exam = require("../Models/Exams");
const StudentExamRS = require("../Models/StudentExamResults");
const StudentCertificate = require("../Models/StudentCertificates");
const Course = require("../Models/Courses");

exports.createExam = async (req, res) => {
  try {
    const course_id = req.body.course_id;
    const duration = req.body.duration;
    const questions = req.body.questions;
    const totalMark = req.body.totalMark;

    // Kiểm tra xem course_id có tồn tại không
    const course = await Course.findById({
      _id: course_id,
      tutor: req.user._id,
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exam = await Exam.findOne({
      course: course_id,
    });

    if (exam) {
      return res.status(400).json({ error: "Exam already exists" });
    }

    // Tính tổng điểm của tất cả các câu hỏi
    const calculatedTotalMark = questions.reduce(
      (sum, question) => sum + question.marks,
      0
    );

    // Kiểm tra nếu tổng điểm không khớp với totalMark
    if (calculatedTotalMark !== totalMark) {
      return res.status(400).json({
        error: "Total marks of questions must equal the totalMark field.",
      });
    }

    // Kiểm tra và cập nhật questionType cho từng câu hỏi
    questions.forEach((question) => {
      const correctAnswers = question.answers.filter(
        (answer) => answer.isCorrect
      );

      if (correctAnswers.length > 1) {
        question.questionType = "Multiple Choice";
      } else {
        question.questionType = "One Choice";
      }
    });

    // Tạo bài thi mới
    const newExam = new Exam({ ...req.body, questions });
    await newExam.save();

    res.status(201).json(exam);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//shuffle array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

//Randomize questions and answers in an array
exports.createStudentExam = async (req, res) => {
  try {
    const course_id = req.params.course_id;
    const student_id = req.user._id;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exam = await Exam.findOne({ course_id: course_id });
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const randomQuestions = shuffleArray(
      exam.questions.map((question) => ({
        question: question.question,
        questionType: question.questionType,
        marks: question.marks,
        answers: shuffleArray(question.answers),
      }))
    );

    return res.status(200).json({
      exam: {
        course_id: exam.course_id,
        exam_id: exam._id,
        title: exam.title,
        duration: exam.duration,
        questions: randomQuestions,
        totalMark: exam.totalMark,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Submit exam
exports.submitExam = async (req, res) => {
  try {
    const student_id = req.user._id;
    const course_id = req.body.course_id;
    const exam_id = req.body.exam_id;
    const questions = req.body.questions;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exam = await Exam.findById(exam_id);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    //Calculate total marks
    let totalScore = 0;

    const questionRS = questions.map((submmitedQuestion) => {
      const examQuestion = exam.questions.find(
        (question) => question.toString() === submmitedQuestion.question
      );

      if (!examQuestion) {
        return res.status(400).json({ error: "Invalid question" });
      }

      const isCorrect = submmitedQuestion.answers.every((answer) => {
        examQuestion.answers.some(
          (examAnswer) =>
            examAnswer.answer === submmitedQuestion.answer &&
            examAnswer.isCorrect === submmitedQuestion.isCorrect
        );
      });

      if (isCorrect) {
        totalScore += examQuestion.marks;
      }

      return {
        question: examQuestion.question,
        answers: submmitedQuestion.answer.map((a) => a.answer),
        isCorrect,
      };
    });

    const studentExamRS = new StudentExamRS({
      student: student_id,
      course: course_id,
      exam: exam_id,
      score: totalScore,
      totalMark: exam.totalMark,
      questions: questionRS,
    });

    res.status(201).json({
      message: "Exam submitted successfully",
      studentExamRS,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
