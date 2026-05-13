const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE_URL = rawBaseUrl.replace(/\/$/, '');

const getToken = () => localStorage.getItem('token');
const getRole = () => localStorage.getItem('role');
const getDisplayName = () => localStorage.getItem('displayName');

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    let message = `Server error ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {}
    throw new Error(message);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

export const setAuthSession = (session) => {
  localStorage.setItem('token', session.token);
  localStorage.setItem('username', session.username || '');
  localStorage.setItem('role', session.role || 'ADMIN');
  localStorage.setItem('displayName', session.displayName || session.username || '');
};

export const getAuthRole = () => getRole() || '';

export const getAuthDisplayName = () => getDisplayName() || '';

export const getLandingPageForRole = (role) => {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN':
      return 'manage-doctors';
    case 'DOCTOR':
      return 'doctor-dashboard';
    default:
      return 'home';
  }
};

export const analyzeSymptoms = async (symptoms, location = null) => {
  const res = await fetch(`${BASE_URL}/api/symptoms/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symptoms,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      locationLabel: location?.label || '',
    }),
  });
  return handleResponse(res);
};

export const getLogs = async () => {
  const res = await fetch(`${BASE_URL}/api/logs`);
  return handleResponse(res);
};

export const getLogsBySeverity = async (severity) => {
  const res = await fetch(`${BASE_URL}/api/logs/severity/${encodeURIComponent(severity)}`);
  return handleResponse(res);
};

export const getLogsBySpecialization = async (specialization) => {
  const res = await fetch(`${BASE_URL}/api/logs/specialization/${encodeURIComponent(specialization)}`);
  return handleResponse(res);
};

export const getAllDoctors = async () => {
  const res = await fetch(`${BASE_URL}/api/doctors`);
  return handleResponse(res);
};

export const getDoctorStats = async () => {
  const res = await fetch(`${BASE_URL}/api/doctors/stats`);
  return handleResponse(res);
};

export const searchDoctors = async (query) => {
  const url = query
    ? `${BASE_URL}/api/doctors/search?query=${encodeURIComponent(query)}`
    : `${BASE_URL}/api/doctors`;
  const res = await fetch(url);
  return handleResponse(res);
};

export const updateDoctor = async (id, doctor) => {
  const res = await fetch(`${BASE_URL}/api/doctors/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(doctor),
  });
  return handleResponse(res);
};

export const deleteDoctor = async (id) => {
  const res = await fetch(`${BASE_URL}/api/doctors/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const login = async ({ role, username, password }) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, username, password }),
  });
  return handleResponse(res);
};

export const adminLogin = async (username, password) => login({ role: 'ADMIN', username, password });

export const getAdminProfile = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const changePassword = async ({ oldPassword, newPassword }) => {
  const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return handleResponse(res);
};

export const addDoctor = async (doctor) => {
  const res = await fetch(`${BASE_URL}/api/doctors`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(doctor),
  });
  return handleResponse(res);
};

export const getAvailability = async (doctorId, startDate, endDate) => {
  const params = new URLSearchParams();
  if (doctorId) params.append('doctorId', doctorId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const res = await fetch(`${BASE_URL}/api/availability?${params.toString()}`);
  return handleResponse(res);
};

export const deleteAvailability = async (id) => {
  const res = await fetch(`${BASE_URL}/api/availability/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getOccupiedTimes = async (doctorId, date) => {
  const params = new URLSearchParams();
  params.append('doctorId', doctorId);
  params.append('date', date);
  const res = await fetch(`${BASE_URL}/api/appointments/occupied?${params.toString()}`);
  return handleResponse(res);
};

export const bookAppointment = async ({
  doctorId,
  appointmentDate,
  appointmentTime,
  patientName,
  patientPhone,
  patientEmail,
  symptoms,
  notes,
}) => {
  const res = await fetch(`${BASE_URL}/api/appointments/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctorId,
      appointmentDate,
      appointmentTime,
      patientName,
      patientPhone,
      patientEmail,
      symptoms,
      notes,
    }),
  });
  return handleResponse(res);
};

export const allocateSlots = async ({ doctorId, date, slotTimes }) => {
  const res = await fetch(`${BASE_URL}/api/availability/allocate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ doctorId, date, slotTimes }),
  });
  return handleResponse(res);
};

export const allocateSlotsRange = async ({ doctorId, startDate, endDate, slotTimes }) => {
  const res = await fetch(`${BASE_URL}/api/availability/allocate-range`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ doctorId, startDate, endDate, slotTimes }),
  });
  return handleResponse(res);
};

export const getAllAuditLogs = async () => {
  const res = await fetch(`${BASE_URL}/api/audit-logs`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getAuditLogsByAdmin = async (adminUsername) => {
  const res = await fetch(`${BASE_URL}/api/audit-logs/admin/${encodeURIComponent(adminUsername)}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getAuditLogsByAction = async (action) => {
  const res = await fetch(`${BASE_URL}/api/audit-logs/action/${encodeURIComponent(action)}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const isLoggedIn = () => {
  const token = getToken();
  return !!token;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  localStorage.removeItem('displayName');
};