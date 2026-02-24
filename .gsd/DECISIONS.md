## Phase 1 Decisions

**Date:** 2026-02-24

### Scope
- Admin can Approve/Reject tests, manually assign testers, delete companies, and view all tasks.
- Pricing on the homepage will be dynamic and editable.

### Approach
- Chose: Option B (Integrated into Create Test form).
- Reason: User preference. Pricing calculated dynamically at roughly ₹70 per tester per session, rounded to the nearest zero.
- Admins will modify the pricing factors from their dashboard.

### Constraints
- Requires coordinated backend changes in `bharatqa-deploy/server.js` (and potentially other backend files). Existing tasks might need default quotas if they are missing them.
