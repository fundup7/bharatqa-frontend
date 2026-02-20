import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { apiClient } from '../utils/api';
import './CreateTestPage.css';

export default function CreateTestPage({ company, onClose, showToast }) {
  const [form, setForm] = useState({
    app_name: '',
    app_package: '',
    test_instructions: '',
    target_devices: 'all',
    priority: 'normal',
  });
  const [apkFile, setApkFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

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
      formData.append('app_name', form.app_name.trim());
      formData.append('app_package', form.app_package.trim());
      formData.append('test_instructions', form.test_instructions.trim());
      formData.append('target_devices', form.target_devices);
      formData.append('priority', form.priority);
      if (apkFile) {
        formData.append('apk', apkFile);
      }

      const res = await apiClient.createTest(formData);
      if (res.ok) {
        showToast('Test created successfully! 🎉');
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Failed to create test: ' + (data.error || 'Unknown error'), 'error');
      }
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

  return (
    <div className="create-test-page">
      <div className="create-test-header">
        <div>
          <h1>Create New Test</h1>
          <p>Upload your APK and tell testers what to test.</p>
        </div>
        <button className="btn-secondary" onClick={onClose}>
          <X size={18} /> Cancel
        </button>
      </div>

      <div className="create-test-grid">
        {/* Left: Form */}
        <div className="create-test-form glass-card">
          <div className="form-group">
            <label>App Name *</label>
            <input
              type="text"
              className="form-input"
              value={form.app_name}
              onChange={e => update('app_name', e.target.value)}
              placeholder="e.g., My Shopping App"
            />
          </div>

          <div className="form-group">
            <label>Package Name (optional)</label>
            <input
              type="text"
              className="form-input"
              value={form.app_package}
              onChange={e => update('app_package', e.target.value)}
              placeholder="e.g., com.example.myapp"
            />
          </div>

          <div className="form-group">
            <label>Test Instructions *</label>
            <textarea
              className="form-input form-textarea"
              value={form.test_instructions}
              onChange={e => update('test_instructions', e.target.value)}
              placeholder={"1. Open the app and sign up with a new account\n2. Browse the home screen\n3. Add any item to cart\n4. Try to checkout\n5. Report anything that looks wrong or crashes"}
              rows={8}
            />
            <span className="form-hint">
              Be specific — testers follow these step by step.
            </span>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Priority</label>
              <select
                className="form-input"
                value={form.priority}
                onChange={e => update('priority', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High — test ASAP</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Target Devices</label>
              <select
                className="form-input"
                value={form.target_devices}
                onChange={e => update('target_devices', e.target.value)}
              >
                <option value="all">All devices</option>
                <option value="budget">Budget phones only</option>
                <option value="midrange">Mid-range</option>
                <option value="flagship">Flagship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: APK Upload */}
        <div className="create-test-upload">
          <div
            className={`apk-dropzone glass-card ${dragActive ? 'drag-active' : ''} ${apkFile ? 'has-file' : ''}`}
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
                <Upload size={40} strokeWidth={1.5} />
                <h3>Drop your APK here</h3>
                <p>or click to browse</p>
                <span className="apk-hint">Max 500 MB · .apk files only</span>
              </div>
            )}
          </div>

          <button
            className="btn-primary full-width"
            style={{ marginTop: 20 }}
            disabled={uploading || !form.app_name.trim() || !form.test_instructions.trim()}
            onClick={handleSubmit}
          >
            {uploading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Uploading…
              </>
            ) : (
              '🚀 Create Test'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}