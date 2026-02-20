import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Bug, Trash2, Play, Brain, ChevronDown, ChevronUp,
  Smartphone, Wifi, Battery, MapPin, Clock, AlertTriangle, Video
} from 'lucide-react';
import { apiClient } from '../utils/api';
import { API } from '../utils/constants';
import './TestDetailPage.css';

/* Helper: turn a relative recording_url into an absolute one */
function getVideoUrl(bug) {
  if (!bug.recording_url) return null;
  // Already absolute
  if (bug.recording_url.startsWith('http')) return bug.recording_url;
  // Relative — prepend the API base (strip trailing /api)
  const base = API.replace(/\/api\/?$/, '');
  return base + bug.recording_url;
}

function severityColor(sev) {
  const s = (sev || '').toLowerCase();
  if (s === 'critical') return '#FF3B5C';
  if (s === 'high') return '#F5A623';
  if (s === 'medium') return '#4F8EF7';
  return '#34C759';
}

export default function TestDetailPage({ test, onBack, showToast }) {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBug, setExpandedBug] = useState(null);
  const [analyzingBug, setAnalyzingBug] = useState(null);

  const loadBugs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getBugs(test.id);
      setBugs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load bug reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [test.id, showToast]);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  const deleteBug = async (bugId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this bug report?')) return;
    try {
      await apiClient.deleteBug(bugId);
      showToast('Bug deleted');
      loadBugs();
    } catch (err) {
      showToast('Failed to delete bug', 'error');
    }
  };

  const analyzeBug = async (bugId, e) => {
    e.stopPropagation();
    setAnalyzingBug(bugId);
    try {
      const result = await apiClient.analyzeWithAI(bugId);
      showToast('AI analysis complete! 🧠');
      loadBugs(); // reload to get ai_analysis field
    } catch (err) {
      showToast('AI analysis failed', 'error');
    } finally {
      setAnalyzingBug(null);
    }
  };

  const toggleExpand = (bugId) => {
    setExpandedBug(prev => (prev === bugId ? null : bugId));
  };

  const parseDeviceStats = (bug) => {
    try {
      if (typeof bug.device_stats === 'string') return JSON.parse(bug.device_stats);
      if (typeof bug.device_stats === 'object') return bug.device_stats;
    } catch (e) {}
    return null;
  };

  return (
    <div className="test-detail-page">
      {/* Header */}
      <div className="td-header">
        <button className="td-back" onClick={onBack}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <div className="td-info glass-card">
        <div className="td-info-main">
          <div className="td-app-icon">📱</div>
          <div>
            <h1>{test.app_name}</h1>
            <p className="td-meta">
              Created {new Date(test.created_at).toLocaleDateString()} ·{' '}
              {bugs.length} bug{bugs.length !== 1 ? 's' : ''} reported
            </p>
          </div>
        </div>
        {test.test_instructions && (
          <div className="td-instructions">
            <h3>📋 Test Instructions</h3>
            <pre>{test.test_instructions}</pre>
          </div>
        )}
      </div>

      {/* Bug Reports */}
      <h2 className="td-section-title">
        <Bug size={20} /> Bug Reports ({bugs.length})
      </h2>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading bug reports…</p>
        </div>
      )}

      {!loading && bugs.length === 0 && (
        <div className="empty-state glass-card">
          <div className="empty-icon">🔍</div>
          <h3>No bug reports yet</h3>
          <p>Testers haven't submitted any reports for this test. Share the test with testers to start receiving feedback.</p>
        </div>
      )}

      <div className="bugs-list">
        {bugs.map(bug => {
          const isExpanded = expandedBug === bug.id;
          const stats = parseDeviceStats(bug);
          const videoUrl = getVideoUrl(bug);

          return (
            <div
              key={bug.id}
              className={`bug-card glass-card ${isExpanded ? 'bug-expanded' : ''}`}
            >
              {/* Bug Header Row */}
              <div className="bug-header" onClick={() => toggleExpand(bug.id)}>
                <div className="bug-severity-dot" style={{ background: severityColor(bug.severity) }} />
                <div className="bug-summary">
                  <h3>{bug.bug_title || bug.title || 'Untitled Bug'}</h3>
                  <div className="bug-meta-row">
                    <span className="bug-tester">👤 {bug.tester_name || 'Anonymous'}</span>
                    <span className="bug-time">
                      <Clock size={12} /> {new Date(bug.created_at).toLocaleString()}
                    </span>
                    {bug.severity && (
                      <span
                        className="bug-severity-badge"
                        style={{ background: severityColor(bug.severity) + '20', color: severityColor(bug.severity) }}
                      >
                        {bug.severity}
                      </span>
                    )}
                    {videoUrl && (
                      <span className="bug-has-video">
                        <Video size={12} /> Recording
                      </span>
                    )}
                  </div>
                </div>
                <div className="bug-actions">
                  <button
                    className="action-btn ai-btn"
                    onClick={(e) => analyzeBug(bug.id, e)}
                    disabled={analyzingBug === bug.id}
                    title="Analyze with AI"
                  >
                    {analyzingBug === bug.id ? (
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    ) : (
                      <Brain size={16} />
                    )}
                  </button>
                  <button
                    className="action-btn delete-action"
                    onClick={(e) => deleteBug(bug.id, e)}
                    title="Delete bug"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="action-btn expand-btn">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="bug-detail">
                  {/* Description */}
                  <div className="bug-section">
                    <h4>Description</h4>
                    <p className="bug-description">{bug.bug_description || bug.description || 'No description provided.'}</p>
                  </div>

                  {/* Steps to Reproduce */}
                  {bug.steps_to_reproduce && (
                    <div className="bug-section">
                      <h4>Steps to Reproduce</h4>
                      <pre className="bug-steps">{bug.steps_to_reproduce}</pre>
                    </div>
                  )}

                  {/* Video Player */}
                  {videoUrl && (
                    <div className="bug-section">
                      <h4><Video size={16} /> Screen Recording</h4>
                      <div className="video-container">
                        <video
                          controls
                          preload="metadata"
                          className="bug-video"
                          src={videoUrl}
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="download-link"
                      >
                        ⬇ Download Recording
                      </a>
                    </div>
                  )}

                  {/* Screenshots */}
                  {bug.screenshot_url && (
                    <div className="bug-section">
                      <h4>📸 Screenshots</h4>
                      <div className="screenshots-grid">
                        <img
                          src={bug.screenshot_url}
                          alt="Bug screenshot"
                          className="bug-screenshot"
                          onClick={() => window.open(bug.screenshot_url, '_blank')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Device Stats */}
                  {stats && (
                    <div className="bug-section">
                      <h4><Smartphone size={16} /> Device Info</h4>
                      <div className="device-grid">
                        {stats.device_model && (
                          <div className="device-item">
                            <Smartphone size={14} />
                            <span>{stats.device_model}</span>
                          </div>
                        )}
                        {stats.android_version && (
                          <div className="device-item">
                            <span className="device-label">Android</span>
                            <span>{stats.android_version}</span>
                          </div>
                        )}
                        {stats.screen_resolution && (
                          <div className="device-item">
                            <span className="device-label">Screen</span>
                            <span>{stats.screen_resolution}</span>
                          </div>
                        )}
                        {stats.network_type && (
                          <div className="device-item">
                            <Wifi size={14} />
                            <span>{stats.network_type}</span>
                          </div>
                        )}
                        {stats.battery_start != null && (
                          <div className="device-item">
                            <Battery size={14} />
                            <span>{stats.battery_start}% → {stats.battery_end || '?'}%</span>
                          </div>
                        )}
                        {stats.location_address && (
                          <div className="device-item">
                            <MapPin size={14} />
                            <span>{stats.location_address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {bug.ai_analysis && (
                    <div className="bug-section ai-section">
                      <h4><Brain size={16} /> AI Analysis</h4>
                      <div className="ai-content">
                        {typeof bug.ai_analysis === 'string' ? (
                          <pre className="ai-text">{bug.ai_analysis}</pre>
                        ) : (
                          <pre className="ai-text">{JSON.stringify(bug.ai_analysis, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}