import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, Smartphone, ListPlus, Settings2, AlertCircle, FileText, Target, Users } from 'lucide-react';
import { apiClient } from '../utils/api';
import './CreateTestPage.css';

export default function CreateTestPage({ company, onClose, showToast }) {
  const [form, setForm] = useState({
    app_name: '',
    app_package: '',
    test_instructions: '',
    priority: 'normal',
    tester_quota: 20,
    testing_iterations: 1,
    total_budget: 1400, // Default: 20 * 1 * 70
  });

  // Derived price calculation
  const calculatedPrice = form.tester_quota * form.testing_iterations * 70;

  // Targeting criteria (all optional — empty = open to all)
  const [criteria, setCriteria] = useState({
    device_tier: '',
    network_type: '',
    max_ram_gb: '',
    allowed_states: '',
    allowed_cities: '',
  });

  const [apkFile, setApkFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const update = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      // Auto-sync budget if it matches the previous default calculation
      const prevDefault = prev.tester_quota * prev.testing_iterations * 70;
      if (prev.total_budget === prevDefault) {
        next.total_budget = next.tester_quota * next.testing_iterations * 70;
      }
      return next;
    });
  };
  const updateCriteria = (key, value) => setCriteria(prev => ({ ...prev, [key]: value }));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.apk')) {
      setApkFile(file);
    } else {
      showToast('Please upload an APK file', 'error');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setApkFile(file);
  };

  const handleSubmit = async () => {
    if (!form.app_name.trim()) {
      showToast('App name is required', 'error');
      return;
    }
    if (!form.test_instructions.trim()) {
      showToast('Test instructions are required', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('company_id', company.id);
      formData.append('company_name', company.company_name || company.name);
      formData.append('app_name', form.app_name.trim());
      formData.append('app_package', form.app_package.trim());
      formData.append('instructions', form.test_instructions.trim());
      formData.append('priority', form.priority);
      formData.append('tester_quota', form.tester_quota);
      formData.append('testing_iterations', form.testing_iterations);
      formData.append('total_budget', form.total_budget);
      formData.append('price_paid', form.total_budget / form.tester_quota);
      if (apkFile) {
        formData.append('apk', apkFile);
      }

      const res = await apiClient.createTest(formData);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast('Failed to create test: ' + (data.error || 'Unknown error'), 'error');
        return;
      }

      const created = await res.json();

      // Apply targeting criteria if any field was set
      const hasAnyCriteria = Object.values(criteria).some(v => v !== '');
      if (hasAnyCriteria && created.id) {
        const criteriaPayload = {};
        if (criteria.device_tier) criteriaPayload.device_tier = criteria.device_tier;
        if (criteria.network_type) criteriaPayload.network_type = criteria.network_type;
        if (criteria.max_ram_gb) criteriaPayload.max_ram_gb = Number(criteria.max_ram_gb);
        if (criteria.allowed_states.trim()) criteriaPayload.allowed_states = criteria.allowed_states.trim();
        if (criteria.allowed_cities.trim()) criteriaPayload.allowed_cities = criteria.allowed_cities.trim();

        try {
          await apiClient.setTestCriteria(created.id, criteriaPayload);
        } catch (criteriaErr) {
          console.warn('Criteria set failed (non-fatal):', criteriaErr.message);
        }
      }

      showToast('Test created successfully! 🎉');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to create test: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasCriteria = Object.values(criteria).some(v => v !== '');

  return (
    <div className="create-test-page">
      <div className="ct-info-hero">
        <div className="ct-info-main">
          <div className="ct-app-icon">
            <ListPlus size={28} color="var(--saffron)" />
          </div>
          <div className="ct-app-details">
            <h1>Create New Test</h1>
            <p className="ct-meta">Upload your APK and instruct testers on what to test.</p>
          </div>
        </div>
        <button className="ct-back" onClick={onClose}>
          <X size={18} /> Cancel
        </button>
      </div>

      <div className="create-test-grid">
        {/* Left: Form */}
        <div className="create-test-col">
          <div className="ct-section-header">
            <h2 className="ct-section-title">
              <Settings2 size={20} color="var(--saffron)" /> Basic Configuration
            </h2>
          </div>

          <div className="create-test-form glass-card">
            <div className="form-group">
              <label>App Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input ct-input"
                value={form.app_name}
                onChange={e => update('app_name', e.target.value)}
                placeholder="e.g., My Shopping App"
              />
            </div>

            <div className="form-group">
              <label>Package Name <span className="optional">(optional)</span></label>
              <input
                type="text"
                className="form-input ct-input"
                value={form.app_package}
                onChange={e => update('app_package', e.target.value)}
                placeholder="e.g., com.example.myapp"
              />
            </div>

            <div className="form-group">
              <label>Test Instructions <span className="required">*</span></label>
              <textarea
                className="form-input form-textarea ct-input"
                value={form.test_instructions}
                onChange={e => update('test_instructions', e.target.value)}
                placeholder={"1. Open the app and sign up with a new account\n2. Browse the home screen\n3. Add any item to cart\n4. Try to checkout\n5. Report anything that looks wrong or crashes"}
                rows={7}
              />
              <span className="form-hint">
                <AlertCircle size={14} /> Be specific — testers follow these step by step.
              </span>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Priority</label>
                <div className="select-wrapper">
                  <select
                    className="form-input ct-input"
                    value={form.priority}
                    onChange={e => update('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High — test ASAP</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="ct-section-header" style={{ marginTop: '24px', paddingBottom: 0 }}>
              <h2 className="ct-section-title">
                <Users size={20} color="var(--saffron)" /> Quota & Scale
              </h2>
            </div>

            <div className="form-row" style={{ marginTop: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Target Number of Testers</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  step="5"
                  className="form-input ct-input"
                  value={form.tester_quota}
                  onChange={e => update('tester_quota', parseInt(e.target.value) || 20)}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Testing Iterations</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  className="form-input ct-input"
                  value={form.testing_iterations}
                  onChange={e => update('testing_iterations', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="form-hint" style={{ marginTop: '-10px', marginBottom: '16px' }}>
              Defines how many distinct demographics will verify the build across how many unique cycles.
            </div>

            <div className="form-group" style={{ marginTop: '8px' }}>
              <label>Total Project Budget (₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }}>₹</span>
                <input
                  type="number"
                  min={form.tester_quota * form.testing_iterations * 70}
                  className="form-input ct-input"
                  style={{ paddingLeft: 28 }}
                  value={form.total_budget}
                  onChange={e => update('total_budget', parseFloat(e.target.value) || 0)}
                />
              </div>
              <span className="form-hint">
                Min: ₹{form.tester_quota * form.testing_iterations * 70} (₹70/tester). Higher budget attracts more skilled testers.
              </span>
            </div>

          </div>

          {/* Targeting Criteria */}
          <div className="ct-section-header" style={{ marginTop: '24px' }}>
            <h2 className="ct-section-title">
              <Target size={20} color="var(--saffron)" /> Tester Targeting
              {hasCriteria && <span className="ct-criteria-badge">Active</span>}
            </h2>
            <p className="ct-section-hint">Leave all blank to accept testers on any device.</p>
          </div>

          <div className="create-test-form glass-card">
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Device Tier</label>
                <div className="select-wrapper">
                  <select
                    className="form-input ct-input"
                    value={criteria.device_tier}
                    onChange={e => updateCriteria('device_tier', e.target.value)}
                  >
                    <option value="">Any device</option>
                    <option value="low">Low-end (budget)</option>
                    <option value="mid">Mid-range</option>
                    <option value="high">Flagship</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Network Type</label>
                <div className="select-wrapper">
                  <select
                    className="form-input ct-input"
                    value={criteria.network_type}
                    onChange={e => updateCriteria('network_type', e.target.value)}
                  >
                    <option value="">Any network</option>
                    <option value="2g">2G (very slow)</option>
                    <option value="3g">3G (slow)</option>
                    <option value="4g">4G / LTE</option>
                    <option value="5g">5G</option>
                    <option value="wifi">WiFi only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Max RAM (GB) <span className="optional">(optional)</span></label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  step="1"
                  className="form-input ct-input"
                  value={criteria.max_ram_gb}
                  onChange={e => updateCriteria('max_ram_gb', e.target.value)}
                  placeholder="e.g., 4 — limits to ≤ 4 GB RAM"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>States <span className="optional">(comma-separated)</span></label>
                <input
                  type="text"
                  className="form-input ct-input"
                  value={criteria.allowed_states}
                  onChange={e => updateCriteria('allowed_states', e.target.value)}
                  placeholder="e.g., Maharashtra, Bihar, Uttar Pradesh"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Cities <span className="optional">(comma-separated)</span></label>
                <input
                  type="text"
                  className="form-input ct-input"
                  value={criteria.allowed_cities}
                  onChange={e => updateCriteria('allowed_cities', e.target.value)}
                  placeholder="e.g., Mumbai, Patna, Lucknow"
                />
              </div>
            </div>

            {hasCriteria && (
              <div className="ct-criteria-summary">
                🎯 Only testers matching these criteria will see this test.
              </div>
            )}
          </div>
        </div>

        {/* Right: APK Upload */}
        <div className="create-test-col">
          <div className="ct-section-header">
            <h2 className="ct-section-title">
              <Smartphone size={20} color="var(--saffron)" /> Application Build
            </h2>
          </div>

          <div className="create-test-upload glass-card">
            <div
              className={`apk-dropzone ${dragActive ? 'drag-active' : ''} ${apkFile ? 'has-file' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => !apkFile && fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".apk"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {apkFile ? (
                <div className="apk-selected">
                  <div className="apk-icon-wrap">
                    <CheckCircle size={32} />
                  </div>
                  <div className="apk-file-info">
                    <strong>{apkFile.name}</strong>
                    <span>{formatSize(apkFile.size)}</span>
                  </div>
                  <button
                    className="apk-remove"
                    onClick={(e) => { e.stopPropagation(); setApkFile(null); }}
                  >
                    <X size={16} /> Remove
                  </button>
                </div>
              ) : (
                <div className="apk-placeholder">
                  <div className="apk-upload-icon">
                    <Upload size={32} strokeWidth={1.5} />
                  </div>
                  <h3>Upload APK File</h3>
                  <p>Drag &amp; drop or click to browse</p>
                  <span className="apk-hint">Max 500 MB · .apk files only</span>
                </div>
              )}
            </div>

            <div className="ct-action-box">
              <FileText size={48} className="ct-bg-icon" />
              <div className="ct-action-content">
                <h4>Ready to launch?</h4>
                <p style={{ marginBottom: 12 }}>Total Budget: <strong style={{ color: 'var(--saffron)', fontSize: '1.2rem' }}>₹{form.total_budget}</strong></p>
                <button
                  className="btn-primary full-width ct-submit-btn"
                  disabled={uploading || !form.app_name.trim() || !form.test_instructions.trim()}
                  onClick={handleSubmit}
                >
                  {uploading ? (
                    <>
                      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Uploading Build…
                    </>
                  ) : (
                    `🚀 Pay ₹${calculatedPrice} & Create`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}