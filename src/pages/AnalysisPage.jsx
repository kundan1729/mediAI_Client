import { useState } from 'react';
import { analyzeSymptoms } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBox from '../components/ErrorBox';

const C = {
  cardBg:     '#EAF3FF',
  cardBorder: '#C7DEFF',
  cardHover:  '#DCEBFF',
  inputBg:    '#F5F9FF',
  accent:     '#2563EB',
  accentDark: '#1A3A6B',
  text:       '#1A2E4A',
  textMuted:  '#5A7ABF',
  label:      '#4A6FA5',
};

const AnalysisPage = ({ onResult }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const getCurrentLocation = () => new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'Current device location',
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });

  const examples = [
    'Severe headache and nausea for 2 days',
    'Chest pain and shortness of breath',
    'Skin rash with itching and redness',
    'High fever, body aches and fatigue',
    'Tooth pain and bleeding gums',
    'Persistent stomach pain and diarrhea',
  ];

  const handleSubmit = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const location = await getCurrentLocation();
      const data = await analyzeSymptoms(symptoms.trim(), location);
      onResult(data, symptoms.trim());
    } catch (e) {
      setError(e.message || 'Failed to connect. Please ensure your backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Analyzing your symptoms with AI..." />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        .submit-btn:hover:not(:disabled) { background: #1A3A6B !important; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,99,235,0.3) !important; }
        .submit-btn:disabled { background: #A8C8FF !important; cursor: not-allowed; }
        .example-pill:hover { background: #DCEBFF !important; border-color: #A8C8FF !important; color: #1A3A6B !important; }
        .symptom-area:focus { border-color: #2563EB !important; outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>

        {/* Left — main input */}
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '36px', color: C.accentDark, margin: '0 0 8px 0' }}>
            Describe your symptoms
          </h2>
          <p style={{ color: C.textMuted, fontSize: '15px', margin: '0 0 28px 0', lineHeight: 1.6 }}>
            Be as specific as possible. The more detail you provide, the more accurate your AI diagnosis will be.
          </p>

          <div style={{
            background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
            borderRadius: '20px', padding: '32px',
            marginBottom: '20px',
          }}>
            <label style={{
              display: 'block', fontSize: '12px', fontWeight: 700,
              color: C.label, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '12px',
            }}>
              Your symptoms
            </label>
            <textarea
              className="symptom-area"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
              rows={7}
              placeholder="e.g. I have been experiencing severe headaches for the past 3 days, along with nausea and sensitivity to light. The pain is mostly on one side..."
              style={{
                width: '100%', background: C.inputBg,
                border: `1.5px solid ${C.cardBorder}`,
                borderRadius: '14px', padding: '16px 18px',
                fontSize: '15px', color: C.text,
                resize: 'vertical', fontFamily: 'inherit',
                lineHeight: 1.7, transition: 'all 0.15s',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: C.textMuted }}>
                {symptoms.length > 0 ? `${symptoms.length} characters · Ctrl+Enter to submit` : 'Tip: Ctrl+Enter to submit quickly'}
              </span>
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!symptoms.trim()}
                style={{
                  background: C.accent, color: '#fff',
                  border: 'none', borderRadius: '12px',
                  padding: '13px 30px', fontSize: '15px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 3px 12px rgba(37,99,235,0.25)',
                }}
              >
                Analyze symptoms
                <svg width="15" height="15" fill="none" viewBox="0 0 14 14">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {error && <ErrorBox message={error} onRetry={handleSubmit} />}
        </div>

        {/* Right — examples */}
        <div style={{
          background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
          borderRadius: '20px', padding: '28px 24px',
          position: 'sticky', top: '20px',
        }}>
          <p style={{
            fontSize: '12px', fontWeight: 700, color: C.label,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            margin: '0 0 16px 0',
          }}>
            Quick examples
          </p>
          <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Click any example to fill the input field
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                className="example-pill"
                onClick={() => setSymptoms(ex)}
                style={{
                  background: '#D6E6FF', border: `1.5px solid ${C.cardBorder}`,
                  borderRadius: '12px', padding: '12px 16px',
                  textAlign: 'left', cursor: 'pointer',
                  fontSize: '13px', color: '#2A5298',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  lineHeight: 1.45, fontWeight: 500,
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive: stack on small screens */}
      <style>{`
        @media (max-width: 700px) {
          .analysis-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AnalysisPage;