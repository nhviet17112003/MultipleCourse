import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  return (
    <Router>
      <Routes>
 
        <Route path="/login" element={<Login />} /> {/* Route cho trang đăng ký */}
        <Route path="/signup" element={<Signup />} />         {/* Các route khác */}
      </Routes>
    </Router>
  );
}

export default App;
