# Task Breakdown

## Phase 1: Admin Controls & Pricing

- [ ] Backend: Coordinate new Admin endpoints (approve/reject tests, assign testers, delete companies).
- [ ] Backend: Coordinate endpoint modifications to save test quotas (testers * iterations) and dynamically calculate pricing.
- [ ] Frontend: Admin Dashboard
  - [ ] Add View All Tasks interface.
  - [ ] Add Task Actions (Approve, Reject, Assign Testers).
  - [ ] Add Company Account Management (Delete).
- [ ] Frontend: Company Dashboard (Create Task)
  - [ ] Add fields for "Number of Testers" and "Testing Iterations".
  - [ ] Add dynamic pricing calculator (₹70/tester/session) rounded to nearest 0.
  - [ ] Display estimated price before test creation.
- [ ] Frontend: Homepage
  - [ ] Create a dynamic pricing section offering default packages (e.g. 20 testers/1 time = ₹2000).
  - [ ] Ensure pricing blocks are editable/fetchable via Admin if required, or strictly calculated based on the base price.
