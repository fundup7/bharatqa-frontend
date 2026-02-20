import React from 'react';
import { Home, TestTube, FileText, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ view, company, onNavigate, onLogout }) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'tests', label: 'My Tests', icon: TestTube },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-company">
          {company.picture ? (
            <img src={company.picture} alt="" className="company-avatar" />
          ) : (
            <div className="company-avatar-placeholder">
              {company.name?.[0]}
            </div>
          )}
          <div className="company-info">
            <div className="company-name">{company.company_name || company.name}</div>
            <div className="company-email">{company.email}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`sidebar-link ${view === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link logout-link" onClick={onLogout}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}