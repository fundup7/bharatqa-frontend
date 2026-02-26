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

## Phase 3 Decisions

**Date:** 2026-02-26

### Scope
- **Dynamic Payouts**: Chose "Total Budget" model. Admin inputs total budget, divisible by target number of testers.
- **Admin Gate**: Mandatory "Human-in-the-loop" approval for all tests. Tests remain hidden from the Company Dashboard until Admin explicitly approves them.
- **Vision AI**: Analysis must handle cases where specific test instructions are missing from the database.

### Approach
- **Backend Wake-Up**: Conditional "Wake-up Initializer" (splash/loading screen) in Android. Triggered only if initial `api/health` check fails/delays.
- **Android Signing**: Generate new `.jks` release key for APK signing.
- **Location Fix**: One-shot, high-priority location request triggered by permission/state changes.
- **Activity Transparency**: Android "Activities" page status labels: "Pending Approval", "Approved (Paid)", or "Rejected".

### Constraints
- Side-loading warnings cannot be fully eliminated; "Trusted Installation" instructions required on the site.
