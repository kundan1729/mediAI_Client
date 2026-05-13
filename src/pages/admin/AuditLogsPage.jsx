import { useEffect, useState, useCallback } from 'react';
import {
  getAllAuditLogs,
  getAuditLogsByAdmin,
  getAuditLogsByAction,
} from '../../services/api';

const C = {
  cardBg: '#EAF3FF',
  cardBorder: '#C7DEFF',
  accent: '#2563EB',
  accentDark: '#1A3A6B',
  text: '#1A2E4A',
  textMuted: '#5A7ABF',
  label: '#4A6FA5',
};

const actionColors = {
  ADD_DOCTOR: '#DBEAFE',
  EDIT_DOCTOR: '#FEF3C7',
  DELETE_DOCTOR: '#FEE2E2',
  UPDATE_APPOINTMENT_STATUS: '#DCE9FF',
  UPDATE_APPOINTMENT_NOTES: '#E0E9FF',
  DELETE_APPOINTMENT: '#FEE2E2',
};

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (filterType === 'admin' && filterValue) {
        data = await getAuditLogsByAdmin(filterValue);
      } else if (filterType === 'action' && filterValue) {
        data = await getAuditLogsByAction(filterValue);
      } else {
        data = await getAllAuditLogs();
      }
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterValue]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (loading) {
    return <div style={{ padding: '40px', color: C.textMuted }}>Loading audit logs...</div>;
  }

  const uniqueAdmins = [...new Set(logs.map(log => log.adminUsername))];
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        .log-row:hover { background: #F5F9FF !important; }
        .action-badge { display: inline-block; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }
      `}</style>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ margin: 0, color: C.accentDark, fontSize: '32px', fontFamily: "'DM Serif Display', Georgia, serif" }}>Audit Logs</h2>
        <p style={{ margin: '12px 0 0 0', color: C.textMuted }}>Complete history of administrative actions and changes.</p>
      </div>

      {error && (
        <div style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: '12px', padding: '16px', marginBottom: '20px', color: '#BE123C' }}>
          {error}
        </div>
      )}

      <div style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: C.label, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              Filter by
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue('');
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1.5px solid ${C.cardBorder}`,
                borderRadius: '12px',
                background: '#F5F9FF',
                color: C.text,
                fontSize: '14px',
              }}
            >
              <option value="all">All logs</option>
              <option value="admin">By admin</option>
              <option value="action">By action</option>
            </select>
          </div>

          {filterType !== 'all' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: C.label, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                {filterType === 'admin' ? 'Admin' : 'Action'}
              </label>
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: `1.5px solid ${C.cardBorder}`,
                  borderRadius: '12px',
                  background: '#F5F9FF',
                  color: C.text,
                  fontSize: '14px',
                }}
              >
                <option value="">Select...</option>
                {filterType === 'admin'
                  ? uniqueAdmins.map(admin => (
                      <option key={admin} value={admin}>{admin}</option>
                    ))
                  : uniqueActions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))
                }
              </select>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '20px', padding: '24px', overflowX: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ color: C.textMuted }}>No audit logs found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 14px', color: C.label, fontSize: '11px', textTransform: 'uppercase' }}>Timestamp</th>
                <th style={{ textAlign: 'left', padding: '12px 14px', color: C.label, fontSize: '11px', textTransform: 'uppercase' }}>Admin</th>
                <th style={{ textAlign: 'left', padding: '12px 14px', color: C.label, fontSize: '11px', textTransform: 'uppercase' }}>Action</th>
                <th style={{ textAlign: 'left', padding: '12px 14px', color: C.label, fontSize: '11px', textTransform: 'uppercase' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="log-row"
                  style={{
                    background: '#fff',
                    borderRadius: '14px',
                  }}
                >
                  <td style={{ padding: '16px 14px', color: C.text, fontSize: '13px' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 14px', color: C.text, fontSize: '13px' }}>
                    <strong>{log.adminUsername}</strong>
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <span
                      className="action-badge"
                      style={{
                        background: actionColors[log.action] || '#E8E8E8',
                        color: '#1A2E4A',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '16px 14px', color: C.textMuted, fontSize: '13px', maxWidth: '300px', wordBreak: 'break-word' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
