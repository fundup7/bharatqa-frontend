import React from 'react';
import './AnimatedBackground.css';

export default function AnimatedBackground() {
  return (
    <div className="animated-bg">
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      <div className="gradient-orb orb-3" />
    </div>
  );
}