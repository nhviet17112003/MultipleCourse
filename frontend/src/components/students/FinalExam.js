import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";


const FinalExam = () => {
  const { courseId, exam_id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [score, setScore] = useState(null);
  const [totalMark, setTotalMark] = useState(null);
  const [allCorrectResults, setAllCorrectResults] = useState({});
  const token = localStorage.getItem("authToken");
  const [modal, setModal] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);


  const handleCommentCourseSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/comments/create-course-comment",
        { courseId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Comment submitted successfully!");
      setModal(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/exams/take-exam/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExam(response.data.exam);
        setTimeLeft(response.data.exam.duration * 60);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam:", error);
        setLoading(false);
      }
    };
    fetchExam();
  }, [courseId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      alert("Time's up! The exam has ended.");
      handleSubmit();
    }
  }, [timeLeft]);

  // Xử lý chọn đáp án
  const handleAnswerChange = (question_id, answer, questionType, isChecked) => {
    setAnswers((prevAnswers) => {
      if (questionType === "Multiple Choice") {
        const updatedAnswers = isChecked
          ? [...(prevAnswers[question_id] || []), answer]
          : prevAnswers[question_id]?.filter((ans) => ans !== answer) || [];
        return { ...prevAnswers, [question_id]: updatedAnswers };
      } else {
        return { ...prevAnswers, [question_id]: [answer] };
      }
    });
  };

  // Xử lý nộp bài
  const handleSubmit = async () => {
    
    try {
      console.log("Answers State:", answers);
  
      const formattedAnswers = Object.keys(answers).map((question_id) => {
        const questionData = exam.questions.find((q) => q.question_id === question_id);
        if (!questionData) return null;
  
        const correctAnswers = questionData.answers
          .filter((ans) => ans.isCorrect)
          .map((ans) => ans.answer);
  
        const selectedAnswers = answers[question_id] || [];
  
        // Kiểm tra nếu tất cả đáp án đúng được chọn hết
        const isCorrect =
          selectedAnswers.length === correctAnswers.length &&
          correctAnswers.every((ans) => selectedAnswers.includes(ans));
  
        return {
          question_id,
          questionType: questionData.questionType,
          answers: selectedAnswers.map((answer) => {
            const matchingAnswer = questionData.answers.find((qAnswer) => qAnswer.answer === answer);
            return {
              answer_id: matchingAnswer ? matchingAnswer._id : "Unknown",
              isCorrect: isCorrect,
            };
          }),
        };
      });
  
      console.log("Formatted Answers:", formattedAnswers);
      
  
      const response = await axios.post(
        `http://localhost:3000/api/exams/submit-exam/${exam.exam_id}`,
        { course_id: courseId, questions: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("API Response:", response.data); // Kiểm tra API trả về
  
      setScore(response.data.studentExamRS.score);
      setTotalMark(response.data.studentExamRS.totalMark);
  
      // Kiểm tra và lưu dữ liệu allCorrect
      if (response.data.studentExamRS.questions) {
        const updatedAllCorrect = {};
        response.data.studentExamRS.questions.forEach((q) => {
          updatedAllCorrect[q.question_id] = q.allCorrect ?? false; // Nếu không có giá trị, mặc định là false
        });
        console.log("API Response:", response.data.studentExamRS);
        setModal(true);
        setAllCorrectResults(updatedAllCorrect);
        console.log("Updated allCorrectResults:", updatedAllCorrect);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };
  

  if (loading) return <p>Loading exam...</p>;
  if (!exam) return <p>Exam not found</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h1>{exam.title}</h1>
      <p>Duration: {exam.duration} minutes</p>
      <p>
        Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {exam.questions.map((question) => (
        // console.log("Question ID:", question.question_id),
          <div key={question.question_id} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
            <span>
              Question {exam.questions.indexOf(question) + 1} (<span>{question.questionType}</span>)
            </span>
            <h3>{question.question}</h3>
            {question.answers.map((answer) => (
              <div key={answer.answer}>
                <label>
                  <input
                    type={question.questionType === "Multiple Choice" ? "checkbox" : "radio"}
                    name={question.question_id}
                    value={answer.answer}
                    checked={answers[question.question_id]?.includes(answer.answer) || false}
                    onChange={(e) =>
                      handleAnswerChange(question.question_id, answer.answer, question.questionType, e.target.checked)
                    }
                  />
                  {answer.answer}
                </label>
              </div>
            ))}

            {/* Hiển thị kết quả sau khi nộp bài */}
            {allCorrectResults[question.question_id] !== undefined && (
           
  <p style={{ fontWeight: "bold", color: allCorrectResults[question.question_id] ? "green" : "red" }}>
    {allCorrectResults[question.question_id] ? "Correct" : "Incorrect"}
  </p>
)}

          </div>
        ))}
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Submit Exam
        </button>
      </form>

{/* modal */}
      {modal && ( 
        <div className="modal" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
        <h2>Exam Result</h2>
            <p>Your Score: {score} / {totalMark} ({((score / totalMark) * 100).toFixed(2)}%)</p>
            <label>Rating:</label>
            <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} min="1" max="5" />
            <label>Comment:</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
              <button onClick={handleCommentCourseSubmit}> Submit Comment </button>
          <button onClick={() => setModal(false)}>Close</button>
        </div>
      </div>
      )
      }
{/* score */}
      {score !== null && totalMark !== null && (
  <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
    <h2>Exam Result</h2>
    <p>Your Score: <strong>{score} / {totalMark} ({((score / totalMark) * 100).toFixed(2)}%)</strong></p>
  </div>
)}

    </div>
  );
};

export default FinalExam;
