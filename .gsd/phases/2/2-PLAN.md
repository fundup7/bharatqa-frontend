---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Test Lifecycle & Admin Fixes

## Objective
Fix the SQL error when admins manually assign testers and implement the automatic completion logic for tests once they reach their tester quota. Also, ensure tests default to 'active' instead of 'pending' when approved by admins.

## Context
- .gsd/SPEC.md
- d:\bharatqa-deploy\server.js

## Tasks

<task type="auto">
  <name>Fix Admin Tester Assignment</name>
  <files>d:\bharatqa-deploy\server.js</files>
  <action>
    - Locate the `POST /api/admin/tests/:testId/assign` endpoint.
    - Change the INSERT statement from inserting into `title` and `description` to the correct column names: `bug_title` and `bug_description`.
  </action>
  <verify>Check the SQL query block to ensure the correct column names are used.</verify>
  <done>Admins can manually assign testers without throwing a SQL relation error.</done>
</task>

<task type="auto">
  <name>Automate Test Completion</name>
  <files>d:\bharatqa-deploy\server.js</files>
  <action>
    - Locate the `POST /api/bugs` endpoint (where bugs/tester participation is recorded).
    - After successfully recording a bug, write a query to count the number of distinct `tester_id`s for that `test_id`.
    - If the count is >= the `tester_quota` from the `tests` table, execute an `UPDATE` query to change the test `status` to `'completed'`.
  </action>
  <verify>Read the `POST /api/bugs` endpoint logic to ensure the quota check and update exist before the response is sent.</verify>
  <done>Tests automatically transition to 'completed' when the required number of distinct testers have participated.</done>
</task>

<task type="auto">
  <name>Update Admin Approval Status</name>
  <files>d:\bharatqa-deploy\server.js</files>
  <action>
    - In `PUT /api/admin/tests/:testId/status`, ensure that when an Admin approves a test, the status transitions to 'active' (or ensure 'approved' is treated identically to 'active' in the `GET /api/available-tests` query). 
    - The preference is to simply use `'active'` as the approved state so it immediately shows up for eligible testers.
  </action>
  <verify>Check the allowed statuses array in the endpoint and the frontend API calls if necessary.</verify>
  <done>Approved tests show up in the available tests feed for eligible testers.</done>
</task>

## Success Criteria
- [ ] Admin assignment works flawlessly.
- [ ] Tests auto-complete based on quotas.
- [ ] Approved tests become active immediately.
