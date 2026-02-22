import React, { useState, useEffect, useCallback } from 'react';
import { Bug, AlertCircle, FileText, Download, Calendar, Activity, Sparkles } from 'lucide-react';
import { apiClient } from '../utils/api';
import { colors } from '../utils/constants';
import './ReportsPage.css';

function exportToCSV(reports, company) {
    if (reports.length === 0) return;

    const headers = [
        'Issue Title',
        'Project',
        'Reporter',
        'Severity',
        'Device',
        'OS Version',
        'Network',
        'Date',
        'Status',
        'Steps to Reproduce',
        'Expected Result',
        'Actual Result',
    ];

    const escape = (val) => {
        if (val == null) return '';
        const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
        return `"${str}"`;
    };

    const rows = reports.map(r => [
        escape(r.bug_title || 'Untitled Issue'),
        escape(r.app_name || ''),
        escape(r.tester_name || 'Anonymous'),
        escape(r.severity || ''),
        escape(r.device_model || ''),
        escape(r.os_version || ''),
        escape(r.network_type || ''),
        escape(r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : ''),
        escape(r.ai_analysis ? 'Analyzed' : 'New'),
        escape(r.steps_to_reproduce || ''),
        escape(r.expected_result || ''),
        escape(r.actual_result || ''),
    ]);

    const csvContent = [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `bharatqa-report-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function ReportsPage({ company, showToast }) {
    const [reports, setReports] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const testsData = await apiClient.getTests(company.id);
            setTests(testsData);

            let allBugs = [];
            for (const test of testsData) {
                const bugs = await apiClient.getBugs(test.id);
                allBugs = [...allBugs, ...bugs.map(bug => ({ ...bug, app_name: test.app_name }))];
            }

            allBugs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setReports(allBugs);
        } catch (err) {
            console.error(err);
            showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    }, [company.id, showToast]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleExport = () => {
        if (reports.length === 0) {
            showToast('No data to export yet', 'error');
            return;
        }
        setExporting(true);
        try {
            exportToCSV(reports, company);
            showToast(`✅ Exported ${reports.length} issue${reports.length !== 1 ? 's' : ''} to CSV`);
        } catch (err) {
            showToast('Export failed', 'error');
        } finally {
            setTimeout(() => setExporting(false), 800);
        }
    };

    const totalBugs = reports.length;
    const criticalBugs = tests.reduce((acc, t) => acc + (t.critical_count || 0), 0);
    const analyzedReports = reports.filter(r => r.ai_analysis).length;

    return (
        <div className="reports-page">
            <div className="rp-header">
                <div className="rp-header-title">
                    <FileText size={28} color="var(--saffron)" />
                    <div>
                        <h1>Global Reports</h1>
                        <p>Overview of all issues across your projects.</p>
                    </div>
                </div>
                <button
                    className={`rp-export-btn ${exporting ? 'exporting' : ''}`}
                    onClick={handleExport}
                    disabled={exporting || loading}
                >
                    {exporting ? (
                        <>
                            <div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                            Exporting…
                        </>
                    ) : (
                        <>
                            <Download size={16} />
                            Export CSV
                        </>
                    )}
                </button>
            </div>

            <div className="rp-stats-grid">
                <div className="rp-stat-card glass-card">
                    <div className="rp-stat-header">
                        <div className="rp-stat-icon issue-icon"><Bug size={20} /></div>
                        <span className="rp-stat-label">Total Issues</span>
                    </div>
                    <div className="rp-stat-value">{totalBugs}</div>
                </div>

                <div className="rp-stat-card glass-card">
                    <div className="rp-stat-header">
                        <div className="rp-stat-icon critical-icon"><AlertCircle size={20} /></div>
                        <span className="rp-stat-label">Critical Bugs</span>
                    </div>
                    <div className="rp-stat-value text-red">{criticalBugs}</div>
                </div>

                <div className="rp-stat-card glass-card">
                    <div className="rp-stat-header">
                        <div className="rp-stat-icon analyzed-icon"><Sparkles size={20} /></div>
                        <span className="rp-stat-label">AI Analyzed</span>
                    </div>
                    <div className="rp-stat-value text-blue">{analyzedReports}</div>
                </div>
            </div>

            <div className="rp-content glass-card">
                <div className="rp-section-header">
                    <h2 className="rp-section-title">All Issues</h2>
                    {reports.length > 0 && (
                        <span className="rp-count-chip">{reports.length} total</span>
                    )}
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading report data...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>No reports found</h3>
                        <p>No issues have been reported for your projects yet.</p>
                    </div>
                ) : (
                    <div className="rp-table-wrapper">
                        <table className="rp-table">
                            <thead>
                                <tr>
                                    <th>Issue Title</th>
                                    <th>Project</th>
                                    <th>Reporter</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report.id}>
                                        <td className="font-medium">{report.bug_title || 'Untitled Issue'}</td>
                                        <td className="text-sec"><span className="app-badge">{report.app_name}</span></td>
                                        <td>{report.tester_name || 'Anonymous'}</td>
                                        <td className="text-sec">
                                            <div className="rp-date">
                                                <Calendar size={14} />
                                                {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td>
                                            {report.ai_analysis
                                                ? <span className="status-badge analyzed">✦ Analyzed</span>
                                                : <span className="status-badge new">New</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
