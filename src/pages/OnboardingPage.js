import React, { useState } from 'react';
import { Building2, User, CheckCircle2, ArrowRight, ArrowLeft, Rocket } from 'lucide-react';
import { apiClient } from '../utils/api';
import { industries, companySizes, roles } from '../utils/constants';
import './OnboardingPage.css';

export default function OnboardingPage({ company, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: company.company_name || company.name || '',
    industry: '',
    company_size: '',
    role: '',
    phone: '',
    website: '',
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const canNext = () => {
    if (step === 1) return form.company_name.trim() && form.industry;
    if (step === 2) return form.company_size && form.role;
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = await apiClient.onboardCompany(company.id, {
        ...form,
        onboarding_complete: true,
      });
      if (data.success || data.company) {
        onComplete(data.company || { ...company, ...form, onboarding_complete: true });
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card glass-card">
        <div className="onboarding-progress">
          {[1, 2, 3].map(s => (
            <div key={s} className={`progress-step ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
              <div className="step-dot">
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span>{s === 1 ? 'Company' : s === 2 ? 'Your Role' : 'Finish'}</span>
            </div>
          ))}
          <div className="progress-line" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="onboarding-step">
            <div className="step-icon-wrapper">
              <Building2 size={24} color="var(--saffron)" />
            </div>
            <h2>Tell us about your company</h2>
            <p className="step-desc">This helps us match you with the right testers.</p>

            <div className="form-group">
              <label>Company Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={form.company_name}
                onChange={e => update('company_name', e.target.value)}
                placeholder="e.g., Acme Technologies"
              />
            </div>

            <div className="form-group">
              <label>Industry <span className="required">*</span></label>
              <div className="chip-grid">
                {industries.map(ind => (
                  <button
                    key={ind}
                    className={`chip ${form.industry === ind ? 'chip-active' : ''}`}
                    onClick={() => update('industry', ind)}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Website <span className="optional">(optional)</span></label>
              <input
                type="url"
                className="form-input"
                value={form.website}
                onChange={e => update('website', e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <div className="step-icon-wrapper">
              <User size={24} color="var(--saffron)" />
            </div>
            <h2>About you</h2>
            <p className="step-desc">So we can tailor your dashboard experience.</p>

            <div className="form-group">
              <label>Company Size <span className="required">*</span></label>
              <div className="chip-grid">
                {companySizes.map(size => (
                  <button
                    key={size}
                    className={`chip ${form.company_size === size ? 'chip-active' : ''}`}
                    onClick={() => update('company_size', size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Your Role <span className="required">*</span></label>
              <div className="chip-grid">
                {roles.map(role => (
                  <button
                    key={role}
                    className={`chip ${form.role === role ? 'chip-active' : ''}`}
                    onClick={() => update('role', role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Phone <span className="optional">(optional)</span></label>
              <input
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step onboarding-review">
            <div className="step-icon-wrapper success">
              <Rocket size={24} color="#34C759" />
            </div>
            <h2>You're all set!</h2>
            <p className="step-desc">Here's a quick summary of what you told us.</p>

            <div className="review-grid">
              <div className="review-item">
                <span className="review-label">Company</span>
                <span className="review-value">{form.company_name}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Industry</span>
                <span className="review-value">{form.industry}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Team Size</span>
                <span className="review-value">{form.company_size}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Your Role</span>
                <span className="review-value">{form.role}</span>
              </div>
            </div>
          </div>
        )}

        <div className="onboarding-actions">
          {step > 1 && (
            <button className="btn-secondary onboarding-btn" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button
              className="btn-primary onboarding-btn"
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn-primary onboarding-btn submit-btn"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Setting up…
                </>
              ) : (
                <>
                  Launch Dashboard <Rocket size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}