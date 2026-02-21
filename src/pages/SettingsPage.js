import React, { useState } from 'react';
import { Save, Trash2, LogOut, CheckCircle, User, Briefcase, Settings2, ShieldAlert } from 'lucide-react';
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
        showToast('Settings saved successfully! 🎉');
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
      'FINAL CONFIRMATION: Are you absolutely sure?'
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
      <div className="sp-header">
        <div className="sp-header-title">
          <Settings2 size={28} color="var(--saffron)" />
          <div>
            <h1>Settings</h1>
            <p>Manage your company profile and account preferences.</p>
          </div>
        </div>
      </div>

      <div className="sp-grid">
        {/* Profile Section */}
        <div className="sp-section glass-card">
          <h2 className="sp-section-title">
            <User size={18} color="var(--saffron)" /> Profile Details
          </h2>
          <div className="sp-profile-header">
            {company.picture ? (
              <img src={company.picture} alt="" className="sp-avatar" />
            ) : (
              <div className="sp-avatar-placeholder">
                {company.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="sp-profile-info">
              <div className="sp-name">{company.name}</div>
              <div className="sp-email">{company.email}</div>
              <span className="sp-badge">Admin</span>
            </div>
          </div>

          <div className="sp-form">
            <div className="form-group">
              <label>Company Name <span className="required">*</span></label>
              <input
                type="text"
                className="sp-input"
                value={form.company_name}
                onChange={e => update('company_name', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Industry</label>
                <div className="select-wrapper">
                  <select
                    className="sp-input select-input"
                    value={form.industry}
                    onChange={e => update('industry', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Company Size</label>
                <div className="select-wrapper">
                  <select
                    className="sp-input select-input"
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
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Your Role</label>
                <div className="select-wrapper">
                  <select
                    className="sp-input select-input"
                    value={form.role}
                    onChange={e => update('role', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Phone <span className="optional">(optional)</span></label>
                <input
                  type="tel"
                  className="sp-input"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Website <span className="optional">(optional)</span></label>
              <input
                type="url"
                className="sp-input"
                value={form.website}
                onChange={e => update('website', e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </div>

            <div className="sp-actions">
              <button
                className="btn-primary sp-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="sp-col-right">
          <div className="sp-section glass-card">
            <h2 className="sp-section-title">
              <LogOut size={18} color="var(--text-sec)" /> Account Actions
            </h2>
            <p className="sp-desc">Need to switch accounts or take a break?</p>
            <button className="btn-secondary sp-logout-btn" onClick={onLogout}>
              <LogOut size={16} /> Sign Out Securely
            </button>
          </div>

          <div className="sp-section glass-card sp-danger-section">
            <div className="sp-danger-header">
              <div className="sp-danger-icon">
                <ShieldAlert size={20} color="var(--red)" />
              </div>
              <h2 className="sp-section-title text-red">Danger Zone</h2>
            </div>
            <p className="sp-desc text-red-dim">
              Deleting your account is irreversible. All your tests, user feedback, and metadata will be permanently erased. Please proceed with caution.
            </p>

            <button className="btn-danger sp-delete-btn" onClick={handleDeleteAccount}>
              <Trash2 size={16} /> Delete Account & Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}