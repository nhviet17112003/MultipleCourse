import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const FinalExam = () => {
  const { courseId } = useParams();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(true);
  const [userAnswers, setUserAnswers] = useState([]); // Lưu trữ câu trả lời của người dùng

  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/exams/take-exam/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExamData(response.data.exam);
        setTimeLeft(response.data.exam.duration * 60); // Đổi sang giây
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('authToken');
          navigate('/login');
        } else {
          setError('Failed to load exam data');
        }
        setLoading(false);
      }
    };

    fetchExamData();
  }, [courseId, token, navigate]);

  useEffect(() => {
    if (timeLeft === 0) {
      setTimerActive(false);
      alert("Time's up! The exam has ended.");
    }

    if (timerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, timerActive]);

  const handleAnswerChange = (questionIndex, answer, isChecked) => {
    const updatedAnswers = [...userAnswers];
    const existingAnswerIndex = updatedAnswers.findIndex(
      (item) => item.questionIndex === questionIndex
    );

    if (existingAnswerIndex === -1) {
      updatedAnswers.push({
        questionIndex,
        answer: isChecked ? [answer] : [], // Nếu là Multiple Choice, sử dụng mảng
      });
    } else {
      if (isChecked) {
        updatedAnswers[existingAnswerIndex].answer.push(answer);
      } else {
        updatedAnswers[existingAnswerIndex].answer = updatedAnswers[existingAnswerIndex].answer.filter(
          (ans) => ans !== answer
        );
      }
    }

    setUserAnswers(updatedAnswers);
  };

  const handleSubmitExam = async () => {
    const answers = examData.questions.map((question, index) => {
      const selectedAnswers = userAnswers.find(
        (ans) => ans.questionIndex === index
      );

      return {
        question: question._id, // ID của câu hỏi
        answers: selectedAnswers ? selectedAnswers.answer : [],
      };
    });

    try {
      const response = await axios.post(
        'http://localhost:3000/api/exams/submit-exam',
        {
          course_id: courseId,
          exam_id: examData.exam_id,
          questions: answers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      // Redirect hoặc làm gì đó sau khi gửi bài thành công
    } catch (err) {
      alert('Error submitting exam. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  // Chuyển thời gian còn lại sang phút:giây
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold text-center text-gray-900 mb-6">{examData.title}</h1>
      <div className="flex justify-between mb-6">
        <p className="text-xl text-gray-700">Total Marks: {examData.totalMark}</p>
        <p className="text-xl text-gray-700">Duration: {examData.duration} minutes</p>
      </div>

      <div className="text-2xl text-red-600 font-bold mb-6">
        Time Left: {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions</h2>
        {examData.questions.map((question, index) => (
          <div key={index} className="mb-6">
            <p className="text-lg text-gray-800 font-semibold mb-2">{question.question}</p>

            {/* Render radio buttons or checkboxes based on the question type */}
            <ul className="space-y-2 pl-5">
              {question.answers.map((answer, ansIndex) => (
                <li key={ansIndex} className="flex items-center space-x-3">
                  {question.questionType === "Multiple Choice" ? (
                    <input
                      type="checkbox"
                      id={`answer-${ansIndex}`}
                      name={`question-${index}`}
                      className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      onChange={(e) =>
                        handleAnswerChange(index, answer.answer, e.target.checked)
                      }
                    />
                  ) : (
                    <input
                      type="radio"
                      id={`answer-${ansIndex}`}
                      name={`question-${index}`}
                      className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      onChange={(e) =>
                        handleAnswerChange(index, answer.answer, e.target.checked)
                      }
                    />
                  )}
                  <label htmlFor={`answer-${ansIndex}`} className="text-lg text-gray-700">
                    {answer.answer}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Nút nộp bài */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmitExam}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default FinalExam;
