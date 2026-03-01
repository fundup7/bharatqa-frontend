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

  getSharedTest: (token) =>
    fetch(API + `/shared/tests/${token}`).then(handleResponse),

  generateShareToken: (testId, duration) =>
    apiFetch(API + `/tests/${testId}/share`, {
      method: 'POST',
      body: JSON.stringify({ duration })
    }).then(handleResponse),

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

  getAnalysis: (bugId) =>
    apiFetch(API + `/bugs/${bugId}/analysis`).then(handleResponse),

  // Video
  getVideoBlobUrl: async (url) => {
    const response = await fetch(url, {
      headers: { 'x-api-key': API_KEY },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  // Health (no API key — public endpoint)
  getHealth: () =>
    fetch(API + '/health').then(handleResponse),

  // ── Targeting Criteria ──────────────────────────────────────
  getTestCriteria: (testId) =>
    apiFetch(API + `/tests/${testId}/criteria`).then(handleResponse),

  setTestCriteria: (testId, data) =>
    apiFetch(API + `/tests/${testId}/criteria`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleResponse),

  getEligibleTesters: (testId) =>
    apiFetch(API + `/tests/${testId}/eligible-testers`).then(handleResponse),

  // ── Admin: Tests & Sessions ──────────────────────────────────
  getAdminTests: () =>
    apiFetch(API + '/admin/tests').then(handleResponse),

  getAdminActiveSessions: () =>
    apiFetch(API + '/admin/active-sessions').then(handleResponse),

  forceCloseSession: (sessionId) =>
    apiFetch(API + `/admin/sessions/${sessionId}/force-close`, {
      method: 'POST'
    }).then(handleResponse),

  updateTestStatus: (testId, status) =>
    apiFetch(API + `/admin/tests/${testId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  adminAssignTester: (testId, testerId) =>
    apiFetch(API + `/admin/tests/${testId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ tester_id: testerId }),
    }).then(handleResponse),

  adminUpdateTestBudget: (testId, total_budget, price_paid) =>
    apiFetch(API + `/admin/tests/${testId}/budget`, {
      method: 'PUT',
      body: JSON.stringify({ total_budget, price_paid }),
    }).then(handleResponse),

  // ── Admin: Bugs ───────────────────────────────────────────
  adminGetPendingBugs: () =>
    apiFetch(API + '/admin/bugs/pending').then(handleResponse),

  adminApproveBug: (bugId, status, reason = null) =>
    apiFetch(API + `/admin/bugs/${bugId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }).then(handleResponse),

  // ── Admin: Testers ───────────────────────────────────────────
  getAllTesters: () =>
    apiFetch(API + '/admin/testers').then(handleResponse),

  banTester: (testerId, banReason) =>
    apiFetch(API + `/admin/testers/${testerId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ ban_reason: banReason }),
    }).then(handleResponse),

  unbanTester: (testerId) =>
    apiFetch(API + `/admin/testers/${testerId}/ban`, {
      method: 'DELETE',
    }).then(handleResponse),

  // ── Admin: Companies ─────────────────────────────────────────
  deleteCompanyByAdmin: (companyId) =>
    apiFetch(API + `/auth/company/${companyId}`, {
      method: 'DELETE'
    }).then(handleResponse),

  adminDeleteTester: (testerId) =>
    apiFetch(API + `/admin/testers/${testerId}`, { method: 'DELETE' }).then(handleResponse),

  adminDeleteBug: (bugId) =>
    apiFetch(API + `/bugs/${bugId}`, { method: 'DELETE' }).then(handleResponse),

  adminDeleteCompany: (companyId) =>
    apiFetch(API + `/admin/companies/${companyId}`, { method: 'DELETE' }).then(handleResponse),

  adminGetCompanyProfile: (companyId) =>
    apiFetch(API + `/admin/companies/${companyId}`).then(handleResponse),

  // ── Payments ─────────────────────────────────────────────────────────────
  getTesterWallet: (testerId) =>
    apiFetch(API + `/testers/${testerId}/wallet`).then(handleResponse),

  getTesterPayments: (testerId) =>
    apiFetch(API + `/testers/${testerId}/payments`).then(handleResponse),

  updateTesterUpi: (testerId, upi_id) =>
    apiFetch(API + `/testers/${testerId}/upi`, {
      method: 'PUT',
      body: JSON.stringify({ upi_id }),
    }).then(handleResponse),

  getPendingPayments: () =>
    apiFetch(API + '/admin/payments/pending').then(handleResponse),

  batchPay: (testerIds = [], note = '') =>
    apiFetch(API + '/admin/payments/batch', {
      method: 'POST',
      body: JSON.stringify({ tester_ids: testerIds, note }),
    }).then(handleResponse),
};
