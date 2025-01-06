import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/authentication/Login";
import UploadTutorCertificate from "./components/tutors/UploadTutorCertificate";
import Signup from "./components/authentication/Signup";
import ForgetPassword from "./components/authentication/ForgetPassword";
import UserProfile from "./components/students/UserProfile";
import ViewCourseList from "./components/students/ViewCourseList";
import HomeScreen from "./components/students/HomeScreen";
import CreateCourse from "./components/tutors/CreateCourse";
import CourseListForTutor from "./components/tutors/CourseListForTutor";
import Navbar from "./components/Navbar"; // Import Navbar

function App() {
  return (
    <Router>
      <Navbar /> {/* Navbar sẽ được hiển thị trên mọi trang */}
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Route cho trang đăng ký */}
        <Route path="/uploadtutorcertificate/:userId" element={<UploadTutorCertificate />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/updateprofile" element={<UserProfile />} />
        <Route path="/courses-list" element={<ViewCourseList />} />
        <Route path="/homescreen" element={<HomeScreen />} />
        <Route path="/createcourse" element={<CreateCourse />} />
        <Route path="/tutor/courselist" element={<CourseListForTutor />} />
      </Routes>
    </Router>
  );
}

export default App;
