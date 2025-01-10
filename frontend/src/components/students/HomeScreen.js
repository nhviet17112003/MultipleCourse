import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spin } from 'antd';
import { FaShoppingCart } from "react-icons/fa";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);


  useEffect(() => {
    setSpinning(true);
    let ptg = -10;
    const interval = setInterval(() => {
      ptg += 5;
      setPercent(ptg);
      if (ptg > 120) {
        clearInterval(interval);
        setSpinning(false);
        setPercent(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Fetch danh sách khóa học
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/courses/active-courses");
        const data = await response.json();
        if (response.ok) {
          setCourses(data);
        } else {
          console.error("Error fetching courses:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (id) => {
    navigate(`/coursedetail/${id}`);
  };

  const handleAddToCart = async (courseId) => {
    const newCartCount = cartCount + 1;
    setCartCount(newCartCount);
    localStorage.setItem("cartCount", newCartCount);

    try {
      const response = await fetch(
        `http://localhost:3000/api/cart/add-to-cart/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Error adding to cart:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100">
      <Spin spinning={spinning} fullscreen />

     

      <main className="container mx-auto px-4 py-8">
       
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => handleCourseClick(course._id)}
                  className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer transition-transform transform hover:scale-105"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-teal-600">
                      {course.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 italic">
                      {course.category}
                    </p>
                    <p className="text-gray-600 mt-2">{course.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-teal-700 font-bold">${course.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(course._id);
                        }}
                        className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">Empty</p>
            )}
          </div>
        
      </main>
    </div>
  );
};

export default HomeScreen;
