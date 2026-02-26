---
phase: 3
plan: 5
wave: 3
---

# Plan 3.5: Android UI Enhancement (Activity Status)

## Objective
Provide transparency to testers by reflecting the new approval statuses and payment details in the mobile UI.

## Context
- D:/BharatQA/app/src/main/java/com/bharatqa/com/MainActivity.kt (for data fetching)
- D:/BharatQA/app/src/main/java/com/bharatqa/com/ui/... (relevant UI components)

## Tasks

<task type="auto">
  <name>Update Activity List Item</name>
  <files>D:/BharatQA/app/src/main/java/com/bharatqa/com/MainActivity.kt</files>
  <action>
    1. Update the `Activity` data class/model to include `status` (PENDING, APPROVED, REJECTED).
    2. Modify the `ActivityItem` composable (or equivalent) to show a Status Chip with color coding:
       - Orange: Pending Approval
       - Green: Approved (Paid)
       - Red: Rejected
    3. Display the "Tester Payout" (calculated from total budget) instead of the old fixed price.
  </action>
  <verify>Confirm the Activities screen correctly maps backend statuses to UI chips.</verify>
  <done>Testers can see the real-time status of their submissions.</done>
</task>

## Success Criteria
- [ ] Submission status labels are visible.
- [ ] Dynamic payout info is displayed.
