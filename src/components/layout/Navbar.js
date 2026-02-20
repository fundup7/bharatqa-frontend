import React from 'react';
import { Home, TestTube, FileText, Settings } from 'lucide-react';
import logo from '../../Logo/logo.png';
import './Navbar.css';

export default function Navbar({ view, company, onNavigate, onLogout }) {
  const navItems = [
    { key: 'home', label: 'Home', icon: Home },
    ...(company ? [
      { key: 'dashboard', label: 'Dashboard', icon: TestTube },
      { key: 'settings', label: 'Settings', icon: Settings },
    ] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => onNavigate('home')}>
          <img src={logo} alt="BharatQA" className="navbar-logo-img" />
        </div>

        <div className="navbar-links">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-btn ${view === item.key ? 'active' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              <item.icon size={18} />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
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