import { useState } from 'react';
import { adminLogin } from '../services/api';

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

const LoginPage = ({ onSuccess, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true); setError('');
    try {
      const session = await adminLogin(username.trim(), password.trim());
      // session expected to include { token, username, role, displayName }
      onSuccess(session);
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'DM Sans', -apple-system, sans-serif",
    }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(16px);} to { opacity:1; transform:translateY(0);} } .login-input:focus { border-color: #2563EB !important; outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }`}</style>
      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.38s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ width: '52px', height: '52px', background: C.accent, borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 16 16"><path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '26px', color: C.accentDark, margin: '0 0 6px 0' }}>Admin Login</h1>
          <p style={{ color: C.textMuted, fontSize: '13px', margin: 0 }}>Sign in with your administrator credentials</p>
        </div>

        <div style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '20px', padding: '28px 22px' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.label, marginBottom: '8px' }}>Username</label>
              <input className="login-input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" style={{ width: '100%', background: C.inputBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '10px', padding: '12px 14px', fontSize: '14px' }} />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.label, marginBottom: '8px' }}>Password</label>
              <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" style={{ width: '100%', background: C.inputBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '10px', padding: '12px 14px', fontSize: '14px' }} />
            </div>

            {error && (<div style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', color: '#9F1239' }}>{error}</div>)}

            <button type="submit" disabled={loading} style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign in as admin'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '14px' }}>
          <button onClick={() => onNavigate('home')} style={{ background: 'transparent', border: 'none', color: C.textMuted, cursor: 'pointer' }}>← Back to home</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
