import React, { useState, useEffect } from 'react';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'https://bharatqa-backend.onrender.com/api';
const BACKEND = process.env.REACT_APP_BACKEND_URL || 'https://bharatqa-backend.onrender.com';

function App() {
    const [view, setView] = useState('home');

    return (
        <div className="App">
            <header style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: 'white', padding: '15px', textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '22px', margin: 0 }}>🇮🇳 BharatQA</h1>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                    Crowdsourced Real-Device Testing
                </p>
                <div style={{ marginTop: '10px' }}>
                    {['home', 'company', 'tester', 'admin'].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            style={{
                                ...navBtn,
                                background: view === v ? 'rgba(255,255,255,0.2)' : 'transparent',
                                borderBottom: view === v ? '2px solid white' : '2px solid transparent'
                            }}
                        >
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ padding: '15px', maxWidth: '900px', margin: '0 auto' }}>
                {view === 'home' && <Home />}
                {view === 'company' && <CompanyDashboard />}
                {view === 'tester' && <TesterDashboard />}
                {view === 'admin' && <AdminDashboard />}
            </div>
        </div>
    );
}

// ===== HOME =====
function Home() {
    const [health, setHealth] = useState(null);

    useEffect(() => {
        fetch(API + '/health')
            .then(r => r.json())
            .then(d => setHealth(d))
            .catch(() => setHealth(null));
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Welcome to BharatQA</h2>
            <p style={{ color: '#666' }}>Real device testing from real users across Bharat</p>

            {/* Server status */}
            <div style={{
                ...cardStyle,
                background: health ? '#F0FDF4' : '#FEF2F2',
                borderLeft: `4px solid ${health ? '#10B981' : '#EF4444'}`
            }}>
                <strong>Server: </strong>
                {health ? '🟢 Connected' : '🔴 Not connected — is backend running?'}
            </div>

            <div style={{ ...cardStyle, textAlign: 'left' }}>
                <h3>How It Works</h3>
                <ol style={{ lineHeight: '2' }}>
                    <li><strong>Company</strong> uploads APK + test instructions</li>
                    <li><strong>Tester</strong> opens BharatQA app on Android phone</li>
                    <li>Taps <strong>START</strong> — screen recording + device monitoring begins</li>
                    <li>Tests the app normally (enable "Show Taps" for touch visibility)</li>
                    <li>Taps <strong>STOP</strong> — video + stats upload automatically</li>
                    <li><strong>Company</strong> gets video, device stats, and bug report</li>
                </ol>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                    <h3>📱 For Companies</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>Upload your APK and get real device test reports with video recordings</p>
                </div>
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                    <h3>💰 For Testers</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>Test apps on your phone and earn ₹50 per test session</p>
                </div>
            </div>
        </div>
    );
}

// ===== COMPANY DASHBOARD =====
function CompanyDashboard() {
    const [tests, setTests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadTests(); }, []);

    const loadTests = async () => {
        try {
            setLoading(true);
            const res = await fetch(API + '/tests');
            setTests(await res.json());
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const deleteTest = async (testId, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this test and ALL its bug reports?')) return;
        try {
            await fetch(API + '/tests/' + testId, { method: 'DELETE' });
            loadTests();
        } catch (err) { console.error(err); }
    };

    if (showForm) return <CreateTestForm onClose={() => { setShowForm(false); loadTests(); }} />;
    if (selectedTest) return <BugReports test={selectedTest} onClose={() => setSelectedTest(null)} />;

    return (
        <div>
            <h2>Company Dashboard</h2>
            <button onClick={() => setShowForm(true)} style={{
                ...btnStyle, background: '#10B981', width: '100%', fontSize: '16px', padding: '14px'
            }}>
                + Create New Test
            </button>

            <h3 style={{ marginTop: '20px' }}>
                My Tests {!loading && <span style={{ color: '#666', fontWeight: 'normal' }}>({tests.length})</span>}
            </h3>

            {loading && <p style={{ color: '#666', textAlign: 'center' }}>Loading...</p>}

            {!loading && tests.length === 0 && (
                <div style={{ ...cardStyle, textAlign: 'center', color: '#666' }}>
                    No tests yet. Create one to get started!
                </div>
            )}

            {tests.map(test => (
                <div key={test.id} style={{ ...cardStyle, cursor: 'pointer' }}
                    onClick={() => setSelectedTest(test)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0' }}>{test.app_name}</h4>
                            <p style={{ color: '#666', margin: '0 0 5px 0', fontSize: '14px' }}>
                                by {test.company_name}
                            </p>
                            <p style={{ color: '#999', margin: 0, fontSize: '12px' }}>
                                {test.apk_file ? '📦 APK uploaded' : '⚠️ No APK'}
                                {' • '}
                                {new Date(test.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <button onClick={(e) => deleteTest(test.id, e)} style={{
                                ...btnStyle, background: '#EF4444', padding: '5px 10px', fontSize: '12px'
                            }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ===== CREATE TEST =====
function CreateTestForm({ onClose }) {
    const [form, setForm] = useState({
        company_name: '', app_name: '', instructions: '', apk: null
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('company_name', form.company_name);
            data.append('app_name', form.app_name);
            data.append('instructions', form.instructions);
            if (form.apk) data.append('apk', form.apk);

            const res = await fetch(API + '/tests', { method: 'POST', body: data });
            if (res.ok) {
                alert('✅ Test created!');
                onClose();
            } else {
                const err = await res.json();
                alert('Error: ' + err.error);
            }
        } catch (err) {
            alert('Failed to create test. Is backend running?');
        }
        setSubmitting(false);
    };

    return (
        <div>
            <h3>Create New Test</h3>
            <form onSubmit={handleSubmit}>
                <div style={formGroup}>
                    <label>Company Name *</label>
                    <input type="text" value={form.company_name}
                        onChange={e => setForm({ ...form, company_name: e.target.value })}
                        required style={inputStyle} placeholder="e.g. Acme Corp" />
                </div>
                <div style={formGroup}>
                    <label>App Name *</label>
                    <input type="text" value={form.app_name}
                        onChange={e => setForm({ ...form, app_name: e.target.value })}
                        required style={inputStyle} placeholder="e.g. MyApp v2.1" />
                </div>
                <div style={formGroup}>
                    <label>Test Instructions *</label>
                    <textarea value={form.instructions}
                        onChange={e => setForm({ ...form, instructions: e.target.value })}
                        required style={{ ...inputStyle, minHeight: '120px' }}
                        placeholder={"What should the tester do?\n\n1. Open the app\n2. Try to login with test@test.com\n3. Navigate to settings\n4. Try changing profile picture"} />
                </div>
                <div style={formGroup}>
                    <label>Upload APK (optional)</label>
                    <input type="file" accept=".apk"
                        onChange={e => setForm({ ...form, apk: e.target.files[0] })}
                        style={inputStyle} />
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                        Max 500MB. Testers will download this to test.
                    </p>
                </div>
                <button type="submit" disabled={submitting} style={{
                    ...btnStyle, background: submitting ? '#9CA3AF' : '#10B981', width: '100%'
                }}>
                    {submitting ? 'Creating...' : 'Create Test'}
                </button>
                <button type="button" onClick={onClose} style={{
                    ...btnStyle, background: '#6B7280', width: '100%', marginTop: '10px'
                }}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

// ===== BUG REPORTS =====
function BugReports({ test, onClose }) {
    const [bugs, setBugs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBugs();
        loadStats();
    }, []);

    const loadBugs = async () => {
        try {
            const res = await fetch(API + '/tests/' + test.id + '/bugs');
            setBugs(await res.json());
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const loadStats = async () => {
        try {
            const res = await fetch(API + '/tests/' + test.id + '/stats');
            setStats(await res.json());
        } catch (err) { console.error(err); }
    };

    const deleteBug = async (bugId) => {
        if (!window.confirm('Delete this bug report?')) return;
        try {
            await fetch(API + '/bugs/' + bugId, { method: 'DELETE' });
            loadBugs();
            loadStats();
        } catch (err) { console.error(err); }
    };

    const exportReport = () => {
        let report = '═══════════════════════════════════\n';
        report += '  BharatQA Test Report\n';
        report += '═══════════════════════════════════\n';
        report += 'App: ' + test.app_name + '\n';
        report += 'Company: ' + test.company_name + '\n';
        report += 'Date: ' + new Date().toLocaleString() + '\n';
        report += 'Total Reports: ' + bugs.length + '\n';
        report += '═══════════════════════════════════\n\n';

        bugs.forEach((bug, i) => {
            report += '--- Report #' + (i + 1) + ' ---\n';
            report += 'Title: ' + bug.bug_title + '\n';
            report += 'Severity: ' + (bug.severity || 'N/A').toUpperCase() + '\n';
            report += 'Tester: ' + bug.tester_name + '\n';
            report += 'Device: ' + (bug.device_info || 'N/A') + '\n';
            report += 'Duration: ' + (bug.test_duration || 0) + 's\n';
            report += 'Date: ' + new Date(bug.created_at).toLocaleString() + '\n';
            report += '\nDescription:\n' + (bug.bug_description || 'N/A') + '\n';

            if (bug.device_stats) {
                try {
                    const ds = JSON.parse(bug.device_stats);
                    report += '\nDevice Stats:\n';
                    report += '  Battery: ' + ds.batteryStart + '% → ' + ds.batteryEnd + '% (' + ds.batteryDrain + '% drain)\n';
                    report += '  Network: ' + ds.networkType + ' (' + ds.networkSpeed + ')\n';
                    report += '  Device: ' + ds.deviceModel + '\n';
                    report += '  Android: ' + ds.androidVersion + '\n';
                    report += '  Location: ' + ds.city + ', ' + ds.state + '\n';
                    report += '  Address: ' + ds.fullAddress + '\n';
                    report += '  Coordinates: ' + ds.latitude + ', ' + ds.longitude + '\n';
                    if (ds.crashDetected) report += '  ⚠️ CRASH: ' + ds.crashInfo + '\n';
                } catch (e) { }
            }

            if (bug.recording_url) {
                report += '\nVideo: ' + BACKEND + '/uploads/' + bug.recording_url + '\n';
            }
            report += '\n' + '─'.repeat(40) + '\n\n';
        });

        const blob = new Blob([report], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = test.app_name.replace(/\s+/g, '_') + '-report.txt';
        a.click();
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={onClose} style={btnStyle}>← Back</button>
                <button onClick={exportReport} style={{ ...btnStyle, background: '#10B981' }}>
                    📄 Export Report
                </button>
<button onClick={() => { loadBugs(); loadStats(); }} style={{
    ...btnStyle, background: '#7C3AED'
}}>
    🔄 Refresh
</button>
                {test.apk_file && (
                    <a href={BACKEND + '/api/tests/' + test.id + '/download-apk'}
                        style={{ ...btnStyle, background: '#F59E0B', textDecoration: 'none', display: 'inline-block' }}>
                        📦 Download APK
                    </a>
                )}
            </div>

            <h3 style={{ marginTop: '15px' }}>{test.app_name}</h3>
            <p style={{ color: '#666', marginTop: '-5px' }}>by {test.company_name}</p>

            {stats && (
                <div style={{
                    ...cardStyle,
                    background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '10px', textAlign: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4F46E5' }}>{stats.total_bugs}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Total Bugs</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7C3AED' }}>{stats.total_testers}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Testers</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>{stats.critical_bugs}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Critical</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>{stats.high_bugs}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>High</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>{Math.round(stats.avg_duration || 0)}s</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Avg Duration</div>
                    </div>
                </div>
            )}

            <h4 style={{ marginTop: '15px' }}>
                Bug Reports {!loading && <span style={{ color: '#666', fontWeight: 'normal' }}>({bugs.length})</span>}
            </h4>

            {loading && <p style={{ color: '#666' }}>Loading reports...</p>}

            {!loading && bugs.length === 0 && (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                    No reports yet. Waiting for testers...
                </p>
            )}

            {bugs.map(bug => {
                let deviceStats = null;
                try { deviceStats = bug.device_stats ? JSON.parse(bug.device_stats) : null; } catch (e) { }

                const severityColors = {
                    critical: '#EF4444', high: '#F59E0B', medium: '#3B82F6', low: '#10B981'
                };
                const borderColor = severityColors[bug.severity] || '#10B981';

                return (
                    <div key={bug.id} style={{ ...cardStyle, borderLeft: '4px solid ' + borderColor }}>

                        {/* Title + Severity + Delete */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <h4 style={{ margin: 0, flex: 1 }}>{bug.bug_title}</h4>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{
                                    background: borderColor, color: 'white',
                                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                                    fontWeight: 'bold', textTransform: 'uppercase'
                                }}>{bug.severity}</span>
                                <button onClick={() => deleteBug(bug.id)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: '16px', padding: '0 4px'
                                }}>🗑️</button>
                            </div>
                        </div>

                        {/* Description */}
                        <pre style={{
                            margin: '10px 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit',
                            fontSize: '14px', lineHeight: '1.5', color: '#374151'
                        }}>{bug.bug_description}</pre>

                        {/* Meta info */}
                        <div style={{ color: '#666', fontSize: '13px' }}>
                            <span>👤 {bug.tester_name}</span>
                            <span style={{ margin: '0 10px' }}>•</span>
                            <span>📱 {bug.device_info}</span>
                            <span style={{ margin: '0 10px' }}>•</span>
                            <span>⏱️ {bug.test_duration || 0}s</span>
                            <span style={{ margin: '0 10px' }}>•</span>
                            <span>{new Date(bug.created_at).toLocaleString()}</span>
                        </div>

                        {/* Device Stats — ONE block with everything */}
                        {deviceStats && (
                            <div style={{
                                background: '#F8FAFC', padding: '12px', borderRadius: '8px',
                                marginTop: '10px', fontSize: '13px'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>

                                    {/* Battery */}
                                    <div>🔋 Battery: {deviceStats.batteryStart}% → {deviceStats.batteryEnd}%
                                        <span style={{
                                            color: deviceStats.batteryDrain > 5 ? '#EF4444' : '#10B981',
                                            fontWeight: 'bold'
                                        }}> ({deviceStats.batteryDrain}% drain)</span>
                                    </div>

                                    {/* Network */}
                                    <div>📶 {deviceStats.networkType} ({deviceStats.networkSpeed})</div>

                                    {/* Device */}
                                    <div>📱 {deviceStats.deviceModel}</div>

                                    {/* Android */}
                                    <div>🤖 {deviceStats.androidVersion}</div>

                                    {/* Location */}
                                    <div style={{
                                        gridColumn: '1 / -1', marginTop: '4px', paddingTop: '4px',
                                        borderTop: '1px solid #E5E7EB'
                                    }}>
                                        📍 <strong>{deviceStats.city}, {deviceStats.state}</strong>
                                        <span style={{ color: '#666', marginLeft: '8px' }}>
                                            ({deviceStats.locationAccuracy?.toFixed(0)}m accuracy, {deviceStats.locationSource})
                                        </span>
                                    </div>

                                    {/* Full Address */}
                                    {deviceStats.fullAddress && deviceStats.fullAddress !== 'Unknown' && (
                                        <div style={{ gridColumn: '1 / -1', color: '#666' }}>
                                            🏠 {deviceStats.fullAddress}
                                        </div>
                                    )}

                                    {/* Google Maps Link */}
                                    {deviceStats.latitude !== 0 && (
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <a
                                                href={`https://www.google.com/maps?q=${deviceStats.latitude},${deviceStats.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#4F46E5', fontSize: '12px' }}
                                            >
                                                🗺️ View on Google Maps
                                            </a>
                                        </div>
                                    )}

                                    {/* Crash Info */}
                                    {deviceStats.crashDetected && (
                                        <div style={{ gridColumn: '1 / -1', color: '#EF4444', fontWeight: 'bold' }}>
                                            ⚠️ CRASH: {deviceStats.crashInfo}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
{/* AI Analysis */}
{bug.ai_analysis && (
    <div style={{
        background: 'linear-gradient(135deg, #EEF2FF, #F0FDF4)',
        padding: '16px', borderRadius: '8px',
        marginTop: '10px', fontSize: '13px',
        border: '1px solid #C7D2FE'
    }}>
        <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '10px'
        }}>
            <strong style={{ color: '#4F46E5', fontSize: '14px' }}>
                🤖 AI Analysis
            </strong>
            <span style={{
                background: '#4F46E5', color: 'white',
                padding: '2px 8px', borderRadius: '10px',
                fontSize: '10px'
            }}>
                Gemini Flash
            </span>
        </div>
        <pre style={{
            whiteSpace: 'pre-wrap', fontFamily: 'inherit',
            margin: 0, lineHeight: '1.6', color: '#374151'
        }}>
            {bug.ai_analysis}
        </pre>
    </div>
)}

{!bug.ai_analysis && bug.recording_url && (
    <button
        onClick={async () => {
            try {
                const r = await fetch(API + '/bugs/' + bug.id + '/analyze', { method: 'POST' });
                const data = await r.json();
                if (data.cached) {
                    loadBugs();
                } else {
                    alert('🤖 Analysis started! Click Refresh in 30-60 seconds.');
                }
            } catch (err) {
                alert('Failed to start analysis');
            }
        }}
        style={{
            ...btnStyle, background: '#7C3AED',
            width: '100%', marginTop: '10px'
        }}
    >
        🤖 Analyze with AI
    </button>
)}

                        {/* Screenshots */}
                        {bug.screenshots && (
                            <div style={{ marginTop: '10px' }}>
                                <strong style={{ fontSize: '13px' }}>Screenshots:</strong>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '5px', overflowX: 'auto' }}>
                                    {bug.screenshots.split(',').map((s, i) => (
                                        <img key={i} src={BACKEND + '/uploads/' + s.trim()}
                                            alt={`Screenshot ${i + 1}`}
                                            style={{ height: '150px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Screen Recording */}
                        {bug.recording_url && (
                            <div style={{ marginTop: '10px' }}>
                                <strong style={{ fontSize: '13px' }}>Screen Recording:</strong>
                                <video
                                    src={BACKEND + '/uploads/' + bug.recording_url}
                                    controls
                                    style={{
                                        width: '100%', maxWidth: '500px', borderRadius: '8px',
                                        marginTop: '5px', border: '1px solid #E5E7EB'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
// ===== TESTER DASHBOARD (Web) =====
function TesterDashboard() {
    const [testerName, setTesterName] = useState('');
    const [earnings, setEarnings] = useState(null);
    const [searched, setSearched] = useState(false);

    const lookupEarnings = async () => {
        if (!testerName.trim()) return;
        try {
            const res = await fetch(API + '/earnings/' + encodeURIComponent(testerName.trim()));
            setEarnings(await res.json());
            setSearched(true);
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <h2>Tester Dashboard</h2>

            <div style={cardStyle}>
                <h3>📱 How to Test</h3>
                <ol style={{ lineHeight: '2', color: '#374151' }}>
                    <li>Install the <strong>BharatQA Android app</strong> on your phone</li>
                    <li>Make sure phone and laptop are on <strong>same WiFi</strong></li>
                    <li>Open app → Enter your name → Pick a test</li>
                    <li>Tap <strong>START</strong> — recording begins automatically</li>
                    <li>Test the app normally</li>
                    <li>Tap <strong>STOP</strong> — report uploads automatically</li>
                    <li>Earn <strong>₹50</strong> per test! 💰</li>
                </ol>
            </div>

            <div style={{ ...cardStyle, marginTop: '15px' }}>
                <h3>💰 Check Your Earnings</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Enter your tester name"
                        value={testerName}
                        onChange={e => setTesterName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && lookupEarnings()}
                        style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={lookupEarnings} style={btnStyle}>Check</button>
                </div>

                {searched && earnings && (
                    <div style={{ marginTop: '15px' }}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '10px', textAlign: 'center', marginBottom: '15px'
                        }}>
                            <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
                                    ₹{earnings.total_earned}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Total Earned</div>
                            </div>
                            <div style={{ background: '#FEF3C7', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>
                                    ₹{earnings.pending_amount}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Pending</div>
                            </div>
                            <div style={{ background: '#EEF2FF', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4F46E5' }}>
                                    {earnings.tests_completed}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Tests Done</div>
                            </div>
                        </div>

                        {earnings.earnings.length === 0 && (
                            <p style={{ color: '#666', textAlign: 'center' }}>
                                No earnings found for "{testerName}". Start testing!
                            </p>
                        )}

                        {earnings.earnings.map((e, i) => (
                            <div key={i} style={{
                                ...cardStyle, display: 'flex',
                                justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <strong>{e.app_name || 'Test #' + e.test_id}</strong>
                                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                                        {e.company_name || ''} • {new Date(e.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: '#10B981' }}>₹{e.amount}</div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: e.status === 'paid' ? '#10B981' : '#F59E0B'
                                    }}>
                                        {e.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== ADMIN DASHBOARD =====
function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentBugs, setRecentBugs] = useState([]);

    useEffect(() => {
        fetch(API + '/admin/stats').then(r => r.json()).then(setStats).catch(console.error);
        fetch(API + '/admin/all-bugs').then(r => r.json())
            .then(bugs => setRecentBugs(bugs.slice(0, 10)))
            .catch(console.error);
    }, []);

    return (
        <div>
            <h2>Admin Dashboard</h2>

            {stats && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px'
                }}>
                    {[
                        { label: 'Total Tests', value: stats.total_tests, color: '#4F46E5', icon: '📋' },
                        { label: 'Total Bugs', value: stats.total_bugs, color: '#7C3AED', icon: '🐛' },
                        { label: 'Testers', value: stats.total_testers, color: '#10B981', icon: '👥' },
                        { label: 'Earnings Paid', value: '₹' + stats.total_earnings, color: '#F59E0B', icon: '💰' },
                        { label: 'Critical Bugs', value: stats.critical_bugs, color: '#EF4444', icon: '🚨' }
                    ].map((item, i) => (
                        <div key={i} style={{
                            ...cardStyle, textAlign: 'center',
                            borderTop: '3px solid ' + item.color
                        }}>
                            <div style={{ fontSize: '28px' }}>{item.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: item.color }}>
                                {item.value}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <h3 style={{ marginTop: '20px' }}>Recent Bug Reports</h3>
            {recentBugs.map(bug => {
                const severityColors = {
                    critical: '#EF4444', high: '#F59E0B', medium: '#3B82F6', low: '#10B981'
                };
                return (
                    <div key={bug.id} style={{
                        ...cardStyle, borderLeft: '4px solid ' + (severityColors[bug.severity] || '#10B981')
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                            <div>
                                <strong>{bug.bug_title}</strong>
                                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '13px' }}>
                                    {bug.app_name} • {bug.tester_name} • {new Date(bug.created_at).toLocaleString()}
                                </p>
                            </div>
                            <span style={{
                                background: severityColors[bug.severity] || '#10B981',
                                color: 'white', padding: '3px 10px', borderRadius: '12px',
                                fontSize: '11px', fontWeight: 'bold', height: 'fit-content',
                                textTransform: 'uppercase'
                            }}>
                                {bug.severity}
                            </span>
                        </div>
                    </div>
                );
            })}

            {recentBugs.length === 0 && (
                <p style={{ color: '#666', textAlign: 'center' }}>No bug reports yet.</p>
            )}
        </div>
    );
}

// ===== STYLES =====
const navBtn = {
    color: 'white', border: 'none', padding: '8px 16px', margin: '0 4px',
    borderRadius: '5px 5px 0 0', cursor: 'pointer', fontSize: '14px',
    background: 'transparent', transition: 'background 0.2s'
};
const btnStyle = {
    background: '#4F46E5', color: 'white', border: 'none', padding: '10px 20px',
    margin: '5px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
    fontWeight: '500'
};
const cardStyle = {
    background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px',
    padding: '15px', marginTop: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
};
const formGroup = { marginBottom: '15px', textAlign: 'left' };
const inputStyle = {
    width: '100%', padding: '10px 12px', marginTop: '5px',
    border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '15px',
    boxSizing: 'border-box', outline: 'none'
};

export default App;