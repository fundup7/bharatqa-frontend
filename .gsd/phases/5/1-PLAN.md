---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Advanced Admin Controls Backend

## Objective
Implement backend APIs for the new Advanced Admin Controls as documented in DECISIONS.md, including test deletion, targeting overrides, session force-closing, and generating detailed payment CSV exports.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- D:\bharatqa-deploy\server.js
- D:\bharatqa-deploy\db.js (Assuming standard pg pool operations)

## Tasks

<task type="auto">
  <name>Implement Test Deletion API</name>
  <files>
    D:\bharatqa-deploy\server.js
  </files>
  <action>
    - Look for the existing admin endpoints (e.g., `DELETE /api/admin/companies/:id`).
    - Create a new endpoint: `DELETE /api/admin/tests/:testId`.
    - Inside, delete bugs associated with the `testId` first to respect foreign keys constraints, OR execute a transaction that wipes test records and bug records.
    - If `b2Storage` or `storage` (supabase) is available, ideally queue or synchronously delete the associated video files and apks if technically feasible. Otherwise, a DB-level cascade delete is sufficient for this scope. Ensure the response format is `{ success: true }`.
  </action>
  <verify>grep -n 'app.delete(\'/api/admin/tests/:testId' D:\bharatqa-deploy\server.js</verify>
  <done>Admin can call `DELETE /api/admin/tests/:testId` and receive a success status after records are removed.</done>
</task>

<task type="auto">
  <name>Implement Targeting Override API</name>
  <files>
    D:\bharatqa-deploy\server.js
  </files>
  <action>
    - Add a new endpoint `PUT /api/admin/tests/:testId/targeting`.
    - It should accept `device_tier`, `network_type`, `min_ram_gb`, and `max_ram_gb` in the JSON body.
    - Update the `tests` table. If `criteria` is a JSON field in `tests`, use the appropriate JSONB update functions, or just replace the column. (If criteria is not a DB column in your current schema, adjust accordingly based on how it's stored - usually it's in a `criteria` column).
    - Ensure it returns the updated test object.
  </action>
  <verify>grep -n 'app.put(\'/api/admin/tests/:testId/targeting' D:\bharatqa-deploy\server.js</verify>
  <done>Admin can update targeting criteria via API independently of the company.</done>
</task>

<task type="auto">
  <name>Implement Session Force Close API</name>
  <files>
    D:\bharatqa-deploy\server.js
  </files>
  <action>
    - Identify where active sessions are tracked. Usually this is within a `tester_sessions` table or similar. If not, it may be tracked via `bugs` with a `status = 'in_progress'` or `pending_submission`.
    - Create `DELETE /api/admin/tests/:testId/sessions/:sessionId` (or testerId). 
    - This endpoint should release the "reserved slot" so another user can test.
  </action>
  <verify>grep -n 'app.delete(\'/api/admin/tests/:testId/sessions' D:\bharatqa-deploy\server.js</verify>
  <done>Admin can free up abandoned quota slots by calling this API.</done>
</task>

<task type="auto">
  <name>Implement CSV Statements API</name>
  <files>
    D:\bharatqa-deploy\server.js
  </files>
  <action>
    - Create `GET /api/admin/payments/export`.
    - Query the historical payments table (if `transactions` or `payouts` exists). Include `tester_name`, `amount`, `paid_at`, `test_id` (or joined `tests.app_name`), and joined `companies.company_name`. 
    - Format the response as `text/csv` with relevant headers, OR return a JSON array that the frontend easily converts to CSV. Returning JSON array of detailed payment logs is perfectly fine and often easier for frontend CSV generator libraries.
  </action>
  <verify>grep -n '/api/admin/payments/export' D:\bharatqa-deploy\server.js</verify>
  <done>Admin export endpoint returns detailed payment history including task and company details.</done>
</task>

## Success Criteria
- [ ] Test deletion cascadingly removes bugs/test entries.
- [ ] Admin can manually patch targeting constraints.
- [ ] Orphaned test sessions can be terminated.
- [ ] Export API provides test-level granularity on tester payouts.
