---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Admin Dashboard Modifications

## Objective
Update the existing Admin Dashboard to list all tests across the platform so admins can approve, reject, and assign testers. Provide the ability to delete companies.

## Context
- .gsd/SPEC.md
- d:\bharatqa-frontend\src\pages\*\*.jsx (Admin Dashboard pages)
- d:\bharatqa-frontend\src\components\*\*.jsx

## Tasks

<task type="auto">
  <name>Create Admin Tests View</name>
  <files>d:\bharatqa-frontend\src\pages\AdminDashboardPage.js</files>
  <action>
    - Add a new tab or section "All Tests".
    - Fetch from `apiClient.getAdminTests()`.
    - Display tests in a table showing Company, App Name, Testers Requested, and Current Status (Pending, Approved, Rejected).
  </action>
  <verify>Check component mounts correctly without errors.</verify>
  <done>Admins can view all tasks across the platform.</done>
</task>

<task type="auto">
  <name>Implement Test Action Controls</name>
  <files>d:\bharatqa-frontend\src\components\AdminTestRow.js</files>
  <action>
    - Add "Approve" and "Reject" buttons invoking `apiClient.updateTestStatus()`.
    - Add "Assign Testers" button which opens a modal to manually bind testers to the test.
  </action>
  <verify>Check onClick handlers invoke correct api methods.</verify>
  <done>Admins can approve/reject tests directly from the dashboard.</done>
</task>

## Success Criteria
- [ ] Admins see all company tasks.
- [ ] Admins can modify task statuses.
- [ ] Admins can assign testers manually.
