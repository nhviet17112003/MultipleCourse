import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import UploadTutorCertificate from "./components/UploadTutorCertificate";
import Forgetpassword from "./components/ForgetPassword";
import UserProfile from "./components/UserProfile";
import Updateprofile from "./components/UpdateProfile";
function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} /> {/* Route cho trang đăng ký */}
        <Route path="/uploadtutorcertificate/:userId" element={<UploadTutorCertificate />} />
        <Route path="/signup" element={<Signup />} />     
        <Route path="/forgetpassword" element={<Forgetpassword />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/updateprofile" element={<Updateprofile />} />
      </Routes>
    </Router>
  );
}

export default App;
