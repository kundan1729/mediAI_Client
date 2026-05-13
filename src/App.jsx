import { useState, useCallback } from 'react';
import { CiSettings } from 'react-icons/ci';
import HomePage       from './pages/HomePage';
import AnalysisPage   from './pages/AnalysisPage';
import ResultsPage    from './pages/ResultsPage';
import DashboardPage  from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import AddDoctorPage  from './pages/admin/AddDoctorPage';
import ManageDoctorsPage from './pages/admin/ManageDoctorsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import SlotAllocationPage from './pages/admin/SlotAllocationPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Toast          from './components/Toast';
import {
  getAuthDisplayName,
  getAuthRole,
  getLandingPageForRole,
  isLoggedIn,
  logout,
  setAuthSession,
} from './services/api';

const navItems = [
  { id: 'home',      label: 'Home'      },
  { id: 'analysis',  label: 'Analyze'   },
  { id: 'results',   label: 'Results'   },
  { id: 'dashboard', label: 'Dashboard' },
];

const App = () => {
  const [authRole, setAuthRole]         = useState(getAuthRole());
  const [displayName, setDisplayName]   = useState(getAuthDisplayName());
  const [page, setPage]                 = useState(() => (isLoggedIn() ? getLandingPageForRole(getAuthRole()) : 'home'));
  const [result, setResult]             = useState(null);
  const [lastSymptoms, setLastSymptoms] = useState('');
  const [loggedIn, setLoggedIn]         = useState(isLoggedIn());
  const [toast, setToast]               = useState(null);

  const handleResult = (data, symptoms) => {
    setResult(data);
    setLastSymptoms(symptoms);
    setPage('results');
  };

  const handleRetry = () => { setPage('analysis'); setResult(null); };

  const handleAddDoctorClick = () => {
    if (isLoggedIn() && authRole === 'ADMIN') {
      setPage('add-doctor');
    } else {
      setPage(isLoggedIn() ? getLandingPageForRole(authRole) : 'login');
    }
  };

  const handleLoginSuccess = (session) => {
    setAuthSession(session);
    setLoggedIn(true);
    setAuthRole((session.role || 'ADMIN').toUpperCase());
    setDisplayName(session.displayName || session.username || '');
    setPage(getLandingPageForRole(session.role));
    showToast(`Welcome back, ${session.displayName || session.username}!`, 'success');
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setAuthRole('');
    setDisplayName('');
    setPage('home');
    showToast('Logged out successfully.', 'success');
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const isAdminPage = authRole === 'ADMIN' && ['dashboard', 'add-doctor', 'manage-doctors', 'slot-allocation', 'audit-logs', 'settings'].includes(page);
  const isLoginPage = page === 'login' || page === 'admin-login';
  const isDoctorPage = page === 'doctor-dashboard';

  return (
    <div style={{
      minHeight: '100vh',
      background: isAdminPage ? '#D6E6FF' : '#D6E6FF',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .nav-btn:hover { background: #C7DEFF !important; color: #1A3A6B !important; }
        .nav-btn.active { background: #2563EB !important; color: #fff !important; border-color: #2563EB !important; }
        .add-doc-btn:hover { background: #166534 !important; transform: translateY(-1px); }
        .logout-btn:hover { background: #FFF1F2 !important; border-color: #FECDD3 !important; color: #9F1239 !important; }
      `}</style>

      {/* Navbar — hidden on login page */}
      {!isLoginPage && (
        <div style={{ background: '#EAF3FF', borderBottom: '1.5px solid #C7DEFF' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '64px', flexWrap: 'wrap' }}>

              {/* Brand */}
              <div
                onClick={() => setPage('home')}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: 'auto', cursor: 'pointer' }}
              >
                <div style={{
                  width: '36px', height: '36px', background: '#2563EB',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 16 16">
                    <path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '22px', color: '#1A3A6B', fontWeight: 400 }}>
                  MediAI
                </span>
              </div>

              {/* Nav links */}
              {authRole === 'ADMIN' ? (
                <>
                  <button
                    className={`nav-btn${page === 'dashboard' ? ' active' : ''}`}
                    onClick={() => setPage('dashboard')}
                    style={{
                      background: page === 'dashboard' ? '#2563EB' : 'transparent',
                      color: page === 'dashboard' ? '#fff' : '#2A5298',
                      border: '1.5px solid ' + (page === 'dashboard' ? '#2563EB' : '#A8C8FF'),
                      borderRadius: '10px', padding: '8px 20px', fontSize: '14px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    className={`nav-btn${page === 'manage-doctors' ? ' active' : ''}`}
                    onClick={() => setPage('manage-doctors')}
                    style={{
                      background: page === 'manage-doctors' ? '#2563EB' : 'transparent',
                      color: page === 'manage-doctors' ? '#fff' : '#2A5298',
                      border: '1.5px solid ' + (page === 'manage-doctors' ? '#2563EB' : '#A8C8FF'),
                      borderRadius: '10px', padding: '8px 20px', fontSize: '14px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    Manage Doctors
                  </button>
                  <button
                    className={`nav-btn${page === 'slot-allocation' ? ' active' : ''}`}
                    onClick={() => setPage('slot-allocation')}
                    style={{
                      background: page === 'slot-allocation' ? '#2563EB' : 'transparent',
                      color: page === 'slot-allocation' ? '#fff' : '#2A5298',
                      border: '1.5px solid ' + (page === 'slot-allocation' ? '#2563EB' : '#A8C8FF'),
                      borderRadius: '10px', padding: '8px 20px', fontSize: '14px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    Manage Slots
                  </button>
                  <button
                    className={`nav-btn${page === 'audit-logs' ? ' active' : ''}`}
                    onClick={() => setPage('audit-logs')}
                    style={{
                      background: page === 'audit-logs' ? '#2563EB' : 'transparent',
                      color: page === 'audit-logs' ? '#fff' : '#2A5298',
                      border: '1.5px solid ' + (page === 'audit-logs' ? '#2563EB' : '#A8C8FF'),
                      borderRadius: '10px', padding: '8px 20px', fontSize: '14px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    Audit Logs
                  </button>
                  <button
                    onClick={() => setPage('settings')}
                    title="Settings"
                    style={{ background: 'transparent', border: 'none', marginLeft: '8px', cursor: 'pointer', padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', transition: 'all 0.15s', fontSize: '24px' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#C7DEFF'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <CiSettings />
                  </button>
                </>
              ) : (
                navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-btn${page === item.id ? ' active' : ''}`}
                    onClick={() => setPage(item.id)}
                    style={{
                      background:   page === item.id ? '#2563EB' : 'transparent',
                      color:        page === item.id ? '#fff'     : '#2A5298',
                      border:       '1.5px solid ' + (page === item.id ? '#2563EB' : '#A8C8FF'),
                      borderRadius: '10px', padding: '8px 20px',
                      fontSize: '14px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    {item.label}
                  </button>
                ))
              )}

              {/* Divider */}
              <div style={{ width: '1.5px', height: '24px', background: '#C7DEFF', margin: '0 4px' }} />

              {/* Logout — only when logged in */}
              {loggedIn && (
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                  style={{
                    background: 'transparent', color: '#BE123C',
                    border: '1.5px solid #FECDD3', borderRadius: '10px',
                    padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s',
                  }}
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 14 14">
                    <path d="M9 1H5a2 2 0 00-2 2v8a2 2 0 002 2h4M11 5l2 2-2 2M7 7h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Logout
                </button>
              )}

            </nav>
          </div>
        </div>
      )}

      {/* Page content */}
      <div style={{
        maxWidth: isLoginPage ? '100%' : '1200px',
        margin: '0 auto',
        padding: isLoginPage ? '0' : '36px 32px 60px',
      }}>
        {page === 'home'        && <HomePage      onNavigate={setPage} />}
        {page === 'analysis'    && <AnalysisPage  onResult={handleResult} />}
        {page === 'results'     && <ResultsPage   result={result} symptoms={lastSymptoms} onRetry={handleRetry} onShowToast={showToast} />}
        {page === 'dashboard' && (
          <ProtectedRoute onRedirect={setPage} allowedRoles={['ADMIN']}>
            <DashboardPage />
          </ProtectedRoute>
        )}
        {isLoginPage && <LoginPage onSuccess={handleLoginSuccess} onNavigate={setPage} />}
        {page === 'add-doctor' && (
          <ProtectedRoute onRedirect={setPage} allowedRoles={['ADMIN']}>
            <AddDoctorPage
              onNavigate={setPage}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        )}
        {page === 'manage-doctors' && (
          <ProtectedRoute onRedirect={setPage} allowedRoles={['ADMIN']}>
            <ManageDoctorsPage
              onShowToast={showToast}
              onNavigate={setPage}
            />
          </ProtectedRoute>
        )}
        {page === 'slot-allocation' && (
          <ProtectedRoute onRedirect={setPage} allowedRoles={['ADMIN']}>
            <SlotAllocationPage
              onShowToast={showToast}
            />
          </ProtectedRoute>
        )}
        {page === 'audit-logs' && (
          <ProtectedRoute onRedirect={setPage} allowedRoles={['ADMIN']}>
            <AuditLogsPage />
          </ProtectedRoute>
        )}
        {page === 'settings' && (
          <ProtectedRoute onRedirect={setPage} allowedRoles={['ADMIN']}>
            <SettingsPage
              onShowToast={showToast}
            />
          </ProtectedRoute>
        )}
        {page === 'doctor-dashboard' && (
          <ProtectedRoute onRedirect={setPage} allowedRoles={['DOCTOR']}>
            <DoctorDashboardPage onNavigate={setPage} displayName={displayName || 'Doctor'} />
          </ProtectedRoute>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;