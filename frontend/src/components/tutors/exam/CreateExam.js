import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
const CreateExam = () => {
  const {courseId} = useParams();
  const [courseIds, setCourseIds] = useState(courseId);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMark, setTotalMark] = useState("");
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", questionType: "One Choice", marks: 0, answers: [] },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddAnswer = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers.push({ answer: "", isCorrect: false });
    setQuestions(updatedQuestions);
  };

  const handleRemoveAnswer = (qIndex, aIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers.splice(aIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (qIndex, aIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers[aIndex][field] =
      field === "isCorrect" ? value === "true" : value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    
    if (!courseIds || !title || !duration || !totalMark || questions.length === 0) {
      setMessage("Vui lòng điền đầy đủ thông tin và ít nhất một câu hỏi.");
      return;
    }

    const calculatedTotalMark = questions.reduce(
      (sum, question) => sum + question.marks,
      0
    );
    
    if (calculatedTotalMark !== parseInt(totalMark)) {
      setMessage("Tổng điểm của các câu hỏi không khớp với tổng điểm đã nhập.");
      return;
    }

    questions.forEach((question) => {
      const correctAnswers = question.answers.filter((answer) => answer.isCorrect);
      question.questionType = correctAnswers.length > 1 ? "Multiple Choice" : "One Choice";
    });

    try {
      await axios.post(
        "http://localhost:3000/api/exams/create-exam",
        { course_id: courseIds, title, duration: parseInt(duration), totalMark: parseInt(totalMark), questions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Bài thi đã được tạo thành công!");
    } catch (error) {
      setMessage("Lỗi khi tạo bài thi: " + (error.response?.data?.error || "Lỗi không xác định"));
    }
  };
  console.log(courseIds)

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Tạo bài thi</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* <input type="text" placeholder="Course ID" value={courseIds} onChange={(e) => setCourseIds(e.target.value)} className="w-full p-2 border rounded" /> */}
        <input type="text" placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Thời gian (phút)" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Tổng điểm" value={totalMark} onChange={(e) => setTotalMark(e.target.value)} className="w-full p-2 border rounded" />
        
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="p-4 border rounded-lg space-y-2">
            <input type="text" placeholder="Câu hỏi" value={question.question} onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)} className="w-full p-2 border rounded" />
            <input type="number" placeholder="Điểm" value={question.marks} onChange={(e) => handleQuestionChange(qIndex, "marks", parseInt(e.target.value))} className="w-full p-2 border rounded" />
            {question.answers.map((answer, aIndex) => (
              <div key={aIndex} className="flex space-x-2 items-center">
                <input type="text" placeholder="Đáp án" value={answer.answer} onChange={(e) => handleAnswerChange(qIndex, aIndex, "answer", e.target.value)} className="p-2 border rounded" />
                <select value={answer.isCorrect.toString()} onChange={(e) => handleAnswerChange(qIndex, aIndex, "isCorrect", e.target.value)} className="p-2 border rounded">
                  <option value="false">Sai</option>
                  <option value="true">Đúng</option>
                </select>
                <button type="button" onClick={() => handleRemoveAnswer(qIndex, aIndex)} className="bg-red-500 text-white p-1 rounded">Xóa</button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddAnswer(qIndex)} className="bg-blue-500 text-white p-2 rounded">Thêm đáp án</button>
            <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="bg-red-500 text-white p-2 rounded">Xóa câu hỏi</button>
          </div>
        ))}
        
        <button type="button" onClick={handleAddQuestion} className="bg-green-500 text-white p-2 rounded">Thêm câu hỏi</button>
        <button type="submit" className="bg-purple-500 text-white p-2 rounded">Tạo bài thi</button>
      </form>
      {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}
    </div>
  );
};

export default CreateExam;
