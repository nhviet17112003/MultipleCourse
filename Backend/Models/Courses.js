const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentsSchemma = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  rating: {
    type: Number,
    required: true,
    max: 5,
    min: 1,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const CourseSchema = new Schema({
  tutor: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Boolean,
    default: false,
  },
  comments: [CommentsSchemma],
});

module.exports = mongoose.model("Courses", CourseSchema);
