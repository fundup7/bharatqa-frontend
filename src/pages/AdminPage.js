import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, ShieldOff, Shield, Users, Smartphone, Wifi, MemoryStick, MapPin, RefreshCw, Wallet, IndianRupee, CheckCircle, Clock, ClipboardList, Check, X, Trash, UserPlus, Eye, EyeOff, Bug, Pencil, ChevronDown, ChevronUp, ExternalLink, List } from 'lucide-react';
import { apiClient } from '../utils/api';
import './AdminPage.css';

function DeviceTierBadge({ tier }) {
    if (!tier) return null;
    const map = {
        low: { label: 'Low-end', color: '#ff9f43' },
        mid: { label: 'Mid-range', color: '#54a0ff' },
        high: { label: 'Flagship', color: '#5f27cd' },
    };
    const t = map[tier] || { label: tier, color: '#888' };
    return (
        <span className="admin-tier-badge" style={{ background: t.color + '22', color: t.color, border: `1px solid ${t.color}44` }}>
            {t.label}
        </span>
    );
}

function BlobVideoPlayer({ src }) {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let url = src;
        if (!url.startsWith('http')) {
            url = `https://bharatqa-backend.onrender.com${url}`;
        }

        let current = true;
        setLoading(true);
        setError(null);

        apiClient.getVideoBlobUrl(url)
            .then(blobUrl => {
                if (current) {
                    setBlobUrl(blobUrl);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (current) {
                    console.error('Video error:', err);
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => {
            current = false;
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [src]);

    if (loading) return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#666' }}>
            <div className="spinner" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '0.8rem' }}>Streaming recording...</div>
        </div>
    );

    if (error) return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#ff4d4d', padding: '20px', textAlign: 'center' }}>
            <ShieldAlert size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div style={{ fontSize: '0.85rem' }}>Failed to load recording</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>{error}</div>
        </div>
    );

    return (
        <video
            src={blobUrl}
            controls
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            autoPlay={false}
        />
    );
}

