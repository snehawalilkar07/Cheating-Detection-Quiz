import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  let role = '';

  const user = localStorage.getItem('user');
  if (user) {
    try {
      role = JSON.parse(user).role; // ✅ Safely extract role
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    }
  }

  return (
    <div className="sidebar">
      <h2>Cheat Detect</h2>
      <nav>
        <ul>
          {role === 'student' && (
            <>
              <li><Link to="/student/dashboard">Dashboard</Link></li>
              <li><Link to="/student/student-performance">Test Details</Link></li>
              <li><Link to="/student/start-test">Start Test</Link></li>
              <li><Link to="/student/profile">Profile</Link></li>
             
            </>
          )}

          {role === 'admin' && (
            <>
              <li><Link to="/admin/dashboard">Dashboard</Link></li>
              <li><Link to="/admin/create-quiz">Create Quiz</Link></li>
              <li><Link to="/admin/view-students">View Students</Link></li>
              {/* <li><Link to="/admin/violations">Violations</Link></li> */}
              <li><Link to="/admin/profile">Profile</Link></li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
