import React, { useState, useEffect, useCallback } from 'react';
import { Bug, AlertCircle, FileText, Download, Calendar, Activity } from 'lucide-react';
import { apiClient } from '../utils/api';
import { colors } from '../utils/constants';
import './ReportsPage.css';

export default function ReportsPage({ company, showToast }) {
    const [reports, setReports] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const testsData = await apiClient.getTests(company.id);
            setTests(testsData);

            let allBugs = [];
            // Fetch bugs for all tests
            for (const test of testsData) {
                const bugs = await apiClient.getBugs(test.id);
                allBugs = [...allBugs, ...bugs.map(bug => ({ ...bug, app_name: test.app_name }))];
            }

            // Sort by newest first
            allBugs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setReports(allBugs);

        } catch (err) {
            console.error(err);
            showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    }, [company.id, showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalBugs = reports.length;
    const criticalBugs = tests.reduce((acc, t) => acc + (t.critical_count || 0), 0);

    // Calculate average resolution time or other metrics if available
    // For now, let's just show some top level stats
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
                <button className="btn-secondary rp-export-btn">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="rp-stats-grid">
                <div className="rp-stat-card glass-card">
                    <div className="rp-stat-header">
                        <div className="rp-stat-icon issue-icon"><Bug size={20} /></div>
                        <span className="rp-stat-label">Total Issues Logged</span>
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
                        <div className="rp-stat-icon analyzed-icon"><Activity size={20} /></div>
                        <span className="rp-stat-label">AI Analyzed</span>
                    </div>
                    <div className="rp-stat-value text-blue">{analyzedReports}</div>
                </div>
            </div>

            <div className="rp-content glass-card">
                <h2 className="rp-section-title">Recent Activity</h2>

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
                                                {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td>
                                            {report.ai_analysis ?
                                                <span className="status-badge analyzed">Analyzed</span> :
                                                <span className="status-badge new">New</span>
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
