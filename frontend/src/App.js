import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/authentication/Login";
import UploadTutorCertificate from "./components/tutors/UploadTutorCertificate";
import Signup from "./components/authentication/Signup";
import ForgetPassword from "./components/authentication/ForgetPassword";
import UserProfile from "./components/students/UserProfile";
import ViewCourseList from "./components/students/ViewCourseList";
import HomeScreen from "./components/students/HomeScreen";

// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import UploadTutorCertificate from "./components/UploadTutorCertificate";
// import Forgetpassword from "./components/ForgetPassword";
// import UserProfile from "./components/UserProfile";
// import Updateprofile from "./components/UpdateProfile";
// import ViewCourseList from "./components/ViewCourseList";
function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} /> {/* Route cho trang đăng ký */}
        <Route path="/uploadtutorcertificate/:userId" element={<UploadTutorCertificate />} />
        <Route path="/signup" element={<Signup />} />     
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/updateprofile" element={<UserProfile />} />
        <Route path="/courses-list" element={<ViewCourseList />} />
        <Route path="/homescreen" element={<HomeScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
