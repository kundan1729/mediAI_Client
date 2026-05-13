import { useEffect, useMemo, useState } from 'react';
import { getAvailability, getOccupiedTimes } from '../services/api';

const C = {
  cardBg: '#EAF3FF',
  cardBorder: '#C7DEFF',
  accent: '#2563EB',
  accentDark: '#1A3A6B',
  text: '#1A2E4A',
  textMuted: '#5A7ABF',
  label: '#4A6FA5',
  freeBorder: '#86EFAC',
  takenBg: '#F3F4F6',
};

const SLOT_VIEW_DAYS = 7;

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Read-only availability viewer. Booking is handled outside the app.
 * Totals match backend: sum of `availableSlots` per day over the same window as analysis cards.
 */
const SlotsPage = ({ doctor, onClose, onShowToast }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [loadingOccupied, setLoadingOccupied] = useState(false);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!doctor?.id) {
        return;
      }

      const today = new Date();
      const dates = [];
      for (let i = 0; i < SLOT_VIEW_DAYS; i += 1) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
      setAvailableDates(dates);
      setSelectedDate(dates[0]);

      const startDate = toDateKey(dates[0]);
      const endDate = toDateKey(dates[dates.length - 1]);

      setLoadingAvailability(true);
      try {
        const rows = await getAvailability(doctor.id, startDate, endDate);
        const map = {};
        (rows || []).forEach((row) => {
          map[row.availableDate] = row;
        });
        setAvailabilityByDate(map);
      } catch (err) {
        onShowToast(err.message || 'Failed to load slot availability', 'error');
        setAvailabilityByDate({});
      } finally {
        setLoadingAvailability(false);
      }
    };

    loadAvailability();
  }, [doctor?.id, onShowToast]);

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : null;
  const selectedDateAvailability = selectedDateKey ? availabilityByDate[selectedDateKey] : null;

  const offeredSlots = useMemo(() => {
    if (!selectedDateAvailability || !selectedDateAvailability.slotTimes) {
      return [];
    }
    return selectedDateAvailability.slotTimes || [];
  }, [selectedDateAvailability]);

  const availableTimes = useMemo(() => {
    const occupied = new Set(occupiedTimes || []);
    return offeredSlots.filter((slot) => !occupied.has(slot));
  }, [offeredSlots, occupiedTimes]);

  /** Sum of per-day remaining capacity — must match card total when both use the same API window. */
  const totalOpenInWindow = useMemo(() => {
    let sum = 0;
    availableDates.forEach((d) => {
      const key = toDateKey(d);
      const row = availabilityByDate[key];
      if (row != null && typeof row.availableSlots === 'number') {
        sum += row.availableSlots;
      }
    });
    return sum;
  }, [availableDates, availabilityByDate]);

  useEffect(() => {
    const loadOccupiedTimes = async () => {
      if (!doctor?.id || !selectedDateKey || !selectedDateAvailability || offeredSlots.length === 0) {
        setOccupiedTimes([]);
        return;
      }

      setLoadingOccupied(true);
      try {
        const data = await getOccupiedTimes(doctor.id, selectedDateKey);
        setOccupiedTimes(Array.isArray(data) ? data : []);
      } catch (err) {
        onShowToast(err.message || 'Failed to load booked times', 'error');
        setOccupiedTimes([]);
      } finally {
        setLoadingOccupied(false);
      }
    };

    loadOccupiedTimes();
  }, [doctor?.id, onShowToast, selectedDateAvailability, selectedDateKey, offeredSlots.length]);

  const initials = doctor?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'DR';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .date-btn:hover { background: #DCEBFF !important; border-color: #2563EB !important; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '28px', color: C.accentDark, margin: '0 0 6px 0' }}>
            Available slots
          </h2>
          <p style={{ fontSize: '13px', color: C.textMuted, margin: 0, lineHeight: 1.5, maxWidth: '420px' }}>
            View-only schedule for the next {SLOT_VIEW_DAYS} days. Contact the clinic directly to book an appointment.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onClose && onClose()}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            padding: '8px',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: '20px', padding: '24px', marginBottom: '24px', display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: '72px', height: '72px', flexShrink: 0, borderRadius: '14px',
          background: '#DBEAFE', border: '2px solid #93C5FD', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#1E40AF',
        }}>
          {initials}
        </div>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <p style={{ fontWeight: 700, fontSize: '20px', color: C.text, margin: '0 0 4px 0' }}>
            {doctor?.name || 'Doctor'}
          </p>
          <p style={{ fontSize: '14px', color: C.textMuted, margin: '0 0 8px 0', fontWeight: 500 }}>
            {doctor?.specialization || 'Specialist'}
          </p>
          <p style={{ fontSize: '13px', color: C.label, margin: '0 0 10px 0' }}>
            📍 {doctor?.address || 'Clinic address'}
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fff',
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '14px',
            fontWeight: 700,
            color: C.accentDark,
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: C.label, textTransform: 'uppercase' }}>Open slots (next {SLOT_VIEW_DAYS} days)</span>
            <span style={{ color: C.accent, fontSize: '18px' }}>
              {loadingAvailability ? '…' : totalOpenInWindow}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: C.label, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Select date
        </h3>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', scrollBehavior: 'smooth' }}>
          {availableDates.map((date, idx) => {
            const { day, date: dateNum, month } = formatDate(date);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={idx}
                type="button"
                className="date-btn"
                onClick={() => setSelectedDate(date)}
                style={{
                  background: isSelected ? C.accent : '#fff',
                  color: isSelected ? '#fff' : C.text,
                  border: `1.5px solid ${isSelected ? C.accent : C.cardBorder}`,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  minWidth: '90px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '13px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8, marginBottom: '4px' }}>{day}</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{dateNum}</div>
                <div style={{ fontSize: '10px', fontWeight: 600, opacity: 0.7 }}>{month}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: C.label, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Times for this day
          </h3>
          <span style={{ fontSize: '12px', fontWeight: 600, color: C.accent, background: '#DBEAFE', padding: '4px 10px', borderRadius: '8px' }}>
            {loadingAvailability || loadingOccupied ? '…' : `${availableTimes.length} open / ${offeredSlots.length} offered`}
          </span>
        </div>
        {loadingAvailability || loadingOccupied ? (
          <div style={{ color: C.textMuted, fontSize: '14px' }}>Loading slots...</div>
        ) : !selectedDateAvailability ? (
          <div style={{ color: C.textMuted, fontSize: '14px' }}>No slots allocated by admin for this date.</div>
        ) : offeredSlots.length === 0 ? (
          <div style={{ color: C.textMuted, fontSize: '14px' }}>No configured time slots for this date.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '10px' }}>
            {offeredSlots.map((slot) => {
              const isFree = availableTimes.includes(slot);
              return (
                <div
                  key={slot}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: `1.5px solid ${isFree ? C.freeBorder : '#E5E7EB'}`,
                    background: isFree ? '#fff' : C.takenBg,
                    color: isFree ? C.text : '#9CA3AF',
                    fontWeight: 600,
                    fontSize: '13px',
                    textAlign: 'center',
                  }}
                >
                  <div>{slot}</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px', color: isFree ? '#166534' : '#9CA3AF' }}>
                    {isFree ? 'Open' : 'Taken'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onClose && onClose()}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: C.accent,
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Close
      </button>
    </div>
  );
};

export default SlotsPage;
