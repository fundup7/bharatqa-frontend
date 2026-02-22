import { API } from './constants';

// API key read from environment variable
const API_KEY = process.env.REACT_APP_API_KEY;

/**
 * Shared fetch wrapper that injects the x-api-key header on every request.
 * The /health endpoint intentionally omits the key (it is public).
 */
function apiFetch(url, options = {}) {
  const isHealth = url.includes('/health');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(isHealth ? {} : { 'x-api-key': API_KEY }),
      ...(options.headers || {}),
    },
  });
}

async function handleResponse(response) {
  // If the server returned an error status
  if (!response.ok) {
    let errorMessage = `Server error (${response.status})`;
    try {
      const data = await response.json();
      errorMessage = data.error || data.message || errorMessage;
    } catch (e) {
      // Response wasn't JSON (e.g., 502 HTML page from Render)
      try {
        const text = await response.text();
        if (text.length < 200) errorMessage = text;
      } catch (e2) { }
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const apiClient = {
  // Auth
  googleAuth: (credential) =>
    apiFetch(API + '/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }).then(handleResponse),

  getCompany: (id) =>
    apiFetch(API + `/auth/company/${id}`).then(handleResponse),

  updateCompany: (id, data) =>
    apiFetch(API + `/auth/company/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteCompany: (id) =>
    apiFetch(API + `/auth/company/${id}`, { method: 'DELETE' }).then(handleResponse),

  onboardCompany: (id, data) =>
    apiFetch(API + `/auth/onboarding/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),

  getCompanyUniqueTesters: (companyId) =>
    apiFetch(API + `/company/${companyId}/unique-testers`).then(handleResponse),

  // Tests
  getTests: (companyId) =>
    apiFetch(API + `/company/${companyId}/tests`).then(handleResponse),

  createTest: (formData) =>
    // FormData: don't set Content-Type so browser sets multipart boundary automatically
    fetch(API + '/tests', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY },
      body: formData,
    }),
  // Note: createTest returns raw Response so caller can check res.ok

  deleteTest: (testId) =>
    apiFetch(API + `/tests/${testId}`, { method: 'DELETE' }).then(handleResponse),

  getTestStats: (testId) =>
    apiFetch(API + `/tests/${testId}/stats`).then(handleResponse),

  // Bugs
  getBugs: (testId) =>
    apiFetch(API + `/tests/${testId}/bugs`).then(handleResponse),

  deleteBug: (bugId) =>
    apiFetch(API + `/bugs/${bugId}`, { method: 'DELETE' }).then(handleResponse),

  analyzeWithAI: (bugId) =>
    apiFetch(API + `/bugs/${bugId}/analyze`, { method: 'POST' }).then(handleResponse),

  // Health (no API key — public endpoint)
  getHealth: () =>
    fetch(API + '/health').then(handleResponse),
};