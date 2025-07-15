import React from 'react';

const WebcamFeed = () => {
  return (
    <div className="webcam-feed card-box">
      <h4>Live Webcam Feed</h4>
      <video autoPlay playsInline muted width="100%" />
    </div>
  );
};

export default WebcamFeed;
