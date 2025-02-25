import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { useCallback } from "react";

const UpdateExam = () => {
  const { examId, courseId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  const token = localStorage.getItem("authToken");

  const handleQuestionTypeChange = (qIndex) => {
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      updatedQuestions[qIndex].answers = updatedQuestions[qIndex].answers.map(
        (answer) => ({
          ...answer,
          isCorrect: false,
        })
      );
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  useEffect(() => {
    if (exam) {
      const totalMark = exam.questions.reduce(
        (acc, question) => acc + Number(question.marks),
        0
      );
      setExam((prevExam) => ({ ...prevExam, totalMark }));
    }
  }, [exam?.questions]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/exams/get-exam/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExam(response.data);
      } catch (err) {
        setError("Failed to fetch exam details");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, token]);

  const handleChange = (e, questionIndex, answerIndex) => {
    const { name, value, type, checked } = e.target;
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      if (answerIndex !== undefined) {
        if (name === "isCorrect" && type === "checkbox") {
          const currentQuestionType =
            updatedQuestions[questionIndex].questionType;
          if (currentQuestionType === "One Choice") {
            updatedQuestions[questionIndex].answers = updatedQuestions[
              questionIndex
            ].answers.map((answer, index) => {
              if (index === answerIndex) {
                return { ...answer, isCorrect: checked };
              }
              return { ...answer, isCorrect: false };
            });
          } else {
            updatedQuestions[questionIndex].answers[answerIndex][name] =
              checked;
          }
        } else {
          updatedQuestions[questionIndex].answers[answerIndex][name] =
            type === "checkbox" ? checked : value;
        }
      } else {
        updatedQuestions[questionIndex][name] = value;
      }
      return { ...prevExam, questions: updatedQuestions };
    });
  };
  const handleDeleteQuestion = (index) => {
    setExam((prevExam) => {
      const updatedQuestions = prevExam.questions.filter((_, i) => i !== index);
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const handleDeleteAnswer = (qIndex, aIndex) => {
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      updatedQuestions[qIndex].answers.splice(aIndex, 1);
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrorMessages = {};

    if (!exam.title.trim()) {
      newErrorMessages.title = "Title cannot be empty!";
    }

    if (!exam.totalMark || exam.totalMark <= 0) {
      newErrorMessages.totalMark = "Total Mark must be greater than zero!";
    }

    if (!exam.duration || exam.duration <= 0) {
      newErrorMessages.duration = "Duration must be greater than zero!";
    }

    const isValidQuestions = exam.questions.every((q, index) => {
      const hasCorrectAnswer = q.answers.some((a) => a.isCorrect);
      if (!q.marks) {
        newErrorMessages[`marks_${index}`] = "Marks cannot be empty!";
      }
      if (!q.question.trim()) {
        newErrorMessages[`question_${index}`] = "Question cannot be empty!";
      }
      if (!hasCorrectAnswer) {
        newErrorMessages[`answers_${index}`] =
          "Each question must have at least one correct answer!";
      }

      q.answers.forEach((a, aIndex) => {
        if (!a.answer.trim()) {
          newErrorMessages[`answer_${index}_${aIndex}`] =
            "Answer cannot be empty!";
        }
      });
      return hasCorrectAnswer && q.marks && q.question.trim();
    });

    setErrorMessages(newErrorMessages);

    if (Object.keys(newErrorMessages).length > 0) {
      return;
    }

    console.log("Submitting exam data:", exam);
    const updatedExam = {
      ...exam,
      totalMark: Number(exam.totalMark),
      questions: exam.questions.map((q) => ({
        ...q,
        marks: Number(q.marks),
      })),
    };

    try {
      await axios.put(
        `http://localhost:3000/api/exams/update-exam/${exam._id}`,
        updatedExam,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to update exam", err);
    }
  };

  const handleAddQuestion = () => {
    setExam((prevExam) => {
      const newQuestion = {
        question: "",
        marks: 0,
        questionType: "Multiple Choice",
        answers: [{ answer: "", isCorrect: false }],
      };
      return { ...prevExam, questions: [...prevExam.questions, newQuestion] };
    });
  };

  const handleAddAnswer = useCallback((qIndex) => {
    console.log("Adding answer to question:", qIndex);
    setExam((prevExam) => {
      if (!prevExam || !prevExam.questions) return prevExam;

      return {
        ...prevExam,
        questions: prevExam.questions.map((q, index) =>
          index === qIndex
            ? {
                ...q,
                answers: [...q.answers, { answer: "", isCorrect: false }],
              }
            : q
        ),
      };
    });
  }, []);

  if (loading) return <p>Loading exam details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Update Exam</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title:</label>
          <input
            type="text"
            name="title"
            value={exam.title}
            onChange={(e) => setExam({ ...exam, title: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          {errorMessages.title && (
            <p className="text-red-500 text-sm mt-1">{errorMessages.title}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Total Mark:
            </label>
            <input
              type="number"
              name="totalMark"
              value={exam.totalMark}
              onChange={(e) => setExam({ ...exam, totalMark: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Duration (minutes):
            </label>
            <input
              type="number"
              name="duration"
              value={exam.duration}
              onChange={(e) => setExam({ ...exam, duration: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            {errorMessages.duration && (
              <p className="text-red-500 text-sm mt-1">
                {errorMessages.duration}
              </p>
            )}
          </div>
        </div>

        {exam.questions.map((question, qIndex) => (
          <div
            key={question._id}
            className="p-4 border rounded-lg shadow-sm bg-gray-50 relative"
          >
            <button
              type="button"
              onClick={() => handleDeleteQuestion(qIndex)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
            >
              <FaTrash size={16} />
            </button>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Question {qIndex + 1}:
              </label>
              <input
                type="text"
                name="question"
                value={question.question}
                onChange={(e) => handleChange(e, qIndex)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {errorMessages[`question_${qIndex}`] && (
              <p className="text-red-500 text-sm mt-1">
                {errorMessages[`question_${qIndex}`]}
              </p>
            )}
            {errorMessages[`marks_${qIndex}`] && (
              <p className="text-red-500 text-sm mt-1">
                {errorMessages[`marks_${qIndex}`]}
              </p>
            )}

            <div className="mt-3">
              <label className="block text-gray-700 font-regular mb-2">
                Question Type:
              </label>
              <select
                name="questionType"
                value={question.questionType}
                onChange={(e) => {
                  handleChange(e, qIndex);
                  handleQuestionTypeChange(qIndex);
                }}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
              >
                <option value="One Choice">One Choice</option>
                <option value="Multiple Choice">Multiple Choice</option>
              </select>
            </div>

            <div className="mt-3">
              <label className="block text-gray-700 font-medium mb-2">
                Marks:
              </label>
              <input
                type="number"
                name="marks"
                value={question.marks}
                onChange={(e) => handleChange(e, qIndex)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {question.answers.map((answer, aIndex) => (
              <div
                key={answer._id}
                className="mt-3 flex items-center space-x-3"
              >
                <input
                  type="text"
                  name="answer"
                  value={answer.answer}
                  onChange={(e) => handleChange(e, qIndex, aIndex)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isCorrect"
                    checked={answer.isCorrect}
                    onChange={(e) => handleChange(e, qIndex, aIndex)}
                  />
                  <span className="text-gray-600">Correct</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteAnswer(qIndex, aIndex)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <FaTrash size={16} />
                </button>
                {errorMessages[`answer_${qIndex}_${aIndex}`] && (
                  <p className="text-red-500 text-sm">
                    {errorMessages[`answer_${qIndex}_${aIndex}`]}
                  </p>
                )}
              </div>
            ))}
            {errorMessages[`answers_${qIndex}`] && (
              <p className="text-red-500 text-sm mt-1">
                {errorMessages[`answers_${qIndex}`]}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                console.log("Button clicked"); // Debug
                handleAddAnswer(qIndex);
              }}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Add Answer
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddQuestion}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Add Question
        </button>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
        >
          Update Exam
        </button>
      </form>
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2">
              Exam updated successfully!
            </h2>
            <button
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
              onClick={handleModalClose}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateExam;
