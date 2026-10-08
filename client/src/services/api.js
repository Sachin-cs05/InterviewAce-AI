const BASE_URL = 'http://localhost:5000/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('interviewace_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(data) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Interviews
  async createInterview(formData) {
    // formData handles multipart for optional PDF resume
    const res = await fetch(`${BASE_URL}/interviews`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async getInterview(id) {
    const res = await fetch(`${BASE_URL}/interviews/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async startInterview(id) {
    const res = await fetch(`${BASE_URL}/interviews/${id}/start`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async submitAnswer(id, { questionIndex, answerText, audioUsed, timeSpentSeconds }) {
    const res = await fetch(`${BASE_URL}/interviews/${id}/answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questionIndex, answerText, audioUsed, timeSpentSeconds }),
    });
    return handleResponse(res);
  },

  async getFinalReport(id) {
    const res = await fetch(`${BASE_URL}/interviews/${id}/result`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async completeInterview(id) {
    const res = await fetch(`${BASE_URL}/interviews/${id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async recordViolation(id, { type }) {
    const res = await fetch(`${BASE_URL}/interviews/${id}/violation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type }),
    });
    return handleResponse(res);
  },

  async getHistory() {
    const res = await fetch(`${BASE_URL}/interviews`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getDashboardStats() {
    const res = await fetch(`${BASE_URL}/interviews/dashboard/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // User
  async updateProfile(data) {
    const res = await fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('interviewace_token');
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: data.message }));
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}
