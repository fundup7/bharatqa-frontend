---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Backend & API Integrations for Admin & Quotas

## Objective
Establish the necessary database and backend API foundation to support tester quotas on tests, dynamic pricing calculations, and admin capabilities (approving/rejecting tests, managing companies). Also, add the corresponding methods in `api.js` on the frontend.

## Context
- .gsd/SPEC.md
- d:\bharatqa-deploy\server.js
- d:\bharatqa-frontend\src\utils\api.js

## Tasks

<task type="auto">
  <name>Backend DB and API Updates</name>
  <files>d:\bharatqa-deploy\server.js</files>
  <action>
    - Add `tester_quota` (int) and `testing_iterations` (int) and `price_paid` (numeric) to the `tests` table insert in the `POST /api/tests` route.
    - Implement `GET /api/admin/tests` to fetch all tests.
    - Implement `PUT /api/admin/tests/:testId/status` to let admin approve/reject tests.
    - The price is dynamically calculated frontend-side before hitting this endpoint, but ensure the endpoint accepts these fields. 
  </action>
  <verify>Check server.js syntax</verify>
  <done>The server.js file contains the new routes and updated POST /api/tests query</done>
</task>

<task type="auto">
  <name>Frontend API client updates</name>
  <files>d:\bharatqa-frontend\src\utils\api.js</files>
  <action>
    - Ensure `createTest` takes `testerQuota` and `iterations` into its form data.
    - Add a method to `apiClient` for `getAdminTests()`.
    - Add a method for `updateTestStatus(testId, status)`.
    - Add a method for `deleteCompanyByAdmin(companyId)`.
  </action>
  <verify>Check api.js exports</verify>
  <done>api.js successfully exports the new methods</done>
</task>

## Success Criteria
- [ ] Backend accepts quota and iteration parameters when creating a test.
- [ ] Frontend API utility has methods mapped for all new Admin and Company actions.
