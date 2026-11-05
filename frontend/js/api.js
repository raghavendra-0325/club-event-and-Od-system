// Determine API Base URL dynamically
const API_BASE = window.location.origin.includes('localhost:5000') || window.location.origin.includes('127.0.0.1:5000')
  ? '/api'
  : 'http://localhost:5000/api';

/**
 * Generic request helper using native fetch
 * @param {string} endpoint - API route path
 * @param {object} options - Fetch options (method, headers, body)
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = result.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return result;
  } catch (error) {
    console.error(`[API Error: ${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

// Exported API Methods
const API = {
  // System Health
  checkHealth: async () => {
    return await apiRequest('/health', { method: 'GET' });
  },

  // Dashboard Analytics
  getDashboardStats: async () => {
    return await apiRequest('/analytics/dashboard', { method: 'GET' });
  },

  // System Logs
  getLogs: async (entityType = 'all', limit = 20) => {
    return await apiRequest(`/logs?entityType=${entityType}&limit=${limit}`, { method: 'GET' });
  },

  // ==================== USERS & ROLES ====================
  getUsers: async (role = 'all', department = 'all', search = '') => {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    if (department && department !== 'all') params.append('department', department);
    if (search) params.append('search', search);
    return await apiRequest(`/users?${params.toString()}`, { method: 'GET' });
  },

  getUserById: async (id) => {
    return await apiRequest(`/users/${id}`, { method: 'GET' });
  },

  createUser: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: userData
    });
  },

  updateUser: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: userData
    });
  },

  deleteUser: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  getRolesMeta: async () => {
    return await apiRequest('/users/meta/roles', { method: 'GET' });
  },

  // ==================== CLUBS ====================
  getClubs: async (category = 'all', status = 'all', search = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    return await apiRequest(`/clubs?${params.toString()}`, { method: 'GET' });
  },

  getClubById: async (id) => {
    return await apiRequest(`/clubs/${id}`, { method: 'GET' });
  },

  createClub: async (clubData) => {
    return await apiRequest('/clubs', {
      method: 'POST',
      body: clubData
    });
  },

  updateClub: async (id, clubData) => {
    return await apiRequest(`/clubs/${id}`, {
      method: 'PUT',
      body: clubData
    });
  },

  deleteClub: async (id) => {
    return await apiRequest(`/clubs/${id}`, {
      method: 'DELETE'
    });
  },

  joinClub: async (clubId, userId) => {
    return await apiRequest(`/clubs/${clubId}/join`, {
      method: 'POST',
      body: { userId }
    });
  },

  // ==================== EVENTS ====================
  getEvents: async (status = 'all', stage = 'all', clubId = 'all', search = '') => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (stage && stage !== 'all') params.append('stage', stage);
    if (clubId && clubId !== 'all') params.append('clubId', clubId);
    if (search) params.append('search', search);
    return await apiRequest(`/events?${params.toString()}`, { method: 'GET' });
  },

  getEventById: async (id) => {
    return await apiRequest(`/events/${id}`, { method: 'GET' });
  },

  createEvent: async (eventData) => {
    return await apiRequest('/events', {
      method: 'POST',
      body: eventData
    });
  },

  updateEvent: async (id, eventData) => {
    return await apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: eventData
    });
  },

  deleteEvent: async (id) => {
    return await apiRequest(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  reviewEvent: async (id, reviewData) => {
    return await apiRequest(`/events/${id}/review`, {
      method: 'PATCH',
      body: reviewData
    });
  },

  // ==================== OD (ON DUTY) REQUESTS ====================
  getOdRequests: async (status = 'all', stage = 'all', department = 'all', search = '') => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (stage && stage !== 'all') params.append('stage', stage);
    if (department && department !== 'all') params.append('department', department);
    if (search) params.append('search', search);
    return await apiRequest(`/od?${params.toString()}`, { method: 'GET' });
  },

  getOdById: async (id) => {
    return await apiRequest(`/od/${id}`, { method: 'GET' });
  },

  createOd: async (odData) => {
    return await apiRequest('/od', {
      method: 'POST',
      body: odData
    });
  },

  updateOd: async (id, odData) => {
    return await apiRequest(`/od/${id}`, {
      method: 'PUT',
      body: odData
    });
  },

  deleteOd: async (id) => {
    return await apiRequest(`/od/${id}`, {
      method: 'DELETE'
    });
  },

  reviewOd: async (id, reviewData) => {
    return await apiRequest(`/od/${id}/review`, {
      method: 'PATCH',
      body: reviewData
    });
  },

  getOdSlip: async (id) => {
    return await apiRequest(`/od/${id}/slip`, { method: 'GET' });
  }
};
