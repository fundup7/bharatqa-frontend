import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { apiClient } from '../utils/api';
import logo from '../Logo/Logo.png';
import './HomePage.css';

/* ── tiny hook: fade-up on scroll ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.unobserve(el); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}


export default function HomePage({ company, onLogin, onNavigate }) {
  const [health, setHealth] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [latestApk, setLatestApk] = useState(null);
  const [dlRef, dlVis] = useReveal(0.15);

  useEffect(() => {
    apiClient.getHealth().then(setHealth).catch(() => setHealth(null));
    // Fetch latest APK link
    apiClient.getLatestAppVersion()
      .then(data => { if (data?.latest?.apk_url) setLatestApk(data.latest); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [heroRef, heroVis] = useReveal(0.1);
  const [numRef, numVis] = useReveal(0.2);
  const [painRef, painVis] = useReveal(0.15);
  const [stepsRef, stepsVis] = useReveal(0.1);
  const [featRef, featVis] = useReveal(0.1);
  const [ctaRef, ctaVis] = useReveal(0.2);

  return (
    <div className="hp">

      {/* ── Navbar ── */}
      <nav className={`hp-nav ${navScrolled ? 'hp-nav--scrolled' : ''}`}>
        <div className="hp-nav-inner">
          <div className="hp-logo">
            <img src={logo} alt="BharatQA" className="hp-logo-img" />
          </div>
          <div className="hp-nav-right">
            <div className="hp-nav-status">
              <span className={`hp-dot ${health ? 'on' : ''}`} />
              <span className="hp-dot-label">{health ? 'All systems online' : 'Connecting…'}</span>
            </div>
            {company && (
              <button className="hp-nav-dash" onClick={() => onNavigate('dashboard')}>
                Dashboard →
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="hp-hero">
        <div className="hp-glow-blob hp-glow-blob--1" />
        <div className="hp-glow-blob hp-glow-blob--2" />
        <div ref={heroRef} className={`hp-hero-inner reveal ${heroVis ? 'reveal--on' : ''}`}>
          <div className="hp-hero-badge">For Android developers who ship fast</div>
          <h1 className="hp-h1">
            Stop guessing why<br />
            your app <em>crashes</em><br />
            on real phones.
          </h1>
          <p className="hp-sub">
            You build on an emulator. Your users are on ₹8K Redmis with flaky
            networks and Android 10. BharatQA sends your APK to real testers
            across India — screen recordings, device telemetry, and AI bug
            reports before your users find them.
          </p>
          <div className="hp-cta">
            {company ? (
              <button className="hp-btn hp-btn--pulse" onClick={() => onNavigate('dashboard')}>
                Open Dashboard →
              </button>
            ) : (
              <div className="hp-login-wrap">
                <GoogleLogin
                  onSuccess={onLogin}
                  onError={() => alert('Login failed')}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="280"
                />
                <p className="hp-login-note">
                  Get started in 2 minutes · No credit card required
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="hp-hero-divider" />
      </header>

      {/* ── Numbers strip ── */}
      <section className="hp-numbers">
        <div ref={numRef} className={`hp-numbers-inner reveal ${numVis ? 'reveal--on' : ''}`}>
          {[
            { display: '50+', label: 'Real device types' },
            { display: '<2 days', label: 'Time to first report' },
            { display: '100+', label: 'Testers paid per session' },
            { display: '24/7', label: 'Tester availability' },
          ].map((d, i) => (
            <div key={i} className="hp-num-block">
              <strong>{d.display}</strong>
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Real testers section ── */}
      <section className="hp-testers-section">
        <div className="hp-testers-inner">
          <div className="hp-testers-left">
            <div className="hp-hero-badge" style={{ marginBottom: 20 }}>Human-powered testing</div>
            <h2 className="hp-section-title" style={{ textAlign: 'left', margin: '0 0 16px' }}>
              Real people.<br />Real phones.<br /><em style={{ color: 'var(--hp-accent)', fontStyle: 'normal' }}>Real feedback.</em>
            </h2>
            <p className="hp-testers-desc">
              We don't simulate users — we pay them. Every tester on BharatQA is a real person
              in India, using their own Android phone, earning money for every session they complete.
            </p>
            <div className="hp-testers-perks">
              <div className="hp-tester-perk">
                <span className="hp-tester-perk-icon">🙋</span>
                <div>
                  <strong>Verified humans, not bots</strong>
                  <span>Each tester is onboarded and verified before they can accept jobs. No automation, no scripts.</span>
                </div>
              </div>
              <div className="hp-tester-perk">
                <span className="hp-tester-perk-icon">💰</span>
                <div>
                  <strong>We pay testers fairly</strong>
                  <span>Testers earn per completed test session. We're transparent about this — it's how we get motivated, honest feedback.</span>
                </div>
              </div>
              <div className="hp-tester-perk">
                <span className="hp-tester-perk-icon">📱</span>
                <div>
                  <strong>Their own devices</strong>
                  <span>Testers use the phones they actually own — budget Redmis, mid-range Samsungs, older Motorolas. Real India, not a lab.</span>
                </div>
              </div>
              <div className="hp-tester-perk">
                <span className="hp-tester-perk-icon">🗣️</span>
                <div>
                  <strong>Qualitative feedback too</strong>
                  <span>Beyond crash reports — testers record their reactions, confusion, and delight. You hear what real users think.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hp-testers-right">
            <div className="hp-tester-card-stack">
              <div className="hp-tester-card">
                <div className="hp-tester-avatar">RK</div>
                <div className="hp-tester-info">
                  <strong>Rahul K.</strong>
                  <span>Bengaluru · Redmi Note 11 · Android 12</span>
                </div>
                <div className="hp-tester-earning">₹120 earned</div>
              </div>
              <div className="hp-tester-card">
                <div className="hp-tester-avatar hp-tester-avatar--2">PM</div>
                <div className="hp-tester-info">
                  <strong>Priya M.</strong>
                  <span>Pune · Samsung M31 · Android 11</span>
                </div>
                <div className="hp-tester-earning">₹95 earned</div>
              </div>
              <div className="hp-tester-card">
                <div className="hp-tester-avatar hp-tester-avatar--3">AS</div>
                <div className="hp-tester-info">
                  <strong>Amit S.</strong>
                  <span>Jaipur · Moto G62 · Android 12</span>
                </div>
                <div className="hp-tester-earning">₹140 earned</div>
              </div>
              <div className="hp-tester-live-badge">
                <span className="hp-dot on" style={{ width: 8, height: 8 }} />
                3 testers live right now
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile-only tester CTA ── */}
      <div className="hp-mobile-dl-banner">
        <p>📱 <strong>Earn money testing apps.</strong> Download the BharatQA Tester App.</p>
        {latestApk ? (
          <a href={latestApk.apk_url} className="hp-btn hp-btn--pulse" style={{ textDecoration: 'none' }}>
            ⬇️ Download APK
          </a>
        ) : (
          <span className="hp-dl-card-loading">Loading download link…</span>
        )}
      </div>

      {/* ── Become a Tester / Download Section ── */}
      <section className="hp-dl-section">
        <div ref={dlRef} className={`hp-dl-grid reveal ${dlVis ? 'reveal--on' : ''}`}>
          <div className="hp-dl-left">
            <div className="hp-hero-badge" style={{ marginBottom: 16 }}>📱 For Testers</div>
            <h2 className="hp-section-title" style={{ textAlign: 'left', marginBottom: 16 }}>
              Earn money.<br />Test real apps.<br /><em style={{ color: 'var(--hp-accent)', fontStyle: 'normal' }}>From your phone.</em>
            </h2>
            <p>
              Join BharatQA as a tester. Download the app, register with your Google account,
              and start earning ₹50–₹200 per test session — right from your Android phone.
            </p>
            <ul className="hp-dl-perks">
              {[
                ['✅', 'Free to join — no investment required'],
                ['💳', 'Instant UPI payments after approval'],
                ['📱', 'Works on any Android phone (Android 8+)'],
                ['🎯', 'Get matched to tests based on your device'],
              ].map(([icon, text], i) => (
                <li key={i}>
                  <span>{icon}</span> {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="hp-dl-right">
            <div className="hp-dl-card">
              <div className="hp-dl-card-icon">📲</div>
              <h3>BharatQA Tester App</h3>
              {latestApk ? (
                <>
                  <p className="hp-dl-card-version">
                    Version {latestApk.version_name} · Android APK
                  </p>
                  <a
                    href={latestApk.apk_url}
                    className="hp-btn hp-btn--pulse"
                    style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px', fontSize: '0.95rem', marginBottom: 16 }}
                  >
                    ⬇️ Download APK
                  </a>
                </>
              ) : (
                <p className="hp-dl-card-loading">
                  Download link loading…<br />Contact us if it doesn't appear.
                </p>
              )}
              <div className="hp-dl-card-note">
                ⚠️ Enable "Install from unknown sources" in your<br />Android settings before installing.
              </div>
            </div>
            <div className="hp-dl-contact">
              <span>📞 +91 6361434273</span>
              <span>·</span>
              <span>fundup3@gmail.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain points ── */}
      <section className="hp-section--pain">
        <div ref={painRef} className={`hp-pain-inner reveal ${painVis ? 'reveal--on' : ''}`}>
          <h2 className="hp-section-title">Sound familiar?</h2>
          <p className="hp-section-sub">
            Every Android dev has shipped something that worked perfectly on their machine.
          </p>
          <div className="hp-pain-grid">
            {[
              {
                emoji: '😤',
                title: '"Works on my machine"',
                text: 'Your app runs perfectly on your Pixel — then crashes on a Samsung M31 running Android 11 with 2 GB free RAM.',
              },
              {
                emoji: '🔥',
                title: '1-star reviews before you know',
                text: 'Users don\'t file bug reports. They leave angry Play Store reviews. You find out too late.',
              },
              {
                emoji: '💸',
                title: 'Device labs are expensive',
                text: 'BrowserStack and AWS Device Farm bill hundreds of dollars a month. Way too much for a bootstrapped team.',
              },
              {
                emoji: '🤷',
                title: 'Crashlytics shows the what, not the why',
                text: 'You see a stack trace, but you don\'t see what the user was actually doing when it broke.',
              },
            ].map((p, i) => (
              <div key={i} className="hp-pain-card" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="hp-pain-emoji">{p.emoji}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="hp-section">
        <div ref={stepsRef} className={`reveal ${stepsVis ? 'reveal--on' : ''}`}>
          <h2 className="hp-section-title">How it works</h2>
          <p className="hp-section-sub">Three steps from APK to actionable bug reports.</p>
          <div className="hp-steps">
            {[
              {
                n: 'Step 01',
                title: 'Upload your APK',
                text: 'Sign in with Google, drop your APK, and write simple test instructions — like "sign up, add an item to cart, checkout."',
              },
              {
                n: 'Step 02',
                title: 'Real people test on real phones',
                text: 'Testers across Indian cities install your app on their own devices — budget phones, mid-range, flagships — and record their entire session.',
              },
              {
                n: 'Step 03',
                title: 'AI turns recordings into bug reports',
                text: 'Gemini AI watches every recording, detects crashes, UI glitches, and slow screens, and generates prioritised bug reports you can act on immediately.',
              },
            ].map((s, i) => (
              <div key={i} className="hp-step" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="hp-step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="hp-section--alt">
        <div ref={featRef} className={`reveal ${featVis ? 'reveal--on' : ''}`}>
          <h2 className="hp-section-title">What you get</h2>
          <p className="hp-section-sub">Everything you need to ship with confidence.</p>
          <ul className="hp-features">
            {[
              ['📹', 'Screen recordings', 'Full video of every tester session — see exactly what happened, not just a stack trace.'],
              ['📊', 'Device telemetry', 'Battery, RAM, CPU, network type, and Android version captured automatically.'],
              ['📍', 'Geo-verified testers', 'Real testers verified across Tier-1, Tier-2, and Tier-3 Indian cities.'],
              ['💥', 'Crash detection', 'Automatic ANR and crash capture with stack traces and full device context.'],
              ['🤖', 'AI bug reports', 'Gemini-powered analysis that tags severity, suggests root causes, and groups duplicates.'],
              ['📤', 'Export & share', 'One-click export to Slack, Jira, or plain CSV — plug into your existing workflow.'],
            ].map(([icon, title, desc], i) => (
              <li key={i} style={{ animationDelay: `${i * 60}ms` }}>
                <span className="hp-feat-icon">{icon}</span>
                <strong>{title}</strong>
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="hp-section">
        <div className={`reveal ${featVis ? 'reveal--on' : ''}`}>
          <h2 className="hp-section-title">Transparent Pricing</h2>
          <p className="hp-section-sub">Simple pay-as-you-go pricing based on the scale you need.</p>
          <div className="hp-pain-grid" style={{ marginTop: 40 }}>
            <div className="hp-pain-card hp-pricing-card">
              <span className="hp-pain-emoji">🚀</span>
              <h3>Essential</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '15px 0', color: 'var(--hp-accent)' }}>₹2,000</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>✓ <strong>20</strong> Real Testers</li>
                <li>✓ <strong>1</strong> Testing Iteration</li>
                <li>✓ Basic Demographics</li>
                <li>✓ Standard Support</li>
              </ul>
              <button
                className="hp-btn hp-btn--outline"
                style={{ width: '100%' }}
                onClick={() => {
                  if (company) onNavigate('dashboard');
                  else document.querySelector('.hp-login-wrap button')?.click();
                }}
              >
                Get Started
              </button>
            </div>

            <div className="hp-pain-card hp-pricing-card" style={{ border: '1px solid var(--hp-accent)', transform: 'scale(1.05)' }}>
              <div className="hp-pop-badge">MOST POPULAR</div>
              <span className="hp-pain-emoji">🔥</span>
              <h3>Comprehensive</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '15px 0', color: 'var(--hp-accent)' }}>₹4,000</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>✓ <strong>40</strong> Real Testers</li>
                <li>✓ <strong>1</strong> Testing Iteration</li>
                <li>✓ Advanced Targeting</li>
                <li>✓ Priority Support</li>
              </ul>
              <button
                className="hp-btn hp-btn--pulse"
                style={{ width: '100%' }}
                onClick={() => {
                  if (company) onNavigate('dashboard');
                  else document.querySelector('.hp-login-wrap button')?.click();
                }}
              >
                Get Started
              </button>
            </div>

            <div className="hp-pain-card hp-pricing-card">
              <span className="hp-pain-emoji">⚡</span>
              <h3>Intensive</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '15px 0', color: 'var(--hp-accent)' }}>₹6,000</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>✓ <strong>40</strong> Real Testers</li>
                <li>✓ <strong>2</strong> Testing Iterations</li>
                <li>✓ Premium Targeting</li>
                <li>✓ 24/7 Dedicated Support</li>
              </ul>
              <button
                className="hp-btn hp-btn--outline"
                style={{ width: '100%' }}
                onClick={() => {
                  if (company) onNavigate('dashboard');
                  else document.querySelector('.hp-login-wrap button')?.click();
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="hp-section--cta">
        <div ref={ctaRef} className={`hp-cta-inner reveal ${ctaVis ? 'reveal--on' : ''}`}>
          <div>
            <h2>Ship with confidence.<br />Know it works everywhere.</h2>
            <p>
              Join developers who catch real-device bugs before their users do.
            </p>
          </div>
          <div className="hp-cta-right">
            {company ? (
              <button className="hp-btn hp-btn--light" onClick={() => onNavigate('dashboard')}>
                Go to Dashboard →
              </button>
            ) : (
              <div className="hp-login-wrap">
                <GoogleLogin
                  onSuccess={onLogin}
                  onError={() => alert('Login failed')}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="280"
                />
                <p className="hp-login-note" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No credit card required
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-col">
            <div className="hp-logo hp-logo--footer">
              <img src={logo} alt="BharatQA" className="hp-logo-img hp-logo-img--footer" />
            </div>
            <p className="hp-footer-tagline">
              Crowdsourced QA testing for Android apps.<br />Built for Indian developers.
            </p>
          </div>
          <div className="hp-footer-col">
            <h4>Office</h4>
            <address>
              Shadat Colony, Gudihal Road,<br />
              Vishal Nagar, Hubballi
            </address>
          </div>
          <div className="hp-footer-col">
            <h4>Contact</h4>
            <p><a href="tel:+916361434273">+91 6361434273</a></p>
            <p><a href="tel:+918123548635">+91 8123548635</a></p>
            <p><a href="mailto:fundup3@gmail.com">fundup3@gmail.com</a></p>
          </div>
        </div>
        <div className="hp-footer-bottom">
          <span>© {new Date().getFullYear()} BharatQA. All rights reserved.</span>
          <span>Made in India 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
}