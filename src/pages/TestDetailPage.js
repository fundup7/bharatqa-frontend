import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, Bug, Trash2, Brain, ChevronDown, ChevronUp, Check,
  Smartphone, Wifi, Battery, MapPin, Clock, Video
} from 'lucide-react';
import { apiClient } from '../utils/api';
import { API } from '../utils/constants';
import './TestDetailPage.css';

function getVideoUrl(bug) {
  if (!bug.recording_url) return null;
  if (bug.recording_url.startsWith('http')) return bug.recording_url;
  const base = API.replace(/\/api\/?$/, '');
  return base + bug.recording_url;
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

function normalizeMbps(v) {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v).trim();
  const cleaned = s.replace(/mbps/ig, '').trim();
  return cleaned ? `${cleaned} Mbps` : null;
}

function extractTesterNotes(bug) {
  const raw = (bug.bug_description || bug.description || '').trim();
  if (!raw) return null;

  // if it contains TESTER FEEDBACK section but empty -> return null
  const idx = raw.toLowerCase().indexOf('tester feedback');
  if (idx !== -1) {
    let after = raw.slice(idx);
    after = after.replace(/tester feedback\s*:\s*/i, '');
    after = after.replace(/rating\s*:\s*\d+(\.\d+)?\s*\/\s*\d+/ig, '');
    after = after.replace(/[_═—-]{5,}/g, ' ');
    after = after.replace(/⭐/g, '').trim();
    return after.length ? after : null;
  }

  // hide telemetry-only blobs
  const tokens = ['Device:', 'Android:', 'Screen:', 'Battery:', 'Network:', 'Duration:', 'Coordinates:', 'Accuracy:', 'Address:'];
  const hits = tokens.reduce((a, t) => a + (raw.includes(t) ? 1 : 0), 0);
  if (hits >= 5) return null;

  return raw;
}

function parseScreenshots(bug) {
  const s = bug.screenshots || bug.screenshot_url || '';
  if (!s) return [];
  return String(s).split(',').map(x => x.trim()).filter(Boolean);
}

