const SeverityBadge = ({ severity }) => {
  if (!severity) return null;
  const s = severity.toUpperCase();

  const config = {
    MILD:     { bg: '#DCFCE7', color: '#166534', border: '#A7F3D0', dot: '#22C55E', desc: 'Manageable with rest and home care' },
    MODERATE: { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', dot: '#F59E0B', desc: 'Requires medical attention soon'    },
    SEVERE:   { bg: '#FFE4E6', color: '#9F1239', border: '#FECDD3', dot: '#EF4444', desc: 'Seek immediate medical attention'   },
  };

  const c = config[s] || { bg: '#EAF3FF', color: '#2A5298', border: '#C7DEFF', dot: '#60A5FA', desc: 'Consult a doctor' };

  return (
    <div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        background: c.bg, color: c.color,
        border: `1.5px solid ${c.border}`,
        borderRadius: '20px', padding: '6px 16px',
        fontSize: '14px', fontWeight: 600,
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
        {s.charAt(0) + s.slice(1).toLowerCase()}
      </span>
      <p style={{ fontSize: '12px', color: '#5A7ABF', marginTop: '6px', marginBottom: 0, fontWeight: 500 }}>
        {c.desc}
      </p>
    </div>
  );
};

export default SeverityBadge;