---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: Backend - Tester Assignment Fix & Link Expiration

## Objective
Update the backend to allow admins to force-assign a test project to a tester bypassing targeting criteria. Simultaneously, update the share result link to expiration based on user's selected duration (1hr, 24hr, 168hr).

## Context
- `.gsd/SPEC.md`
- `D:\bharatqa-deploy\server.js`

## Tasks

<task type="auto">
  <name>Update GET /api/tests/available-tests</name>
  <files>D:\bharatqa-deploy\server.js</files>
  <action>
    - Ensure the query checks if `tester_test_assignments` has a record for this `tester_id` and `test_id`.
    - If a manual assignment exists, the test should be returned regardless of the device tier or other targeting criteria.
    - Specifically, update the `WHERE` clause: `AND (t.status = 'active' OR t.status = 'yet-to-approve') AND ( COALESCE(assignments.assigned, false) = true OR ( (t.criteria->>'device_tier' IS NULL OR t.criteria->>'device_tier' = '' OR t.criteria->>'device_tier' = $3) AND ... ) )`.
  </action>
  <verify>Syntax check the file with `node -c server.js`</verify>
  <done>The available-tests endpoint respects manual assignments overriding targeting criteria.</done>
</task>

<task type="auto">
  <name>Update POST /api/tests/:testId/share</name>
  <files>D:\bharatqa-deploy\server.js</files>
  <action>
    - Read `durationHours` from `req.body`.
    - Calculate the `expires_at` based on `durationHours` (defaulting to 30 days if not provided).
    - Allow updating the existing share row with the new token and expiry if it already exists, or insert new.
  </action>
  <verify>Syntax check the file with `node -c server.js`</verify>
  <done>The share endpoint accepts a duration parameter and sets expiration dynamically.</done>
</task>

## Success Criteria
- [ ] `available-tests` API returns manually assigned tests even for restricted devices.
- [ ] Share generation API correctly applies varying hour-based expirations.
