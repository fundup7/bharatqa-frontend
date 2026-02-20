import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Bug, AlertCircle, Users, TestTube, Trash2 } from 'lucide-react';
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
        <div>
          <h1>Good morning, {company.name.split(' ')[0]} 👋</h1>
          <p>You have {tests.length} active test{tests.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => onViewChange('create-test')}
        >
          <Plus size={20} /> Create New Test
        </button>
      </div>

      <div className="stats-row">
        {[
          { label: 'Total Tests', value: tests.length, icon: TestTube, color: colors.saffron },
          { label: 'Total Bugs', value: totalBugs, icon: Bug, color: colors.critical },
          { label: 'Critical', value: criticalBugs, icon: AlertCircle, color: colors.high },
          { label: 'Testers', value: totalTesters, icon: Users, color: colors.electricBlue },
        ].map((stat, i) => (
          <div key={i} className="stat-card glass-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: `${stat.color}20`,
                color: stat.color
              }}
            >
              <stat.icon size={24} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="tests-heading">Your Tests ({tests.length})</h2>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading tests...</p>
        </div>
      )}

      {!loading && tests.length === 0 && (
        <div className="empty-state glass-card">
          <div className="empty-icon">📋</div>
          <h3>No tests yet</h3>
          <p>Create your first test to start getting real device bug reports</p>
          <button
            className="btn-primary"
            onClick={() => onViewChange('create-test')}
          >
            + Create Your First Test
          </button>
        </div>
      )}

      <div className="test-grid">
        {tests.map(test => (
          <div
            key={test.id}
            className="test-card glass-card"
            onClick={() => {
              onSelectTest(test);
              onViewChange('test-detail');
            }}
          >
            <div className="test-card-header">
              <div className="app-icon">📱</div>
              <button
                className="delete-btn"
                onClick={(e) => deleteTest(test.id, e)}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <h3 className="test-name">{test.app_name}</h3>
            <p className="test-date">
              Created {new Date(test.created_at).toLocaleDateString()}
            </p>

            <div className="test-stats">
              <div className={test.apk_file_url ? 'status-good' : 'status-warning'}>
                {test.apk_file_url ? '✅ APK' : '⚠️ No APK'}
              </div>
              <div className="test-stat">
                <Bug size={14} /> {test.bug_count || 0}
              </div>
              <div className="test-stat">
                <AlertCircle size={14} /> {test.critical_count || 0}
              </div>
            </div>

            <div className="test-card-footer">
              <span>View Reports →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}