// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './App.css';
// import axios from 'axios';

// const AuthForm = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [role, setRole] = useState('student');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState('');

//   const navigate = useNavigate();

//   const toggleForm = () => {
//     setIsLogin(!isLogin);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Basic simulated login/signup logic
//     if (isLogin) {
//       if (role === 'student') {
//         localStorage.setItem('role', 'student'); //newly added
//         navigate('/student/dashboard');
//       } else {
//         localStorage.setItem('role', 'admin'); // 👈 Add this
//         navigate('/admin/dashboard');
//       }
//     } else {
//       // Here you can add real signup API logic later
//       alert('Signup successful! You can now log in.');
//       setIsLogin(true);
//     }
//   };

//   return (
//     <div className="container">
//       <div className="form-container">
//         <div className="form-toggle">
//           <button
//             className={isLogin ? 'active' : ''}
//             onClick={() => setIsLogin(true)}
//           >
//             Login
//           </button>
//           <button
//             className={!isLogin ? 'active' : ''}
//             onClick={() => setIsLogin(false)}
//           >
//             Signup
//           </button>
//         </div>

//         <form className="form" onSubmit={handleSubmit}>
//           <h2>{isLogin ? 'Login Form' : 'Signup Form'}</h2>

//           <input
//             type="email"
//             placeholder="Email Address"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           {!isLogin && (
//             <input
//               type="text"
//               placeholder="Full Name"
//               value={fullName}
//               onChange={(e) => setFullName(e.target.value)}
//               required
//             />
//           )}

//           {/* Role selection only during login */}
//           {isLogin && (
//             <div className="role-selection">
//               <label>
//                 <input
//                   type="radio"
//                   name="role"
//                   value="student"
//                   checked={role === 'student'}
//                   onChange={(e) => setRole(e.target.value)}
//                 />
//                 Student
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="role"
//                   value="admin"
//                   checked={role === 'admin'}
//                   onChange={(e) => setRole(e.target.value)}
//                 />
//                 Administrator
//               </label>
//             </div>
//           )}

//           {isLogin && <a href="#" className="forgot-password">Forgot password?</a>}

//           <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>

//           <p>
//             {isLogin ? 'Not a member?' : 'Already have an account?'}{' '}
//             <a href="#" onClick={toggleForm}>
//               {isLogin ? 'Signup now' : 'Login now'}
//             </a>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AuthForm;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css"; // Reusing your CSS

export default function AuthForm({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";

    const payload = isLogin
      ? { email: form.email, password: form.password }
      : form;

    const res = await fetch(`http://localhost:5000/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      if (isLogin) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        if (data.user.role === "student") {
          navigate("/student/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        alert("Registered successfully! Please login.");
        setIsLogin(true);
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="form-toggle">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <h2>{isLogin ? "Login" : "Signup"}</h2>

          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <div className="role-selection">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={form.role === "student"}
                  onChange={handleChange}
                />
                Student
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={form.role === "admin"}
                  onChange={handleChange}
                />
                Admin
              </label>
            </div>
          )}

          {isLogin && <a href="#">Forgot password?</a>}

          <button type="submit">{isLogin ? "Login" : "Signup"}</button>

          <p>
            {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
            <span
              style={{ color: "#033452", fontWeight: "500", cursor: "pointer" }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Signup" : "Login"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
