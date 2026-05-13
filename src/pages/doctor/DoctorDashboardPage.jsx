import { useState, useEffect } from 'react';

const C = {
  cardBg:     '#EAF3FF',
  cardBorder: '#C7DEFF',
  accent:     '#0F766E',
  accentDark: '#115E59',
  text:       '#1A2E4A',
  textMuted:  '#5A7ABF',
};

const DoctorDashboardPage = ({ displayName, onNavigate }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        .doctor-card {
          background: ${C.cardBg};
          border: 1.5px solid ${C.cardBorder};
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .btn { border: none; border-radius: 10px; padding: '12px 20px'; fontSize: '14px'; fontWeight: 600; cursor: 'pointer'; fontFamily: 'inherit'; transition: 'all 0.2s'; }
        .btn-primary { background: ${C.accent}; color: white; }
        .btn-primary:hover { background: ${C.accentDark}; transform: translateY(-2px); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: C.accentDark, marginBottom: '8px' }}>
          Welcome back, {displayName}!
        </h1>
        <p style={{ fontSize: '15px', color: C.textMuted }}>
          Manage your availability and view your appointments
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="doctor-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>Today's Schedule</h3>
            <div style={{ fontSize: '24px' }}>📅</div>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, color: C.accent, marginBottom: '8px' }}>
            5
          </p>
          <p style={{ fontSize: '13px', color: C.textMuted }}>Available slots</p>
        </div>

        <div className="doctor-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>Appointments</h3>
            <div style={{ fontSize: '24px' }}>👥</div>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, color: C.accent, marginBottom: '8px' }}>
            3
          </p>
          <p style={{ fontSize: '13px', color: C.textMuted }}>Booked appointments</p>
        </div>

        <div className="doctor-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>This Week</h3>
            <div style={{ fontSize: '24px' }}>📊</div>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, color: C.accent, marginBottom: '8px' }}>
            12
          </p>
          <p style={{ fontSize: '13px', color: C.textMuted }}>Total slots available</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="doctor-card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <button className="btn btn-primary">
            View Schedule
          </button>
          <button className="btn btn-primary">
            Update Availability
          </button>
          <button className="btn btn-primary">
            View Appointments
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="doctor-card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>
          Upcoming Appointments
        </h2>
        <div style={{ borderTop: '1.5px solid ' + C.cardBorder, paddingTop: '16px' }}>
          <p style={{ fontSize: '14px', color: C.textMuted, textAlign: 'center', padding: '24px' }}>
            No appointments scheduled yet
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
