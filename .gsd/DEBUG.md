# Debug Session: Manual Assignment showing as bug approval

## Symptom
When an Admin assigns a new tester to a test, a "pseudo-bug" appears inside the Bug Approval tab. The system creates an artificial bug record to lock the `tester_id` slot, but fails to hide it from admins who approve real vulnerabilities. Additionally, the "Started At" timestamp under "Active Sessions" displays the time the tester was assigned, inaccurately implying they actively tested the app.

**When:** When a tester is manually assigned via the Admin Tests tab (`/api/admin/tests/:testId/assign`).
**Expected:** The assignment reserves a spot for the tester. It should not appear as a test result awaiting AI/Admin grading. The active session view should either reflect actual app usage or accurately clarify that the date represents only an "assignment" lock.
**Actual:** The placeholder bug `Manual Assignment` flooded the pending bugs queue (`/api/admin/bugs/pending`). The Admin session tracker incorrectly labeled assignment time as "Started at".

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | `adminGetPendingBugs` fetches all bugs where status='pending' regardless of if it's an assignment placeholder. | 95% | CONFIRMED |
| 2 | The mobile app submits a "Start Test" ping to update the timestamp, but we failed to build the endpoint. | 25% | ELIMINATED |

## Attempts

### Attempt 1
**Testing:** H1 — `adminGetPendingBugs` missing filter
**Action:** Investigated `server.js` route `/api/admin/bugs/pending` returning all unstructured bugs. Added `b.bug_title != 'Manual Assignment'` to the SQL query.
**Result:** Successfully eliminated the placeholder artifacts from `AdminPage`'s bug approval queue.
**Conclusion:** CONFIRMED

### Attempt 2
**Testing:** H2 — Missing Mobile start ping
**Action:** Scanned `server.js` mapping tests. There is no `start` session endpoint that the mobile apk interacts with. Time tracking strictly happens upon final `/api/bugs` JSON submission.
**Result:** "Started at" can never be accurately measured prior to submission lacking Android modification scope.
**Conclusion:** ELIMINATED. Re-labeled table header directly to "Assigned At" inside the `AdminPage.js` Active Session map representing reality.

## Resolution

**Root Cause:** Bug approval API fetched `pending` tests indiscriminately, failing to exclude placeholders generated to manage assignment capacity. The "Started at" ambiguity stemmed from UI mislabeling of backend `created_at` records.
**Fix:** Modified `d:\bharatqa-deploy\server.js:` line 606 to filter `bug_title != 'Manual Assignment'`. Replaced `<th>Started At</th>` with explicitly titled `<th>Assigned At</th>` in `AdminPage.js`.
**Verified:** API `GET /api/admin/bugs/pending` executes cleanly. React syntax re-compiled via `npm run build`.
**Regression Check:** Verified Active Session `forceClose` query continues to recognize the `'Manual Assignment'` string.
