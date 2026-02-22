import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, Bug, Trash2, Brain, ChevronDown, ChevronUp, Check,
  Smartphone, Wifi, Battery, MapPin, Clock, Video, List, Code, Share2,
  Target, Pencil, X as XIcon, Users
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

export default function TestDetailPage({ test, onBack, showToast }) {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBug, setExpandedBug] = useState(null);
  const [analyzingBug, setAnalyzingBug] = useState(null);

  // Targeting state
  const [criteria, setCriteria] = useState(null);      // loaded from backend
  const [eligibleCount, setEligibleCount] = useState(null);
  const [editingCriteria, setEditingCriteria] = useState(false);
  const [criteriaForm, setCriteriaForm] = useState({
    device_tier: '', network_type: '', max_ram_gb: '', allowed_states: '', allowed_cities: ''
  });
  const [savingCriteria, setSavingCriteria] = useState(false);

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const loadCriteria = useCallback(async () => {
    try {
      const res = await apiClient.getTestCriteria(test.id);
      const c = res.test?.criteria || null;
      if (mountedRef.current) {
        setCriteria(c);
        // Pre-fill edit form
        setCriteriaForm({
          device_tier: c?.device_tier || '',
          network_type: c?.network_type || '',
          max_ram_gb: c?.max_ram_gb != null ? String(c.max_ram_gb) : '',
          allowed_states: c?.allowed_states || '',
          allowed_cities: c?.allowed_cities || '',
        });
      }
    } catch { /* non-fatal */ }
    try {
      const er = await apiClient.getEligibleTesters(test.id);
      if (mountedRef.current) setEligibleCount(er.count ?? null);
    } catch { /* non-fatal */ }
  }, [test.id]);

  const saveCriteria = async () => {
    setSavingCriteria(true);
    try {
      const payload = {};
      if (criteriaForm.device_tier) payload.device_tier = criteriaForm.device_tier;
      if (criteriaForm.network_type) payload.network_type = criteriaForm.network_type;
      if (criteriaForm.max_ram_gb) payload.max_ram_gb = Number(criteriaForm.max_ram_gb);
      if (criteriaForm.allowed_states.trim()) payload.allowed_states = criteriaForm.allowed_states.trim();
      if (criteriaForm.allowed_cities.trim()) payload.allowed_cities = criteriaForm.allowed_cities.trim();
      await apiClient.setTestCriteria(test.id, payload);
      showToastRef.current('🎯 Targeting criteria saved!');
      setEditingCriteria(false);
      loadCriteria();
    } catch (err) {
      showToastRef.current('Failed to save criteria: ' + err.message, 'error');
    } finally {
      setSavingCriteria(false);
    }
  };

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

  useEffect(() => { loadBugs(); loadCriteria(); }, [loadBugs, loadCriteria]);

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
      showToastRef.current('AI analysis already done for this bug ✅');
      return;
    }
    setAnalyzingBug(bug.id);
    try {
      await apiClient.analyzeWithAI(bug.id);
      showToastRef.current('🤖 AI analysis running… this takes 30-60s');

      // Poll /api/bugs/:id/analysis every 5s for up to 2 min
      let attempts = 0;
      const maxAttempts = 24; // 24 × 5s = 120s
      const pollInterval = setInterval(async () => {
        if (!mountedRef.current) { clearInterval(pollInterval); return; }
        attempts++;
        try {
          const result = await apiClient.getAnalysis(bug.id);
          if (result.success && result.analysis) {
            clearInterval(pollInterval);
            // Patch the bug in-place so the analysis shows immediately
            setBugs(prev => prev.map(b =>
              b.id === bug.id
                ? { ...b, ai_analysis: result.analysis, ai_model: result.model }
                : b
            ));
            showToastRef.current('✅ AI analysis complete!');
            if (mountedRef.current) setAnalyzingBug(null);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            showToastRef.current('⚠️ Analysis timed out — check logs or retry', 'error');
            if (mountedRef.current) setAnalyzingBug(null);
          }
        } catch {
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            showToastRef.current('⚠️ AI analysis failed — retry later', 'error');
            if (mountedRef.current) setAnalyzingBug(null);
          }
        }
      }, 5000);

    } catch (err) {
      showToastRef.current('AI failed: ' + (err.message || 'server error'), 'error');
      if (mountedRef.current) setAnalyzingBug(null);
    }
  };


  return (
    <div className="test-detail-page">
      <div className="td-header">
        <button className="td-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Projects
        </button>
      </div>

      <div className="td-info-hero">
        <div className="td-info-main">
          <div className="td-app-icon">📱</div>
          <div className="td-app-details">
            <h1>{test.app_name}</h1>
            <p className="td-meta">
              <Clock size={14} /> Created {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} <span className="td-meta-dot">•</span> <Bug size={14} /> {bugs.length} Issue{bugs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {test.test_instructions && (
          <div className="td-instructions">
            <h3 className="section-subtitle"><List size={16} /> Testing Instructions</h3>
            <div className="td-instruction-box">
              <pre>{test.test_instructions}</pre>
            </div>
          </div>
        )}

        {/* Targeting Section */}
        <div className="td-targeting">
          <div className="td-targeting-header">
            <h3 className="section-subtitle"><Target size={16} /> Targeting</h3>
            <div className="td-targeting-meta">
              {eligibleCount !== null && (
                <span className="td-eligible-count"><Users size={13} /> {eligibleCount} eligible testers</span>
              )}
              <button
                className="td-criteria-edit-btn"
                onClick={() => setEditingCriteria(e => !e)}
              >
                {editingCriteria ? <><XIcon size={13} /> Cancel</> : <><Pencil size={13} /> Edit</>}
              </button>
            </div>
          </div>

          {!editingCriteria && (
            <div className="td-criteria-chips">
              {!criteria || Object.keys(criteria).length === 0 ? (
                <span className="td-criteria-chip open">🌐 Open to all testers</span>
              ) : (
                <>
                  {criteria.device_tier && <span className="td-criteria-chip">📱 {criteria.device_tier} devices</span>}
                  {criteria.network_type && <span className="td-criteria-chip">📶 {criteria.network_type.toUpperCase()}</span>}
                  {criteria.max_ram_gb != null && <span className="td-criteria-chip">💾 ≤{criteria.max_ram_gb} GB RAM</span>}
                  {criteria.allowed_states && <span className="td-criteria-chip">📍 {criteria.allowed_states}</span>}
                  {criteria.allowed_cities && <span className="td-criteria-chip">🏙️ {criteria.allowed_cities}</span>}
                </>
              )}
            </div>
          )}

          {editingCriteria && (
            <div className="td-criteria-form">
              <div className="td-criteria-row">
                <div className="td-criteria-field">
                  <label>Device Tier</label>
                  <select
                    value={criteriaForm.device_tier}
                    onChange={e => setCriteriaForm(f => ({ ...f, device_tier: e.target.value }))}
                  >
                    <option value="">Any device</option>
                    <option value="low">Low-end</option>
                    <option value="mid">Mid-range</option>
                    <option value="high">Flagship</option>
                  </select>
                </div>
                <div className="td-criteria-field">
                  <label>Network</label>
                  <select
                    value={criteriaForm.network_type}
                    onChange={e => setCriteriaForm(f => ({ ...f, network_type: e.target.value }))}
                  >
                    <option value="">Any network</option>
                    <option value="2g">2G</option>
                    <option value="3g">3G</option>
                    <option value="4g">4G / LTE</option>
                    <option value="5g">5G</option>
                    <option value="wifi">WiFi</option>
                  </select>
                </div>
                <div className="td-criteria-field">
                  <label>Max RAM (GB)</label>
                  <input
                    type="number" min="1" max="16"
                    placeholder="Any"
                    value={criteriaForm.max_ram_gb}
                    onChange={e => setCriteriaForm(f => ({ ...f, max_ram_gb: e.target.value }))}
                  />
                </div>
              </div>
              <div className="td-criteria-row">
                <div className="td-criteria-field" style={{ flex: 2 }}>
                  <label>States (comma-separated)</label>
                  <input
                    type="text" placeholder="e.g. Maharashtra, Bihar"
                    value={criteriaForm.allowed_states}
                    onChange={e => setCriteriaForm(f => ({ ...f, allowed_states: e.target.value }))}
                  />
                </div>
                <div className="td-criteria-field" style={{ flex: 2 }}>
                  <label>Cities (comma-separated)</label>
                  <input
                    type="text" placeholder="e.g. Mumbai, Patna"
                    value={criteriaForm.allowed_cities}
                    onChange={e => setCriteriaForm(f => ({ ...f, allowed_cities: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13 }}
                  disabled={savingCriteria}
                  onClick={saveCriteria}
                >
                  {savingCriteria ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : '💾 Save Criteria'}
                </button>
                <button
                  className="td-criteria-clear-btn"
                  disabled={savingCriteria}
                  onClick={async () => {
                    setSavingCriteria(true);
                    try {
                      await apiClient.setTestCriteria(test.id, {});
                      showToastRef.current('Criteria cleared — open to all testers');
                      setEditingCriteria(false);
                      loadCriteria();
                    } catch (err) {
                      showToastRef.current('Failed: ' + err.message, 'error');
                    } finally { setSavingCriteria(false); }
                  }}
                >
                  Clear (open to all)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="td-section-header">
        <h2 className="td-section-title">
          <Bug size={24} color={API.saffron || '#FF6B2B'} /> Reported Issues <span className="badge-count">{bugs.length}</span>
        </h2>
      </div>

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
          const aiBusy = analyzingBug === bug.id;

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
                    className={`action-btn ai-btn ${aiDone ? 'action-btn--disabled' : ''}`}
                    onClick={(e) => analyzeBug(bug, e)}
                    disabled={aiBusy || aiDone}
                    title={aiDone ? 'AI already done' : 'Analyze with AI'}
                  >
                    {aiBusy ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : (aiDone ? <Check size={16} /> : <Brain size={16} />)}
                  </button>

                  <button className="action-btn delete-action" onClick={(e) => deleteBug(bug.id, e)} title="Delete Issue">
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
