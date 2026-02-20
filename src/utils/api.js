import { API } from './constants';

export const apiClient = {
  // Auth
  googleAuth: (credential) =>
    fetch(API + '/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    }).then(r => r.json()),

  getCompany: (id) =>
    fetch(API + `/auth/company/${id}`).then(r => r.json()),

  updateCompany: (id, data) =>
    fetch(API + `/auth/company/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  deleteCompany: (id) =>
    fetch(API + `/auth/company/${id}`, { method: 'DELETE' }).then(r => r.json()),

  onboardCompany: (id, data) =>
    fetch(API + `/auth/onboarding/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Tests
  getTests: (companyId) =>
    fetch(API + `/company/${companyId}/tests`).then(r => r.json()),

  createTest: (formData) =>
    fetch(API + '/tests', { method: 'POST', body: formData }),

  deleteTest: (testId) =>
    fetch(API + `/tests/${testId}`, { method: 'DELETE' }),

  getTestStats: (testId) =>
    fetch(API + `/tests/${testId}/stats`).then(r => r.json()),

  // Bugs
  getBugs: (testId) =>
    fetch(API + `/tests/${testId}/bugs`).then(r => r.json()),

  deleteBug: (bugId) =>
    fetch(API + `/bugs/${bugId}`, { method: 'DELETE' }),

  analyzeWithAI: (bugId) =>
    fetch(API + `/bugs/${bugId}/analyze`, { method: 'POST' }).then(r => r.json()),

  // Health
  getHealth: () =>
    fetch(API + '/health').then(r => r.json()),
};