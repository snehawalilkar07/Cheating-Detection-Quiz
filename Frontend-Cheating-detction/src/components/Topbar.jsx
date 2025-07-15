import React from 'react';
import './Topbar.css';

const Topbar = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const name = user.name || "User";
  const role = user.role || "student";

  return (
    <div className="topbar">
      <div className="profile">
        <img src="/avatar.png" alt="User Avatar" className="avatar" />
        <span>
          Welcome, {role === 'admin' ? 'Administrator' : name}
        </span>
      </div>
    </div>
  );
};

export default Topbar;
