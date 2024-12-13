import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import UploadTutorCertificate from "./components/UploadTutorCertificate";
function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} /> {/* Route cho trang đăng ký */}
        <Route path="/uploadtutorcertificate/:userId" element={<UploadTutorCertificate />} />
        <Route path="/signup" element={<Signup />} />         {/* Các route khác */}
      </Routes>
    </Router>
  );
}

export default App;
