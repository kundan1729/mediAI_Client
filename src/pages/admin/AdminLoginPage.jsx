import { useState } from 'react';
import { adminLogin } from '../../services/api';

const C = {
  pageBg:     '#D6E6FF',
  cardBg:     '#EAF3FF',
  cardBorder: '#C7DEFF',
  inputBg:    '#F5F9FF',
  accent:     '#2563EB',
  accentDark: '#1A3A6B',
  text:       '#1A2E4A',
  textMuted:  '#5A7ABF',
  label:      '#4A6FA5',
};

const AdminLoginPage = ({ onSuccess, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await adminLogin(username.trim(), password.trim());
      const token = data.token || data;
      localStorage.setItem('token', token);
      onSuccess();
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .login-input:focus { border-color: #2563EB !important; outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
        .login-btn:hover:not(:disabled) { background: #1A3A6B !important; transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .back-link:hover { color: #1A3A6B !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s ease-out' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', background: C.accent,
            borderRadius: '14px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
          }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 16 16">
              <path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '28px', color: C.accentDark,
            margin: '0 0 6px 0',
          }}>Admin Portal</h1>
          <p style={{ color: C.textMuted, fontSize: '14px', margin: 0 }}>
            Sign in to manage doctors and settings
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
          borderRadius: '22px', padding: '36px 32px',
        }}>
          <form onSubmit={handleLogin}>

            {/* Username */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 700,
                color: C.label, textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '8px',
              }}>
                Username
              </label>
              <input
                className="login-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                style={{
                  width: '100%', background: C.inputBg,
                  border: `1.5px solid ${C.cardBorder}`,
                  borderRadius: '12px', padding: '13px 16px',
                  fontSize: '15px', color: C.text,
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 700,
                color: C.label, textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '8px',
              }}>
                Password
              </label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: '100%', background: C.inputBg,
                  border: `1.5px solid ${C.cardBorder}`,
                  borderRadius: '12px', padding: '13px 16px',
                  fontSize: '15px', color: C.text,
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#FFF1F2', border: '1.5px solid #FECDD3',
                borderRadius: '10px', padding: '12px 14px',
                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.3" />
                  <path d="M8 5v3M8 10.5v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <p style={{ color: '#9F1239', fontSize: '13px', margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              className="login-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: C.accent, color: '#fff',
                border: 'none', borderRadius: '12px',
                padding: '14px', fontSize: '15px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s',
                boxShadow: '0 3px 12px rgba(37,99,235,0.25)',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '18px', height: '18px',
                    border: '2.5px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>
        </div>

        {/* Back link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          <button
            className="back-link"
            onClick={() => onNavigate('home')}
            style={{
              background: 'transparent', border: 'none',
              color: C.textMuted, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '14px',
              fontWeight: 500, transition: 'color 0.15s',
            }}
          >
            ← Back to home
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;