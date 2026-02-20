import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, Bug, Trash2, Brain, ChevronDown, ChevronUp,
  Smartphone, Wifi, Battery, MapPin, Clock, Video, Check
} from 'lucide-react';
import { apiClient } from '../utils/api';
import { API } from '../utils/constants';
import './TestDetailPage.css';

/* Helper: turn a relative recording_url into an absolute one */
function getVideoUrl(bug) {
  if (!bug.recording_url) return null;
  if (bug.recording_url.startsWith('http')) return bug.recording_url;
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

function safeJsonParse(v) {
  try {
    if (!v) return null;
    if (typeof v === 'string') return JSON.parse(v);
    if (typeof v === 'object') return v;
  } catch {}
  return null;
}

function pick(obj, keys) {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return null;
}

function fmtPct(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? `${n}%` : String(v);
}

function fmtSeconds(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  if (n < 60) return `${n}s`;
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}m ${s}s`;
}

export default function TestDetailPage({ test, onBack, showToast }) {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBug, setExpandedBug] = useState(null);
  const [analyzingBug, setAnalyzingBug] = useState(null);

  // Use ref to avoid showToast in dependency arrays
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  // Track if component is mounted to avoid state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const loadBugs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getBugs(test.id);
      if (mountedRef.current) setBugs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load bugs:', err);
      if (mountedRef.current) setError(err.message || 'Failed to load bug reports');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [test.id]);

  useEffect(() => { loadBugs(); }, [loadBugs]);

  const toggleExpand = (bugId) => {
    setExpandedBug(prev => (prev === bugId ? null : bugId));
  };

  const deleteBug = async (bugId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this bug report?')) return;
    try {
      await apiClient.deleteBug(bugId);
      showToastRef.current('Bug deleted');
      loadBugs();
    } catch (err) {
      showToastRef.current('Failed to delete bug', 'error');
    }
  };

  const analyzeBug = async (bug, e) => {
    e.stopPropagation();

    // “Only one time” rule: if already exists, do nothing
    if (bug.ai_analysis) {
      showToastRef.current('AI analysis already exists for this bug.', 'error');
      return;
    }

    setAnalyzingBug(bug.id);
    try {
      await apiClient.analyzeWithAI(bug.id);
      showToastRef.current('AI analysis complete!');
      loadBugs();
    } catch (err) {
      showToastRef.current('AI analysis failed: ' + (err.message || 'Server error'), 'error');
    } finally {
      if (mountedRef.current) setAnalyzingBug(null);
    }
  };

  return (
    <div className="test-detail-page">
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
            <h3>Test Instructions</h3>
            <pre>{test.test_instructions}</pre>
          </div>
        )}
      </div>

      <h2 className="td-section-title">
        <Bug size={20} /> Bug Reports ({bugs.length})
      </h2>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading bug reports…</p>
        </div>
      )}

      {!loading && error && (
        <div className="error-state glass-card">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load bug reports</h3>
          <p>{error}</p>
          <p className="error-hint">
            Backend might be sleeping (Render). Wait 30–60s and retry.
          </p>
          <button className="btn-primary" onClick={loadBugs}>Retry</button>
        </div>
      )}

      {!loading && !error && bugs.length === 0 && (
        <div className="empty-state glass-card">
          <div className="empty-icon">🗂️</div>
          <h3>No bug reports yet</h3>
          <p>When testers submit reports, they’ll appear here.</p>
        </div>
      )}

      <div className="bugs-list">
        {bugs.map(bug => {
          const isExpanded = expandedBug === bug.id;
          const stats = safeJsonParse(bug.device_stats);
          const videoUrl = getVideoUrl(bug);

          // Map stats with support for snake_case + camelCase keys
          const deviceModel = pick(stats, ['device_model', 'deviceModel', 'model']);
          const androidVersion = pick(stats, ['android_version', 'androidVersion', 'osVersion']);
          const screenRes = pick(stats, ['screen_resolution', 'screenResolution', 'resolution']);
          const networkType = pick(stats, ['network_type', 'networkType']);
          const networkSpeed = pick(stats, ['network_speed_mbps', 'networkSpeedMbps', 'networkSpeed']);
          const batteryStart = pick(stats, ['battery_start', 'batteryStart']);
          const batteryEnd = pick(stats, ['battery_end', 'batteryEnd']);
          const batteryDrain = pick(stats, ['battery_drain', 'batteryDrain']);
          const durationSec = pick(stats, ['duration_seconds', 'durationSeconds', 'duration']);
          const locationAddr = pick(stats, ['location_address', 'locationAddress', 'address']);
          const lat = pick(stats, ['location_lat', 'locationLat', 'lat', 'latitude']);
          const lng = pick(stats, ['location_lng', 'locationLng', 'lng', 'longitude']);
          const accuracy = pick(stats, ['location_accuracy', 'locationAccuracy', 'accuracy']);

          const alreadyAnalyzed = Boolean(bug.ai_analysis);
          const aiBusy = analyzingBug === bug.id;

          const mapsUrl = (lat && lng)
            ? `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`
            : null;

          return (
            <div key={bug.id} className={`bug-card glass-card ${isExpanded ? 'bug-expanded' : ''}`}>
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

                    {alreadyAnalyzed && (
                      <span className="bug-ai-badge">
                        <Check size={12} /> AI Done
                      </span>
                    )}
                  </div>
                </div>

                <div className="bug-actions">
                  <button
                    className={`action-btn ai-btn ${alreadyAnalyzed ? 'action-btn--disabled' : ''}`}
                    onClick={(e) => analyzeBug(bug, e)}
                    disabled={aiBusy || alreadyAnalyzed}
                    title={alreadyAnalyzed ? 'AI analysis already available' : 'Analyze with AI'}
                  >
                    {aiBusy ? (
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    ) : alreadyAnalyzed ? (
                      <Check size={16} />
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

                  <button
                    type="button"
                    className="action-btn expand-btn"
                    onClick={(e) => { e.stopPropagation(); toggleExpand(bug.id); }}
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="bug-detail">
                  <div className="bug-detail-grid">
                    {/* LEFT COLUMN */}
                    <div className="bug-col">
                      <div className="bug-panel">
                        <h4>Tester Notes</h4>
                        <p className="bug-description">
                          {bug.bug_description || bug.description || 'No description provided.'}
                        </p>
                      </div>

                      {bug.steps_to_reproduce && (
                        <div className="bug-panel">
                          <h4>Steps to Reproduce</h4>
                          <pre className="bug-steps">{bug.steps_to_reproduce}</pre>
                        </div>
                      )}

                      {/* Structured Specs */}
                      {(stats || deviceModel || networkType || locationAddr) && (
                        <div className="bug-panel">
                          <h4>Session Specs</h4>

                          <dl className="spec-grid">
                            {deviceModel && (<><dt><Smartphone size={14} /> Device</dt><dd>{deviceModel}</dd></>)}
                            {androidVersion && (<><dt>Android</dt><dd>{androidVersion}</dd></>)}
                            {screenRes && (<><dt>Screen</dt><dd>{screenRes}</dd></>)}

                            {typeof batteryStart !== 'undefined' && batteryStart !== null && (
                              <><dt><Battery size={14} /> Battery start</dt><dd>{fmtPct(batteryStart)}</dd></>
                            )}
                            {typeof batteryEnd !== 'undefined' && batteryEnd !== null && (
                              <><dt>Battery end</dt><dd>{fmtPct(batteryEnd)}</dd></>
                            )}
                            {batteryDrain !== null && batteryDrain !== undefined && batteryDrain !== '' && (
                              <><dt>Battery drain</dt><dd>{fmtPct(batteryDrain)}</dd></>
                            )}

                            {networkType && (<><dt><Wifi size={14} /> Network</dt><dd>{networkType}</dd></>)}
                            {networkSpeed && (<><dt>Network speed</dt><dd>{String(networkSpeed)} Mbps</dd></>)}

                            {durationSec && (<><dt>Duration</dt><dd>{fmtSeconds(durationSec)}</dd></>)}

                            {locationAddr && (
                              <><dt><MapPin size={14} /> Location</dt><dd>{locationAddr}</dd></>
                            )}
                            {(lat && lng) && (
                              <><dt>Coordinates</dt><dd>
                                {lat}, {lng}
                                {mapsUrl && (
                                  <>
                                    {' '}
                                    <a className="spec-link" href={mapsUrl} target="_blank" rel="noreferrer">
                                      View map
                                    </a>
                                  </>
                                )}
                              </dd></>
                            )}
                            {accuracy && (<><dt>Accuracy</dt><dd>{String(accuracy)} m</dd></>)}
                          </dl>

                          {!stats && (
                            <div className="spec-muted">
                              (No device_stats JSON found; showing only what’s available.)
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="bug-col">
                      {videoUrl && (
                        <div className="bug-panel">
                          <h4>Screen Recording</h4>
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
                            Download Recording
                          </a>
                        </div>
                      )}

                      {bug.screenshot_url && (
                        <div className="bug-panel">
                          <h4>Screenshots</h4>
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
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {bug.ai_analysis && (
                    <div className="bug-panel ai-section">
                      <h4>AI Analysis</h4>

                      {typeof bug.ai_analysis === 'string' ? (
                        <div className="ai-markdown">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {bug.ai_analysis}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <pre className="ai-text">
                          {JSON.stringify(bug.ai_analysis, null, 2)}
                        </pre>
                      )}
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