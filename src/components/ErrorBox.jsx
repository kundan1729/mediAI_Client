const ErrorBox = ({ message, onRetry }) => (
  <div style={{
    background: '#FFE4E6', border: '1.5px solid #FECDD3',
    borderRadius: '14px', padding: '20px 22px',
    display: 'flex', alignItems: 'flex-start', gap: '14px',
  }}>
    <svg width="20" height="20" fill="none" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: '1px' }}>
      <circle cx="10" cy="10" r="9" stroke="#EF4444" strokeWidth="1.5" />
      <path d="M10 6v4M10 13.5v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <div style={{ flex: 1 }}>
      <p style={{ color: '#9F1239', fontWeight: 600, fontSize: '15px', margin: '0 0 5px 0' }}>Something went wrong</p>
      <p style={{ color: '#BE123C', fontSize: '13px', margin: 0, lineHeight: 1.55 }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '12px', background: 'transparent',
            border: '1.5px solid #FECDD3', borderRadius: '10px',
            padding: '7px 16px', fontSize: '13px', fontWeight: 500,
            color: '#9F1239', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#FFD0D5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

export default ErrorBox;