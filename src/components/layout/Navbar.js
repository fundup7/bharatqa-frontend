import React from 'react';
// Icon imports removed as navbar buttons are no longer needed
import logo from '../../Logo/logo.png';
import './Navbar.css';

export default function Navbar({ company, onNavigate, onLogout }) {
  // Navigation items removed; sidebar provides navigation

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => onNavigate('home')}>
          <img src={logo} alt="BharatQA" className="navbar-logo-img" />
        </div>


        <div className="navbar-auth">
          {company ? (
            <>
              <div className="user-info">
                <div className="user-name">{company.name}</div>
                <div className="user-email">{company.email}</div>
              </div>
              {company.picture ? (
                <img src={company.picture} alt="" className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">
                  {company.name?.[0]}
                </div>
              )}
              <button className="btn-secondary btn-small" onClick={onLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => onNavigate('login')}>
              Sign In →
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}