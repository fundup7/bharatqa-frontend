import { API } from './constants';

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
      } catch (e2) {}
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const apiClient = {
  // Auth
  googleAuth: (credential) =>
    fetch(API + '/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    }).then(handleResponse),

  getCompany: (id) =>
    fetch(API + `/auth/company/${id}`).then(handleResponse),

  updateCompany: (id, data) =>
    fetch(API + `/auth/company/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  deleteCompany: (id) =>
    fetch(API + `/auth/company/${id}`, { method: 'DELETE' }).then(handleResponse),

  onboardCompany: (id, data) =>
    fetch(API + `/auth/onboarding/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // Tests
  getTests: (companyId) =>
    fetch(API + `/company/${companyId}/tests`).then(handleResponse),

  createTest: (formData) =>
    fetch(API + '/tests', { method: 'POST', body: formData }),
    // Note: createTest returns raw Response so caller can check res.ok

  deleteTest: (testId) =>
    fetch(API + `/tests/${testId}`, { method: 'DELETE' }).then(handleResponse),

  getTestStats: (testId) =>
    fetch(API + `/tests/${testId}/stats`).then(handleResponse),

  // Bugs
  getBugs: (testId) =>
    fetch(API + `/tests/${testId}/bugs`).then(handleResponse),

  deleteBug: (bugId) =>
    fetch(API + `/bugs/${bugId}`, { method: 'DELETE' }).then(handleResponse),

  analyzeWithAI: (bugId) =>
    fetch(API + `/bugs/${bugId}/analyze`, { method: 'POST' }).then(handleResponse),

  // Health
  getHealth: () =>
    fetch(API + '/health').then(handleResponse),
};