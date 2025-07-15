import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#FF4C4C', '#00C49F']; // Cheated, Clean

const AdminDashboard = () => {
  const [quizData, setQuizData] = useState([]);
  const [overallStats, setOverallStats] = useState({});
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id) {
      setAdminId(storedUser.id);
      axios.get(`http://localhost:5000/admin/quiz-performance-summary/${storedUser.id}`)
        .then(res => {
          setQuizData(res.data.quiz_stats);
          setOverallStats(res.data.overall);
          setStudentSubmissions(res.data.submissions || []);
        })
        .catch(err => console.error("Error fetching quiz performance", err));
    } else {
      alert("Unauthorized access. Please login.");
    }
  }, []);

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <div className="topbar">
          <Topbar />
        </div>

        <br /><br />
        <h2 className="dashboard-title">📊 Admin Dashboard – Quiz Performance</h2>

        {/* Overall Stats */}
        <div className="dashboard-grid">
          <div className="webcam-container">📘 <b>Total Quizzes:</b> {overallStats.total_quizzes || 0}</div>
          <div className="webcam-container">🧑‍💻 <b>Total Attempts:</b> {overallStats.total_attempts || 0}</div>
          <div className="webcam-container">📈 <b>Average Score:</b> {overallStats.avg_score || 0}</div>
          <div className="webcam-container">✅ <b>Clean %:</b> {overallStats.clean_percent || 0}%</div>
          <div className="webcam-container">🚨 <b>Cheated %:</b> {overallStats.cheated_percent || 0}%</div>
        </div>

        {/* Per Quiz Breakdown */}
        <h3 style={{ marginTop: '2rem', color: '#002f5d' }}>📘 Per Quiz Breakdown</h3>
        <div className="lower-section">
          {quizData.length === 0 ? (
            <p style={{ color: "#ff4d4f", fontWeight: "500" }}>No quiz data available.</p>

          ) : (
            quizData.map((quiz, index) => (
              <div key={index} className="chart-container">
                <h4>{quiz.title}</h4>
                <p><b>Total Attempts:</b> {quiz.total_attempts}</p>
                <p><b>Average Score:</b> {quiz.avg_score}</p>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[quiz]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cheated" fill={COLORS[0]} name="Cheated" />
                    <Bar dataKey="clean" fill={COLORS[1]} name="Clean" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))
          )}
        </div>

        {/* Student Submissions */}
        {/* <h3 style={{ marginTop: '3rem', color: '#002f5d' }}>🧑‍🎓 Student Submissions</h3>
        {studentSubmissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <div>
            {studentSubmissions.map((s, idx) => (
              <div
                key={idx}
                className={`student-entry ${s.cheated ? "student-cheated" : "student-clean"}`}
              >
                <p><b>Student:</b> {s.student_name}</p>
                <p><b>Quiz:</b> {s.quiz_title}</p>
                <p><b>Score:</b> {s.score}</p>
                <p><b>Status:</b> {s.cheated ? "❌ Cheating Detected" : "✅ Clean Attempt"}</p>
              </div>
            ))}
          </div> */}
        {/* )} */}
      </div>
    </div>
  );
};

export default AdminDashboard;
