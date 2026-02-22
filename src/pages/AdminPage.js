import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, ShieldOff, Shield, Users, Smartphone, Wifi, MemoryStick, MapPin, RefreshCw } from 'lucide-react';
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
    const [testers, setTesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [banningId, setBanningId] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'banned'

    const loadTesters = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiClient.getAllTesters();
            setTesters(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast('Failed to load testers: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { loadTesters(); }, [loadTesters]);

    const handleBan = async (tester) => {
        const reason = window.prompt(`Ban reason for ${tester.full_name}:`, 'Violation of terms of service');
        if (reason === null) return; // cancelled
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

    const filtered = testers.filter(t => {
        if (filter === 'banned') return t.is_banned;
        if (filter === 'active') return !t.is_banned;
        return true;
    });

    const bannedCount = testers.filter(t => t.is_banned).length;

    return (
        <div className="admin-page">
            <div className="admin-hero glass-card">
                <div className="admin-hero-left">
                    <div className="admin-hero-icon">
                        <ShieldAlert size={28} color="var(--saffron)" />
                    </div>
                    <div>
                        <h1>Tester Administration</h1>
                        <p className="admin-hero-sub">Manage testers, device profiles, and access control.</p>
                    </div>
                </div>
                <button className="admin-refresh-btn" onClick={loadTesters} title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Stats bar */}
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

            {/* Filter tabs */}
            <div className="admin-filter-tabs">
                {['all', 'active', 'banned'].map(f => (
                    <button
                        key={f}
                        className={`admin-filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'banned' && bannedCount > 0 && <span className="admin-filter-count">{bannedCount}</span>}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading testers…</p>
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="empty-state glass-card">
                    <div className="empty-icon">👥</div>
                    <h3>No testers found</h3>
                    <p>{filter === 'banned' ? 'No banned testers.' : 'No testers registered yet.'}</p>
                </div>
            )}

            {!loading && filtered.length > 0 && (
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
                                            <button
                                                className="admin-action-btn unban"
                                                disabled={banningId === tester.id}
                                                onClick={() => handleUnban(tester)}
                                            >
                                                {banningId === tester.id
                                                    ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                                    : <><Shield size={14} /> Unban</>
                                                }
                                            </button>
                                        ) : (
                                            <button
                                                className="admin-action-btn ban"
                                                disabled={banningId === tester.id}
                                                onClick={() => handleBan(tester)}
                                            >
                                                {banningId === tester.id
                                                    ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                                    : <><ShieldOff size={14} /> Ban</>
                                                }
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
