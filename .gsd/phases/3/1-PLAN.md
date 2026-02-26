---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Backend Infrastructure (Budget & Approval)

## Objective
Implement the foundational database changes and core API logic to support dynamic payouts (Total Budget) and the Admin approval flag.

## Context
- .gsd/phases/3/RESEARCH.md
- D:/bharatqa-deploy/server.js
- D:/bharatqa-deploy/db.js

## Tasks

<task type="auto">
  <name>Database Schema Migration</name>
  <files>D:/bharatqa-deploy/migrate_phase3.sql</files>
  <action>
    Create a new SQL migration file to:
    1. Add `total_budget` (NUMERIC) to the `tests` table.
    2. Add `admin_approved` (BOOLEAN, default FALSE) to the `tests` table.
    3. Ensure existing tests remain functional by defaulting `total_budget` to `tester_quota * price_paid` where applicable.
  </action>
  <verify>Run `node test_db.js` after manually applying the SQL to confirm connectivity and schema integrity.</verify>
  <done>Columns `total_budget` and `admin_approved` exist in the `tests` table.</done>
</task>

<task type="auto">
  <name>Update Test Creation Logic</name>
  <files>D:/bharatqa-deploy/server.js</files>
  <action>
    Modify `app.post('/api/tests')` to:
    1. Accept `total_budget` from `req.body`.
    2. Calculate `price_paid` as `total_budget / tester_quota` (per tester payout).
    3. Insert both `total_budget` and explicitly set `admin_approved = FALSE` into the database.
  </action>
  <verify>Submit a test creation request via Postman or script and verify the calculated `price_paid` in the DB.</verify>
  <done>New tests are created with the correct `total_budget` and `admin_approved = false`.</done>
</task>

## Success Criteria
- [ ] Database schema updated.
- [ ] Test creation logic correctly handles Total Budget.
