import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/authentication/Login";
import UploadTutorCertificate from "./components/tutors/UploadTutorCertificate";
import Signup from "./components/authentication/Signup";
import ForgetPassword from "./components/authentication/ForgetPassword";
import UserProfile from "./components/students/UserProfile";
import ViewCourseList from "./components/students/ViewCourseList";
import HomeScreen from "./components/students/HomeScreen";
import CourseDetail from "./components/students/CourseDetail";
import Cart from "./components/students/Cart";
import UpdateProfile from "./components/students/UpdateProfile";
import CourseManageTutor from "./components/tutors/CourseManageTutor";
import CreateCourse from "./components/tutors/CreateCourse";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./components/authentication/AuthContext"; // Import AuthProvider
import CourseListForTutor from "./components/tutors/CourseListForTutor";
import UpdateCourse from "./components/tutors/UpdateCourse";
import CourseDetailForTutor from "./components/tutors/CourseDetailForTutor";
import { ThemeProvider } from "./components/context/ThemeContext"; // Import ThemeProvider
import CreateLesson from "./components/tutors/lesson/CreateLesson";
import LessonDetail from "./components/tutors/lesson/LessonDetail";
import UpdateLessonModal from "./components/tutors/lesson/UpdateLessonModal";

function App() {
  return (
    <div className="bg-white dark:bg-black w-screen h-screen">
    <AuthProvider> {/* Bọc ứng dụng trong AuthProvider */}
      <ThemeProvider> {/* Bọc ứng dụng trong ThemeProvider */}
        <Router>
          <Navbar />
          <div className="flex">
            <Sidebar className="w-1/4" /> {/* Sidebar chiếm 1/4 chiều rộng */}
            <div className="flex-1"> {/* Chiếm phần còn lại */}
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/login" element={<Login />} />
                <Route path="/uploadtutorcertificate/:userId" element={<UploadTutorCertificate />} />
                <Route path="/signup" element={<Signup />} />     
                <Route path="/forgetpassword" element={<ForgetPassword />} />
                <Route path="/userprofile" element={<UserProfile />} />
                <Route path="/updateprofile/:id" element={<UpdateProfile />} />
                <Route path="/courses-list-tutor" element={<CourseListForTutor />} />
                <Route path="/homescreen" element={<HomeScreen />} />
                <Route path="/coursedetail/:id" element={<CourseDetail />} />
                <Route path="/createcourse" element={<CreateCourse />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/coursemanagertutor/:courseId" element={<CourseManageTutor />} />
                <Route path="/updatecourse" element={<UpdateCourse />} />
                <Route path="/courses-list-tutor/:courseId" element={<CourseDetailForTutor />} />
                <Route path="/courses-list" element={<ViewCourseList />} />
                <Route path="/create-lesson/:courseId" element={<CreateLesson />} />
                <Route path="/lesson-detail/:lessonId" element={<LessonDetail />} />
                <Route path="/update-lesson/:lessonId" element={<UpdateLessonModal />} />
              </Routes>
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
    </div>
  );
}

export default App;
