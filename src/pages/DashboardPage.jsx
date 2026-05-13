import { useState, useEffect, useCallback } from 'react';
import { getLogs, getLogsBySeverity, getLogsBySpecialization } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import ErrorBox from '../components/ErrorBox';

const C = {
  cardBg:     '#EAF3FF',
  cardBorder: '#C7DEFF',
  rowHover:   '#F0F7FF',
  accent:     '#2563EB',
  accentDark: '#1A3A6B',
  text:       '#1A2E4A',
  textMuted:  '#5A7ABF',
  label:      '#4A6FA5',
};

const SkeletonRow = () => (
  <tr>
    {[1,2,3,4,5].map(i => (
      <td key={i} style={{ padding: '16px 18px' }}>
        <div style={{
          height: '13px', borderRadius: '6px',
          background: 'linear-gradient(90deg,#D6E6FF 25%,#C7DEFF 50%,#D6E6FF 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          width: i === 3 ? '70px' : '100%',
        }} />
      </td>
    ))}
  </tr>
);

const DashboardPage = () => {
  const [logs, setLogs]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [severityFilter, setSeverityFilter] = useState('');
  const [specFilter, setSpecFilter]         = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let data;
      if (severityFilter)  data = await getLogsBySeverity(severityFilter);
      else if (specFilter) data = await getLogsBySpecialization(specFilter);
      else                 data = await getLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load logs. Ensure backend is running on port 8080.');
    } finally { setLoading(false); }
  }, [severityFilter, specFilter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const uniqueSpecs = [...new Set(logs.map(l => l.specialization || l.recommendedSpecialization).filter(Boolean))];

  const stats = [
    { label: 'Total logs',   value: logs.length,                                     color: '#1A3A6B', bg: '#D6E6FF' },
    { label: 'Mild cases',   value: logs.filter(l => l.severity === 'MILD').length,    color: '#166534', bg: '#DCFCE7' },
    { label: 'Moderate',     value: logs.filter(l => l.severity === 'MODERATE').length,color: '#92400E', bg: '#FEF3C7' },
    { label: 'Severe',       value: logs.filter(l => l.severity === 'SEVERE').length,  color: '#9F1239', bg: '#FFE4E6' },
  ];

  const formatDate = d => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return String(d); }
  };

  const truncate = (str, n = 52) => str && str.length > n ? str.slice(0, n) + '…' : (str || '—');

  const selectStyle = {
    background: '#D6E6FF', border: `1.5px solid ${C.cardBorder}`,
    borderRadius: '12px', padding: '11px 16px',
    fontSize: '14px', color: C.text,
    fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
    minWidth: '170px', fontWeight: 500,
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        .log-row:hover td { background: ${C.rowHover}; }
        .refresh-btn:hover { background: #DCEBFF !important; border-color: #A8C8FF !important; }
        .clear-btn:hover { background: #DCEBFF !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '36px', color: C.accentDark, margin: '0 0 6px 0' }}>
            Analytics dashboard
          </h2>
          <p style={{ color: C.textMuted, fontSize: '15px', margin: 0 }}>Symptom analysis log history and trends</p>
        </div>
        <button
          className="refresh-btn"
          onClick={loadLogs}
          style={{
            background: C.cardBg, color: C.textSub,
            border: `1.5px solid ${C.cardBorder}`, borderRadius: '12px',
            padding: '11px 20px', fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.15s',
          }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 14 14">
            <path d="M2 7a5 5 0 109.5-2M11 2v3H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: s.bg, border: `1.5px solid ${C.cardBorder}`,
            borderRadius: '18px', padding: '24px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: s.color, fontWeight: 500, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
        borderRadius: '18px', padding: '24px 28px', marginBottom: '20px',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px 0' }}>
          Filter logs
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={severityFilter}
            onChange={e => { setSeverityFilter(e.target.value); setSpecFilter(''); }}
            style={selectStyle}
          >
            <option value="">All severities</option>
            <option value="MILD">Mild</option>
            <option value="MODERATE">Moderate</option>
            <option value="SEVERE">Severe</option>
          </select>

          <select
            value={specFilter}
            onChange={e => { setSpecFilter(e.target.value); setSeverityFilter(''); }}
            style={{ ...selectStyle, minWidth: '220px' }}
          >
            <option value="">All specializations</option>
            {uniqueSpecs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {(severityFilter || specFilter) && (
            <button
              className="clear-btn"
              onClick={() => { setSeverityFilter(''); setSpecFilter(''); }}
              style={{
                background: '#D6E6FF', border: `1.5px solid ${C.cardBorder}`,
                borderRadius: '12px', padding: '11px 18px',
                fontSize: '13px', color: C.textSub, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              ✕ Clear filters
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ marginBottom: '16px' }}><ErrorBox message={error} onRetry={loadLogs} /></div>}

      {/* Table */}
      {!loading && logs.length === 0 && !error ? (
        <div style={{
          background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
          borderRadius: '18px', padding: '40px 28px',
          color: C.textSub, fontSize: '15px', textAlign: 'center',
        }}>
          {severityFilter || specFilter
            ? 'No logs match the selected filter.'
            : 'No logs yet. Analyze some symptoms to see data here.'}
        </div>
      ) : (
        <div style={{
          background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
          borderRadius: '20px', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#D6E6FF', borderBottom: `1.5px solid ${C.cardBorder}` }}>
                  {['Symptoms', 'AI condition', 'Severity', 'Specialization', 'Timestamp'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '14px 18px',
                      fontSize: '12px', fontWeight: 700,
                      color: C.label, textTransform: 'uppercase',
                      letterSpacing: '0.07em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3,4].map(i => <SkeletonRow key={i} />)
                  : logs.map((log, i) => (
                    <tr key={log.id || i} className="log-row" style={{ borderBottom: `1px solid ${C.cardBorder}`, transition: 'background 0.1s' }}>
                      <td style={{ padding: '15px 18px', color: C.text, maxWidth: '200px' }}>
                        <span title={log.symptom || log.symptoms}>{truncate(log.symptom || log.symptoms, 40)}</span>
                      </td>
                      <td style={{ padding: '15px 18px', color: C.textMuted, maxWidth: '240px' }}>
                        <span title={log.condition || log.aiCondition}>{truncate(log.condition || log.aiCondition, 50)}</span>
                      </td>
                      <td style={{ padding: '15px 18px' }}>
                        <SeverityBadge severity={log.severity} />
                      </td>
                      <td style={{ padding: '15px 18px' }}>
                        <span style={{
                          background: '#D6E6FF', color: C.accent,
                          border: `1.5px solid ${C.cardBorder}`,
                          borderRadius: '8px', padding: '4px 12px',
                          fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                        }}>
                          {log.specialization || log.recommendedSpecialization || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '15px 18px', color: C.textMuted, fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          {!loading && logs.length > 0 && (
            <div style={{ padding: '12px 18px', borderTop: `1px solid ${C.cardBorder}`, textAlign: 'right' }}>
              <span style={{ fontSize: '13px', color: C.textMuted, fontWeight: 500 }}>
                Showing {logs.length} record{logs.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;