const Exam = require("../Models/Exams");

exports.createExam = async (req, res) => {
  try {
    const { questions, totalMark } = req.body;

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
    const exam = new Exam({ ...req.body, questions });
    await exam.save();

    res.status(201).json(exam);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
