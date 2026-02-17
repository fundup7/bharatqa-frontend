import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'https://bharatqa-backend.onrender.com/api';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';

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

  useEffect(() => {
    const saved = localStorage.getItem('bharatqa_company');
    if (saved) {
      try { setCompany(JSON.parse(saved)); } catch (e) { }
    }
  }, []);

  const handleLogin = async (credentialResponse) => {
    try {
      const res = await fetch(API + '/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (data.success) {
        setCompany(data.company);
        localStorage.setItem('bharatqa_company', JSON.stringify(data.company));
        setView('company');
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    setCompany(null);
    localStorage.removeItem('bharatqa_company');
    setView('home');
  };

  return (
    <div className="App">
      <header style={{
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        color: 'white', padding: '15px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '22px', margin: 0 }}>🇮🇳 BharatQA</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
          Crowdsourced Real-Device Testing
        </p>
        <div style={{ marginTop: '10px' }}>
          {['home', 'company', 'settings', 'tester', 'admin'].map(v => (
            <button
              key={v}
              onClick={() => {
                if ((v === 'company' || v === 'settings') && !company) return;
                setView(v);
              }}
              style={{
                ...navBtn,
                background: view === v ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderBottom: view === v ? '2px solid white' : '2px solid transparent',
                opacity: ((v === 'company' || v === 'settings') && !company) ? 0.5 : 1
              }}
            >
              {v === 'settings' ? '⚙️ ' : ''}
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        {company && (
          <div style={{
            marginTop: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px'
          }}>
            {company.picture && (
              <img src={company.picture} alt="" style={{
                width: '28px', height: '28px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.5)'
              }} />
            )}
            <span style={{ fontSize: '13px', opacity: 0.9 }}>{company.name}</span>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: 'white', padding: '4px 10px', borderRadius: '4px',
              cursor: 'pointer', fontSize: '11px'
            }}>Logout</button>
          </div>
        )}
      </header>

      <div style={{ padding: '15px', maxWidth: '900px', margin: '0 auto' }}>
        {view === 'home' && <Home company={company} onLogin={handleLogin} />}

        {view === 'company' && company && !company.onboarding_complete && (
          <OnboardingForm
            company={company}
            onComplete={(updated) => { setCompany(updated); setView('company'); }}
          />
        )}
        {view === 'company' && company && company.onboarding_complete && (
          <CompanyDashboard company={company} />
        )}
        {view === 'company' && !company && (
          <LoginPrompt onLogin={handleLogin} />
        )}

        {view === 'settings' && company && (
          <SettingsPage
            company={company}
            onUpdate={(updated) => setCompany(updated)}
            onLogout={handleLogout}
          />
        )}
        {view === 'settings' && !company && (
          <LoginPrompt onLogin={handleLogin} />
        )}

        {view === 'tester' && <TesterDashboard />}
        {view === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
}

// ===== LOGIN PROMPT =====
function LoginPrompt({ onLogin }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Company Login</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Sign in with Google to manage your tests and view reports
      </p>
      <div style={{ ...cardStyle, display: 'inline-block', padding: '30px 50px' }}>
        <h3 style={{ marginTop: 0 }}>Sign In</h3>
        <GoogleLogin
          onSuccess={onLogin}
          onError={() => alert('Login failed')}
          theme="outline" size="large" text="signin_with" shape="rectangular" width="300"
        />
        <p style={{ color: '#999', fontSize: '12px', marginTop: '15px', marginBottom: 0 }}>
          We only access your name, email, and profile picture
        </p>
      </div>
    </div>
  );
}

// ===== HOME =====
function Home({ company, onLogin }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch(API + '/health').then(r => r.json()).then(d => setHealth(d)).catch(() => setHealth(null));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>Welcome to BharatQA</h2>
      <p style={{ color: '#666' }}>Real device testing from real users across Bharat</p>

      <div style={{
        ...cardStyle,
        background: health ? '#F0FDF4' : '#FEF2F2',
        borderLeft: `4px solid ${health ? '#10B981' : '#EF4444'}`
      }}>
        <strong>Server: </strong>
        {health ? 'Connected' : 'Not connected'}
        {health?.ai_enabled && ' | AI Enabled'}
      </div>

      {!company && (
        <div style={{ ...cardStyle, padding: '25px', textAlign: 'center' }}>
          <h3>For Companies</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Sign in to upload APKs and get real device test reports
          </p>
          <GoogleLogin
            onSuccess={onLogin}
            onError={() => alert('Login failed')}
            theme="filled_blue" size="large" text="signin_with" shape="rectangular"
          />
        </div>
      )}

      {company && (
        <div style={{ ...cardStyle, background: '#F0FDF4', borderLeft: '4px solid #10B981', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {company.picture && (
              <img src={company.picture} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            )}
            <div>
              <strong>Welcome, {company.name}!</strong>
              <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{company.email}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ ...cardStyle, textAlign: 'left' }}>
        <h3>How It Works</h3>
        <ol style={{ lineHeight: '2' }}>
          <li><strong>Company</strong> signs in and uploads APK + test instructions</li>
          <li><strong>Tester</strong> opens BharatQA app on Android phone</li>
          <li>Taps <strong>START</strong> - screen recording + device monitoring begins</li>
          <li>Tests the app normally</li>
          <li>Taps <strong>STOP</strong> - video + stats upload automatically</li>
          <li><strong>Company</strong> gets video, device stats, AI analysis, and bug report</li>
        </ol>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h3>For Companies</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Upload your APK and get real device test reports with AI analysis</p>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h3>For Testers</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Test apps on your phone and earn 50 per test session</p>
        </div>
      </div>
    </div>
  );
}

// ===== ONBOARDING FORM =====
function OnboardingForm({ company, onComplete }) {
  const [form, setForm] = useState({
    company_name: '', industry: '', company_size: '', role: '',
    phone: '', website: '', referral_source: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const industries = ['Fintech', 'E-commerce', 'EdTech', 'HealthTech', 'Social Media', 'Gaming', 'SaaS / B2B', 'Logistics', 'Food & Delivery', 'Travel', 'Media & Entertainment', 'Government / GovTech', 'Other'];
  const companySizes = ['Just me', '2-10', '11-50', '51-200', '200+'];
  const roles = ['Founder / CEO', 'CTO / Tech Lead', 'QA Lead / Manager', 'Developer', 'Product Manager', 'Other'];
  const referralSources = ['Google Search', 'Twitter / X', 'LinkedIn', 'Friend / Colleague', 'YouTube', 'Reddit', 'Product Hunt', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name || !form.industry || !form.company_size || !form.role || !form.phone) {
      alert('Please fill all required fields'); return;
    }
    const phoneClean = form.phone.replace(/\D/g, '');
    if (phoneClean.length < 10) { alert('Please enter a valid phone number'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(API + '/auth/onboarding/' + company.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...company, ...data.company, onboarding_complete: true };
        localStorage.setItem('bharatqa_company', JSON.stringify(updated));
        onComplete(updated);
      } else {
        alert('Error: ' + (data.error || 'Something went wrong'));
      }
    } catch (err) { alert('Failed to save: ' + err.message); }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
        <h2 style={{ margin: '0 0 5px 0' }}>Welcome, {company.name}!</h2>
        <p style={{ color: '#666', margin: 0 }}>Complete your profile to start testing</p>
      </div>

      <div style={{ ...cardStyle, background: '#F0FDF4', borderLeft: '4px solid #10B981', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        {company.picture && <img src={company.picture} alt="" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />}
        <div>
          <div style={{ fontWeight: 'bold' }}>{company.name}</div>
          <div style={{ color: '#666', fontSize: '13px' }}>{company.email}</div>
        </div>
        <span style={{ marginLeft: 'auto', background: '#10B981', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '11px' }}>Verified</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={formGroup}>
          <label style={labelStyle}>Company Name <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="text" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="e.g. Acme Technologies" required style={inputStyle} />
        </div>
        <div style={formGroup}>
          <label style={labelStyle}>Industry <span style={{ color: '#EF4444' }}>*</span></label>
          <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} required style={inputStyle}>
            <option value="">Select your industry</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={formGroup}>
            <label style={labelStyle}>Team Size <span style={{ color: '#EF4444' }}>*</span></label>
            <select value={form.company_size} onChange={e => setForm({ ...form, company_size: e.target.value })} required style={inputStyle}>
              <option value="">Select</option>
              {companySizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={formGroup}>
            <label style={labelStyle}>Your Role <span style={{ color: '#EF4444' }}>*</span></label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required style={inputStyle}>
              <option value="">Select</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={formGroup}>
          <label style={labelStyle}>Phone Number <span style={{ color: '#EF4444' }}>*</span></label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ ...inputStyle, width: '60px', textAlign: 'center', background: '#F3F4F6', flex: 'none' }}>+91</span>
            <input type="tel" value={form.phone} onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setForm({ ...form, phone: val }); }} placeholder="9876543210" required style={{ ...inputStyle, flex: 1 }} maxLength="10" />
          </div>
        </div>

        <button type="button" onClick={() => setShowOptional(!showOptional)} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '14px', padding: '10px 0', width: '100%', textAlign: 'left' }}>
          {showOptional ? '▼' : '▶'} Tell us more (optional)
        </button>

        {showOptional && (
          <div style={{ background: '#F9FAFB', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <div style={formGroup}>
              <label style={labelStyle}>Website</label>
              <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yourcompany.com" style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={labelStyle}>How did you find BharatQA?</label>
              <select value={form.referral_source} onChange={e => setForm({ ...form, referral_source: e.target.value })} style={inputStyle}>
                <option value="">Select</option>
                {referralSources.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ ...btnStyle, background: submitting ? '#9CA3AF' : '#4F46E5', width: '100%', fontSize: '16px', padding: '14px', marginTop: '10px' }}>
          {submitting ? 'Setting up...' : 'Start Testing'}
        </button>
        <p style={{ textAlign: 'center', color: '#999', fontSize: '12px', marginTop: '15px' }}>You can update this info later in settings</p>
      </form>
    </div>
  );
}

// ===== SETTINGS PAGE =====
function SettingsPage({ company, onUpdate, onLogout }) {
  const [form, setForm] = useState({ company_name: '', industry: '', company_size: '', role: '', phone: '', website: '', referral_source: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDanger, setShowDanger] = useState(false);

  const industries = ['Fintech', 'E-commerce', 'EdTech', 'HealthTech', 'Social Media', 'Gaming', 'SaaS / B2B', 'Logistics', 'Food & Delivery', 'Travel', 'Media & Entertainment', 'Government / GovTech', 'Other'];
  const companySizes = ['Just me', '2-10', '11-50', '51-200', '200+'];
  const roles = ['Founder / CEO', 'CTO / Tech Lead', 'QA Lead / Manager', 'Developer', 'Product Manager', 'Other'];
  const referralSources = ['Google Search', 'Twitter / X', 'LinkedIn', 'Friend / Colleague', 'YouTube', 'Reddit', 'Product Hunt', 'Other'];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(API + '/auth/company/' + company.id);
        const data = await res.json();
        setForm({
          company_name: data.company_name || '', industry: data.industry || '',
          company_size: data.company_size || '', role: data.role || '',
          phone: data.phone || '', website: data.website || '',
          referral_source: data.referral_source || ''
        });
      } catch (err) { console.error('Failed to load profile:', err); }
      setLoading(false);
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.company_name || !form.industry || !form.company_size || !form.role || !form.phone) {
      alert('Please fill all required fields'); return;
    }
    const phoneClean = form.phone.replace(/\D/g, '');
    if (phoneClean.length < 10) { alert('Please enter a valid 10-digit phone number'); return; }

    setSaving(true); setSaved(false);
    try {
      const res = await fetch(API + '/auth/company/' + company.id, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        const updated = { ...company, ...data.company };
        onUpdate(updated);
        localStorage.setItem('bharatqa_company', JSON.stringify(updated));
        setTimeout(() => setSaved(false), 3000);
      } else { alert('Error: ' + (data.error || 'Failed to save')); }
    } catch (err) { alert('Failed to save: ' + err.message); }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    const confirmText = prompt('This will DELETE your account and ALL your tests.\n\nType "DELETE" to confirm:');
    if (confirmText !== 'DELETE') {
      if (confirmText !== null) alert('You must type DELETE exactly to confirm');
      return;
    }
    try {
      const res = await fetch(API + '/auth/company/' + company.id, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { alert('Account deleted.'); onLogout(); }
      else { alert('Error: ' + (data.error || 'Failed to delete')); }
    } catch (err) { alert('Failed to delete: ' + err.message); }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}><p style={{ color: '#666' }}>Loading settings...</p></div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Settings</h2>

      {saved && (
        <div style={{ ...cardStyle, background: '#F0FDF4', borderLeft: '4px solid #10B981', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <span style={{ color: '#065F46', fontWeight: '500' }}>Settings saved successfully!</span>
        </div>
      )}

      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Google Account</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {company.picture && <img src={company.picture} alt="" style={{ width: '55px', height: '55px', borderRadius: '50%', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{company.name}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>{company.email}</div>
          </div>
        </div>
        <p style={{ color: '#999', fontSize: '12px', margin: '12px 0 0 0', fontStyle: 'italic' }}>Email and profile picture are managed by Google</p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Profile</h3>
        <form onSubmit={handleSave}>
          <div style={formGroup}>
            <label style={labelStyle}>Company Name <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="text" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="e.g. Acme Technologies" required style={inputStyle} />
          </div>
          <div style={formGroup}>
            <label style={labelStyle}>Industry <span style={{ color: '#EF4444' }}>*</span></label>
            <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} required style={inputStyle}>
              <option value="">Select your industry</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={formGroup}>
              <label style={labelStyle}>Team Size <span style={{ color: '#EF4444' }}>*</span></label>
              <select value={form.company_size} onChange={e => setForm({ ...form, company_size: e.target.value })} required style={inputStyle}>
                <option value="">Select</option>
                {companySizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={formGroup}>
              <label style={labelStyle}>Your Role <span style={{ color: '#EF4444' }}>*</span></label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required style={inputStyle}>
                <option value="">Select</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={formGroup}>
            <label style={labelStyle}>Phone Number <span style={{ color: '#EF4444' }}>*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ ...inputStyle, width: '60px', textAlign: 'center', background: '#F3F4F6', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+91</span>
              <input type="tel" value={form.phone} onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setForm({ ...form, phone: val }); }} placeholder="9876543210" required style={{ ...inputStyle, flex: 1 }} maxLength="10" />
            </div>
          </div>
          <div style={formGroup}>
            <label style={labelStyle}>Website</label>
            <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yourcompany.com" style={inputStyle} />
          </div>
          <div style={formGroup}>
            <label style={labelStyle}>How did you find BharatQA?</label>
            <select value={form.referral_source} onChange={e => setForm({ ...form, referral_source: e.target.value })} style={inputStyle}>
              <option value="">Select</option>
              {referralSources.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} style={{ ...btnStyle, background: saving ? '#9CA3AF' : '#4F46E5', width: '100%', fontSize: '16px', padding: '14px', marginTop: '10px' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div style={{ ...cardStyle, border: '1px solid #FCA5A5', marginTop: '25px' }}>
        <button type="button" onClick={() => setShowDanger(!showDanger)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '14px', fontWeight: '600', padding: 0, width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Danger Zone</span>
          <span>{showDanger ? '▼' : '▶'}</span>
        </button>
        {showDanger && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #FEE2E2' }}>
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>Log Out</div>
                <div style={{ color: '#999', fontSize: '12px' }}>Sign out of your account</div>
              </div>
              <button onClick={onLogout} style={{ ...btnStyle, background: '#F59E0B', padding: '8px 16px', fontSize: '13px' }}>Log Out</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px', color: '#EF4444' }}>Delete Account</div>
                <div style={{ color: '#999', fontSize: '12px' }}>Permanently delete your account and all tests</div>
              </div>
              <button onClick={handleDeleteAccount} style={{ ...btnStyle, background: '#EF4444', padding: '8px 16px', fontSize: '13px' }}>Delete</button>
            </div>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', color: '#999', fontSize: '12px', marginTop: '20px', marginBottom: '40px' }}>
        Company ID: {company.id}
      </p>
    </div>
  );
}

// ===== COMPANY DASHBOARD =====
function CompanyDashboard({ company }) {
  const [tests, setTests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadTests(); }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(API + '/company/' + company.id + '/tests');
      setTests(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteTest = async (testId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this test and ALL its bug reports?')) return;
    try { await fetch(API + '/tests/' + testId, { method: 'DELETE' }); loadTests(); } catch (err) { console.error(err); }
  };

  if (showForm) return <CreateTestForm company={company} onClose={() => { setShowForm(false); loadTests(); }} />;
  if (selectedTest) return <BugReports test={selectedTest} onClose={() => setSelectedTest(null)} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2>My Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {company.picture && <img src={company.picture} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{company.name}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{company.email}</div>
          </div>
        </div>
      </div>

      <button onClick={() => setShowForm(true)} style={{ ...btnStyle, background: '#10B981', width: '100%', fontSize: '16px', padding: '14px' }}>+ Create New Test</button>

      <h3 style={{ marginTop: '20px' }}>My Tests {!loading && <span style={{ color: '#666', fontWeight: 'normal' }}>({tests.length})</span>}</h3>

      {loading && <p style={{ color: '#666', textAlign: 'center' }}>Loading...</p>}
      {!loading && tests.length === 0 && <div style={{ ...cardStyle, textAlign: 'center', color: '#666' }}>No tests yet. Create one to get started!</div>}

      {tests.map(test => (
        <div key={test.id} style={{ ...cardStyle, cursor: 'pointer' }} onClick={() => setSelectedTest(test)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>{test.app_name}</h4>
              <p style={{ color: '#999', margin: 0, fontSize: '12px' }}>
                {test.apk_file_url ? 'APK uploaded' : 'No APK'} {' | '} {new Date(test.created_at).toLocaleDateString()}
              </p>
            </div>
            <button onClick={(e) => deleteTest(test.id, e)} style={{ ...btnStyle, background: '#EF4444', padding: '5px 10px', fontSize: '12px' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== CREATE TEST =====
function CreateTestForm({ company, onClose }) {
  const [form, setForm] = useState({ app_name: '', instructions: '', apk: null });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data = new FormData();
      data.append('company_name', company.name);
      data.append('company_id', company.id);
      data.append('app_name', form.app_name);
      data.append('instructions', form.instructions);
      if (form.apk) data.append('apk', form.apk);

      const res = await fetch(API + '/tests', { method: 'POST', body: data });
      if (res.ok) { alert('Test created!'); onClose(); }
      else { const err = await res.json(); alert('Error: ' + err.error); }
    } catch (err) { alert('Failed to create test'); }
    setSubmitting(false);
  };

  return (
    <div>
      <h3>Create New Test</h3>
      <div style={{ ...cardStyle, background: '#F0FDF4', marginBottom: '15px' }}>
        <span>Creating as: <strong>{company.name}</strong> ({company.email})</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={formGroup}>
          <label>App Name *</label>
          <input type="text" value={form.app_name} onChange={e => setForm({ ...form, app_name: e.target.value })} required style={inputStyle} placeholder="e.g. MyApp v2.1" />
        </div>
        <div style={formGroup}>
          <label>Test Instructions *</label>
          <textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} required style={{ ...inputStyle, minHeight: '120px' }} placeholder={"What should the tester do?\n\n1. Open the app\n2. Try to login\n3. Navigate to settings"} />
        </div>
        <div style={formGroup}>
          <label>Upload APK (optional)</label>
          <input type="file" accept=".apk" onChange={e => setForm({ ...form, apk: e.target.files[0] })} style={inputStyle} />
        </div>
        <button type="submit" disabled={submitting} style={{ ...btnStyle, background: submitting ? '#9CA3AF' : '#10B981', width: '100%' }}>{submitting ? 'Creating...' : 'Create Test'}</button>
        <button type="button" onClick={onClose} style={{ ...btnStyle, background: '#6B7280', width: '100%', marginTop: '10px' }}>Cancel</button>
      </form>
    </div>
  );
}

// ===== BUG REPORTS =====
function BugReports({ test, onClose }) {
  const [bugs, setBugs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBugs = async () => { try { const res = await fetch(API + '/tests/' + test.id + '/bugs'); setBugs(await res.json()); } catch (err) { console.error(err); } setLoading(false); };
  const loadStats = async () => { try { const res = await fetch(API + '/tests/' + test.id + '/stats'); setStats(await res.json()); } catch (err) { console.error(err); } };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadBugs(); loadStats(); }, []);

  const deleteBug = async (bugId) => {
    if (!window.confirm('Delete this bug report?')) return;
    try { await fetch(API + '/bugs/' + bugId, { method: 'DELETE' }); loadBugs(); loadStats(); } catch (err) { console.error(err); }
  };

  const exportReport = () => {
    let report = 'BharatQA Test Report\n';
    report += 'App: ' + test.app_name + '\n';
    report += 'Company: ' + test.company_name + '\n';
    report += 'Total Reports: ' + bugs.length + '\n\n';
    bugs.forEach((bug, i) => {
      report += '--- Report #' + (i + 1) + ' ---\n';
      report += 'Title: ' + bug.bug_title + '\n';
      report += 'Severity: ' + (bug.severity || 'N/A').toUpperCase() + '\n';
      report += 'Description:\n' + (bug.bug_description || 'N/A') + '\n';
      if (bug.ai_analysis) report += '\nAI Analysis:\n' + bug.ai_analysis + '\n';
      report += '\n';
    });
    const blob = new Blob([report], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = test.app_name.replace(/\s+/g, '_') + '-report.txt';
    a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={onClose} style={btnStyle}>Back</button>
        <button onClick={exportReport} style={{ ...btnStyle, background: '#10B981' }}>Export</button>
        <button onClick={() => { loadBugs(); loadStats(); }} style={{ ...btnStyle, background: '#7C3AED' }}>Refresh</button>
      </div>

      <h3 style={{ marginTop: '15px' }}>{test.app_name}</h3>
      <p style={{ color: '#666', marginTop: '-5px' }}>by {test.company_name}</p>

      {stats && (
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', textAlign: 'center' }}>
          <StatBox value={stats.total_bugs} label="Bugs" color="#4F46E5" />
          <StatBox value={stats.total_testers} label="Testers" color="#7C3AED" />
          <StatBox value={stats.critical_bugs} label="Critical" color="#EF4444" />
          <StatBox value={stats.high_bugs} label="High" color="#F59E0B" />
          <StatBox value={Math.round(stats.avg_duration || 0) + 's'} label="Avg Time" color="#10B981" />
        </div>
      )}

      {loading && <p style={{ color: '#666' }}>Loading...</p>}
      {!loading && bugs.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No reports yet.</p>}

      {bugs.map(bug => {
        let deviceStats = null;
        try { deviceStats = typeof bug.device_stats === 'string' ? JSON.parse(bug.device_stats) : bug.device_stats; } catch (e) { }
        const sevColors = { critical: '#EF4444', high: '#F59E0B', medium: '#3B82F6', low: '#10B981' };
        const borderColor = sevColors[bug.severity] || '#10B981';

        return (
          <div key={bug.id} style={{ ...cardStyle, borderLeft: '4px solid ' + borderColor }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <h4 style={{ margin: 0, flex: 1 }}>{bug.bug_title}</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ background: borderColor, color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{bug.severity}</span>
                <button onClick={() => deleteBug(bug.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>X</button>
              </div>
            </div>

            <pre style={{ margin: '10px 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', color: '#374151' }}>{bug.bug_description}</pre>

            <div style={{ color: '#666', fontSize: '13px' }}>
              {bug.tester_name} | {bug.device_info} | {bug.test_duration || 0}s | {new Date(bug.created_at).toLocaleString()}
            </div>

            {deviceStats && (
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginTop: '10px', fontSize: '13px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>Battery: {deviceStats.batteryStart}% to {deviceStats.batteryEnd}% <span style={{ color: deviceStats.batteryDrain > 5 ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>({deviceStats.batteryDrain}%)</span></div>
                  <div>Network: {deviceStats.networkType} ({deviceStats.networkSpeed})</div>
                  <div>Device: {deviceStats.deviceModel}</div>
                  <div>Android: {deviceStats.androidVersion}</div>
                  {deviceStats.city && deviceStats.city !== 'Unknown' && (
                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #E5E7EB', paddingTop: '4px', marginTop: '4px' }}>
                      Location: <strong>{deviceStats.city}, {deviceStats.state}</strong>
                      {deviceStats.latitude !== 0 && (
                        <a href={'https://www.google.com/maps?q=' + deviceStats.latitude + ',' + deviceStats.longitude} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', fontSize: '12px', marginLeft: '10px' }}>Map</a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {bug.ai_analysis && (
              <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #F0FDF4)', padding: '16px', borderRadius: '8px', marginTop: '10px', border: '1px solid #C7D2FE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ color: '#4F46E5' }}>AI Analysis</strong>
                  <span style={{ background: '#4F46E5', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>{bug.ai_model || 'Gemini'}</span>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: '1.6', color: '#374151', fontSize: '13px' }}>{bug.ai_analysis}</pre>
              </div>
            )}

            {!bug.ai_analysis && bug.recording_url && (
              <button onClick={async () => {
                try { const r = await fetch(API + '/bugs/' + bug.id + '/analyze', { method: 'POST' }); const data = await r.json(); if (data.cached) loadBugs(); else alert('Analysis started! Click Refresh in 30-60s.'); } catch (err) { alert('Failed'); }
              }} style={{ ...btnStyle, background: '#7C3AED', width: '100%', marginTop: '10px' }}>Analyze with AI</button>
            )}

            {bug.recording_url && (
              <div style={{ marginTop: '10px' }}>
                <strong style={{ fontSize: '13px' }}>Screen Recording:</strong>
                <video src={bug.recording_url} controls style={{ width: '100%', maxWidth: '500px', borderRadius: '8px', marginTop: '5px' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== STAT BOX =====
function StatBox({ value, label, color }) {
  return (
    <div>
      <div style={{ fontSize: '22px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#666' }}>{label}</div>
    </div>
  );
}

// ===== TESTER DASHBOARD =====
function TesterDashboard() {
  const [testerName, setTesterName] = useState('');
  const [earnings, setEarnings] = useState(null);
  const [searched, setSearched] = useState(false);

  const lookupEarnings = async () => {
    if (!testerName.trim()) return;
    try { const res = await fetch(API + '/earnings/' + encodeURIComponent(testerName.trim())); setEarnings(await res.json()); setSearched(true); } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h2>Tester Dashboard</h2>
      <div style={cardStyle}>
        <h3>How to Test</h3>
        <ol style={{ lineHeight: '2', color: '#374151' }}>
          <li>Install the <strong>BharatQA Android app</strong></li>
          <li>Open app - Enter your name - Pick a test</li>
          <li>Tap <strong>START</strong> - Test the app normally</li>
          <li>Tap <strong>STOP</strong> - Report uploads automatically</li>
          <li>Earn <strong>50</strong> per test!</li>
        </ol>
      </div>
      <div style={{ ...cardStyle, marginTop: '15px' }}>
        <h3>Check Your Earnings</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Your tester name" value={testerName} onChange={e => setTesterName(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookupEarnings()} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={lookupEarnings} style={btnStyle}>Check</button>
        </div>
        {searched && earnings && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
              <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>{earnings.total_earned}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
              </div>
              <div style={{ background: '#FEF3C7', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>{earnings.pending_amount}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Pending</div>
              </div>
              <div style={{ background: '#EEF2FF', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4F46E5' }}>{earnings.tests_completed}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Tests</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== ADMIN =====
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBugs, setRecentBugs] = useState([]);

  useEffect(() => {
    fetch(API + '/admin/stats').then(r => r.json()).then(setStats).catch(console.error);
    fetch(API + '/admin/all-bugs').then(r => r.json()).then(bugs => setRecentBugs(bugs.slice(0, 10))).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Tests', value: stats.total_tests, color: '#4F46E5' },
            { label: 'Bugs', value: stats.total_bugs, color: '#7C3AED' },
            { label: 'Testers', value: stats.total_testers, color: '#10B981' },
            { label: 'Companies', value: stats.total_companies || 0, color: '#3B82F6' },
            { label: 'Earnings', value: stats.total_earnings, color: '#F59E0B' },
            { label: 'Critical', value: stats.critical_bugs, color: '#EF4444' }
          ].map((item, i) => (
            <div key={i} style={{ ...cardStyle, textAlign: 'center', borderTop: '3px solid ' + item.color }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}
      <h3 style={{ marginTop: '20px' }}>Recent Reports</h3>
      {recentBugs.map(bug => (
        <div key={bug.id} style={{ ...cardStyle, borderLeft: '4px solid ' + ({ critical: '#EF4444', high: '#F59E0B', medium: '#3B82F6', low: '#10B981' }[bug.severity] || '#10B981') }}>
          <strong>{bug.bug_title}</strong>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '13px' }}>
            {bug.app_name} | {bug.tester_name} | {new Date(bug.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

// ===== STYLES =====
const navBtn = { color: 'white', border: 'none', padding: '8px 16px', margin: '0 4px', borderRadius: '5px 5px 0 0', cursor: 'pointer', fontSize: '14px', background: 'transparent' };
const btnStyle = { background: '#4F46E5', color: 'white', border: 'none', padding: '10px 20px', margin: '5px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
const cardStyle = { background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '15px', marginTop: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };
const formGroup = { marginBottom: '15px', textAlign: 'left' };
const inputStyle = { width: '100%', padding: '10px 12px', marginTop: '5px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' };
const labelStyle = { fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' };

export default App;