export default function TestDetailPage({ test, onBack, showToast }) {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBug, setExpandedBug] = useState(null);
  const [analyzingBug, setAnalyzingBug] = useState(null);

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const loadBugs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getBugs(test.id);
      if (mountedRef.current) setBugs(Array.isArray(data) ? data : []);
    } catch (err) {
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
    } catch {
      showToastRef.current('Failed to delete bug', 'error');
    }
  };

  const analyzeBug = async (bug, e) => {
    e.stopPropagation();
    if (bug.ai_analysis) {
      showToastRef.current('AI already done for this bug', 'error');
      return;
    }
    setAnalyzingBug(bug.id);
    try {
      await apiClient.analyzeWithAI(bug.id);
      showToastRef.current('AI analysis started/completed');
      loadBugs();
    } catch (err) {
      showToastRef.current('AI failed: ' + (err.message || 'server'), 'error');
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
              Created {new Date(test.created_at).toLocaleDateString()} · {bugs.length} report{bugs.length !== 1 ? 's' : ''}
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
          <p>Loading…</p>
        </div>
      )}

      {!loading && error && (
        <div className="error-state glass-card">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadBugs}>Retry</button>
        </div>
      )}

      {!loading && !error && bugs.length === 0 && (
        <div className="empty-state glass-card">
          <div className="empty-icon">🗂️</div>
          <h3>No reports</h3>
        </div>
      )}

      <div className="bugs-list">
        {bugs.map((bug) => {
          const isExpanded = expandedBug === bug.id;
          const stats = safeJsonParse(bug.device_stats);
          const videoUrl = getVideoUrl(bug);
          const screenshots = parseScreenshots(bug);
          const testerNotes = extractTesterNotes(bug);

          const deviceModel = pick(stats, ['device_model','deviceModel','model']);
          const androidVersion = pick(stats, ['android_version','androidVersion','osVersion']);
          const screenRes = pick(stats, ['screen_resolution','screenResolution','resolution']);
          const networkType = pick(stats, ['network_type','networkType']);
          const networkSpeed = pick(stats, ['network_speed_mbps','networkSpeedMbps','networkSpeed']);
          const batteryStart = pick(stats, ['battery_start','batteryStart']);
          const batteryEnd = pick(stats, ['battery_end','batteryEnd']);
          const batteryDrain = pick(stats, ['battery_drain','batteryDrain']);
          const durationSec = pick(stats, ['duration_seconds','testDuration','durationSeconds','duration']);
          const locationAddr = pick(stats, ['location_address','fullAddress','locationAddress','address']);
          const lat = pick(stats, ['location_lat','latitude','locationLat','lat']);
          const lng = pick(stats, ['location_lng','longitude','locationLng','lng']);
          const accuracy = pick(stats, ['location_accuracy','locationAccuracy','accuracy']);

          const mapsUrl = (lat && lng) ? `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}` : null;

          const specItems = [
            { label: 'Device', value: deviceModel, icon: Smartphone },
            { label: 'Android', value: androidVersion },
            { label: 'Screen', value: screenRes },
            { label: 'Battery start', value: batteryStart != null ? `${batteryStart}%` : null, icon: Battery },
            { label: 'Battery end', value: batteryEnd != null ? `${batteryEnd}%` : null },
            { label: 'Battery drain', value: batteryDrain != null ? `${batteryDrain}%` : null },
            { label: 'Network', value: networkType, icon: Wifi },
            { label: 'Network speed', value: normalizeMbps(networkSpeed) },
            { label: 'Duration', value: durationSec != null ? `${durationSec}s` : null },
            { label: 'Coordinates', value: (lat && lng) ? `${lat}, ${lng}` : null, full: true },
            { label: 'Accuracy', value: accuracy != null ? `${accuracy} m` : null },
            { label: 'Address', value: locationAddr, full: true, icon: MapPin },
          ].filter(x => x.value);

          const aiDone = Boolean(bug.ai_analysis);
          const aiBusy = analyzingBug === bug.id;

          return (
            <div key={bug.id} className={`bug-card glass-card ${isExpanded ? 'bug-expanded' : ''}`}>
              <div className="bug-header" onClick={() => toggleExpand(bug.id)}>
                <div className="bug-summary">
                  <h3>{bug.bug_title || 'Untitled'}</h3>
                  <div className="bug-meta-row">
                    <span className="bug-tester">👤 {bug.tester_name || 'Anonymous'}</span>
                    <span className="bug-time"><Clock size={12} /> {new Date(bug.created_at).toLocaleString()}</span>
                    {videoUrl && <span className="bug-has-video"><Video size={12} /> Recording</span>}
                    {aiDone && <span className="bug-ai-badge"><Check size={12} /> AI Done</span>}
                  </div>
                </div>

                <div className="bug-actions">
                  <button
                    className={`action-btn ai-btn ${aiDone ? 'action-btn--disabled' : ''}`}
                    onClick={(e) => analyzeBug(bug, e)}
                    disabled={aiBusy || aiDone}
                    title={aiDone ? 'AI already done' : 'Analyze with AI'}
                  >
                    {aiBusy ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : (aiDone ? <Check size={16} /> : <Brain size={16} />)}
                  </button>

                  <button className="action-btn delete-action" onClick={(e) => deleteBug(bug.id, e)} title="Delete">
                    <Trash2 size={16} />
                  </button>

                  <button
                    className="action-btn expand-btn"
                    onClick={(e) => { e.stopPropagation(); toggleExpand(bug.id); }}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="bug-detail">
                  <div className="bug-detail-grid">
                    {/* LEFT */}
                    <div className="bug-col">
                      <div className="bug-panel">
                        <h4>Tester Notes</h4>
                        {testerNotes ? (
                          <p className="bug-description">{testerNotes}</p>
                        ) : (
                          <p className="bug-description bug-description--muted">No tester feedback.</p>
                        )}
                      </div>

                      {bug.steps_to_reproduce && (
                        <div className="bug-panel">
                          <h4>Steps to Reproduce</h4>
                          <pre className="bug-steps">{bug.steps_to_reproduce}</pre>
                        </div>
                      )}

                      {specItems.length > 0 && (
                        <div className="bug-panel">
                          <h4>Session Specs</h4>

                          <div className="specs-grid">
                            {specItems.map((it, idx) => {
                              const Icon = it.icon;
                              return (
                                <div key={idx} className={`spec-card ${it.full ? 'spec-card--full' : ''}`}>
                                  <div className="spec-card-label">
                                    {Icon ? <Icon size={14} /> : null}
                                    <span>{it.label}</span>
                                  </div>
                                  <div className="spec-card-value">
                                    {it.value}
                                    {it.label === 'Coordinates' && mapsUrl && (
                                      <>
                                        {' '}
                                        <a className="spec-link" href={mapsUrl} target="_blank" rel="noreferrer">
                                          View map
                                        </a>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {!stats && <div className="spec-muted">(no device_stats json)</div>}
                        </div>
                      )}
                    </div>

                    {/* RIGHT */}
                    <div className="bug-col">
                      {videoUrl && (
                        <div className="bug-panel">
                          <h4>Screen Recording</h4>
                          <div className="video-container">
                            <video controls preload="metadata" className="bug-video" src={videoUrl} />
                          </div>
                          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                            Download Recording
                          </a>
                        </div>
                      )}

                      {screenshots.length > 0 && (
                        <div className="bug-panel">
                          <h4>Screenshots</h4>
                          <div className="screenshots-grid">
                            {screenshots.map((u, i) => (
                              <img
                                key={i}
                                src={u}
                                alt={`Screenshot ${i + 1}`}
                                className="bug-screenshot"
                                onClick={() => window.open(u, '_blank')}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

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
                        <pre className="ai-text">{JSON.stringify(bug.ai_analysis, null, 2)}</pre>
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