---
phase: 1
plan: 3
wave: 3
---

# Plan 1.3: Dynamic Pricing and Company Quotas

## Objective
Enable companies to purchase test packages dynamically inside the "Create Task" module, and showcase the dynamic pricing formulas clearly on the homepage.

## Context
- .gsd/SPEC.md
- d:\bharatqa-frontend\src\components\CreateTestModal.jsx
- d:\bharatqa-frontend\src\pages\HomePage.jsx

## Tasks

<task type="auto">
  <name>Add Quota Fields to Create Test</name>
  <files>d:\bharatqa-frontend\src\components\CreateTestModal.js</files>
  <action>
    - Add inputs for "Target Number of Testers" (default: 20) and "Testing Iterations" (default: 1).
    - Calculate price live: `(Testers * Iterations * 70)` rounded to nearest zero.
    - Display the estimated price prominently before submit.
    - Send these parameters via `formData` during test creation.
  </action>
  <verify>Check form calculation math output in console.</verify>
  <done>Companies know exactly what testing costs before creating it.</done>
</task>

<task type="auto">
  <name>Update Homepage Pricing Cards</name>
  <files>d:\bharatqa-frontend\src\pages\HomePage.js</files>
  <action>
    - Create a Pricing Section on the Landing page.
    - Add 3 standard cards: 
      1. Essential: 20 Testers / 1 Iteration (₹2000)
      2. Comprehensive: 40 Testers / 1 Iteration (₹4000)
      3. Intensive: 40 Testers / 2 Iterations (₹6000)
    - Ensure styling follows the platform's glassmorphism UI rules.
  </action>
  <verify>Visually inspect the homepage layout logic.</verify>
  <done>Visitors can immediately see transparent pricing options.</done>
</task>

## Success Criteria
- [ ] Companies can define test scale via the UI.
- [ ] The platform automatically sets pricing expectations.
- [ ] The homepage lists the 3 specified price points beautifully.
