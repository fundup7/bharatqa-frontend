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

// Styles
import './styles/tokens.css';
import './styles/glass.css';
import './styles/animations.css';
import './App.css';

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

  useEffect(() => {
    const saved = localStorage.getItem('bharatqa_company');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompany(parsed);
        if (parsed.onboarding_complete) {
          setView('dashboard');
        }
      } catch (e) {}
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
  const isPublicPage = ['home', 'login', 'onboarding'].includes(view);

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
        company={company}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      {!isPublicPage && company && (
        <Sidebar
          view={view}
          company={company}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}

      <main className={isPublicPage ? 'main-content-full' : 'main-content-sidebar'}>
        {view === 'home' && (
          <HomePage
            company={company}
            onLogin={handleLogin}
            onNavigate={navigate}
          />
        )}

        {view === 'login' && (
          <LoginPage onLogin={handleLogin} />
        )}

        {view === 'onboarding' && company && !company.onboarding_complete && (
          <OnboardingPage
            company={company}
            onComplete={(updated) => {
              updateCompany(updated);
              navigate('dashboard');
              showToast('Setup complete! 🚀');
            }}
          />
        )}

        {view === 'dashboard' && company && company.onboarding_complete && (
          <DashboardPage
            company={company}
            onSelectTest={setSelectedTest}
            onViewChange={navigate}
            showToast={showToast}
          />
        )}

        {view === 'create-test' && company && (
          <CreateTestPage
            company={company}
            onClose={() => navigate('dashboard')}
            showToast={showToast}
          />
        )}

        {view === 'test-detail' && selectedTest && (
          <TestDetailPage
            test={selectedTest}
            onBack={() => navigate('dashboard')}
            showToast={showToast}
          />
        )}

        {view === 'settings' && company && (
          <SettingsPage
            company={company}
            onUpdate={updateCompany}
            onLogout={handleLogout}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}

export default App;