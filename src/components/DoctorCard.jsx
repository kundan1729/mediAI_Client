const DoctorCard = ({ doctor, isGoogleDoctor = false, onSlotClick }) => {
  const name = doctor?.name || 'Unknown';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const specialization = doctor?.specialization || 'Specialist';
  const slots = doctor?.availableSlots;
  const address = doctor?.address || '';
  const contactNumber = doctor?.contactNumber || doctor?.phoneNumber || '';
  const distance = doctor?.distance;
  const rating = doctor?.rating;
  const ratingCount = doctor?.ratingCount;
  const latitude = doctor?.latitude;
  const longitude = doctor?.longitude;
  const placeId = doctor?.placeId;

  const openMapsDirections = () => {
    if (latitude && longitude) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(mapsUrl, '_blank');
    } else if (address) {
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const callDoctor = () => {
    if (contactNumber) {
      window.location.href = `tel:${contactNumber}`;
    }
  };

  const formatDistance = (km) => {
    if (!km) return null;
    if (km < 1) return `${Math.round(km * 1000)} m away`;
    return `${km.toFixed(1)} km away`;
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E5E7EB',
        borderRadius: '16px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.25s ease',
        cursor: 'default',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header: Avatar + Name + Rating */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{
          width: '48px',
          height: '48px',
          flexShrink: 0,
          borderRadius: '12px',
          background: isGoogleDoctor ? '#FEF3C7' : '#DBEAFE',
          border: `2px solid ${isGoogleDoctor ? '#FCD34D' : '#93C5FD'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 700,
          color: isGoogleDoctor ? '#92400E' : '#1E40AF',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: '#111827', margin: '0 0 2px 0' }}>
            {name}
          </p>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, fontWeight: 500 }}>
            {specialization}
          </p>
          {rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', color: '#F59E0B' }}>⭐ {rating.toFixed(1)}</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({ratingCount} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Distance badge (for Google doctors) */}
      {isGoogleDoctor && distance && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: '#DBEAFE',
          color: '#0C4A6E',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
          width: 'fit-content',
        }}>
          📍 {formatDistance(distance)}
        </div>
      )}

      {/* Availability status (for MediAI doctors) */}
      {!isGoogleDoctor && slots !== undefined && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: slots > 0 ? '#DCFCE7' : '#FEE2E2',
          color: slots > 0 ? '#166534' : '#991B1B',
          padding: '5px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
          width: 'fit-content',
        }}>
          {slots > 0 ? '🟢 Available Now' : '🕒 No slots available'}
        </div>
      )}

      {/* Address (shortened for Google doctors) */}
      {address && (
        <p style={{
          fontSize: '12px',
          color: '#6B7280',
          margin: 0,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {address}
        </p>
      )}

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '4px',
        flexWrap: 'wrap',
      }}>
        {isGoogleDoctor ? (
          <>
            <button
              onClick={callDoctor}
              style={{
                flex: 1,
                minWidth: '80px',
                padding: '8px 12px',
                background: '#0C4A6E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: contactNumber ? 'pointer' : 'default',
                opacity: contactNumber ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (contactNumber) e.currentTarget.style.background = '#082f49';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0C4A6E';
              }}
            >
              ☎️ Call
            </button>
            <button
              onClick={openMapsDirections}
              style={{
                flex: 1,
                minWidth: '80px',
                padding: '8px 12px',
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#15803d';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#16A34A';
              }}
            >
              🗺️ Directions
            </button>
          </>
        ) : (
          <button
            onClick={() => onSlotClick && onSlotClick(doctor)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1d4ed8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#2563EB';
            }}
          >
            📅 View schedule ({slots} open)
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;