import React from 'react';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label>{label}</label>}
      <input className={`form-input ${error ? 'form-input-error' : ''}`} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}