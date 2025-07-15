// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // import AuthForm from './AuthForm';
// import Login from './Login';
// import Register from './Register';
// import StudentDashboard from './pages/StudentDashboard';
// import AdminDashboard from './pages/AdminDashboard';
// import AdminCreateQuiz from './pages/AdminCreateQuiz';
// import StudentTestDetails from './pages/StudentTestDetails';
// import StudentStartTest from './pages/StudentStartTest';
// import Profile from './pages/Profile';

// function App() {
//   const [user, setUser] = useState(null);

//   return (
//     <Router>
//       <Routes>
//         {/* Auth pages */}
//         {/* <Route path="/authform" element={<AuthForm setUser={setUser} />} /> */}
//         <Route path="/" element={<Login setUser={setUser} />} />
//         <Route path="/register" element={<Register />} />

//         {/* Student Routes */}
//         <Route path="/student/dashboard" element={<StudentDashboard />} />
//         <Route path="/student/test-details" element={<StudentTestDetails />} />
//         <Route path="/student/start-test" element={<StudentStartTest />} />
//         <Route path="/student/profile" element={<Profile />} />

//         {/* Admin Routes */}
//         <Route path="/admin/dashboard" element={<AdminDashboard />} />
//         <Route path="/admin/create-quiz" element={<AdminCreateQuiz />} />

//         {/* Catch-all redirect */}
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./AuthForm";
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminCreateQuiz from './pages/AdminCreateQuiz';
// import StudentTestHistory from "./pages/TestDetails";
import StudentStartTest from './pages/StudentStartTest';
import Profile from './pages/Profile';
import ViewStudents from "./pages/ViewStudents";
import StudentPerformance from "./pages/StudentPerformance";
// import StudentPerformance from "./pages/StudentPerformance";


function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm setUser={setUser} />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/student-performance" element={<StudentPerformance />} />
        <Route path="/student/start-test" element={<StudentStartTest />} />
        <Route path="/student/profile" element={<Profile />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-quiz" element={<AdminCreateQuiz />} />
         <Route path="/admin/view-students" element={<ViewStudents />} />
        <Route path="/admin/profile" element={<Profile />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
