/**
 * Centralized API client for Project Memory Agent.
 * Interfaces directly with the FastAPI backend.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function getStoredToken() {
  try {
    return localStorage.getItem('pma_token');
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('pma_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(user, token) {
  try {
    if (token) localStorage.setItem('pma_token', token);
    if (user) localStorage.setItem('pma_user', JSON.stringify(user));
  } catch (e) {
    console.warn('Could not persist auth to localStorage', e);
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem('pma_token');
    localStorage.removeItem('pma_user');
  } catch (e) {
    console.warn('Could not clear auth from localStorage', e);
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorDetail = `Request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (typeof errorData.detail === 'string') {
          errorDetail = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorDetail = errorData.detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
        } else if (errorData.detail) {
          errorDetail = JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorDetail = errorData.message;
        }
      } catch {
        errorDetail = res.statusText || errorDetail;
      }
      throw new Error(errorDetail);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    if (err.name === 'TypeError' && String(err.message).toLowerCase().includes('fetch')) {
      throw new Error('Unable to connect to FastAPI backend (http://127.0.0.1:8000). Please ensure the backend is running.');
    }
    throw err;
  }
}

// 0. Authentication
export async function signup({ name, email, password }) {
  clearStoredAuth();
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data?.user && data?.token) {
    setStoredAuth(data.user, data.token);
  }
  return data;
}

export async function login({ email, password }) {
  clearStoredAuth();
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.user && data?.token) {
    setStoredAuth(data.user, data.token);
  }
  return data;
}

export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const user = await request('/auth/me');
    setStoredAuth(user, token);
    return user;
  } catch (e) {
    clearStoredAuth();
    return null;
  }
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore network error on logout
  } finally {
    clearStoredAuth();
  }
}

// 1. Projects
export async function getProjects() {
  return await request('/projects');
}

export async function createProject({ name, description }) {
  return await request('/projects', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function getProject(projectId) {
  return await request(`/projects/${projectId}`);
}

export async function deleteProject(projectId) {
  return await request(`/projects/${projectId}`, {
    method: 'DELETE',
  });
}

// 2. Information & Processing
export async function addInformation(projectId, { title, info_type = 'decision', content, document_id }) {
  return await request(`/projects/${projectId}/information`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      info_type,
      content,
      document_id: document_id || undefined,
    }),
  });
}

export async function processInformation(projectId, content, options = {}) {
  const { title, document_id, info_type } = options;
  return await request(`/projects/${projectId}/process`, {
    method: 'POST',
    body: JSON.stringify({
      content,
      title: title || undefined,
      document_id: document_id || undefined,
      info_type: info_type || undefined,
    }),
  });
}

// 3. Memories & History
export async function getMemories(projectId, query = '') {
  const queryParam = query ? `?query=${encodeURIComponent(query)}` : '';
  return await request(`/projects/${projectId}/memories${queryParam}`);
}

// 4. Historical Question Answering (QA & Reasoning)
export async function askQuestion(projectId, question) {
  return await request(`/projects/${projectId}/ask`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

// 5. System Health Check
export async function checkHealth() {
  return await request('/health');
}
