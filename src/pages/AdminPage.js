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
                                        <th>Visibility</th>
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
                                                        <div>
                                                            <div className="admin-tester-name">{test.company_name}</div>
                                                            <div className="admin-tester-email">App: {test.app_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{test.tester_quota || 20}</td>
                                                <td>{test.testing_iterations || 1}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>₹{Number(test.total_budget || 0).toFixed(0)}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>₹{Number(test.price_paid || 0).toFixed(2)} / test</div>
                                                        </div>
                                                        <button
                                                            className="admin-action-btn partial"
                                                            style={{ padding: '4px 8px' }}
                                                            onClick={async () => {
                                                                const newBudget = window.prompt(`Enter total budget for ${test.app_name}:`, test.total_budget);
                                                                if (newBudget === null) return;
                                                                const b = parseFloat(newBudget);
                                                                if (isNaN(b)) return showToast('Invalid budget', 'error');

                                                                const newPrice = window.prompt(`Enter price per test (paid to tester):`, test.price_paid || 70);
                                                                if (newPrice === null) return;
                                                                const p = parseFloat(newPrice);
                                                                if (isNaN(p)) return showToast('Invalid price', 'error');

                                                                try {
                                                                    await apiClient.adminUpdateTestBudget(test.id, b, p);
                                                                    showToast('Budget updated successfully');
                                                                    loadAdminTests();
                                                                } catch (err) {
                                                                    showToast('Update failed: ' + err.message, 'error');
                                                                }
                                                            }}
                                                        >
                                                            <Pencil size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        className={`admin-action-btn ${test.admin_approved ? 'unban' : 'ban'}`}
                                                        onClick={async () => {
                                                            try {
                                                                await apiClient.approveTestVisibility(test.id, !test.admin_approved);
                                                                showToast(test.admin_approved ? 'Test hidden from company' : 'Test visible to company');
                                                                loadAdminTests();
                                                            } catch (err) {
                                                                showToast('Error: ' + err.message, 'error');
                                                            }
                                                        }}
                                                        title={test.admin_approved ? "Hide from Company" : "Approve for Company Visibility"}
                                                    >
                                                        {test.admin_approved ? <Eye size={14} /> : <EyeOff size={14} />}
                                                        {test.admin_approved ? ' Visible' : ' Hidden'}
                                                    </button>
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
                                                                        {test.test_instructions}
                                                                    </pre>
                                                                </div>
                                                                <div>
                                                                    <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <Smartphone size={16} /> Build & Criteria
                                                                    </h4>
                                                                    <div style={{ marginBottom: '16px' }}>
                                                                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>APK Link:</div>
                                                                        {test.apk_url ? (
                                                                            <a href={test.apk_url} target="_blank" rel="noreferrer" style={{ color: 'var(--saffron)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                Download APK <ExternalLink size={12} />
                                                                            </a>
                                                                        ) : 'No APK uploaded'}
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Targeting:</div>
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                            <DeviceTierBadge tier={test.device_tier} />
                                                                            {test.network_type && <span className="admin-status-badge active" style={{ fontSize: '0.7rem' }}>📶 {test.network_type.toUpperCase()}</span>}
                                                                            {test.max_ram_gb && <span className="admin-status-badge active" style={{ fontSize: '0.7rem' }}>💾 {test.max_ram_gb}GB RAM</span>}
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

            {/* ════ BUG APPROVAL TAB ════ */}
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
                                        <th>Details</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingBugs.map(bug => (
                                        <tr key={bug.id}>
                                            <td>
                                                <div className="admin-tester-name">{bug.app_name}</div>
                                                <div className="admin-tester-email">By: {bug.tester_name}</div>
                                            </td>
                                            <td style={{ maxWidth: 300 }}>
                                                <div style={{ fontWeight: 600 }}>{bug.bug_title}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {bug.bug_description}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.8rem' }}>{new Date(bug.created_at).toLocaleString()}</div>
                                                {bug.recording_url && <span style={{ color: 'var(--blue)', fontSize: '0.75rem' }}>📹 Recording attached</span>}
                                            </td>
                                            <td>
                                                <button
                                                    className="admin-action-btn unban"
                                                    disabled={approvingBugId === bug.id}
                                                    onClick={async () => {
                                                        setApprovingBugId(bug.id);
                                                        try {
                                                            await apiClient.adminApproveBug(bug.id);
                                                            showToast('Bug approved and visible to company');
                                                            loadPendingBugs();
                                                        } catch (err) {
                                                            showToast('Failed to approve bug: ' + err.message, 'error');
                                                        } finally {
                                                            setApprovingBugId(null);
                                                        }
                                                    }}
                                                >
                                                    {approvingBugId === bug.id ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><Check size={14} /> Approve</>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
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