export default function AdminPage({ company, showToast }) {
    const [mainTab, setMainTab] = useState('tests'); // 'tests' | 'bugs' | 'testers' | 'payments'

    // ── Tests state ──
    const [allTests, setAllTests] = useState([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [expandedTest, setExpandedTest] = useState(null);

    // Assign testers modal state
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignTestContext, setAssignTestContext] = useState(null);
    const [assignTargetTesters, setAssignTargetTesters] = useState([]);
    const [assigningLoading, setAssigningLoading] = useState(false);

    // ── Testers state ──
    const [testers, setTesters] = useState([]);
    const [loadingTesters, setLoadingTesters] = useState(true);
    const [banningId, setBanningId] = useState(null);
    const [filter, setFilter] = useState('all');

    // ── Payments state ──
    const [pending, setPending] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [paying, setPaying] = useState(false);
    const [selected, setSelected] = useState(new Set()); // tester ids selected for payment

    // ── Bug Approval state ──
    const [pendingBugs, setPendingBugs] = useState([]);
    const [loadingBugs, setLoadingBugs] = useState(false);
    const [approvingBugId, setApprovingBugId] = useState(null);
    const [expandedBugId, setExpandedBugId] = useState(null);

    // Budget editing state
    const [editingBudget, setEditingBudget] = useState(null); // { id, total_budget, price_paid, tester_quota, testing_iterations }
    const [savingBudget, setSavingBudget] = useState(false);

    const loadTesters = useCallback(async () => {
        try {
            setLoadingTesters(true);
            const data = await apiClient.getAllTesters();
            setTesters(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast('Failed to load testers: ' + err.message, 'error');
        } finally {
            setLoadingTesters(false);
        }
    }, [showToast]);

    const loadPending = useCallback(async () => {
        try {
            setLoadingPending(true);
            const data = await apiClient.getPendingPayments();
            setPending(data.testers || []);
        } catch (err) {
            showToast('Failed to load pending payments: ' + err.message, 'error');
        } finally {
            setLoadingPending(false);
        }
    }, [showToast]);

    const loadAdminTests = useCallback(async () => {
        try {
            setLoadingTests(true);
            const data = await apiClient.getAdminTests();
            setAllTests(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast('Failed to load tests: ' + err.message, 'error');
        } finally {
            setLoadingTests(false);
        }
    }, [showToast]);

    const loadPendingBugs = useCallback(async () => {
        try {
            setLoadingBugs(true);
            const data = await apiClient.adminGetPendingBugs();
            setPendingBugs(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast('Failed to load pending bugs: ' + err.message, 'error');
        } finally {
            setLoadingBugs(false);
        }
    }, [showToast]);

    useEffect(() => { loadTesters(); }, [loadTesters]);
    useEffect(() => { if (mainTab === 'payments') loadPending(); }, [mainTab, loadPending]);
    useEffect(() => { if (mainTab === 'tests') loadAdminTests(); }, [mainTab, loadAdminTests]);
    useEffect(() => { if (mainTab === 'bugs') loadPendingBugs(); }, [mainTab, loadPendingBugs]);

    const handleBan = async (tester) => {
        const reason = window.prompt(`Ban reason for ${tester.full_name}:`, 'Violation of terms of service');
        if (reason === null) return;
        setBanningId(tester.id);
        try {
            await apiClient.banTester(tester.id, reason);
            showToast(`🚫 ${tester.full_name} has been banned`);
            loadTesters();
        } catch (err) {
            showToast('Failed to ban tester: ' + err.message, 'error');
        } finally {
            setBanningId(null);
        }
    };

    const handleUnban = async (tester) => {
        if (!window.confirm(`Unban ${tester.full_name}?`)) return;
        setBanningId(tester.id);
        try {
            await apiClient.unbanTester(tester.id);
            showToast(`✅ ${tester.full_name} has been unbanned`);
            loadTesters();
        } catch (err) {
            showToast('Failed to unban tester: ' + err.message, 'error');
        } finally {
            setBanningId(null);
        }
    };

    const handleBatchPay = async (ids = []) => {
        const total = ids.length === 0
            ? pending.reduce((s, t) => s + parseFloat(t.pending || 0), 0)
            : pending.filter(t => ids.includes(t.id)).reduce((s, t) => s + parseFloat(t.pending || 0), 0);
        const label = ids.length === 0 ? `all ${pending.length} testers` : `${ids.length} selected tester(s)`;
        if (!window.confirm(`Pay ₹${total.toFixed(2)} to ${label}? This cannot be undone.`)) return;
        setPaying(true);
        try {
            const result = await apiClient.batchPay(ids);
            showToast(`✅ ${result.message}`);
            setSelected(new Set());
            loadPending();
        } catch (err) {
            showToast('Payment failed: ' + err.message, 'error');
        } finally {
            setPaying(false);
        }
    };

    const toggleSelect = (id) => {
        setSelected(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const toggleAll = () => {
        setSelected(prev => prev.size === pending.length ? new Set() : new Set(pending.map(t => t.id)));
    };

    const filtered = testers.filter(t => {
        if (filter === 'banned') return t.is_banned;
        if (filter === 'active') return !t.is_banned;
        return true;
    });

    const bannedCount = testers.filter(t => t.is_banned).length;
    const totalPending = pending.reduce((s, t) => s + parseFloat(t.pending || 0), 0);

    return (
        <div className="admin-page">
            <div className="admin-hero glass-card">
                <div className="admin-hero-left">
                    <div className="admin-hero-icon">
                        <ShieldAlert size={28} color="var(--saffron)" />
                    </div>
                    <div>
                        <h1>Administration</h1>
                        <p className="admin-hero-sub">Manage testers, access control, and payments.</p>
                    </div>
                </div>
                <button className="admin-refresh-btn" onClick={() => {
                    if (mainTab === 'testers') loadTesters();
                    else if (mainTab === 'payments') loadPending();
                    else if (mainTab === 'bugs') loadPendingBugs();
                    else loadAdminTests();
                }} title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Main tabs */}
            <div className="admin-main-tabs">
                <button className={`admin-main-tab ${mainTab === 'tests' ? 'active' : ''}`} onClick={() => setMainTab('tests')}>
                    <ClipboardList size={15} /> All Tests
                </button>
                <button className={`admin-main-tab ${mainTab === 'bugs' ? 'active' : ''}`} onClick={() => setMainTab('bugs')}>
                    <Bug size={15} /> Bug Approval
                    {pendingBugs.length > 0 && <span className="admin-filter-count">{pendingBugs.length}</span>}
                </button>
                <button className={`admin-main-tab ${mainTab === 'testers' ? 'active' : ''}`} onClick={() => setMainTab('testers')}>
                    <Users size={15} /> Testers
                </button>
                <button className={`admin-main-tab ${mainTab === 'payments' ? 'active' : ''}`} onClick={() => setMainTab('payments')}>
                    <Wallet size={15} /> Payments
                    {totalPending > 0 && mainTab === 'payments' && (
                        <span className="admin-filter-count">₹{totalPending.toFixed(0)}</span>
                    )}
                </button>
            </div>

            {/* ════ TESTERS TAB ════ */}
            {mainTab === 'testers' && (
                <>
                    <div className="admin-stats-row">
                        {[
                            { label: 'Total Testers', value: testers.length, icon: Users, color: '#54a0ff' },
                            { label: 'Active', value: testers.length - bannedCount, icon: Shield, color: '#5f27cd' },
                            { label: 'Banned', value: bannedCount, icon: ShieldOff, color: '#ff6b6b' },
                        ].map((s, i) => (
                            <div key={i} className="admin-stat-card">
                                <s.icon size={22} style={{ color: s.color }} />
                                <div>
                                    <div className="admin-stat-val">{s.value}</div>
                                    <div className="admin-stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="admin-filter-tabs">
                        {['all', 'active', 'banned'].map(f => (
                            <button key={f} className={`admin-filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                {f === 'banned' && bannedCount > 0 && <span className="admin-filter-count">{bannedCount}</span>}
                            </button>
                        ))}
                    </div>

                    {loadingTesters && <div className="loading-state"><div className="spinner" /><p>Loading testers…</p></div>}
                    {!loadingTesters && filtered.length === 0 && (
                        <div className="empty-state glass-card">
                            <div className="empty-icon">👥</div>
                            <h3>No testers found</h3>
                            <p>{filter === 'banned' ? 'No banned testers.' : 'No testers registered yet.'}</p>
                        </div>
                    )}
                    {!loadingTesters && filtered.length > 0 && (
                        <div className="admin-table-wrap glass-card">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Tester</th>
                                        <th><Smartphone size={13} /> Device</th>
                                        <th><Wifi size={13} /> Network</th>
                                        <th><MemoryStick size={13} /> RAM</th>
                                        <th><MapPin size={13} /> Location</th>
                                        <th>Tests</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(tester => (
                                        <tr key={tester.id} className={tester.is_banned ? 'admin-row-banned' : ''}>
                                            <td>
                                                <div className="admin-tester-name">{tester.full_name || '—'}</div>
                                                <div className="admin-tester-email">{tester.email || tester.phone || '—'}</div>
                                                {tester.is_banned && tester.ban_reason && (
                                                    <div className="admin-ban-reason">🚫 {tester.ban_reason}</div>
                                                )}
                                            </td>
                                            <td>
                                                <div>{tester.device_model || '—'}</div>
                                                <DeviceTierBadge tier={tester.device_tier} />
                                            </td>
                                            <td>{tester.network_type ? tester.network_type.toUpperCase() : '—'}</td>
                                            <td>{tester.ram_gb ? `${tester.ram_gb} GB` : '—'}</td>
                                            <td>
                                                <div>{tester.city || '—'}</div>
                                                <div className="admin-tester-email">{tester.state || ''}</div>
                                            </td>
                                            <td>{tester.total_tests || 0}</td>
                                            <td>
                                                {tester.is_banned
                                                    ? <span className="admin-status-badge banned">Banned</span>
                                                    : <span className="admin-status-badge active">Active</span>
                                                }
                                            </td>
                                            <td>
                                                {tester.is_banned ? (
                                                    <button className="admin-action-btn unban" disabled={banningId === tester.id} onClick={() => handleUnban(tester)}>
                                                        {banningId === tester.id ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><Shield size={14} /> Unban</>}
                                                    </button>
                                                ) : (
                                                    <button className="admin-action-btn ban" disabled={banningId === tester.id} onClick={() => handleBan(tester)}>
                                                        {banningId === tester.id ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><ShieldOff size={14} /> Ban</>}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* ════ PAYMENTS TAB ════ */}
            {mainTab === 'payments' && (
                <>
                    <div className="admin-stats-row">
                        {[
                            { label: 'Awaiting Payment', value: pending.length, icon: Clock, color: '#ff9f43' },
                            { label: 'Total Pending (₹)', value: `₹${totalPending.toFixed(2)}`, icon: IndianRupee, color: '#5f27cd' },
                            { label: 'Next Payout', value: 'Sunday 12 PM', icon: CheckCircle, color: '#34c759' },
                        ].map((s, i) => (
                            <div key={i} className="admin-stat-card">
                                <s.icon size={22} style={{ color: s.color }} />
                                <div>
                                    <div className="admin-stat-val">{s.value}</div>
                                    <div className="admin-stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="admin-payments-toolbar">
                        <span className="admin-payments-info">
                            {selected.size > 0 ? `${selected.size} selected` : 'Select testers to pay individually, or pay all at once'}
                        </span>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {selected.size > 0 && (
                                <button className="admin-pay-btn partial" disabled={paying} onClick={() => handleBatchPay([...selected])}>
                                    {paying ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : `💸 Pay Selected (${selected.size})`}
                                </button>
                            )}
                            <button className="admin-pay-btn" disabled={paying || pending.length === 0} onClick={() => handleBatchPay([])}>
                                {paying ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : `✅ Pay All (${pending.length})`}
                            </button>
                        </div>
                    </div>

                    {loadingPending && <div className="loading-state"><div className="spinner" /><p>Loading pending payments…</p></div>}
                    {!loadingPending && pending.length === 0 && (
                        <div className="empty-state glass-card">
                            <div className="empty-icon">🎉</div>
                            <h3>All caught up!</h3>
                            <p>No pending payments. Everyone has been paid.</p>
                        </div>
                    )}
                    {!loadingPending && pending.length > 0 && (
                        <div className="admin-table-wrap glass-card">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th><input type="checkbox" checked={selected.size === pending.length} onChange={toggleAll} /></th>
                                        <th>Tester</th>
                                        <th>UPI ID</th>
                                        <th>Tests Done</th>
                                        <th>Total Earned</th>
                                        <th>Already Paid</th>
                                        <th>Pending</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pending.map(t => (
                                        <tr key={t.id} className={selected.has(t.id) ? 'admin-row-selected' : ''}>
                                            <td><input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} /></td>
                                            <td>
                                                <div className="admin-tester-name">{t.full_name}</div>
                                                <div className="admin-tester-email">{t.phone}</div>
                                            </td>
                                            <td>
                                                {t.upi_id
                                                    ? <span className="admin-upi-chip">{t.upi_id}</span>
                                                    : <span className="admin-upi-missing">⚠️ No UPI</span>
                                                }
                                            </td>
                                            <td>{t.total_tests}</td>
                                            <td>₹{parseFloat(t.total_earnings).toFixed(2)}</td>
                                            <td>₹{parseFloat(t.total_paid).toFixed(2)}</td>
                                            <td><span className="admin-pending-amount">₹{parseFloat(t.pending).toFixed(2)}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* ════ TESTS TAB ════ */}
            {mainTab === 'tests' && (
                <>
                    {loadingTests && <div className="loading-state"><div className="spinner" /><p>Loading tests…</p></div>}
                    {!loadingTests && allTests.length === 0 && (
                        <div className="empty-state glass-card">
                            <div className="empty-icon">📝</div>
                            <h3>No Tests</h3>
                            <p>No company has created a test yet.</p>
                        </div>
                    )}
                    {!loadingTests && allTests.length > 0 && (
                        <div className="admin-table-wrap glass-card">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Company / App</th>
                                        <th>Requested Testers</th>
                                        <th>Iterations</th>
                                        <th>Budget / Payout</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTests.map(test => (
                                        <React.Fragment key={test.id}>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <button
                                                            className="icon-btn"
                                                            onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
                                                            style={{ padding: 4 }}
                                                        >
                                                            {expandedTest === test.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            {test.company_logo ? (
                                                                <img src={test.company_logo} alt={test.company_name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                                                            ) : (
                                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Users size={16} color="#888" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="admin-tester-name">{test.company_name}</div>
                                                                <div className="admin-tester-email">App: {test.app_name}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{test.tester_quota || 20}</td>
                                                <td>{test.testing_iterations || 1}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {editingBudget && editingBudget.id === test.id ? (
                                                            <div className="admin-budget-manager glass-card">
                                                                <div className="admin-budget-manager-header">
                                                                    <Wallet size={14} color="var(--saffron)" />
                                                                    <span>Budget Manager</span>
                                                                </div>

                                                                <div className="admin-budget-manager-grid">
                                                                    <div className="admin-budget-field">
                                                                        <label>Total Campaign (₹)</label>
                                                                        <div className="admin-budget-input-wrapper">
                                                                            <IndianRupee size={12} />
                                                                            <input
                                                                                type="number"
                                                                                value={editingBudget.total_budget}
                                                                                onChange={(e) => {
                                                                                    const val = parseFloat(e.target.value) || 0;
                                                                                    const totalTests = editingBudget.tester_quota * editingBudget.testing_iterations;
                                                                                    setEditingBudget({
                                                                                        ...editingBudget,
                                                                                        total_budget: val,
                                                                                        price_paid: (val / totalTests).toFixed(2)
                                                                                    });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="admin-budget-field">
                                                                        <label>Payout Per Test (₹)</label>
                                                                        <div className="admin-budget-input-wrapper">
                                                                            <IndianRupee size={12} />
                                                                            <input
                                                                                type="number"
                                                                                value={editingBudget.price_paid}
                                                                                onChange={(e) => {
                                                                                    const val = parseFloat(e.target.value) || 0;
                                                                                    const totalTests = editingBudget.tester_quota * editingBudget.testing_iterations;
                                                                                    setEditingBudget({
                                                                                        ...editingBudget,
                                                                                        price_paid: val,
                                                                                        total_budget: (val * totalTests).toFixed(0)
                                                                                    });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="admin-budget-breakdown">
                                                                    <div className="admin-breakdown-item">
                                                                        <span className="label">Testers</span>
                                                                        <span className="value">{editingBudget.tester_quota}</span>
                                                                    </div>
                                                                    <div className="admin-breakdown-sep">×</div>
                                                                    <div className="admin-breakdown-item">
                                                                        <span className="label">Iterations</span>
                                                                        <span className="value">{editingBudget.testing_iterations}</span>
                                                                    </div>
                                                                    <div className="admin-breakdown-sep">=</div>
                                                                    <div className="admin-breakdown-item highlight">
                                                                        <span className="label">Total Tests</span>
                                                                        <span className="value">{editingBudget.tester_quota * editingBudget.testing_iterations}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="admin-budget-manager-actions">
                                                                    <button
                                                                        className="admin-budget-manager-btn cancel"
                                                                        onClick={() => setEditingBudget(null)}
                                                                        disabled={savingBudget}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        className="admin-budget-manager-btn save"
                                                                        disabled={savingBudget}
                                                                        onClick={async () => {
                                                                            setSavingBudget(true);
                                                                            try {
                                                                                await apiClient.adminUpdateTestBudget(
                                                                                    editingBudget.id,
                                                                                    parseFloat(editingBudget.total_budget),
                                                                                    parseFloat(editingBudget.price_paid)
                                                                                );
                                                                                showToast('Budget applied successfully');
                                                                                setEditingBudget(null);
                                                                                loadAdminTests();
                                                                            } catch (err) {
                                                                                showToast('Failed to apply budget: ' + err.message, 'error');
                                                                            } finally {
                                                                                setSavingBudget(false);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {savingBudget ? <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : "Apply Changes"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="admin-budget-display">
                                                                    <div className="admin-budget-total">₹{Number(test.total_budget || 0).toLocaleString()}</div>
                                                                    <div className="admin-budget-per">₹{Number(test.price_paid || 0).toFixed(2)} / test</div>
                                                                </div>
                                                                <button
                                                                    className="admin-budget-edit-trigger"
                                                                    onClick={() => {
                                                                        setEditingBudget({
                                                                            id: test.id,
                                                                            total_budget: test.total_budget || 0,
                                                                            price_paid: test.price_paid || 0,
                                                                            tester_quota: test.tester_quota || 20,
                                                                            testing_iterations: test.testing_iterations || 1
                                                                        });
                                                                    }}
                                                                >
                                                                    <Pencil size={12} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`admin-status-badge ${test.status === 'approved' || test.status === 'active' ? 'active' : test.status === 'rejected' ? 'banned' : 'pending'}`}>
                                                        {(test.status || 'pending').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '8px' }}>
                                                    {(test.status === 'pending-approval' || test.status === 'pending') && (
                                                        <>
                                                            <button className="admin-action-btn unban" onClick={async () => {
                                                                try {
                                                                    await apiClient.updateTestStatus(test.id, 'approved');
                                                                    showToast(`✅ Test ${test.app_name} Approved`);
                                                                    loadAdminTests();
                                                                } catch (err) {
                                                                    showToast('Error: ' + err.message, 'error');
                                                                }
                                                            }}>
                                                                <Check size={14} /> Approve
                                                            </button>
                                                            <button className="admin-action-btn ban" onClick={async () => {
                                                                try {
                                                                    await apiClient.updateTestStatus(test.id, 'rejected');
                                                                    showToast(`🚫 Test ${test.app_name} Rejected`);
                                                                    loadAdminTests();
                                                                } catch (err) {
                                                                    showToast('Error: ' + err.message, 'error');
                                                                }
                                                            }}>
                                                                <X size={14} /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="admin-action-btn partial" onClick={() => {
                                                        setAssignTestContext(test);
                                                        setAssignTargetTesters([]);
                                                        setAssignModalOpen(true);
                                                        if (testers.length === 0) loadTesters();
                                                    }} title="Assign Testers manually">
                                                        <UserPlus size={14} />
                                                    </button>
                                                    <button className="admin-action-btn ban" onClick={async () => {
                                                        if (window.confirm(`Are you sure you want to delete ${test.company_name} and all associated data? This cannot be undone.`)) {
                                                            try {
                                                                await apiClient.deleteCompanyByAdmin(test.company_id);
                                                                showToast(`🗑️ Company ${test.company_name} deleted`);
                                                                loadAdminTests();
                                                            } catch (err) {
                                                                showToast('Error: ' + err.message, 'error');
                                                            }
                                                        }
                                                    }} title="Delete Company">
                                                        <Trash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedTest === test.id && (
                                                <tr className="admin-expanded-row">
                                                    <td colSpan="7">
                                                        <div className="admin-expanded-content" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                                                <div>
                                                                    <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <List size={16} /> Instructions
                                                                    </h4>
                                                                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#ccc', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '4px' }}>
                                                                        {test.instructions}
                                                                    </pre>
                                                                </div>
                                                                <div>
                                                                    <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <Smartphone size={16} /> Build & Criteria
                                                                    </h4>
                                                                    <div style={{ marginBottom: '16px' }}>
                                                                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>APK Link:</div>
                                                                        {test.apk_file_url ? (
                                                                            <a href={test.apk_file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--saffron)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                Download APK <ExternalLink size={12} />
                                                                            </a>
                                                                        ) : 'No APK uploaded'}
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Targeting:</div>
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                            <DeviceTierBadge tier={test.criteria?.device_tier} />
                                                                            {test.criteria?.network_type && <span className="admin-status-badge active" style={{ fontSize: '0.7rem' }}>📶 {test.criteria.network_type.toUpperCase()}</span>}
                                                                            {(test.criteria?.max_ram_gb || test.criteria?.min_ram_gb) && (
                                                                                <span className="admin-status-badge active" style={{ fontSize: '0.7rem' }}>
                                                                                    💾 {test.criteria.min_ram_gb || 0}-{test.criteria.max_ram_gb || '∞'}GB RAM
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {mainTab === 'bugs' && (
                <>
                    {loadingBugs && <div className="loading-state"><div className="spinner" /><p>Loading pending bugs…</p></div>}
                    {!loadingBugs && pendingBugs.length === 0 && (
                        <div className="empty-state glass-card">
                            <div className="empty-icon">✅</div>
                            <h3>All Bugs Approved</h3>
                            <p>No bugs waiting for approval right now.</p>
                        </div>
                    )}
                    {!loadingBugs && pendingBugs.length > 0 && (
                        <div className="admin-table-wrap glass-card">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>App / Tester</th>
                                        <th>Issue</th>
                                        <th>AI Verdict</th>
                                        <th>Details</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingBugs.map(bug => {
                                        const isExpanded = expandedBugId === bug.id;
                                        const aiVerdict = bug.ai_analysis && bug.ai_analysis.includes('FINAL VERDICT: [APPROVE]') ? 'APPROVE' :
                                            (bug.ai_analysis && bug.ai_analysis.includes('FINAL VERDICT: [REJECT]') ? 'REJECT' : 'PENDING');

                                        return (
                                            <React.Fragment key={bug.id}>
                                                <tr className={isExpanded ? 'admin-row-expanded-header' : ''}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <button
                                                                className="icon-btn"
                                                                onClick={() => setExpandedBugId(isExpanded ? null : bug.id)}
                                                                style={{ padding: 4 }}
                                                            >
                                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </button>
                                                            <div>
                                                                <div className="admin-tester-name">{bug.app_name}</div>
                                                                <div className="admin-tester-email">By: {bug.tester_name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ maxWidth: 300 }}>
                                                        <div style={{ fontWeight: 600 }}>{bug.bug_title}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {bug.bug_description}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {aiVerdict === 'APPROVE' && <span className="admin-status-badge active" style={{ fontSize: '0.7rem' }}>🤖 AI: APPROVE</span>}
                                                        {aiVerdict === 'REJECT' && <span className="admin-status-badge banned" style={{ fontSize: '0.7rem' }}>🤖 AI: REJECT</span>}
                                                        {aiVerdict === 'PENDING' && <span className="admin-status-badge pending" style={{ fontSize: '0.7rem' }}>🤖 AI: ANALYZING...</span>}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '0.8rem' }}>{new Date(bug.created_at).toLocaleString()}</div>
                                                        {bug.recording_url && <span style={{ color: 'var(--blue)', fontSize: '0.75rem' }}>📹 Video Attached</span>}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                className="admin-action-btn unban"
                                                                disabled={approvingBugId === bug.id}
                                                                onClick={async () => {
                                                                    setApprovingBugId(bug.id);
                                                                    try {
                                                                        await apiClient.adminApproveBug(bug.id, true, 'approved');
                                                                        showToast('Bug approved and visible to company');
                                                                        loadPendingBugs();
                                                                    } catch (err) {
                                                                        showToast('Failed to approve bug: ' + err.message, 'error');
                                                                    } finally {
                                                                        setApprovingBugId(null);
                                                                    }
                                                                }}
                                                            >
                                                                {approvingBugId === bug.id ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Check size={14} />}
                                                            </button>
                                                            <button
                                                                className="admin-action-btn ban"
                                                                disabled={approvingBugId === bug.id}
                                                                onClick={async () => {
                                                                    const reason = window.prompt("Reason for rejection:");
                                                                    if (reason === null) return;
                                                                    setApprovingBugId(bug.id);
                                                                    try {
                                                                        await apiClient.adminApproveBug(bug.id, false, 'rejected', reason);
                                                                        showToast('Bug rejected');
                                                                        loadPendingBugs();
                                                                    } catch (err) {
                                                                        showToast('Failed to reject bug: ' + err.message, 'error');
                                                                    } finally {
                                                                        setApprovingBugId(null);
                                                                    }
                                                                }}
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="admin-expanded-row">
                                                        <td colSpan="5">
                                                            <div className="admin-expanded-content" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
                                                                    {/* Left: Video Player */}
                                                                    <div>
                                                                        <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <Smartphone size={16} /> Bug Recording
                                                                        </h4>
                                                                        {bug.recording_url ? (
                                                                            <div className="admin-video-container" style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', aspectRatio: '9/16', border: '1px solid #333' }}>
                                                                                <BlobVideoPlayer src={bug.recording_url} />
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ padding: '40px', background: '#222', borderRadius: '12px', textAlign: 'center', color: '#666' }}>
                                                                                No video recording available.
                                                                            </div>
                                                                        )}
                                                                        <div style={{ marginTop: '16px' }}>
                                                                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>Device Info:</div>
                                                                            <div style={{ fontSize: '0.85rem' }}>{bug.device_info || 'Unknown device'}</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Right: Info & AI */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                                        <div>
                                                                            <h4 style={{ color: 'var(--saffron)', marginBottom: '12px' }}>📋 Instructions & Feedback</h4>
                                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                                                <div>
                                                                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Test Instructions</div>
                                                                                    <div style={{ background: 'rgba(255,107,43,0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', borderLeft: '3px solid var(--saffron)' }}>
                                                                                        {bug.test_instructions || 'No instructions provided for this test.'}
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Tester Feedback</div>
                                                                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', borderLeft: '3px solid #ccc' }}>
                                                                                        {bug.bug_description}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h4 style={{ color: '#54a0ff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                <Shield size={16} /> AI Vision Verdict (Gemini)
                                                                            </h4>
                                                                            {bug.ai_analysis ? (
                                                                                <div className="admin-ai-analysis-box" style={{
                                                                                    background: 'rgba(84,160,255,0.05)',
                                                                                    padding: '20px',
                                                                                    borderRadius: '12px',
                                                                                    fontSize: '0.9rem',
                                                                                    border: '1px solid rgba(84,160,255,0.2)',
                                                                                    lineHeight: '1.6'
                                                                                }}>
                                                                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                                                                        {bug.ai_analysis}
                                                                                    </div>

                                                                                    {bug.ai_admin_context && (
                                                                                        <div style={{
                                                                                            marginTop: '20px',
                                                                                            paddingTop: '20px',
                                                                                            borderTop: '1px dashed rgba(84,160,255,0.3)',
                                                                                            color: '#ffcc00'
                                                                                        }}>
                                                                                            <h5 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                <Shield size={14} /> INTERNAL ADMIN CONTEXT
                                                                                            </h5>
                                                                                            <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                                                                                                {bug.ai_admin_context}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center', border: '1px dashed #444' }}>
                                                                                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                                                                                    <p style={{ color: '#888' }}>Gemini is currently analyzing this recording...</p>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                                                                            <button
                                                                                className="admin-premium-btn approve"
                                                                                disabled={approvingBugId === bug.id}
                                                                                onClick={async () => {
                                                                                    setApprovingBugId(bug.id);
                                                                                    try {
                                                                                        await apiClient.adminApproveBug(bug.id, 'approved');
                                                                                        showToast('✅ Bug Approved');
                                                                                        loadPendingBugs();
                                                                                    } catch (err) {
                                                                                        showToast('Error: ' + err.message, 'error');
                                                                                    } finally {
                                                                                        setApprovingBugId(null);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Check size={18} /> <span>Approve & Release</span>
                                                                            </button>
                                                                            <button
                                                                                className="admin-premium-btn reject"
                                                                                disabled={approvingBugId === bug.id}
                                                                                onClick={async () => {
                                                                                    const reason = window.prompt("Reason for rejection:");
                                                                                    if (reason === null) return;
                                                                                    setApprovingBugId(bug.id);
                                                                                    try {
                                                                                        await apiClient.adminApproveBug(bug.id, 'rejected', reason);
                                                                                        showToast('🚫 Bug Rejected');
                                                                                        loadPendingBugs();
                                                                                    } catch (err) {
                                                                                        showToast('Error: ' + err.message, 'error');
                                                                                    } finally {
                                                                                        setApprovingBugId(null);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <X size={18} /> <span>Reject</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* ASSIGN TESTERS MODAL */}
            {assignModalOpen && assignTestContext && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3>Assign Testers to {assignTestContext.app_name}</h3>
                            <button className="icon-btn" onClick={() => setAssignModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div style={{ marginBottom: 15, fontSize: '0.9rem', color: '#888' }}>
                            Company: <strong>{assignTestContext.company_name}</strong> &nbsp; | &nbsp;
                            Quota: <strong>{assignTestContext.tester_count} / {assignTestContext.tester_quota}</strong>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #333', borderRadius: 8, padding: 10 }}>
                            {testers.filter(t => !t.is_banned).map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #222' }}>
                                    <input
                                        type="checkbox"
                                        checked={assignTargetTesters.includes(t.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setAssignTargetTesters(prev => [...prev, t.id]);
                                            else setAssignTargetTesters(prev => prev.filter(id => id !== t.id));
                                        }}
                                        style={{ marginRight: 15, transform: 'scale(1.2)' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>{t.full_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{t.device_model} • {t.city}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                disabled={assignTargetTesters.length === 0 || assigningLoading}
                                onClick={async () => {
                                    try {
                                        setAssigningLoading(true);
                                        // TODO: We need an API endpoint for this!
                                        for (const testerId of assignTargetTesters) {
                                            await apiClient.adminAssignTester(assignTestContext.id, testerId);
                                        }
                                        showToast(`✅ Successfully assigned ${assignTargetTesters.length} testers`);
                                        setAssignModalOpen(false);
                                        loadAdminTests();
                                    } catch (err) {
                                        showToast('Assignment Error: ' + err.message, 'error');
                                    } finally {
                                        setAssigningLoading(false);
                                    }
                                }}
                            >
                                {assigningLoading ? 'Assigning...' : `Assign ${assignTargetTesters.length} Testers`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
