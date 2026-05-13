import { useState } from 'react';
import { addDoctor } from '../../services/api';

const C = {
  cardBg:     '#EAF3FF',
  cardBorder: '#C7DEFF',
  inputBg:    '#F5F9FF',
  accent:     '#2563EB',
  accentDark: '#1A3A6B',
  text:       '#1A2E4A',
  textMuted:  '#5A7ABF',
  label:      '#4A6FA5',
};

const SPECIALIZATIONS = [
  'General Physician', 'Dental Surgeon', 'Skin Specialist',
  'Gynaecologist', 'Cardiologist', 'Neurologist',
  'Orthopaedic', 'Paediatrician', 'Psychiatrist',
  'ENT Specialist', 'Ophthalmologist', 'Urologist',
];

const AddDoctorPage = ({ onNavigate, onShowToast }) => {
  const [form, setForm] = useState({ name: '', specialization: '', availableSlots: '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const isValid = form.name.trim() && form.specialization && Number(form.availableSlots) > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      await addDoctor({
        name:           form.name.trim(),
        specialization: form.specialization,
        availableSlots: Number(form.availableSlots),
      });
      setForm({ name: '', specialization: '', availableSlots: '' });
      setSuccess(true);
      onShowToast('Doctor added successfully!', 'success');
    } catch (err) {
      const msg = err.message.includes('401')
        ? 'Session expired. Please log in again.'
        : err.message || 'Failed to add doctor. Please try again.';
      onShowToast(msg, 'error');
      if (err.message.includes('401')) {
        localStorage.removeItem('token');
        setTimeout(() => onNavigate('admin-login'), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: C.inputBg,
    border: `1.5px solid ${C.cardBorder}`,
    borderRadius: '12px', padding: '13px 16px',
    fontSize: '15px', color: C.text,
    fontFamily: 'inherit', transition: 'all 0.15s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 700,
    color: C.label, textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: '8px',
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        .field-input:focus { border-color: #2563EB !important; outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
        .submit-btn:hover:not(:disabled) { background: #1A3A6B !important; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: '36px', color: C.accentDark, margin: '0 0 6px 0',
        }}>Add a doctor</h2>
        <p style={{ color: C.textMuted, fontSize: '15px', margin: 0 }}>
          Fill in the details below to register a new doctor in the system
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>

        {/* Form card */}
        <div style={{
          background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
          borderRadius: '22px', padding: '36px 32px',
        }}>
          <form onSubmit={handleSubmit}>

            {/* Doctor Name */}
            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>Doctor name</label>
              <input
                className="field-input"
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. Dr. Priya Sharma"
                style={inputStyle}
              />
            </div>

            {/* Specialization */}
            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>Specialization</label>
              <select
                className="field-input"
                value={form.specialization}
                onChange={e => handleChange('specialization', e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235A7ABF' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  paddingRight: '44px',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select a specialization</option>
                {SPECIALIZATIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Available Slots */}
            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>Available slots</label>
              <input
                className="field-input"
                type="number"
                min="1"
                max="50"
                value={form.availableSlots}
                onChange={e => handleChange('availableSlots', e.target.value)}
                placeholder="e.g. 5"
                style={inputStyle}
              />
              <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '6px' }}>
                Number of appointment slots available per day
              </p>
            </div>

            {/* Success banner */}
            {success && (
              <div style={{
                background: '#F0FDF4', border: '1.5px solid #A7F3D0',
                borderRadius: '12px', padding: '14px 16px',
                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#A7F3D0', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: '#166534', fontWeight: 700, flexShrink: 0,
                }}>✓</div>
                <p style={{ color: '#166534', fontSize: '14px', margin: 0, fontWeight: 500 }}>
                  Doctor added successfully! You can add another one.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              className="submit-btn"
              type="submit"
              disabled={!isValid || loading}
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
                  Adding doctor...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Add doctor
                </>
              )}
            </button>
          </form>
        </div>

        {/* Side info card */}
        <div style={{
          background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
          borderRadius: '20px', padding: '28px 24px',
          position: 'sticky', top: '20px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px 0' }}>
            Quick guide
          </p>
          {[
            { icon: '👨‍⚕️', title: 'Doctor name',       desc: 'Use full name with title, e.g. Dr. Priya Sharma' },
            { icon: '🏥', title: 'Specialization',     desc: 'Select from the list of available specializations' },
            { icon: '📅', title: 'Available slots',    desc: 'Set daily appointment capacity (1 to 50)' },
          ].map((tip, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              padding: '14px 0',
              borderBottom: i < 2 ? `1px solid ${C.cardBorder}` : 'none',
            }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{tip.icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '13px', color: C.text, margin: '0 0 3px 0' }}>{tip.title}</p>
                <p style={{ fontSize: '12px', color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{tip.desc}</p>
              </div>
            </div>
          ))}

          <button
            onClick={() => onNavigate('dashboard')}
            style={{
              marginTop: '20px', width: '100%',
              background: '#D6E6FF', color: C.accentDark,
              border: `1.5px solid ${C.cardBorder}`,
              borderRadius: '12px', padding: '12px',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#C7DEFF'}
            onMouseLeave={e => e.currentTarget.style.background = '#D6E6FF'}
          >
            View analytics dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDoctorPage;