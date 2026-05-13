import { useCallback, useEffect, useState } from 'react';
import { allocateSlots, allocateSlotsRange, getAllDoctors, getAvailability, deleteAvailability } from '../../services/api';

const C = {
  cardBg: '#EAF3FF',
  cardBorder: '#C7DEFF',
  inputBg: '#F5F9FF',
  accent: '#2563EB',
  accentDark: '#1A3A6B',
  text: '#1A2E4A',
  textMuted: '#5A7ABF',
  label: '#4A6FA5',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  /** Edit panel actions — distinct from slot grid blue */
  saveEditBg: '#047857',
  saveEditBgDisabled: '#94A3B8',
  discardBg: '#F8FAFC',
  discardBorder: '#CBD5E1',
  discardText: '#475569',
  modalBackdrop: 'rgba(15, 23, 42, 0.45)',
};

const SlotAllocationPage = ({ onShowToast }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingSlots, setExistingSlots] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  /** Load existing rows for CRUD: doctor + list date range (independent of allocate form dates) */
  const [slotListStart, setSlotListStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [slotListEnd, setSlotListEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  });
  const [editingRowId, setEditingRowId] = useState(null);
  const [editTimes, setEditTimes] = useState([]);
  const [savingEditId, setSavingEditId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  /** 'single' = one calendar day; 'range' = start–end with same times each day */
  const [allocationMode, setAllocationMode] = useState('single');
  const [form, setForm] = useState({
    doctorId: '',
    singleDate: '',
    startDate: '',
    endDate: '',
    slotTimes: [],
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Generate time options (every 30 minutes from 9 AM to 5 PM)
  const timeOptions = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const todayMin = new Date().toISOString().split('T')[0];

  const refreshExistingSlots = useCallback(async () => {
    if (!form.doctorId || !slotListStart || !slotListEnd) {
      setExistingSlots([]);
      return;
    }
    if (new Date(slotListEnd) < new Date(slotListStart)) {
      setExistingSlots([]);
      return;
    }

    setLoadingExisting(true);
    try {
      const data = await getAvailability(Number(form.doctorId), slotListStart, slotListEnd);
      const rows = Array.isArray(data) ? [...data] : [];
      rows.sort((a, b) => String(a.availableDate ?? '').localeCompare(String(b.availableDate ?? '')));
      setExistingSlots(rows);
    } catch (err) {
      setExistingSlots([]);
    } finally {
      setLoadingExisting(false);
    }
  }, [form.doctorId, slotListStart, slotListEnd]);

  useEffect(() => {
    refreshExistingSlots();
  }, [refreshExistingSlots]);

  useEffect(() => {
    setEditingRowId(null);
    setEditTimes([]);
  }, [form.doctorId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleTimeSlot = (time) => {
    setForm(prev => {
      const times = prev.slotTimes.includes(time)
        ? prev.slotTimes.filter(t => t !== time)
        : [...prev.slotTimes, time].sort();
      return { ...prev, slotTimes: times };
    });
  };

  const isValid =
    form.doctorId &&
    form.slotTimes.length > 0 &&
    (allocationMode === 'single'
      ? !!form.singleDate
      : !!(form.startDate && form.endDate));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    if (allocationMode === 'range' && new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date must be on or after start date');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (allocationMode === 'single') {
        await allocateSlots({
          doctorId: Number(form.doctorId),
          date: form.singleDate,
          slotTimes: form.slotTimes,
        });
      } else {
        await allocateSlotsRange({
          doctorId: Number(form.doctorId),
          startDate: form.startDate,
          endDate: form.endDate,
          slotTimes: form.slotTimes,
        });
      }

      setSuccess(`Slots allocated successfully: ${form.slotTimes.join(', ')}`);
      onShowToast('Slots allocated successfully!', 'success');

      setForm((prev) => ({
        ...prev,
        slotTimes: [],
      }));
      refreshExistingSlots();
    } catch (err) {
      const message = err.message || 'Failed to allocate slots';
      setError(message);
      onShowToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteSlot = async () => {
    if (pendingDeleteId == null) return;
    const slotId = pendingDeleteId;
    setPendingDeleteId(null);

    setDeleting(slotId);
    try {
      await deleteAvailability(slotId);
      setExistingSlots(prev => prev.filter(slot => slot.id !== slotId));
      if (editingRowId === slotId) {
        setEditingRowId(null);
        setEditTimes([]);
      }
      onShowToast('Allocation removed for that date.', 'success');
    } catch (err) {
      const message = err.message || 'Failed to delete slot';
      onShowToast(message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const slotDateKey = (slot) => {
    const raw = slot.availableDate ?? slot.slotDate;
    if (!raw) return '';
    return String(raw).split('T')[0];
  };

  const startEditRow = (slot) => {
    setEditingRowId(slot.id);
    setEditTimes([...(slot.slotTimes || [])].sort());
  };

  const cancelEditRow = () => {
    setEditingRowId(null);
    setEditTimes([]);
  };

  const toggleEditTime = (time) => {
    setEditTimes((prev) => {
      const next = prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time].sort();
      return next;
    });
  };

  const saveEditRow = async (slot) => {
    if (!editTimes.length) {
      onShowToast('Select at least one time slot', 'error');
      return;
    }
    const dateKey = slotDateKey(slot);
    if (!dateKey || !form.doctorId) return;

    setSavingEditId(slot.id);
    try {
      await allocateSlots({
        doctorId: Number(form.doctorId),
        date: dateKey,
        slotTimes: editTimes,
      });
      onShowToast('Slots updated for this date.', 'success');
      cancelEditRow();
      refreshExistingSlots();
    } catch (err) {
      onShowToast(err.message || 'Failed to update slots', 'error');
    } finally {
      setSavingEditId(null);
    }
  };

  const editTimeButtonStyle = (time) => ({
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1.5px solid ${C.cardBorder}`,
    background: editTimes.includes(time) ? C.accent : C.inputBg,
    color: editTimes.includes(time) ? 'white' : C.text,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.15s',
    textAlign: 'center',
    fontFamily: 'inherit',
  });

  const inputStyle = {
    width: '100%',
    background: C.inputBg,
    border: `1.5px solid ${C.cardBorder}`,
    borderRadius: '12px',
    padding: '13px 16px',
    fontSize: '15px',
    color: C.text,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: C.label,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8px',
  };

  const timeButtonStyle = (time) => ({
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1.5px solid ${C.cardBorder}`,
    background: form.slotTimes.includes(time) ? C.accent : C.inputBg,
    color: form.slotTimes.includes(time) ? 'white' : C.text,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.15s',
    textAlign: 'center',
    fontFamily: 'inherit',
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        .field-input:focus { border-color: #2563EB !important; outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
        .submit-btn:hover:not(:disabled) { background: #1A3A6B !important; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .delete-btn:hover { background: #FEE2E2 !important; }
        .delete-btn:disabled { opacity: 0.5; }
        .time-button:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(37,99,235,0.2); }
        .slot-row:hover { background: #F5F9FF !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: '36px',
          color: C.accentDark,
          margin: '0 0 6px 0',
        }}>
          Manage Doctor Slots
        </h2>
        <p style={{ color: C.textMuted, fontSize: '15px', margin: 0 }}>
          Allocate new slots or manage existing ones. View, update, and remove slot allocations.
        </p>
      </div>

      <div>
          {/* Allocation Form */}
          <div style={{
            background: C.cardBg,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: '22px',
            padding: '36px 32px',
            marginBottom: '28px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: C.accentDark,
              margin: '0 0 24px 0',
            }}>
              ➕ Allocate New Slots
            </h3>

            {loading ? (
              <div style={{ color: C.textMuted }}>Loading doctors...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Doctor Selection */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={labelStyle}>Select Doctor</label>
                  <select
                  className="field-input"
                  value={form.doctorId}
                  onChange={e => handleChange('doctorId', e.target.value)}
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
                  <option value="">Choose a doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

                {/* Single day vs date range */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={labelStyle}>Allocation type</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setAllocationMode('single')}
                      style={{
                        flex: '1',
                        minWidth: '140px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: `1.5px solid ${allocationMode === 'single' ? C.accent : C.cardBorder}`,
                        background: allocationMode === 'single' ? '#DBEAFE' : C.inputBg,
                        color: allocationMode === 'single' ? C.accentDark : C.text,
                        fontWeight: allocationMode === 'single' ? 700 : 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Single day
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllocationMode('range')}
                      style={{
                        flex: '1',
                        minWidth: '140px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: `1.5px solid ${allocationMode === 'range' ? C.accent : C.cardBorder}`,
                        background: allocationMode === 'range' ? '#DBEAFE' : C.inputBg,
                        color: allocationMode === 'range' ? C.accentDark : C.text,
                        fontWeight: allocationMode === 'range' ? 700 : 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Date range
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: C.textMuted, margin: '10px 0 0 0' }}>
                    {allocationMode === 'single'
                      ? 'Choose one date and the times that apply only to that day.'
                      : 'Same times are applied to every day from start through end (inclusive).'}
                  </p>
                </div>

              {allocationMode === 'single' ? (
              <div style={{ marginBottom: '22px' }}>
                <label style={labelStyle}>Date</label>
                <input
                  className="field-input"
                  type="date"
                  value={form.singleDate}
                  onChange={e => handleChange('singleDate', e.target.value)}
                  min={todayMin}
                  style={inputStyle}
                />
              </div>
              ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    className="field-input"
                    type="date"
                    value={form.startDate}
                    onChange={e => handleChange('startDate', e.target.value)}
                    min={todayMin}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input
                    className="field-input"
                    type="date"
                    value={form.endDate}
                    onChange={e => handleChange('endDate', e.target.value)}
                    min={form.startDate || todayMin}
                    style={inputStyle}
                  />
                </div>
              </div>
              )}

              {/* Select Times */}
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Select Appointment Times</label>
                <p style={{ fontSize: '13px', color: C.textMuted, marginBottom: '14px' }}>
                  Choose the exact times this doctor will have available. Selected: {form.slotTimes.length} slot{form.slotTimes.length !== 1 ? 's' : ''}
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1.5px solid ${C.cardBorder}`,
                }}>
                  {timeOptions.map(time => (
                    <button
                      key={time}
                      className="time-button"
                      type="button"
                      onClick={() => toggleTimeSlot(time)}
                      style={timeButtonStyle(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                {form.slotTimes.length > 0 && (
                  <div style={{
                    marginTop: '14px',
                    padding: '10px 14px',
                    background: '#F0F7FF',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: C.text,
                  }}>
                    <strong>Selected times:</strong> {form.slotTimes.join(', ')}
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div style={{
                  marginBottom: '20px',
                  padding: '14px 16px',
                  background: '#FEE2E2',
                  border: `1px solid ${C.error}`,
                  borderRadius: '10px',
                  color: C.error,
                  fontSize: '14px',
                  animation: 'slideDown 0.3s ease-out',
                }}>
                  {error}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div style={{
                  marginBottom: '20px',
                  padding: '14px 16px',
                  background: '#D1FAE5',
                  border: `1px solid ${C.success}`,
                  borderRadius: '10px',
                  color: C.success,
                  fontSize: '14px',
                  animation: 'slideDown 0.3s ease-out',
                }}>
                  ✓ {success}
                </div>
              )}

              {/* Submit button */}
              <button
                className="submit-btn"
                type="submit"
                disabled={!isValid || submitting}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: C.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {submitting ? 'Allocating...' : allocationMode === 'single' ? 'Allocate slots for this day' : 'Allocate slots for range'}
              </button>
            </form>
          )}
          </div>

          {/* Existing allocations: doctor + list range — full CRUD */}
          <div style={{
            background: C.cardBg,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: '22px',
            padding: '36px 32px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: C.accentDark,
              margin: '0 0 8px 0',
            }}>
              Existing slots by doctor
            </h3>
            <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 22px 0', lineHeight: 1.5 }}>
              Select a doctor above. Set a date window to list that doctor&apos;s allocations. Use Edit to change times for a day, Delete to remove a day with no bookings, or use Allocate New Slots to add days.
            </p>

            {!form.doctorId ? (
              <div style={{ textAlign: 'center', color: C.textMuted, padding: '28px 16px', fontSize: '14px' }}>
                Choose a doctor in &quot;Allocate New Slots&quot; to load and manage their slots.
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <label style={labelStyle}>List from</label>
                    <input
                      className="field-input"
                      type="date"
                      value={slotListStart}
                      onChange={(e) => setSlotListStart(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>List to</label>
                    <input
                      className="field-input"
                      type="date"
                      value={slotListEnd}
                      onChange={(e) => setSlotListEnd(e.target.value)}
                      min={slotListStart}
                      style={inputStyle}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => refreshExistingSlots()}
                    style={{
                      padding: '13px 18px',
                      background: 'white',
                      border: `1.5px solid ${C.cardBorder}`,
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: C.accentDark,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Refresh list
                  </button>
                </div>

                {slotListEnd && slotListStart && new Date(slotListEnd) < new Date(slotListStart) && (
                  <div style={{ marginBottom: '16px', fontSize: '13px', color: C.error }}>
                    &quot;List to&quot; must be on or after &quot;List from&quot;.
                  </div>
                )}

                {loadingExisting ? (
                  <div style={{ textAlign: 'center', color: C.textMuted, padding: '40px 20px' }}>
                    <div style={{ fontSize: '14px' }}>Loading slots...</div>
                  </div>
                ) : existingSlots.length === 0 ? (
                  <div style={{ textAlign: 'center', color: C.textMuted, padding: '40px 20px' }}>
                    <div style={{ fontSize: '14px' }}>
                      No allocations for this doctor in the selected date window.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(100px, 120px) 1fr minmax(100px, 130px) minmax(140px, 180px)',
                      gap: '12px',
                      paddingBottom: '10px',
                      borderBottom: `1px solid ${C.cardBorder}`,
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase' }}>Date</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase' }}>Times</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase' }}>Bookings</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.label, textTransform: 'uppercase' }}>Actions</div>
                    </div>

                    {existingSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="slot-row"
                        style={{
                          background: 'white',
                          border: `1.5px solid ${C.cardBorder}`,
                          borderRadius: '14px',
                          padding: '14px 16px',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(100px, 120px) 1fr minmax(100px, 130px) minmax(140px, 180px)',
                          gap: '12px',
                          alignItems: 'center',
                        }}>
                          <div style={{ fontSize: '14px', color: C.text, fontWeight: 600 }}>
                            {(() => {
                              try {
                                const raw = slot.availableDate ?? slot.slotDate;
                                if (!raw) return 'N/A';
                                const dateStr = String(raw).split('T')[0];
                                const [year, month, day] = dateStr.split('-');
                                if (year && month && day) {
                                  const date = new Date(year, parseInt(month, 10) - 1, day);
                                  const formatted = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                  return formatted === 'Invalid Date' ? dateStr : formatted;
                                }
                                return dateStr || 'N/A';
                              } catch {
                                return slot.availableDate || slot.slotDate || 'N/A';
                              }
                            })()}
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(slot.slotTimes || []).map((t) => (
                              <span
                                key={t}
                                style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  background: C.accent,
                                  color: 'white',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {slot.bookedCount > 0 ? (
                              <>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.warning }} />
                                <span style={{ fontSize: '13px', color: C.warning, fontWeight: 600 }}>
                                  {slot.bookedCount} booked
                                </span>
                              </>
                            ) : (
                              <>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.success }} />
                                <span style={{ fontSize: '13px', color: C.success, fontWeight: 600 }}>None</span>
                              </>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                            <button
                              type="button"
                              onClick={() => (editingRowId === slot.id ? cancelEditRow() : startEditRow(slot))}
                              disabled={savingEditId === slot.id}
                              style={{
                                padding: '8px 12px',
                                background: editingRowId === slot.id ? C.inputBg : 'white',
                                color: C.accentDark,
                                border: `1.5px solid ${C.accent}`,
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: savingEditId === slot.id ? 'not-allowed' : 'pointer',
                                opacity: savingEditId === slot.id ? 0.6 : 1,
                                fontFamily: 'inherit',
                              }}
                            >
                              {editingRowId === slot.id ? 'Cancel' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => setPendingDeleteId(slot.id)}
                              disabled={slot.bookedCount > 0 || deleting === slot.id || savingEditId === slot.id}
                              style={{
                                padding: '8px 12px',
                                background: C.error,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: slot.bookedCount > 0 || deleting === slot.id ? 'not-allowed' : 'pointer',
                                opacity: slot.bookedCount > 0 || deleting === slot.id ? 0.5 : 1,
                              }}
                              title={slot.bookedCount > 0 ? 'Cannot delete while there are bookings' : 'Delete allocation for this date'}
                            >
                              {deleting === slot.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>

                        {editingRowId === slot.id && (
                          <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: `1px solid ${C.cardBorder}`,
                          }}>
                            <label style={{ ...labelStyle, marginBottom: '10px' }}>Update times for this day</label>
                            <p style={{ fontSize: '12px', color: C.textMuted, marginBottom: '12px' }}>
                              You cannot set fewer slots than existing bookings ({slot.bookedCount}). Selected: {editTimes.length}.
                            </p>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '10px',
                              marginBottom: '16px',
                            }}>
                              {timeOptions.map((time) => (
                                <button
                                  key={time}
                                  type="button"
                                  className="time-button"
                                  onClick={() => toggleEditTime(time)}
                                  style={editTimeButtonStyle(time)}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => saveEditRow(slot)}
                                disabled={!editTimes.length || savingEditId === slot.id}
                                style={{
                                  padding: '10px 20px',
                                  background: editTimes.length && savingEditId !== slot.id ? C.saveEditBg : C.saveEditBgDisabled,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '10px',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  cursor: editTimes.length && savingEditId !== slot.id ? 'pointer' : 'not-allowed',
                                  fontFamily: 'inherit',
                                  boxShadow: editTimes.length && savingEditId !== slot.id ? '0 2px 8px rgba(4, 120, 87, 0.35)' : 'none',
                                }}
                              >
                                {savingEditId === slot.id ? 'Saving...' : 'Save changes'}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditRow}
                                disabled={savingEditId === slot.id}
                                style={{
                                  padding: '10px 20px',
                                  background: C.discardBg,
                                  color: C.discardText,
                                  border: `1.5px solid ${C.discardBorder}`,
                                  borderRadius: '10px',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  cursor: savingEditId === slot.id ? 'not-allowed' : 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                Discard
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
      </div>

      {pendingDeleteId != null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-slot-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: C.modalBackdrop,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setPendingDeleteId(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setPendingDeleteId(null);
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: `1.5px solid ${C.cardBorder}`,
              boxShadow: '0 24px 48px rgba(26, 62, 122, 0.18)',
              maxWidth: '420px',
              width: '100%',
              padding: '26px 24px 22px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4
              id="delete-slot-title"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '22px',
                color: C.accentDark,
                margin: '0 0 10px 0',
              }}
            >
              Remove this day&apos;s allocation?
            </h4>
            <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.55, margin: '0 0 22px 0' }}>
              This removes all configured times for that date. It cannot be undone. Days with patient bookings cannot be deleted from the list.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                style={{
                  padding: '11px 18px',
                  background: C.discardBg,
                  color: C.discardText,
                  border: `1.5px solid ${C.discardBorder}`,
                  borderRadius: '11px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSlot}
                disabled={deleting === pendingDeleteId}
                style={{
                  padding: '11px 18px',
                  background: C.error,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '11px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: deleting === pendingDeleteId ? 'not-allowed' : 'pointer',
                  opacity: deleting === pendingDeleteId ? 0.85 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {deleting === pendingDeleteId ? 'Removing...' : 'Remove allocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotAllocationPage;
