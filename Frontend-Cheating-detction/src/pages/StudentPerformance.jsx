// src/pages/StudentPerformance.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#00C49F", "#FF4444"];

const StudentPerformance = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      axios
        .get(`http://localhost:5000/student/performance-summary/${user.id}`)
        .then((res) => setSummary(res.data))
        .catch((err) => console.error("Error fetching performance summary", err));
    }
  }, []);

  const pieData = useMemo(
    () => [
      { name: "Clean", value: summary?.clean || 0 },
      { name: "Cheated", value: summary?.cheated || 0 },
    ],
    [summary]
  );

  const barData = useMemo(
    () =>
      summary?.tests?.map((t) => ({
        title: t.quiz_title,
        score: t.score || 0,
      })) || [],
    [summary]
  );

  if (!summary)
    return (
      <div style={{ display: "flex" }}>
        <Sidebar role="student" />
        <div style={{ flex: 1 }}>
          <Topbar />
          <p style={{ padding: "2rem" }}>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="dashboard-container" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="student" />
      <div className="main-panel" style={{ flexGrow: 1, backgroundColor: "#f9fafb" }}>
        <Topbar />
        <div className="main-content" style={{ padding: "2rem", fontFamily: "Segoe UI" }}>
          <br/><br/>
          <h2 style={{ marginBottom: "20px" }}>📊 My Performance Summary</h2>

          <div
            className="summary-cards"
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}
          >
            <div style={cardStyle}>📝 Total Tests: <b>{summary.total_quizzes}</b></div>
            <div style={cardStyle}>📈 Avg. Score: <b>{summary.average_score}</b></div>
            <div style={cardStyle}>✅ Clean Attempts: <b>{summary.clean}</b></div>
            <div style={cardStyle}>🚨 Cheated Attempts: <b>{summary.cheated}</b></div>
          </div>

          <div
            className="charts-section"
            style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}
          >
            <div style={{ flex: 1, minWidth: 300, background: "#fff", padding: "1rem", borderRadius: "8px" }}>
              <h4 style={{ marginBottom: "1rem" }}>Clean vs Cheated</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell key="clean" fill={COLORS[0]} />
                    <Cell key="cheated" fill={COLORS[1]} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, minWidth: 300, background: "#fff", padding: "1rem", borderRadius: "8px" }}>
              <h4 style={{ marginBottom: "1rem" }}>Scores per Quiz</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="title" angle={-30} textAnchor="end" interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "1rem",
  borderRadius: "8px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  minWidth: "180px",
  flex: 1,
  textAlign: "center",
};

export default StudentPerformance;
