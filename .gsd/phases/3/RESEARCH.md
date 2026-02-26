# RESEARCH.md — Phase 3

## Backend: Dynamic Payouts & Admin Approval Gate
- **Database**: The `tests` table currently has `tester_quota` (INT), `testing_iterations` (INT), and `price_paid` (NUMERIC). 
- **Change**: Add `total_budget` (NUMERIC) and `admin_approved` (BOOLEAN, default FALSE).
- **Logic**: `price_paid` should be calculated as `total_budget / tester_quota` during test creation or admin update.
- **Gate**: The `/api/available-tests` and `/api/company/:id/tests` endpoints need to filter by `admin_approved = TRUE`.

## AI-Assisted Moderation
- **Vision AI**: `ai-analyzer-cloud.js` currently uses a generic prompt. 
- **Refinement**: Needs to inject `company_name`, `app_name`, and `instructions` from the database. 
- **Human-in-the-loop**: AI provides a "Recommendation" in the analysis text, but the `admin_approved` flag remains unchanged until an Admin clicks the button.

## Android: Location & Cold Start
- **Cold Start**: Render free-tier sleeps. Initial `api/health` check on app startup is essential.
- **Location Fix**: `FusedLocationProviderClient` in `MainActivity.kt` needs a high-priority request if `lastLocation` is null or stalled. 
- **UI Update**: `tester_quota` and `price_paid` (renamed to Tester Payout) should be clearly displayed in the "Activities" status labels.

## Security
- **Signing**: APK is likely signed with a debug key. Generating a proper `.jks` file is required to reduce "Harmful App" flags from Play Protect.
