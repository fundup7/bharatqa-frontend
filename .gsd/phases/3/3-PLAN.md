---
phase: 3
plan: 3
wave: 2
---

# Plan 3.3: Web Dashboard Integration (Admin UI)

## Objective
Expose the new backend controls (Budget & Approval) through the React Admin Dashboard.

## Context
- D:/bharatqa-frontend/src/utils/api.js
- D:/bharatqa-frontend/src/pages/Admin.js
- D:/bharatqa-frontend/src/components/GlassCard.js (context)

## Tasks

<task type="auto">
  <name>Update API Client & Admin UI</name>
  <files>
    D:/bharatqa-frontend/src/utils/api.js,
    D:/bharatqa-frontend/src/pages/Admin.js
  </files>
  <action>
    1. Add `approveTest(testId)` and `updateTestBudget(testId, budget)` to `apiClient`.
    2. In `Admin.js`, add a "Visibility Approval" toggle button to each test card in the moderation list.
    3. Implement a dynamic payout input in the test detail view to allow overriding the total budget.
  </action>
  <verify>Confirm buttons trigger correct API calls and UI state updates on success.</verify>
  <done>Admins can approve tests and edit budgets from the dashboard.</done>
</task>

## Success Criteria
- [ ] Admin dashboard supports visibility approval.
- [ ] Dynamic budget customization is integrated.
