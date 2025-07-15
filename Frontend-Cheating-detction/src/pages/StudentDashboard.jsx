import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './Dashboard.css';

const StudentDashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar role="student" />
      <div className="main-content">
        <Topbar />
        <br/><br/>
        <h2 className="dashboard-title">Welcome</h2>

        <div className="instructions p-4 bg-light rounded shadow-sm mt-4">
          <h3>📢 Important Instructions for the Test</h3>
          <ul>
            <li>The webcam will remain active throughout the test. Ensure it is functioning properly.</li>
            <li>Sit against a plain background. Avoid distractions or movement behind you.</li>
            <li>Violations will result in warnings for the following:
              <ul>
                <li>📱 Mobile phone usage detected</li>
                <li>👥 Multiple people in the frame</li>
                <li>🙈 Face not clearly visible</li>
                <li>🧍 Excessive movement or posture changes</li>
              </ul>
            </li>
            <li>You are allowed a maximum of <strong>3 warnings</strong>. On the third warning, your test will be <strong>automatically submitted and locked</strong>.</li>
            <li>After the test is locked, you will not be able to attempt it again.</li>
            <li>The admin will review all cheating reports. Please maintain discipline and honesty during the test.</li>
          </ul>
          <p className="mt-3"><strong>⚠️ Please follow all instructions carefully to avoid disqualification.</strong></p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


