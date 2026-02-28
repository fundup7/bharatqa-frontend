---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Database Migrations and Backend APIs

## Objective
Implement backend support for Shareable Test Results and Admin Impersonation.

## Context
- .gsd/SPEC.md
- D:\bharatqa-deploy\server.js

## Tasks

<task type="auto">
  <name>Database Migrations</name>
  <files>D:\bharatqa-deploy\server.js</files>
  <action>
    Modify `server.js` `runMigrations()` block to add two new columns to the `tests` table:
    - `share_token` (TEXT)
    - `share_expires_at` (TIMESTAMP)
  </action>
  <verify>grep "share_token" D:\bharatqa-deploy\server.js</verify>
  <done>Columns are added seamlessly without breaking existing migrations.</done>
</task>

<task type="auto">
  <name>Share Link API</name>
  <files>D:\bharatqa-deploy\server.js</files>
  <action>
    Add `POST /api/tests/:testId/share` endpoint:
    - Generates a UUID string (requires `crypto` module, e.g. `crypto.randomUUID()`)
    - Sets expiry to 30 days from now
    - Updates `share_token` and `share_expires_at` in the `tests` table
    - Returns the generated token
  </action>
  <verify>grep "/api/tests/:testId/share" D:\bharatqa-deploy\server.js</verify>
  <done>Endpoint successfully returns a token.</done>
</task>

<task type="auto">
  <name>Public Shared Test Data API</name>
  <files>D:\bharatqa-deploy\server.js</files>
  <action>
    Add `GET /api/shared/tests/:token` endpoint:
    - Finds a test by `share_token` where `share_expires_at > NOW()`
    - Returns minimal test data (app_name, company_name, instructions, status, created_at, criteria)
    - IMPORTANT: Excludes sensitive data (price_paid, total_budget, company_id)
    - Also fetches approved bugs associated with the test
  </action>
  <verify>grep "/api/shared/tests/:token" D:\bharatqa-deploy\server.js</verify>
  <done>Endpoint returns public-safe payload.</done>
</task>

<task type="auto">
  <name>Admin Company Profile API</name>
  <files>D:\bharatqa-deploy\server.js</files>
  <action>
    Add `GET /api/admin/companies/:companyId` endpoint:
    - Finds the company by ID and returns its full record so the Admin can impersonate it.
  </action>
  <verify>grep "/api/admin/companies/:companyId" D:\bharatqa-deploy\server.js</verify>
  <done>Endpoint returns full company data.</done>
</task>

## Success Criteria
- [ ] Backend starts up successfully (`node server.js`)
- [ ] New APIs are accessible and properly secured (or explicitly public if shared).
