import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './Dashboard.css';

const ViewStudents = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizStatus, setQuizStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const adminId = user?.id;
  const adminName = user?.name || "Admin";

  useEffect(() => {
    if (!adminId) return;
    axios.get(`http://localhost:5000/admin/quizzes/${adminId}`)
      .then(res => setQuizzes(res.data))
      .catch(err => console.error("Error fetching quizzes", err));
  }, [adminId]);

  const handleQuizSelect = (quizId) => {
    setSelectedQuizId(quizId);
    setLoading(true);
    axios.get(`http://localhost:5000/admin/quiz-student-status/${quizId}`)
      .then(res => {
        setQuizStatus(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching quiz student status", err);
        setLoading(false);
      });
  };

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
        <div>
          <h2 className="dashboard-title">📋 Quiz Status Panel – Welcome {adminName}!</h2>

          {!adminId && <p style={{ color: "red" }}>❌ Admin not logged in.</p>}

          {adminId && (
            <>
              <div className="quiz-form-container">
                <label style={{ fontWeight: 'bold', fontSize: '16px' }}>Select a Quiz:</label>
                <div className="dashboard-grid">
                  {quizzes.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => handleQuizSelect(quiz.id)}
                      className="quiz-form-button"
                      style={{
                        backgroundColor: selectedQuizId === quiz.id ? '#003366' : '#f0f0f0',
                        color: selectedQuizId === quiz.id ? '#fff' : '#333',
                        border: '1px solid #ccc'
                      }}
                    >
                      {quiz.title}
                    </button>
                  ))}
                </div>
              </div>

              {loading && <p>⏳ Loading student status...</p>}

              {quizStatus && (
                <div className="quiz-form-container">
                  <h3 style={{ color: '#003366' }}>📘 Quiz: {quizStatus.quiz_title}</h3>

                  <div className="dashboard-grid">
                    <div className="webcam-container">✅ Submitted: <b>{quizStatus.submitted_count}</b></div>
                    <div className="webcam-container">⏳ Pending: <b>{quizStatus.pending_count}</b></div>
                  </div>

                  <div className="dashboard-grid">
                    <div className="chart-container">
                      <h4>✅ Submitted Students</h4>
                      {quizStatus.submitted_students.length === 0 ? (
                        <p>No one has submitted yet.</p>
                      ) : quizStatus.submitted_students.map((s, i) => (
                        <div
  key={i}
  className="quiz-form"
  style={{
    backgroundColor:
      s.cheated === "Cheated" || s.cheated === "Violated" ? '#ffe5e5' : '#e0ffe0',
    borderLeft: `6px solid ${
      s.cheated === "Cheated" || s.cheated === "Violated" ? '#cc0000' : '#00aa00'
    }`,
    padding: '12px',
    marginBottom: '12px',
    borderRadius: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  }}
>
  <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{s.name}</p>
  <p>📧 {s.email}</p>
  <p>🎯 Score: <b>{s.score}</b></p>
  <p>
    🚨 Status:
    <b
      style={{
        color:
          s.cheated === "Cheated" || s.cheated === "Violated"
            ? '#cc0000'
            : '#007f00',
        marginLeft: '5px',
      }}
    >
      {s.cheated}
    </b>
  </p>
  <p>🕒 Submitted: {s.submitted_at}</p>
</div>

                      ))}
                    </div>

                    <div className="chart-container">
                      <h4>⏳ Pending Students</h4>
                      {quizStatus.pending_students.length === 0 ? (
                        <p>No pending students.</p>
                      ) : quizStatus.pending_students.map((s, i) => (
                        <div key={i} className="quiz-form" style={{
                          backgroundColor: '#f4f4f4',
                          padding: '10px',
                          marginBottom: '10px',
                          borderRadius: '8px'
                        }}>
                          <p><strong>{s.name}</strong></p>
                          <p>📧 {s.email}</p>
                          <p>🕓 Status: <b style={{ color: '#555' }}>Pending</b></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStudents;
