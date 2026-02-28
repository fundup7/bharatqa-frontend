import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './utils/constants';
import { apiClient } from './utils/api';

// Layout
import AnimatedBackground from './components/layout/AnimatedBackground';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Toast from './components/layout/Toast';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './components/auth/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import CreateTestPage from './pages/CreateTestPage';
import TestDetailPage from './pages/TestDetailPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import SharedTestDetailPage from './pages/SharedTestDetailPage';

// Styles
import './styles/tokens.css';
import './styles/glass.css';
import './styles/animations.css';
import './App.css';

// List of allowed admin emails
export const ADMIN_EMAILS = [
  'fundup3@gmail.com' // Replace or add your emails here
];

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

function AppContent() {
  const [view, setView] = useState('home');
  const [company, setCompany] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [toast, setToast] = useState(null);
  const [impersonating, setImpersonating] = useState(null);
  const [sharedToken, setSharedToken] = useState(null);

  const activeCompany = impersonating || company;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('share');
    if (token) {
      setSharedToken(token);
      setView('shared-test');
      return;
    }

    const saved = localStorage.getItem('bharatqa_company');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompany(parsed);
        if (parsed.onboarding_complete) {
          setView('dashboard');
        }
      } catch (e) { }
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  };

  const handleLogin = async (credentialResponse) => {
    try {
      const data = await apiClient.googleAuth(credentialResponse.credential);
      if (data.success) {
        setCompany(data.company);
        localStorage.setItem('bharatqa_company', JSON.stringify(data.company));
        if (data.company.onboarding_complete) {
          setView('dashboard');
        } else {
          setView('onboarding');
        }
        showToast('Welcome! 🎉');
      } else {
        showToast('Login failed: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast('Login failed: ' + err.message, 'error');
    }
  };

  const handleLogout = () => {
    setCompany(null);
    localStorage.removeItem('bharatqa_company');
    setView('home');
    showToast('Signed out successfully');
  };

  const updateCompany = (updated) => {
    setCompany(updated);
    localStorage.setItem('bharatqa_company', JSON.stringify(updated));
  };

  const navigate = (newView) => setView(newView);

  // Public pages (no sidebar)
  const isPublicPage = ['home', 'login', 'onboarding', 'shared-test'].includes(view);

  return (
    <div className="app-container">
      <AnimatedBackground />

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      <Navbar
        view={view}
        company={activeCompany}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      {!isPublicPage && activeCompany && (
        <Sidebar
          view={view}
          company={activeCompany}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}

      <main className={isPublicPage ? 'main-content-full' : 'main-content-sidebar'}>
        {impersonating && (
          <div style={{ background: '#ff4d4d', color: '#fff', padding: '12px', textAlign: 'center', zIndex: 1000, position: 'relative', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <span>⚠️ You are impersonating <strong>{impersonating.company_name}</strong></span>
            <button
              onClick={() => { setImpersonating(null); setView('admin'); }}
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 12px', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Exit Impersonation
            </button>
          </div>
        )}

        {view === 'home' && (
          <HomePage
            company={activeCompany}
            onLogin={handleLogin}
            onNavigate={navigate}
          />
        )}

        {view === 'login' && (
          <LoginPage onLogin={handleLogin} />
        )}

        {view === 'onboarding' && activeCompany && !activeCompany.onboarding_complete && (
          <OnboardingPage
            company={activeCompany}
            onComplete={(updated) => {
              updateCompany(updated);
              navigate('dashboard');
              showToast('Setup complete! 🚀');
            }}
          />
        )}

        {(view === 'dashboard' || view === 'tests') && activeCompany && activeCompany.onboarding_complete && (
          <DashboardPage
            company={activeCompany}
            onSelectTest={setSelectedTest}
            onViewChange={navigate}
            showToast={showToast}
          />
        )}

        {view === 'create-test' && activeCompany && (
          <CreateTestPage
            company={activeCompany}
            onClose={() => navigate('tests')}
            showToast={showToast}
          />
        )}

        {view === 'test-detail' && selectedTest && (
          <TestDetailPage
            test={selectedTest}
            onBack={() => navigate('tests')}
            showToast={showToast}
          />
        )}

        {view === 'reports' && activeCompany && (
          <ReportsPage
            company={activeCompany}
            showToast={showToast}
          />
        )}

        {view === 'settings' && activeCompany && (
          <SettingsPage
            company={activeCompany}
            onUpdate={updateCompany}
            onLogout={handleLogout}
            showToast={showToast}
          />
        )}

        {view === 'admin' && company && ADMIN_EMAILS.includes(company.email) && (
          <AdminPage
            company={company}
            showToast={showToast}
            onImpersonate={async (companyId) => {
              try {
                const data = await apiClient.adminGetCompanyProfile(companyId);
                setImpersonating(data.company);
                setView('dashboard');
                showToast(`Impersonating ${data.company.company_name} 🕵️`);
              } catch (err) {
                showToast('Failed to impersonate: ' + err.message, 'error');
              }
            }}
          />
        )}

        {view === 'shared-test' && sharedToken && (
          <SharedTestDetailPage
            token={sharedToken}
            showToast={showToast}
            onExit={() => {
              window.location.href = '/';
            }}
          />
        )}

      </main>
    </div>
  );
}

export default App;