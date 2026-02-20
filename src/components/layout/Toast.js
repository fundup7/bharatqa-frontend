import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import './Toast.css';

export default function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={`toast glass-elevated toast-${type}`}>
      {type === 'success' ? (
        <CheckCircle size={18} />
      ) : (
        <X size={18} />
      )}
      <span>{message}</span>
    </div>
  );
}