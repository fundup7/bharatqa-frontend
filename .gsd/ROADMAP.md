# ROADMAP.md

> **Current Phase**: Phase 4
> **Milestone**: v1.1

## Must-Haves (from SPEC)
- [x] Implement Admin controls over testers and company tasks
- [x] Add Company config for Test Quotas (number of testers, number of times)
- [x] Display pricing packages on the Homepage

## Phases

### Phase 1: Admin Controls & Company Quotas
**Status**: ✅ Complete
**Objective**: Introduce admin moderation capabilities (approve/reject tests, assign testers, manage companies), allow companies to set test quotas (calculate pricing dynamically at ₹70/tester/session).
**Requirements**: REQ-01, REQ-02, REQ-03

### Phase 2: Onboarding, UI Polish & Test Lifecycle
**Status**: ✅ Complete
**Objective**: Enforce mandatory onboarding fields (phone) on frontend, improve navbar UI (Sign In/Out buttons), fix manual tester assignment query, and implement the complete Test Lifecycle (Pending -> Active -> Completed) including automatic completion.
**Requirements**: REQ-04, REQ-05

### Phase 3: Resilience & Moderation
**Status**: ✅ Complete
**Objective**: Enhanced platform resilience, AI-driven moderation, and dynamic financial control. 
**Requirements**: REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-11, REQ-12

### Phase 4: Shareable Reports & Admin Impersonation
**Status**: ✅ Complete
**Objective**: Enable sharing a company's dashboard with external stakeholders via an expiring public link. Allow admins to impersonate companies from the admin panel.

### Phase 5 & 6: Payout History, Tester Approvals & Advanced Controls
**Status**: ✅ Complete
**Objective**: Add payouts to wallet history, prevent test visibility before admin approval, and enable Admin targeting overrides.

### Phase 7: Analytics, Refined Deletions & Session Management
**Status**: ⏳ Pending
**Objective**: Introduce detailed CSV payment statements (Option I), prevent complete company deletion while enabling strict project deletion ("DELETE" confirmation), and implement Active Testing Sessions management with manual force-closures (Option G).
