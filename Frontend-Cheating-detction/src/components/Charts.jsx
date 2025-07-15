import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '10:00', faceDetected: 1 },
  { name: '10:05', faceDetected: 0 },
  { name: '10:10', faceDetected: 1 },
  { name: '10:15', faceDetected: 1 },
  { name: '10:20', faceDetected: 0 },
];

const Charts = () => {
  return (
    <div className="card-box">
      <h4>Face Detection Timeline</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="faceDetected" stroke="#033452" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
