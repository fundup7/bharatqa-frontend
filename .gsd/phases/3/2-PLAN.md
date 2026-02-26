---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Admin Moderation Gate & AI Context

## Objective
Implement the visibility "gate" for companies and enhance the AI analyzer with context-aware data.

## Context
- D:/bharatqa-deploy/server.js
- D:/bharatqa-deploy/ai-analyzer-cloud.js

## Tasks

<task type="auto">
  <name>Implement Visibility Filtering</name>
  <files>D:/bharatqa-deploy/server.js</files>
  <action>
    1. Update `app.get('/api/company/:companyId/tests')` to ONLY return tests where `admin_approved = TRUE`.
    2. Update internal `/api/available-tests` (for testers) to also filter by `admin_approved = TRUE`.
    3. Add `app.put('/api/admin/tests/:testId/approve')` to allow admins to toggle the visibility gate.
  </action>
  <verify>Check company dashboard API and verify unapproved tests are excluded.</verify>
  <done>Companies cannot see tests until Admin approves them.</done>
</task>

<task type="auto">
  <name>Enhance AI Prompt Logic</name>
  <files>D:/bharatqa-deploy/ai-analyzer-cloud.js</files>
  <action>
    Modify `analyzeBugReport` to:
    1. Fetch `instructions`, `app_name`, and `company_name` for the associated test from the DB.
    2. Inject this data into the Gemini prompt to provide "Context-Aware" analysis.
    3. Ensure a fallback prompt exists if data is missing.
  </action>
  <verify>Trigger an AI analysis and check the log for the injected context in the prompt.</verify>
  <done>AI analysis takes test instructions and company context into account.</done>
</task>

## Success Criteria
- [ ] Admin approval gate is functional.
- [ ] AI prompt is context-aware.
