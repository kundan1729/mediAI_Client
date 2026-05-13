import { useState } from 'react';

const C = {
  pageBg:     '#D6E6FF',
  cardBg:     '#EAF3FF',
  cardBorder: '#C7DEFF',
  cardHover:  '#DCEBFF',
  heroBg:     '#C0D8FF',
  heroBorder: '#A8C8FF',
  accent:     '#2563EB',
  accentDark: '#1A3A6B',
  text:       '#1A2E4A',
  textSub:    '#2A5298',
  textMuted:  '#5A7ABF',
};

const HomePage = ({ onNavigate }) => {
  const features = [
    { icon: '🧠', title: 'AI-Powered Diagnosis',   desc: 'Advanced language model analyzes your symptoms and identifies possible conditions with clinical accuracy.' },
    { icon: '⚡', title: 'Instant Results',          desc: 'Receive severity assessment, specialist mapping, and doctor recommendations within seconds.' },
    { icon: '👨‍⚕️', title: 'Available Doctors',       desc: 'View real-time availability of specialists from your network and plan your consultation.' },
    { icon: '📊', title: 'Analytics Dashboard',      desc: 'Admins can review comprehensive logs, filter by severity or specialization, and monitor trends.' },
    { icon: '🔒', title: 'Secure & Private',         desc: 'Your symptom data is processed securely and never shared with third parties without your consent.' },
    { icon: '📱', title: 'Works Everywhere',         desc: 'Fully responsive design that works on desktop, tablet, and mobile with a seamless experience.' },
  ];

  const steps = [
    { num: '01', title: 'Enter symptoms',  desc: 'Type your symptoms in plain language' },
    { num: '02', title: 'AI analyzes',     desc: 'Our AI engine processes your input'   },
    { num: '03', title: 'Get diagnosis',   desc: 'Receive condition & severity report'  },
    { num: '04', title: 'See doctors',     desc: 'View available specialist doctors'      },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        .hero-cta:hover { background: #1A3A6B !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.35) !important; }
        .feat-card:hover { background: #DCEBFF !important; border-color: #A8C8FF !important; transform: translateY(-2px); }
        .step-card:hover { background: #DCEBFF !important; border-color: #A8C8FF !important; }
      `}</style>

      {/* ── Hero ── */}
      <div style={{
        background: `linear-gradient(140deg, #B8D4FF 0%, #D6E6FF 60%, #EAF3FF 100%)`,
        border: `2px solid ${C.heroBorder}`,
        borderRadius: '24px',
        padding: '64px 56px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circle */}
        <div style={{
          position: 'absolute', right: '-60px', top: '-60px',
          width: '340px', height: '340px',
          background: 'rgba(37,99,235,0.06)', borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{ width: '9px', height: '9px', background: C.accent, borderRadius: '50%' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            AI-Powered Telemedicine Platform
          </span>
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 'clamp(36px, 5vw, 56px)',
          color: C.accentDark, lineHeight: 1.15,
          margin: '0 0 20px 0', maxWidth: '620px',
        }}>
          Your intelligent<br />
          <em style={{ color: C.accent }}>medical assistant</em>
        </h1>

        <p style={{
          color: C.textSub, fontSize: '17px', lineHeight: 1.75,
          maxWidth: '540px', margin: '0 0 40px 0',
        }}>
          Describe your symptoms and receive an AI-powered condition analysis,
          severity assessment, and specialist doctor recommendations — instantly.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            className="hero-cta"
            onClick={() => onNavigate('analysis')}
            style={{
              background: C.accent, color: '#fff',
              border: 'none', borderRadius: '14px',
              padding: '16px 40px', fontSize: '16px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
            }}
          >
            Start symptom analysis
            <svg width="16" height="16" fill="none" viewBox="0 0 14 14">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            style={{
              background: 'transparent', color: C.accentDark,
              border: `2px solid ${C.heroBorder}`, borderRadius: '14px',
              padding: '16px 32px', fontSize: '16px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.cardHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            View Dashboard
          </button>
        </div>
      </div>

      {/* ── Feature cards ── */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '26px', color: C.accentDark, margin: '0 0 20px 0' }}>
          Why choose MediAI?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="feat-card"
              style={{
                background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
                borderRadius: '18px', padding: '28px 24px',
                display: 'flex', gap: '18px', alignItems: 'flex-start',
                transition: 'all 0.2s', cursor: 'default',
              }}
            >
              <div style={{
                width: '52px', height: '52px', flexShrink: 0,
                background: '#D6E6FF', border: `1.5px solid ${C.cardBorder}`,
                borderRadius: '14px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '24px',
              }}>{f.icon}</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '15px', color: C.text, margin: '0 0 8px 0' }}>{f.title}</p>
                <p style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      
        

      {/* ── How it works ── */}
      <div style={{
        background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
        borderRadius: '20px', padding: '36px 32px',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '24px', color: C.accentDark, margin: '0 0 6px 0' }}>
          How it works
        </h2>
        <p style={{ color: C.textMuted, fontSize: '14px', margin: '0 0 28px 0' }}>
          Four simple steps from symptom to specialist
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {steps.map((s, i) => (
            <div
              key={i}
              className="step-card"
              style={{
                background: '#D6E6FF', border: `1.5px solid ${C.cardBorder}`,
                borderRadius: '16px', padding: '24px 20px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontSize: '28px', fontWeight: 700, color: C.accent,
                fontFamily: "'DM Serif Display',Georgia,serif",
                marginBottom: '12px', lineHeight: 1,
              }}>{s.num}</div>
              <p style={{ fontWeight: '600', fontSize: '14px', color: C.text, margin: '0 0 6px 0' }}>{s.title}</p>
              <p style={{ fontSize: '12px', color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onNavigate('login')}
        style={{
          background: 'transparent', color: C.textMuted,
          border: 'none', cursor: 'pointer',
          fontSize: '14px', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = C.accent; }}
        onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; }}
      >
          Are you an admin? Login
        </button>
      </div>
    
  );
};

export default HomePage;