import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          `http://localhost:3000/api/lessons/${lessonId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLesson(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return lesson ? (
    <div className="p-4">
      <h1>{lesson.title}</h1>
      <p>{lesson.description}</p>
      <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">
        Watch Video
      </a>
      <a href={lesson.document_url} target="_blank" rel="noopener noreferrer">
        View Document
      </a>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default LessonDetail;