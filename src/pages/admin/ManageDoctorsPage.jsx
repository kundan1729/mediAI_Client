import { useEffect, useState, useCallback } from 'react';
import {
  getAllDoctors,
  getDoctorStats,
  searchDoctors,
  updateDoctor,
  deleteDoctor,
} from '../../services/api';
import ErrorBox from '../../components/ErrorBox';

const C = {
  cardBg: '#EAF3FF',
  cardBorder: '#C7DEFF',
  accent: '#2563EB',
  accentDark: '#1A3A6B',
  text: '#1A2E4A',
  textMuted: '#5A7ABF',
  label: '#4A6FA5',
};

const ManageDoctorsPage = ({ onShowToast, onNavigate }) => {
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', specialization: '', availableSlots: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [doctorsData, statsData] = await Promise.all([
        getAllDoctors(),
        getDoctorStats(),
      ]);
      setDoctors(doctorsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Unable to load doctor management data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = async () => {
    if (!query.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await searchDoctors(query.trim());
      setDoctors(result);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditId(doctor.id);
    setEditForm({
      name: doctor.name,
      specialization: doctor.specialization,
      availableSlots: doctor.availableSlots.toString(),
    });
  };

  const handleUpdate = async () => {
    if (!editForm.name.trim() || !editForm.specialization || Number(editForm.availableSlots) < 1) {
      onShowToast('Please complete all fields before saving.', 'error');
      return;
    }

    try {
      await updateDoctor(editId, {
        name: editForm.name.trim(),
        specialization: editForm.specialization,
        availableSlots: Number(editForm.availableSlots),
      });
      onShowToast('Doctor updated successfully.', 'success');
      setEditId(null);
      setEditForm({ name: '', specialization: '', availableSlots: '' });
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Update failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this doctor permanently?');
    if (!confirmed) return;
    try {
      await deleteDoctor(id);
      onShowToast('Doctor removed successfully.', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Delete failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', color: C.textMuted }}>
        Loading admin tools...
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        .manage-btn:hover { background: #1A3A6B !important; }
        .table-row:hover { background: #F5F9FF !important; }
        .field-select:focus, .field-input:focus { border-color: #2563EB !important; outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
      `}</style>

      <div style={{ display: 'grid', gap: '26px' }}>
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '24px', padding: '30px' }}>
          <h2 style={{ margin: 0, color: C.accentDark, fontSize: '32px', fontFamily: "'DM Serif Display', Georgia, serif" }}>Doctor Management</h2>
          <p style={{ margin: '12px 0 0 0', color: C.textMuted }}>Search, edit, and remove doctors from the system.</p>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              className="field-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctors by name or specialization"
              style={{ flex: 1, minWidth: '220px', padding: '12px 14px', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', background: '#F5F9FF', color: C.text }}
            />
            <button
              className="manage-btn"
              onClick={handleSearch}
              style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 18px', cursor: 'pointer', fontWeight: 600 }}
            >
              Search
            </button>
            <button
              onClick={() => onNavigate && onNavigate('add-doctor')}
              style={{ background: '#fff', color: C.accentDark, border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', padding: '12px 16px', cursor: 'pointer', fontWeight: 700 }}
            >
              + Add Doctor
            </button>
          </div>

          <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }}>
            <div style={{ background: '#fff', borderRadius: '18px', border: `1.5px solid ${C.cardBorder}`, padding: '18px' }}>
              <span style={{ fontSize: '12px', color: C.label, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total doctors</span>
              <p style={{ margin: '8px 0 0', fontSize: '28px', color: C.accentDark, fontWeight: 700 }}>{stats?.totalDoctors ?? 0}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '18px', border: `1.5px solid ${C.cardBorder}`, padding: '18px' }}>
              <span style={{ fontSize: '12px', color: C.label, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Specializations</span>
              <p style={{ margin: '8px 0 0', fontSize: '28px', color: C.accentDark, fontWeight: 700 }}>{stats?.totalSpecializations ?? 0}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '18px', border: `1.5px solid ${C.cardBorder}`, padding: '18px' }}>
              <span style={{ fontSize: '12px', color: C.label, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Available slots</span>
              <p style={{ margin: '8px 0 0', fontSize: '28px', color: C.accentDark, fontWeight: 700 }}>{stats?.totalAvailableSlots ?? 0}</p>
            </div>
          </div>
        </div>

        <div style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '24px', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px' }}>
            <div>
              <h3 style={{ margin: 0, color: C.accentDark, fontSize: '26px' }}>Doctor list</h3>
              <p style={{ margin: '8px 0 0', color: C.textMuted }}>Edit doctor records or remove outdated entries.</p>
            </div>
            {editId && (
              <button
                onClick={() => {
                  setEditId(null);
                  setEditForm({ name: '', specialization: '', availableSlots: '' });
                }}
                style={{ background: 'transparent', color: '#9F1239', border: '1.5px solid #FECACA', borderRadius: '14px', padding: '12px 16px', cursor: 'pointer' }}
              >
                Cancel edit
              </button>
            )}
          </div>

          {doctors.length === 0 ? (
            <div style={{ marginTop: '22px', color: C.textMuted }}>No doctors found. Add one from the admin panel.</div>
          ) : (
            <div style={{ marginTop: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 14px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '14px 16px', color: C.label, fontSize: '12px', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '14px 16px', color: C.label, fontSize: '12px', textTransform: 'uppercase' }}>Specialization</th>
                    <th style={{ textAlign: 'left', padding: '14px 16px', color: C.label, fontSize: '12px', textTransform: 'uppercase' }}>Slots</th>
                    <th style={{ textAlign: 'right', padding: '14px 16px', color: C.label, fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="table-row" style={{ background: '#fff', borderRadius: '18px' }}>
                      <td style={{ padding: '18px 16px', color: C.text }}>{doctor.name}</td>
                      <td style={{ padding: '18px 16px', color: C.text }}>{doctor.specialization}</td>
                      <td style={{ padding: '18px 16px', color: C.text }}>{doctor.availableSlots}</td>
                      <td style={{ padding: '18px 16px', color: C.text, textAlign: 'right' }}>
                        <button
                          onClick={() => handleEdit(doctor)}
                          style={{ marginRight: '10px', background: '#E0F2FE', color: '#0C4A6E', border: '1.5px solid #BAE6FD', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          style={{ background: '#FFF1F2', color: '#B91C1C', border: '1.5px solid #FECACA', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {editId && (
            <div style={{ marginTop: '30px', background: '#fff', border: `1.5px solid ${C.cardBorder}`, borderRadius: '22px', padding: '26px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: C.accentDark }}>Edit doctor record</h4>
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: C.label, fontSize: '12px' }}>Name</label>
                  <input
                    className="field-input"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', background: '#F5F9FF', color: C.text }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: C.label, fontSize: '12px' }}>Specialization</label>
                  <input
                    className="field-input"
                    type="text"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm(prev => ({ ...prev, specialization: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', background: '#F5F9FF', color: C.text }}
                  />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: C.label, fontSize: '12px' }}>Available slots</label>
                  <input
                    className="field-input"
                    type="number"
                    min="1"
                    value={editForm.availableSlots}
                    onChange={(e) => setEditForm(prev => ({ ...prev, availableSlots: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', background: '#F5F9FF', color: C.text }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '22px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleUpdate}
                  style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: '14px', padding: '14px 20px', cursor: 'pointer', fontWeight: 700 }}
                >
                  Save changes
                </button>
                <button
                  onClick={() => {
                    setEditId(null);
                    setEditForm({ name: '', specialization: '', availableSlots: '' });
                  }}
                  style={{ background: '#fff', color: C.accentDark, border: `1.5px solid ${C.cardBorder}`, borderRadius: '14px', padding: '14px 20px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDoctorsPage;
