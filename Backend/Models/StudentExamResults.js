const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentExamResultsSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  exam: {
    type: Schema.Types.ObjectId,
    ref: "Exams",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalMark: {
    type: Number,
    required: true,
  },
  answers: [
    {
      question: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("StudentExamResults", StudentExamResultsSchema);
