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
  function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<Login />} /> {/* Route cho trang đăng ký */}
          <Route path="/uploadtutorcertificate/:userId" element={<UploadTutorCertificate />} />
          <Route path="/signup" element={<Signup />} />     
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/updateprofile/:id" element={<UpdateProfile />} />
          <Route path="/courses-list" element={<ViewCourseList />} />
          <Route path="/homescreen" element={<HomeScreen />} />
          <Route path="/coursedetail/:id" element={<CourseDetail />} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/coursemanagertutor/:courseId" element={<CourseManageTutor />} />
        </Routes>
      </Router>
    );
  }

  export default App;
