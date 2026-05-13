const LoadingSpinner = ({ message = 'Analyzing your symptoms with AI...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: '20px' }}>
    <div style={{ width: '56px', height: '56px', border: '5px solid #C7DEFF', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
    <p style={{ color: '#2A5298', fontSize: '15px', fontWeight: 500, margin: 0 }}>{message}</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingSpinner;