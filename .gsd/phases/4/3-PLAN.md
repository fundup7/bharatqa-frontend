---
phase: 4
plan: 3
wave: 3
---

# Plan 4.3: Shareable Reports Feature

## Objective
Add the "Share Results" button to `TestDetailPage` and implement `SharedTestDetailPage` rendering for public links.

## Context
- d:\bharatqa-frontend\src\App.js
- d:\bharatqa-frontend\src\pages\TestDetailPage.js
- d:\bharatqa-frontend\src\pages\SharedTestDetailPage.js

## Tasks

<task type="auto">
  <name>Share Results Button</name>
  <files>d:\bharatqa-frontend\src\pages\TestDetailPage.js</files>
  <action>
    Add a "Share Results" button to `TestDetailPage.js` beside the Back button.
    - When clicked, call `apiClient.generateShareToken(test.id)`.
    - Alert or show a toast with the new link: `window.location.origin + '/?share=' + token`.
    - Provide a "Copy" mechanism or prompt to copy the link.
  </action>
  <verify>grep "Share Results" d:\bharatqa-frontend\src\pages\TestDetailPage.js</verify>
  <done>Company can generate a link.</done>
</task>

<task type="auto">
  <name>Shared Test Detail Page Component</name>
  <files>d:\bharatqa-frontend\src\pages\SharedTestDetailPage.js</files>
  <action>
    Create `SharedTestDetailPage.js`:
    - Base it off `TestDetailPage.js`.
    - Fetch data via `apiClient.getSharedTest(token)`.
    - Strip all proprietary actions: NO delete button, NO "Analyze with AI" button, NO targeting edit section, NO pricing/budget display.
    - Render a simple "Read-Only view" badge.
    - Include the bug list, bug details, and video player normally.
  </action>
  <verify>grep "SharedTestDetailPage" d:\bharatqa-frontend\src\pages\SharedTestDetailPage.js</verify>
  <done>Public facing page is read-only.</done>
</task>

<task type="auto">
  <name>Shared Link Routing</name>
  <files>d:\bharatqa-frontend\src\App.js</files>
  <action>
    Modify `App.js`:
    - Parse `window.location.search` for `?share=TOKEN` on initial load.
    - If found, bypass full auth requirement and set `view` to `'shared-test'`.
    - Do not render Sidebar or Navbar if `view === 'shared-test'`. Ensure the user is isolated.
    - Render `<SharedTestDetailPage token={token} onExit={() => window.location.href = '/'} />`.
  </action>
  <verify>grep "share=" d:\bharatqa-frontend\src\App.js</verify>
  <done>Public links successfully load the shared view without requiring login.</done>
</task>

## Success Criteria
- [ ] Test detail page has a functioning share button.
- [ ] The generated link works in incognito mode.
- [ ] Shared page does not expose budget/company emails or modification buttons.
