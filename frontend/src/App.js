import { BrowserRouter as Router, Route, Routes,useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Login from "./components/authentication/Login";
import UploadTutorCertificate from "./components/tutors/UploadTutorCertificate";
import Signup from "./components/authentication/Signup";
import ForgetPassword from "./components/authentication/ForgetPassword";
import UserProfile from "./components/students/UserProfile";
import ViewCourseList from "./components/students/ViewCourseList";
import CourseList from "./components/students/CourseList";
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
import WalletManage from "./components/tutors/wallet/WalletManage";
import WithdrawalHistory from "./components/tutors/wallet/WithdrawalHistory";
import WalletManageForAdmin from "./components/admins/WalletManageForAdmin";
import MyCourses from "./components/students/MyCourse";
import CourseLearningPage from "./components/students/CourseLearning";
import CourseListForAdmin from "./components/admins/CourseListForAdmin";
import CreateExam from "./components/tutors/exam/CreateExam";
import ManageUser from "./components/admins/ManageUser";
import PurchaseHistory from "./components/students/PurchaseHistory";
import PurchaseHistoryForAdmin from "./components/admins/PurchaseHistoryForAdmin";
import ManageReview from "./components/admins/ManageReview";
import StatisticForAdmin from "./components/admins/StatisticForAdmin";
import FinalExam from "./components/students/FinalExam";
import Certificate from "./components/students/Certificate";
import RequestList from "./components/admins/RequestList";
import UpdateExam from "./components/tutors/exam/UpdateExam";
import WalletStudent from "./components/students/wallet/WalletStudent";
import ActivitiesHistory from "./components/admins/ActivitiesHistory";
import BuyerHistory from "./components/admins/BuyerHistory";
import StatisticForTutor from "./components/tutors/StatisticForTutor";

import Introduce from "./components/Introduce";
import DepositHistory from "./components/students/wallet/DepositHistory";
import HomeScreen from "./components/HomeScreen";
import Footer from "./components/Footer";

function Layout() {
  const location = useLocation();


  // Danh sách các trang không hiển thị Sidebar
  const noSidebarPages = ["/login", "/signup", "/forgetpassword", "/"];

  // Kiểm tra nếu đang ở một trong các trang trên thì không hiển thị Sidebar
  const hideSidebar = noSidebarPages.includes(location.pathname);

  return (
    <div className="bg-white dark:bg-black w-screen min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex">
        {!hideSidebar && <Sidebar className="w-1/4" />}
        <div className="flex-1">
          <Routes>
         

            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />
            <Route path="/" element={<HomeScreen />} />


            {/* Các route khác */}
            <Route path="/introduce" element={<Introduce />} />
                  {/* <Route path="/login" element={<Login />} /> */}
                  <Route
                    path="/uploadtutorcertificate/:userId"
                    element={<UploadTutorCertificate />}
                  />
                  {/* <Route path="/signup" element={<Signup />} />
                  <Route path="/forgetpassword" element={<ForgetPassword />} /> */}
                  <Route path="/userprofile" element={<UserProfile />} />
                  <Route
                    path="/updateprofile/:id"
                    element={<UpdateProfile />}
                  />
                  <Route
                    path="/courses-list-tutor"
                    element={<CourseListForTutor />}
                  />
                  <Route path="/course-list" element={<CourseList />} />
                  <Route path="/coursedetail/:id" element={<CourseDetail />} />
                  <Route path="/createcourse" element={<CreateCourse />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wallet" element={<WalletManage />} />
                  <Route path="/deposit-history" element={<DepositHistory />} />

                  <Route
                    path="/withdrawal-history"
                    element={<WithdrawalHistory />}
                  />
                  <Route
                    path="/wallet-manage-for-admin"
                    element={<WalletManageForAdmin />}
                  />
                  <Route
                    path="/coursemanagertutor/:courseId"
                    element={<CourseManageTutor />}
                  />
                  <Route path="/updatecourse" element={<UpdateCourse />} />
                  <Route
                    path="/courses-list-tutor/:courseId"
                    element={<CourseDetailForTutor />}
                  />
                  <Route path="/courses-list" element={<ViewCourseList />} />
                  <Route
                    path="/create-lesson/:courseId"
                    element={<CreateLesson />}
                  />
                  <Route
                    path="/lesson-detail/:lessonId"
                    element={<LessonDetail />}
                  />
                  <Route
                    path="/update-lesson/:lessonId"
                    element={<UpdateLessonModal />}
                  />

                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/deposit" element={<WalletStudent />} />
                  <Route path="/manage-users" element={<ManageUser />} />

                  <Route
                    path="/courses/:courseId"
                    element={<CourseLearningPage />}
                  />

                  <Route
                    path="/purchase-history"
                    element={<PurchaseHistory />}
                  />

                  <Route
                    path="/purchase-history-for-admin"
                    element={<PurchaseHistoryForAdmin />}
                  />

                  <Route
                    path="/manage-review-for-admin"
                    element={<ManageReview />}
                  />

                  <Route
                    path="/statistic-for-admin"
                    element={<StatisticForAdmin />}
                  />

                  <Route path="/final-exam/:courseId" element={<FinalExam />} />

                  <Route
                    path="/course-list-for-admin"
                    element={<CourseListForAdmin />}
                  />
                  <Route
                    path="/create-exam/:courseId"
                    element={<CreateExam />}
                  />
                  <Route
                    path="/update-exam/:courseId"
                    element={<UpdateExam />}
                  />

                  <Route path="/my-certificate" element={<Certificate />} />
                  <Route
                    path="/manage-request-list"
                    element={<RequestList />}
                  />
                    <Route
                    path="/activities-history-list"
                    element={<ActivitiesHistory />}
                  />
                       <Route
                    path="/buyer-history-list"
                    element={<BuyerHistory />}
                  />

<Route
                    path="/statistic-tutor"
                    element={<StatisticForTutor />}
                  />
          </Routes>
          
        </div>
        
      </div>

    
      <Footer />
    </div>
    
  );
}
function App() {
 
  return (
    <div className="bg-white dark:bg-black w-screen h-screen">
      <AuthProvider>
        {" "}
        {/* Bọc ứng dụng trong AuthProvider */}
        <ThemeProvider>
          {" "}
          {/* Bọc ứng dụng trong ThemeProvider */}
          <Router>
          <Layout />
          
           
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}

export default App;


