import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, ShieldOff, Shield, Users, Smartphone, Wifi, MemoryStick, MapPin, RefreshCw, Wallet, IndianRupee, CheckCircle, Clock } from 'lucide-react';
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
    const [mainTab, setMainTab] = useState('testers'); // 'testers' | 'payments'

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

    useEffect(() => { loadTesters(); }, [loadTesters]);
    useEffect(() => { if (mainTab === 'payments') loadPending(); }, [mainTab, loadPending]);

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
                <button className="admin-refresh-btn" onClick={mainTab === 'testers' ? loadTesters : loadPending} title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Main tabs */}
            <div className="admin-main-tabs">
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
        </div>
    );
}
