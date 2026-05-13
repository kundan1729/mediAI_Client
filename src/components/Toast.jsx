import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: '#F0FDF4', border: '#A7F3D0', color: '#166534', icon: '✓' },
    error:   { bg: '#FFF1F2', border: '#FECDD3', color: '#9F1239', icon: '✕' },
  };

  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: '14px', padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      animation: 'slideIn 0.3s ease-out',
      maxWidth: '360px',
    }}>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: c.border, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 700, color: c.color, flexShrink: 0,
      }}>{c.icon}</div>
      <p style={{ fontSize: '14px', fontWeight: 500, color: c.color, margin: 0, flex: 1 }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'transparent', border: 'none',
          cursor: 'pointer', color: c.color,
          fontSize: '16px', padding: '0 4px', lineHeight: 1,
        }}
      >×</button>
    </div>
  );
};

export default Toast;