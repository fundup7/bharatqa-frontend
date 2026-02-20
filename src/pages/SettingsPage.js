import React, { useState } from 'react';
import { Save, Trash2, LogOut } from 'lucide-react';
import { apiClient } from '../utils/api';
import { industries, companySizes, roles } from '../utils/constants';
import './SettingsPage.css';

export default function SettingsPage({ company, onUpdate, onLogout, showToast }) {
  const [form, setForm] = useState({
    company_name: company.company_name || company.name || '',
    industry: company.industry || '',
    company_size: company.company_size || '',
    role: company.role || '',
    phone: company.phone || '',
    website: company.website || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await apiClient.updateCompany(company.id, form);
      if (data.success || data.company) {
        onUpdate(data.company || { ...company, ...form });
        showToast('Settings saved! ✅');
      } else {
        showToast('Failed to save: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This will permanently delete ALL your tests, bug reports, and data. This cannot be undone.'
    );
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'FINAL CONFIRMATION: Type is not supported, but are you absolutely sure?'
    );
    if (!doubleConfirm) return;

    try {
      await apiClient.deleteCompany(company.id);
      showToast('Account deleted');
      onLogout();
    } catch (err) {
      showToast('Failed to delete account', 'error');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your company profile and account.</p>
      </div>

      {/* Profile Section */}
      <div className="settings-section glass-card">
        <h2>Company Profile</h2>

        <div className="settings-profile-header">
          {company.picture ? (
            <img src={company.picture} alt="" className="settings-avatar" />
          ) : (
            <div className="settings-avatar-placeholder">
              {company.name?.[0]}
            </div>
          )}
          <div>
            <div className="settings-name">{company.name}</div>
            <div className="settings-email">{company.email}</div>
          </div>
        </div>

        <div className="settings-form">
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              className="form-input"
              value={form.company_name}
              onChange={e => update('company_name', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Industry</label>
              <select
                className="form-input"
                value={form.industry}
                onChange={e => update('industry', e.target.value)}
              >
                <option value="">Select…</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Company Size</label>
              <select
                className="form-input"
                value={form.company_size}
                onChange={e => update('company_size', e.target.value)}
              >
                <option value="">Select…</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Your Role</label>
              <select
                className="form-input"
                value={form.role}
                onChange={e => update('role', e.target.value)}
              >
                <option value="">Select…</option>
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Phone</label>
              <input
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              className="form-input"
              value={form.website}
              onChange={e => update('website', e.target.value)}
              placeholder="https://yourcompany.com"
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-section glass-card">
        <h2>⚠️ Danger Zone</h2>
        <p className="danger-desc">
          These actions are irreversible. Please be certain.
        </p>

        <div className="danger-actions">
          <button className="btn-secondary" onClick={onLogout}>
            <LogOut size={16} /> Sign Out
          </button>
          <button className="btn-danger" onClick={handleDeleteAccount}>
            <Trash2 size={16} /> Delete Account & All Data
          </button>
        </div>
      </div>
    </div>
  );
}