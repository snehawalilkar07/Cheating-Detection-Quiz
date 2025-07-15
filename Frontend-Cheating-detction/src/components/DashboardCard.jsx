import React from 'react';
import './DashboardCard.css'; // You can reuse styling similar to the crypto boxes

const DashboardCard = ({ title, value, color }) => {
  return (
    <div className="dashboard-card">
      <h4>{title}</h4>
      <p style={{ color }}>{value}</p>
    </div>
  );
};

export default DashboardCard;
