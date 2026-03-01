---
phase: 7
plan: 1
wave: 1
---

# Plan 7.1: Analytics, Refined Deletions, and Session Management

## Objective
Implement Phase 7 requirements encompassing strict project deletions, Option I (CSV payment statements), Option G (Active Session Management), Company Share Link Expiry, and fixing the Phase 6 Option D (Tester Assignment overrides).

## Context
- `d:\bharatqa-frontend\src\pages\AdminPage.js`
- `d:\bharatqa-frontend\src\utils\api.js`
- `d:\bharatqa-deploy\server.js`

## Features & Scope

1. **Refined Deletions & Warnings**
   - **Frontend**: Remove the "Delete Company" button entirely from the Admin panel.
   - **Frontend**: Add a "Delete Test Project" button for Admins, guarded by a modal that requires typing exactly `"DELETE"` to confirm.
   - **Frontend**: Protect other negative actions (e.g., "Ban User") with double-confirmation modals.

2. **Fix Option D (Tester Assignment Overrides)**
   - **Backend**: Locate the endpoint where the mobile app fetches `available-tests`.
   - **Backend**: Update the SQL query so that if a tester is manually assigned to a test (in `tester_test_assignments`), that test is returned ignoring `device_tier` or other targeting criteria mismatches.

3. **Option I (Detailed CSV Payment Statements)**
   - **Backend**: Create a new endpoint `GET /api/admin/payments/csv` that joins `transactions/payouts`, `testers`, and `tests/companies` to assemble detailed logs.
   - **Frontend**: Add an "Export CSV" button in the Admin Wallet/Payments section.

4. **Option G (Active Testing Sessions Management)**
   - **Backend**: Add infrastructure to track "Session Starts" (when a tester claims a test slot).
   - **Frontend (Admin)**: Create an "Active Sessions" view displaying users currently testing an app.
   - **Backend & Frontend**: Add a "Force Close Session" button. This backend endpoint will release the tester's lock on the slot, allowing another tester to take it.

5. **Configurable Share Link Expiry**
   - **Frontend**: In the company's test detail dashboard (or wherever they generate share links), add a dropdown to select expiry duration: "1 Hour", "1 Day", "7 Days".
   - **Backend**: Ensure the `POST /api/tests/:testId/share` generates the link honoring this selected `durationHours`.

## Risks & Edge Cases
- **Session State**: We need to make sure the Android fetch-tests endpoint accurately respects the `force_close` state so the tester is booted immediately upon refresh.
- **SQL Complexities**: The available-tests query for Option D might be complex if it involves JSONB tracking parameters. We will investigate the query and fix the boolean logical groupings.

## Verification Plan
1. **Manual UI Check**: Open AdminPage. Verify "Delete Company" is gone, "Delete Test" requires "DELETE" input. Ban user requires confirmation.
2. **API Verification**: Call the `csv` export endpoint and ensure the file downloads correctly formatted.
3. **Database Test**: Mock a tester assignment on a restricted test, simulate the Android API call, and verify that the manually assigned test is in the payload.
