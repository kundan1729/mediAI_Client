import { useState, useEffect } from 'react';
import { getAdminProfile, changePassword } from '../../services/api';
import ErrorBox from '../../components/ErrorBox';

const C = {
  cardBg: '#EAF3FF',
  cardBorder: '#C7DEFF',
  accent: '#2563EB',
  accentDark: '#1A3A6B',
  text: '#1A2E4A',
  textMuted: '#5A7ABF',
  label: '#4A6FA5',
};

const SettingsPage = ({ onShowToast }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getAdminProfile();
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Please fill in every password field.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setUpdateLoading(true);
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      onShowToast('Password changed successfully.', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Password update failed.');
      onShowToast(err.message || 'Failed to change password', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted }}>
        <div style={{ fontSize: '14px' }}>Loading admin settings...</div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        .field-input:focus { border-color: #2563EB !important; outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
        .submit-btn:hover:not(:disabled) { background: #1A3A6B !important; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '36px', color: C.accentDark, margin: '0 0 8px 0' }}>Admin Settings</h1>
          <p style={{ color: C.textMuted, margin: 0 }}>Manage your account and security settings</p>
        </div>

        {/* Admin Profile Card */}
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '22px', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 20px 0', color: C.accentDark, fontSize: '20px', fontWeight: 600 }}>Account Information</h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase', marginBottom: '8px' }}>Username</label>
              <div style={{ background: '#fff', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', padding: '14px 16px', color: C.text, fontSize: '15px' }}>
                {profile?.username || 'Admin'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase', marginBottom: '8px' }}>Display Name</label>
              <div style={{ background: '#fff', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', padding: '14px 16px', color: C.text, fontSize: '15px' }}>
                {profile?.displayName || 'Administrator'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase', marginBottom: '8px' }}>Role</label>
              <div style={{ background: '#fff', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', padding: '14px 16px', color: C.text, fontSize: '15px' }}>
                {profile?.role || 'ADMIN'}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '22px', padding: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: C.accentDark, fontSize: '20px', fontWeight: 600 }}>Change Password</h2>
          <p style={{ color: C.textMuted, fontSize: '13px', margin: '0 0 24px 0' }}>Update your password to keep your account secure</p>

          {error && (
            <div style={{ marginBottom: '20px' }}>
              <ErrorBox message={error} />
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase', marginBottom: '8px' }}>Current password</label>
              <input
                className="field-input"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                placeholder="Enter your current password"
                disabled={updateLoading}
                style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', background: '#F5F9FF', color: C.text, fontSize: '15px', fontFamily: 'inherit', transition: 'all 0.15s' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase', marginBottom: '8px' }}>New password</label>
              <input
                className="field-input"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter a new password (min 6 characters)"
                disabled={updateLoading}
                style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', background: '#F5F9FF', color: C.text, fontSize: '15px', fontFamily: 'inherit', transition: 'all 0.15s' }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase', marginBottom: '8px' }}>Confirm new password</label>
              <input
                className="field-input"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your new password"
                disabled={updateLoading}
                style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', background: '#F5F9FF', color: C.text, fontSize: '15px', fontFamily: 'inherit', transition: 'all 0.15s' }}
              />
            </div>

            <button
              type="submit"
              disabled={updateLoading}
              className="submit-btn"
              style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', borderRadius: '14px', padding: '16px 20px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            >
              {updateLoading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: C.textMuted, margin: '16px 0 0 0', textAlign: 'center' }}>
            Your password must be at least 6 characters long
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
