import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Bug, AlertCircle, Users, Trash2, Calendar, FolderGit2, ArrowRight, Activity } from 'lucide-react';
import { apiClient } from '../utils/api';
import { colors } from '../utils/constants';
import './DashboardPage.css';

export default function DashboardPage({ company, onSelectTest, onViewChange, showToast }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uniqueTesters, setUniqueTesters] = useState(0);

  const loadTests = useCallback(async () => {

    const u = await apiClient.getCompanyUniqueTesters(company.id);
    setUniqueTesters(u.unique_testers || 0);

    try {
      setLoading(true);
      const data = await apiClient.getTests(company.id);
      setTests(data);

      const u = await apiClient.getCompanyUniqueTesters(company.id);
      setUniqueTesters(u.unique_testers || 0);
    } catch (err) {
      console.error(err);
      showToast('Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  }, [company.id, showToast]);

  useEffect(() => {

    loadTests();
  }, [loadTests]);

  const deleteTest = async (testId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this test and ALL its bug reports?')) return;

    try {
      await apiClient.deleteTest(testId);
      showToast('Test deleted successfully');
      loadTests();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete test', 'error');
    }
  };

  const totalBugs = tests.reduce((acc, t) => acc + (t.bug_count || 0), 0);
  const criticalBugs = tests.reduce((acc, t) => acc + (t.critical_count || 0), 0);
  const totalTesters = tests.reduce((acc, t) => acc + (t.tester_count || 0), 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-greeting">
          <h1>Good morning, {company.name.split(' ')[0]}</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
        <button
          className="create-btn"
          onClick={() => onViewChange('create-test')}
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="stats-row">
        {[
          { label: 'Active Projects', value: tests.length, icon: FolderGit2, color: colors.saffron },
          { label: 'Total Issues', value: totalBugs, icon: Bug, color: colors.critical },
          { label: 'Critical Bugs', value: criticalBugs, icon: AlertCircle, color: colors.high },
          { label: 'Active Testers', value: totalTesters, icon: Users, color: colors.electricBlue },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: `${stat.color}15`,
                color: stat.color,
                border: `1px solid ${stat.color}30`
              }}
            >
              <stat.icon size={26} strokeWidth={2} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="tests-heading">Your Projects</h2>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading projects...</p>
        </div>
      )}

      {!loading && tests.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🚀</div>
          <h3>No projects yet</h3>
          <p>Create your first project to start tracking bug reports from real devices.</p>
          <button
            className="create-btn"
            style={{ margin: '0 auto' }}
            onClick={() => onViewChange('create-test')}
          >
            <Plus size={20} /> Create Your First Project
          </button>
        </div>
      )}

      <div className="test-grid">
        {tests.map(test => (
          <div
            key={test.id}
            className="test-card"
            onClick={() => {
              onSelectTest(test);
              onViewChange('test-detail');
            }}
          >
            <div className="test-card-header">
              <div className="app-icon"><Activity size={24} /></div>
              <button
                className="delete-btn"
                title="Delete Project"
                onClick={(e) => deleteTest(test.id, e)}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <h3 className="test-name">{test.app_name}</h3>
            <p className="test-date">
              <Calendar size={14} /> {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="test-stats">
              <div className={test.apk_file_url ? 'status-good test-stat' : 'status-warning test-stat'}>
                <div className="test-stat-val">
                  {test.apk_file_url ? 'Active' : 'Pending'}
                </div>
                <div className="test-stat-label">Build</div>
              </div>
              <div className="test-stat">
                <div className="test-stat-val">
                  <Bug size={16} color={colors.critical} /> {test.bug_count || 0}
                </div>
                <div className="test-stat-label">Issues</div>
              </div>
              <div className="test-stat">
                <div className="test-stat-val">
                  <AlertCircle size={16} color={colors.high} /> {test.critical_count || 0}
                </div>
                <div className="test-stat-label">Critical</div>
              </div>
            </div>

            <div className="test-card-footer">
              <span>View Dashboard</span>
              <span className="arrow"><ArrowRight size={18} /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}