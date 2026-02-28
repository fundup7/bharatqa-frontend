import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, Bug, ChevronDown, ChevronUp, Check,
  Smartphone, Wifi, Battery, MapPin, Clock, Video, List, Code, Share2,
  Target, Brain
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
  } catch { }
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

  const idx = raw.toLowerCase().indexOf('tester feedback');
  if (idx !== -1) {
    let after = raw.slice(idx);
    after = after.replace(/tester feedback\s*:\s*/i, '');
    after = after.replace(/rating\s*:\s*\d+(\.\d+)?\s*\/\s*\d+/ig, '');
    after = after.replace(/[_═—-]{5,}/g, ' ');
    after = after.replace(/⭐/g, '').trim();
    return after.length ? after : null;
  }

  const tokens = ['Device:', 'Android:', 'Screen:', 'Battery:', 'Network:', 'Duration:', 'Coordinates:', 'Accuracy:', 'Address:'];
  const hits = tokens.reduce((a, t) => a + (raw.includes(t) ? 1 : 0), 0);
  if (hits >= 5) return null;

  return raw;
}


function AuthorizedVideo({ url, title }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    let isMounted = true;

    async function loadVideo() {
      const isBackendUrl = url && (url.includes('/api/videos') || url.includes('/recordings/'));
      if (!isBackendUrl) {
        if (isMounted) setBlobUrl(url);
        return;
      }

      try {
        setLoading(true);
        const fetchedBlobUrl = await apiClient.getVideoBlobUrl(url);
        if (isMounted) {
          setBlobUrl(fetchedBlobUrl);
          objectUrl = fetchedBlobUrl; // Save for cleanup
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (url) loadVideo();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (loading) return (
    <div className="bug-video-placeholder" style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #ccc' }}>
      <div className="spinner" style={{ margin: '0 auto 10px auto' }} />
      <span style={{ fontSize: '13px', color: '#666' }}>Securely fetching recording...</span>
    </div>
  );
  if (error) return (
    <div className="bug-video-placeholder error-state" style={{ padding: '40px 20px', textAlign: 'center', background: '#fff0f0', borderRadius: '12px', color: '#d32f2f', border: '1px dashed #ffa6a6' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Failed to load recording:</span><br />
      <span style={{ fontSize: '12px', opacity: 0.8 }}>{error}</span>
    </div>
  );
  if (!blobUrl) return null;

  return (
    <>
      <div className="video-container">
        <video controls preload="metadata" className="bug-video" src={blobUrl} />
      </div>
      <a href={blobUrl} download={title ? `${title}.mp4` : "recording.mp4"} target="_blank" rel="noopener noreferrer" className="download-link">
        <Share2 size={14} /> Download Recording
      </a>
    </>
  );
}

export default function SharedTestDetailPage({ token, showToast, onExit }) {
  const [test, setTest] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBug, setExpandedBug] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const loadSharedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSharedTest(token);
      if (mountedRef.current) {
        setTest(data.test);
        setBugs(Array.isArray(data.bugs) ? data.bugs : []);
      }
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Failed to load shared report');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadSharedData(); }, [loadSharedData]);

  const toggleExpand = (bugId) => {
    setExpandedBug(prev => (prev === bugId ? null : bugId));
  };


  if (loading) {
    return (
      <div className="test-detail-page" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', height: '100vh' }}>
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading Shared Report…</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="test-detail-page" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', height: '100vh' }}>
        <div className="error-state glass-card">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load</h3>
          <p>{error || 'Test not found'}</p>
          <button className="btn-primary" onClick={onExit} style={{ marginTop: '20px' }}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-detail-page">
      <div className="td-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="td-back" onClick={onExit}>
          <ArrowLeft size={18} /> Exit Public View
        </button>
        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👁️ Read-Only Shared Report
        </span>
      </div>

      <div className="td-info-hero">
        <div className="td-info-main">
          <div className="td-app-icon">📱</div>
          <div className="td-app-details">
            <h1>{test.app_name}</h1>
            <p className="td-meta">
              <span className="td-meta-label">By {test.company_name}</span>
              <span className="td-meta-dot">•</span>
              <Clock size={14} /> Created {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              <span className="td-meta-dot">•</span>
              <Bug size={14} /> {bugs.length} Issue{bugs.length !== 1 ? 's' : ''}
              <span className="td-meta-dot">•</span>
              <span className={`td-status-badge ${test.status === 'pending-approval' ? 'pending' : (test.status === 'active' ? 'active' : '')}`}>
                {test.status === 'pending-approval' ? 'Pending Approval' : (test.status ? test.status.toUpperCase() : 'PENDING')}
              </span>
            </p>
          </div>
        </div>

        {test.instructions && (
          <div className="td-instructions">
            <h3 className="section-subtitle"><List size={16} /> Testing Instructions</h3>
            <div className="td-instruction-box">
              <pre>{test.instructions}</pre>
            </div>
          </div>
        )}

        {test.criteria && Object.keys(test.criteria).length > 0 && (
          <div className="td-targeting">
            <h3 className="section-subtitle"><Target size={16} /> Targeting</h3>
            <div className="td-criteria-chips">
              {test.criteria.device_tier && <span className="td-criteria-chip">📱 {test.criteria.device_tier} devices</span>}
              {test.criteria.network_type && <span className="td-criteria-chip">📶 {test.criteria.network_type.toUpperCase()}</span>}
              {test.criteria.max_ram_gb != null && <span className="td-criteria-chip">💾 ≤{test.criteria.max_ram_gb} GB RAM</span>}
              {test.criteria.allowed_states && <span className="td-criteria-chip">📍 {test.criteria.allowed_states}</span>}
              {test.criteria.allowed_cities && <span className="td-criteria-chip">🏙️ {test.criteria.allowed_cities}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="td-section-header">
        <h2 className="td-section-title">
          <Bug size={24} color={API.saffron || '#FF6B2B'} /> Reported Issues <span className="badge-count">{bugs.length}</span>
        </h2>
      </div>

      {bugs.length === 0 && (
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
          const testerNotes = extractTesterNotes(bug);

          const deviceModel = pick(stats, ['device_model', 'deviceModel', 'model']);
          const androidVersion = pick(stats, ['android_version', 'androidVersion', 'osVersion']);
          const screenRes = pick(stats, ['screen_resolution', 'screenResolution', 'resolution']);
          const networkType = pick(stats, ['network_type', 'networkType']);
          const networkSpeed = pick(stats, ['network_speed_mbps', 'networkSpeedMbps', 'networkSpeed']);
          const batteryStart = pick(stats, ['battery_start', 'batteryStart']);
          const batteryEnd = pick(stats, ['battery_end', 'batteryEnd']);
          const batteryDrain = pick(stats, ['battery_drain', 'batteryDrain']);
          const durationSec = pick(stats, ['duration_seconds', 'testDuration', 'durationSeconds', 'duration']);
          const locationAddr = pick(stats, ['location_address', 'fullAddress', 'locationAddress', 'address']);
          const lat = pick(stats, ['location_lat', 'latitude', 'locationLat', 'lat']);
          const lng = pick(stats, ['location_lng', 'longitude', 'locationLng', 'lng']);
          const accuracy = pick(stats, ['location_accuracy', 'locationAccuracy', 'accuracy']);

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

          return (
            <div key={bug.id} className={`bug-card glass-card ${isExpanded ? 'bug-expanded' : ''}`}>
              <div className="bug-header" onClick={() => toggleExpand(bug.id)}>
                <div className="bug-summary">
                  <h3>{bug.bug_title || 'Untitled Issue'}</h3>
                  <div className="bug-meta-row">
                    <span className="bug-tester-badge">👤 {bug.tester_name || 'Anonymous'}</span>
                    <span className="bug-time"><Clock size={12} /> {new Date(bug.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                    {videoUrl && <span className="bug-has-video"><Video size={12} /> Recording Available</span>}
                    {aiDone && <span className="bug-ai-badge"><Check size={12} /> AI Analyzed</span>}
                  </div>
                </div>

                <div className="bug-actions">
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
                        <h4><List size={14} /> Tester Notes</h4>
                        {testerNotes ? (
                          <div className="bug-description-box">
                            <p className="bug-description">{testerNotes}</p>
                          </div>
                        ) : (
                          <p className="bug-description bug-description--muted">No tester feedback provided.</p>
                        )}
                      </div>

                      {bug.steps_to_reproduce && (
                        <div className="bug-panel">
                          <h4><Code size={14} /> Steps to Reproduce</h4>
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
                        <div className="bug-panel highlight-panel">
                          <h4><Video size={14} /> Screen Recording</h4>
                          <AuthorizedVideo url={videoUrl} title={`recording-${bug.id}`} />
                        </div>
                      )}
                    </div>
                  </div>

                  {bug.ai_analysis && (
                    <div className="bug-panel ai-section">
                      <h4><Brain size={16} color="#4F8EF7" /> AI Analysis Insight</h4>
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
