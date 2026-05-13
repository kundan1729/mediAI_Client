import { useState } from 'react';
import SeverityBadge from '../components/SeverityBadge';
import DoctorCard from '../components/DoctorCard';
import SlotsPage from './SlotsPage';

const C = {
  cardBg: '#EAF3FF',
  cardBorder: '#C7DEFF',
  accent: '#2563EB',
  accentDark: '#1A3A6B',
  text: '#1A2E4A',
  textSub: '#2A5298',
  textMuted: '#5A7ABF',
  label: '#4A6FA5',
};

const card = {
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: '20px',
  padding: '28px 28px',
};

const label = {
  fontSize: '11px',
  fontWeight: 700,
  color: C.label,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: '12px',
};

const ResultsPage = ({ result, symptoms, onRetry, onShowToast }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  if (!result) {
    return (
      <div style={{ ...card, color: C.textSub, fontSize: '15px' }}>
        No results yet. Go to the Analyze page and submit your symptoms first.
      </div>
    );
  }

  const message = result.message;
  const severity = result.severity;
  const recommendedSpecialization =
    result.recommendedSpecialization ||
    result.recommendSpecialization ||
    result.specialization ||
    '';
  const recommendedDoctors =
    result.recommendedDoctors ||
    result.recommenddoctors ||
    result.doctors ||
    [];
  const externalDoctors = result.externalDoctors || result.googleDoctors || [];
  const alertTriggered = result.alertTriggered || result.severeAlertTriggered || false;
  const alertSent = result.alertSent || false;
  const alertMessage = result.alertMessage || '';
  const conditionMatch = message && message.match(/Possible condition:\s*(.+?)\./);
  const adviceMatch = message && message.match(/Advice:\s*(.+)/);
  const condition = conditionMatch ? conditionMatch[1].trim() : message;
  const advice = adviceMatch ? adviceMatch[1].replace(/\.$/, '').trim() : 'Please consult a doctor.';

  const isSevereOrModerate = severity === 'SEVERE' || severity === 'MODERATE';

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        .retry-btn:hover { background: #DCEBFF !important; border-color: #A8C8FF !important; }
        .doctor-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 18px;
          @media (max-width: 768px) {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .page-header { flex-direction: column !important; }
        }
      `}</style>

      {/* Page header */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'DM Serif Display',Georgia,serif",
              fontSize: '36px',
              color: C.accentDark,
              margin: '0 0 6px 0',
            }}
          >
            Analysis results
          </h2>
          <p style={{ color: C.textMuted, fontSize: '14px', margin: 0 }}>
            Based on: <strong style={{ color: C.accent, fontWeight: 500 }}>"{symptoms}"</strong>
          </p>
        </div>
        <button
          className="retry-btn"
          onClick={onRetry}
          style={{
            background: C.cardBg,
            color: C.textSub,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: '12px',
            padding: '11px 20px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s',
          }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 14 14">
            <path
              d="M2 7a5 5 0 109.5-2M11 2v3H8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          New analysis
        </button>
      </div>

      {/* Row 1 — Condition + Severity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        <div style={card}>
          <span style={label}>Possible condition</span>
          <p style={{ fontSize: '18px', fontWeight: 600, color: C.text, lineHeight: 1.4, margin: 0 }}>
            {condition}
          </p>
        </div>
        <div style={card}>
          <span style={label}>Severity level</span>
          <SeverityBadge severity={severity} />
        </div>
      </div>

      {/* Row 2 — Advice + Specialist side by side */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: isSevereOrModerate ? '16px' : '32px',
        }}
      >
        <div style={card}>
          <span style={label}>AI advice</span>
          <p style={{ fontSize: '15px', color: C.text, lineHeight: 1.75, margin: 0 }}>
            {advice}
          </p>
        </div>

        <div style={card}>
          <span style={label}>Recommended specialist</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                flexShrink: 0,
                background: '#D6E6FF',
                border: `1.5px solid ${C.cardBorder}`,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8z" stroke="#2563EB" strokeWidth="1.5" />
                <path
                  d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6"
                  stroke="#2563EB"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: '17px',
                  color: C.text,
                  margin: '0 0 4px 0',
                }}
              >
                {recommendedSpecialization || 'General Physician'}
              </p>
              <p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>
                Best match for your condition
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency recommendation */}
      {isSevereOrModerate && (
        <div
          style={{
            ...card,
            marginBottom: '28px',
            background: '#FFF7ED',
            borderColor: '#FDBA74',
            color: '#9A3412',
          }}
        >
          <span style={label}>⚠️ Important</span>
          <p style={{ fontSize: '15px', lineHeight: 1.75, margin: 0, fontWeight: 500 }}>
            {severity === 'SEVERE'
              ? 'Your symptoms indicate a severe condition. Please seek immediate medical attention or visit the nearest hospital.'
              : 'If symptoms worsen or persist, visit a nearby hospital or clinic immediately.'}
          </p>
        </div>
      )}

      {alertTriggered && (
        <div
          style={{
            ...card,
            marginBottom: '24px',
            background: alertSent ? '#FEF2F2' : '#FFF7ED',
            borderColor: alertSent ? '#FECACA' : '#FDBA74',
            color: alertSent ? '#991B1B' : '#9A3412',
          }}
        >
          <span style={label}>Emergency alert</span>
          <p style={{ fontSize: '15px', lineHeight: 1.75, margin: 0 }}>
            {alertSent
              ? 'WhatsApp alert sent with the current location details.'
              : 'High severity detected, but the WhatsApp alert could not be sent automatically.'}
          </p>
        </div>
      )}

      {/* Section 1: MediAI Doctors */}
      {recommendedDoctors && recommendedDoctors.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: C.text,
                margin: 0,
              }}
            >
              🩺 MediAI Available Doctors
            </h3>
            <span
              style={{
                background: C.accent,
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {recommendedDoctors.length}
            </span>
          </div>
          <div className="doctor-grid">
            {recommendedDoctors.map((doctor, idx) => (
              <DoctorCard 
                key={idx} 
                doctor={doctor} 
                isGoogleDoctor={false}
                onSlotClick={setSelectedDoctor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Google Nearby Clinics */}
      {externalDoctors && externalDoctors.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: C.text,
                margin: 0,
              }}
            >
              📍 Nearby Physical Clinics
            </h3>
            <span
              style={{
                background: '#F59E0B',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {externalDoctors.length}
            </span>
          </div>
          <div className="doctor-grid">
            {externalDoctors.map((doctor, idx) => (
              <DoctorCard key={idx} doctor={doctor} isGoogleDoctor={true} />
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {(!recommendedDoctors || recommendedDoctors.length === 0) &&
        (!externalDoctors || externalDoctors.length === 0) && (
          <div
            style={{
              ...card,
              textAlign: 'center',
              color: C.textMuted,
            }}
          >
            <p style={{ fontSize: '16px', fontWeight: 500, margin: 0 }}>
              No doctors available for your location or specialization.
            </p>
            <p style={{ fontSize: '14px', color: C.textMuted, margin: '8px 0 0 0' }}>
              Please try a different search or contact a nearby hospital.
            </p>
          </div>
        )}

      {/* Slots selection modal */}
      {selectedDoctor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <SlotsPage
              doctor={selectedDoctor}
              onClose={() => setSelectedDoctor(null)}
              onShowToast={onShowToast}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;