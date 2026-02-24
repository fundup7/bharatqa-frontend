---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Onboarding Enforcement and UI Polish

## Objective
Enforce the phone number as a mandatory field during onboarding entirely on the frontend, and style the Sign In/Sign Out buttons on the navbar to match the website's aesthetic.

## Context
- .gsd/SPEC.md
- src/components/Navbar.js (or equivalent top navigation component)
- src/pages/CompleteProfileScreen.js (or equivalent onboarding components)

## Tasks

<task type="auto">
  <name>Enforce Phone Number</name>
  <files>src/pages/CompleteProfileScreen.js</files>
  <action>
    - Ensure the phone number input field is marked as required.
    - Disable the "Next" or "Submit" button if the phone number field is empty.
    - Show a clear validation message if the user tries to bypass it.
  </action>
  <verify>Check the UI code to ensure the `disabled` prop is tied to the phone state.</verify>
  <done>User cannot proceed past the profile screen without entering a phone number.</done>
</task>

<task type="auto">
  <name>Style Navbar Buttons</name>
  <files>src/components/Navbar.js</files>
  <action>
    - Update the CSS for the Sign In and Sign Out buttons in the Navbar.
    - Use the project's existing design system (e.g., primary colors, glassmorphic effects if applicable).
  </action>
  <verify>Visually inspect the CSS classes applied to the buttons.</verify>
  <done>Navbar buttons look cohesive with the rest of the application.</done>
</task>

## Success Criteria
- [ ] Phone number is strictly enforced on the frontend.
- [ ] Sign In/Out buttons are aesthetically pleasing and consistent.
