import React from 'react';
import { Book, Video, Users, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";   
export default function HomeScreen() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("authToken");
  const [tutors, setTutors] = useState([]);
  const [bestSeller, setBestSeller] = useState([]);
//   const [course, setCourse] = useState(null);


useEffect(() => {
    const fetchTopTutors = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/courses/top-tutors", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); // Gọi API để lấy danh sách giảng viên hàng đầu
        const data = await response.json();
        setTutors(data); // Cập nhật state với dữ liệu mới
        console.log("Top tutors data:", data); // ✅ Kiểm tra dữ liệu API trả về
      } catch (error) {
        console.error("Error fetching top tutors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTutors();
  }, [token]);

    useEffect(() => {
        const fetchCourses = async () => {
          setLoading(true);
          try {
            const response = await fetch("http://localhost:3000/api/courses/top-courses", {
                method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const data = await response.json();
            setCourses(data);
          } catch (error) {
            setError(error.message);
          }
          setLoading(false);
        };
        
        fetchCourses();
      }
    , [token]);

    useEffect(() => {
        const fetchBestSeller = async () => {
          try {
            const response = await fetch("http://localhost:3000/api/courses/best-seller", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            });
    
            const data = await response.json();
            console.log("Dữ liệu best seller:", data); // ✅ Kiểm tra dữ liệu API trả về
    
            if (data.length > 0) {
              setBestSeller(data[0]); // ✅ Lấy phần tử đầu tiên của mảng
            } else {
              setBestSeller(null);
            }
          } catch (error) {
            console.error("Lỗi khi lấy khóa học bán chạy:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchBestSeller();
      }, []);
      
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

  return (
    <div className="w-screen min-h-screen flex flex-col bg-white items-center text-black dark:text-white dark:bg-gray-900 transition-colors duration-300">

      {/* Video nền full width, tự động chạy */}
      <video 
        className="w-full min-w-screen h-max object-cover"
        // fixed top-0 left-0 z-0
        autoPlay 
        muted 
        loop 
        playsInline
      >
        <source src="/How To Study3.mp4" type="video/mp4" />
      </video>

{/* Nội dung chính */}
<div className="w-full flex flex-col items-center justify-center text-black dark:text-white px-6 bg-white dark:bg-gray-900 mt-20">
<h1 className="text-5xl font-bold text-center uppercase tracking-wide">
  Welcome to <span className="text-cyan-400">MultiCourse</span>
</h1>
<p className="text-xl text-center mt-4">
  The best platform to <span className="text-cyan-400">learn</span> and <span className="text-cyan-400">grow</span>
</p>
<p className="text-lg text-center mt-4 text-gray-600 max-w-2xl">
  Unlock your potential with expert-led courses, interactive lessons, and a supportive learning community.  
  Join thousands of students worldwide and start mastering new skills today!
</p>


 
        <a href="/course-list">
  <button className="mt-6 px-6 py-3 bg-cyan-400 text-black font-semibold text-lg rounded-full shadow-md hover:bg-cyan-500 transition">
    Get Started
  </button>
</a>


        {/* Tính năng nổi bật */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <FeatureCard 
            icon={<Book size={48} className="text-cyan-400 mx-auto" />}
            title="Diverse Courses"
            description="Explore courses from different fields, taught by experts."
          />
          <FeatureCard 
            icon={<Video size={48} className="text-cyan-400 mx-auto" />}
            title="Interactive Learning"
            description="Engaging video lessons and quizzes to test your knowledge."
          />
          <FeatureCard 
            icon={<Users size={48} className="text-cyan-400 mx-auto" />}
            title="Community Support"
            description="Connect with fellow learners and share knowledge."
          />
          <FeatureCard 
            icon={<ShieldCheck size={48} className="text-cyan-400 mx-auto" />}
            title="Certified Courses"
            description="Earn recognized certificates upon course completion."
          />
        </div>

        <div
  className="min-h-screen min-w-full bg-cover bg-center bg-no-repeat p-16 shadow-md"
  style={{ backgroundImage: "url('/computer-1873831_1280.png')" }} // Đổi đường dẫn ảnh
>

        <h2 className="text-4xl font-bold text-center text-white uppercase tracking-wide mt-[80px] mb-5 relative">
  🔥 Top 5 Highest Rated Courses 🔥
  <span className="block w-24 h-1 bg-white mx-auto mt-4 mb-10 "></span>
</h2>


          {loading ? (
            <p>Đang tải danh sách khóa học...</p>
          ) : (
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 ">
               
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course._id}
                    // onClick={() => handleCourseClick(course._id)}
                    className="bg-white shadow-sm rounded-lg overflow-hidden dark:text-white dark:bg-gray-800"
                  >
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 items-center justify-center flex flex-col">
                    <h4 className="text-lg font-semibold truncate w-full text-center">
  {course.title}
</h4>

                      <p className="text-sm text-gray-500 mt-1 italic">
                        {course.category}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Tutor: {course.tutor?.fullname}
                      </p>
                      {/* <p className="text-gray-600 mt-2">{course.description}</p> */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-red-700 font-bold">
                          {course.price} VND
                        </span>
                        {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // handleAddToCart(course._id);
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Thêm vào giỏ
                        </button> */}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>There are no courses currently available.</p>
              )}
            </div>
          )}
        </div>


        <div className="w-full flex flex-col md:flex-row items-center bg-gray-50 p-10 dark:text-white dark:bg-gray-900">
  {loading ? (
    <p className="text-center text-lg text-gray-600 animate-pulse">Loading best-selling course...</p>
  ) : bestSeller && bestSeller.course ? ( // Ensure bestSeller and bestSeller.course exist
    <>
    
      <div className="w-full md:w-1/2 relative overflow-hidden rounded-lg shadow-lg">
        <img
          src={bestSeller.course.image || "/default-image.jpg"} // Provide a default image if missing
          alt={bestSeller.course.title}
          className="w-full rounded-lg relative h-96 object-cover transform hover:scale-105 transition duration-500"
        />

     
        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 text-lg font-bold rounded-lg shadow-lg animate-bounce">
          🔥 {bestSeller.totalSold} SALES
        </div>
      </div>

     
      <div className="w-full md:w-1/2 flex flex-col justify-center px-10 ">
        <h2 className="text-4xl font-bold text-cyan-500 uppercase drop-shadow-md mt-10">
          {bestSeller.course.title}
        </h2>
        <p className="text-xl text-gray-600 mt-3 italic font-medium">{bestSeller.course.category}</p>
        <p className="text-lg text-gray-700 mt-4 leading-relaxed">
          {bestSeller.course.description}
        </p>
        
        <ul className="mt-6 text-gray-700 space-y-3">
          <li className="text-xl font-semibold">
            💰 Price: <span className="text-3xl font-bold text-green-600">${bestSeller.course.price}</span>
          </li>
          <li className="text-sm text-gray-500 italic">
            📅 Release Date: {bestSeller.course.date ? new Date(bestSeller.course.date).toLocaleDateString() : "No information available"}
          </li>
        </ul>

        <a href={`/coursedetail/${bestSeller.course._id}`}>
          <button className="mt-6 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-lg rounded-full shadow-lg hover:scale-105 transition duration-300">
            Explore Now
          </button>
        </a>
      </div>
    </>
  ) : (
    <p className="text-center text-lg text-red-500">No best-selling courses available.</p>
  )}
</div>

<div className='w-full  md:flex-row items-center p-10'>
    <h2 className="text-4xl font-bold text-center uppercase tracking-wide mt-10">
      Top 5 Influential <span className="text-cyan-400">Tutors</span>
      <span className="block w-24 h-1 bg-black mx-auto mt-4 mb-10 "></span>
     
    </h2>
    

    {loading ? (
      <p className="text-center text-lg text-gray-600 animate-pulse">Loading top tutors...</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 dark:text-white dark:bg-gray-900 ">
        {tutors.map((tutor) => (
          <div
            key={tutor._id}
            className="bg-white shadow-lg p-6 rounded-lg flex flex-col items-center border border-gray-200 dark:text-white dark:bg-gray-800 dark:border-gray-900"
          >
            {/* Hình ảnh mặc định (có thể thay thế nếu có avatar) */}
            <div className="w-24 h-24 flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-2xl rounded-full">
              {tutor.tutor.fullname.charAt(0)}
            </div>

            <h4 className="text-xl font-semibold mt-4">{tutor.tutor.fullname}</h4>
            <p className="text-sm text-gray-600 mt-2 italic">
              ⭐ Average Rating: <span className="font-semibold">{tutor.averageRating.toFixed(1)}</span> ({tutor.totalReviews} reviews)
            </p>

            {/* Badge nổi bật nếu giảng viên có điểm số cao */}
            {tutor.averageRating >= 4.5 && (
              <div className="mt-3 bg-yellow-400 text-white px-3 py-1 text-sm font-bold rounded-full">
                🌟 Top Rated
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>

  <div
  className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat p-16 shadow-md mt-12 mb-[250px]"
  style={{ backgroundImage: "url('/online-6204349_1280.jpg')" }}
>
  {/* Container video có vị trí tuyệt đối */}
  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] mt-[400px]">
    <video
      className="w-full h-[500px] object-cover shadow-lg"
      autoPlay
      muted
      loop
      playsInline
    >
      <source src="/How To Study2.mp4" type="video/mp4" />
    </video>
  </div>
</div>


      </div>
     
    </div>
    
  );
  
}

// Component hiển thị từng tính năng
function FeatureCard({ icon, title, description }) {
    return (
      <div className="bg-white dark:bg-gray-800 backdrop-blur-lg p-6 mb-10 rounded-lg shadow-md transition-colors duration-300">
        {icon}
        <h3 className="text-2xl font-semibold mt-4">{title}</h3>
        <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">{description}</p>
      </div>
    );
  }