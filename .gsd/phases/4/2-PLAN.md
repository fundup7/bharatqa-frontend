---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: Frontend App State and Admin Impersonation

## Objective
Implement impersonation state in `App.js` and add the impersonation trigger in `AdminPage.js`.

## Context
- d:\bharatqa-frontend\src\App.js
- d:\bharatqa-frontend\src\pages\AdminPage.js
- d:\bharatqa-frontend\src\utils\api.js

## Tasks

<task type="auto">
  <name>API Client Methods</name>
  <files>d:\bharatqa-frontend\src\utils\api.js</files>
  <action>
    Add methods to call the new backend endpoints:
    - `generateShareToken(testId)`
    - `getSharedTest(token)`
    - `adminGetCompanyProfile(companyId)`
  </action>
  <verify>grep "generateShareToken" d:\bharatqa-frontend\src\utils\api.js</verify>
  <done>Frontend API client has the new methods.</done>
</task>

<task type="auto">
  <name>App State & Impersonation Banner</name>
  <files>d:\bharatqa-frontend\src\App.js</files>
  <action>
    Modify `App.js` to support impersonation:
    - Add `const [impersonating, setImpersonating] = useState(null);`
    - Define `const activeCompany = impersonating || company;`
    - Pass `activeCompany` (instead of `company`) to `Navbar`, `Sidebar`, `DashboardPage`, `CreateTestPage`, `TestDetailPage`, `ReportsPage`, `SettingsPage`.
    - Do NOT pass `activeCompany` to `AdminPage`, pass the original `company`.
    - Add a visible banner (e.g., fixed top, red/orange background) when `impersonating` is true: "⚠️ You are viewing as [Company Name]. [Exit Impersonation Button]"
    - The "Exit" button calls `setImpersonating(null)` and `navigate('admin')`.
  </action>
  <verify>grep "impersonating" d:\bharatqa-frontend\src\App.js</verify>
  <done>App.js handles impersonation state globally.</done>
</task>

<task type="auto">
  <name>Admin Impersonate Action</name>
  <files>d:\bharatqa-frontend\src\pages\AdminPage.js</files>
  <action>
    Modify the Tests tab table in `AdminPage.js` to include an "Impersonate" button (Eye icon).
    - Add `onImpersonate` to `AdminPage.js` props (passed from `App.js`).
    - The `onImpersonate` handler in `App.js` should fetch full company profile and call `setImpersonating(profile)`.
    - Clicking the Eye icon in AdminPage calls `onImpersonate(test.company_id)`.
  </action>
  <verify>grep "onImpersonate" d:\bharatqa-frontend\src\pages\AdminPage.js</verify>
  <done>Admin can trigger impersonation from a company row.</done>
</task>

## Success Criteria
- [ ] Admin clicks 'Eye' icon, UI switches to the company's dashboard.
- [ ] Impersonation banner is visible.
- [ ] Clicking "Exit" returns to the normal admin view.
