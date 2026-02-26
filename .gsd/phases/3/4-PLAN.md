---
phase: 3
plan: 4
wave: 2
---

# Plan 3.4: Android App Resilience (GPS & Warm-up)

## Objective
Improve mobile app stability by fixing location stalls and handling backend cold starts proactively.

## Context
- D:/BharatQA/app/src/main/java/com/bharatqa/com/MainActivity.kt
- D:/BharatQA/app/build.gradle.kts

## Tasks

<task type="auto">
  <name>Implement GPS Recovery & Server Warm-up</name>
  <files>D:/BharatQA/app/src/main/java/com/bharatqa/com/MainActivity.kt</files>
  <action>
    1. **Location Fix**: Add a `requestLocationUpdate` call in `onResume` when permissions are granted but location is null. Use `PRIORITY_HIGH_ACCURACY`.
    2. **Warm-up**: On `onCreate`, send a silent `api/health` request. 
    3. If health check doesn't respond within 3s, show a subtle "Connecting to Server..." glass indicator. Replace it with "Ready" once the backend wakes up.
  </action>
  <verify>Test on real device or emulator: Toggle location and verify immediate fetch. Observe "Connecting" state on fresh app launch.</verify>
  <done>GPS stall is eliminated; Backend cold-start is handled gracefully.</done>
</task>

<task type="auto">
  <name>Generate Release Signing Key</name>
  <files>D:/BharatQA/app/build.gradle.kts</files>
  <action>
    1. Use `keytool` (via `run_command`) to generate a `release.keystore` (user input for passwords may be needed if not automated).
    2. Update `build.gradle.kts` to include a `release` signing config using the new keystore.
  </action>
  <verify>Run `./gradlew assembleRelease` and verify the APK is signed with the new key.</verify>
  <done>APK is signed with a valid release key, reducing security warnings.</done>
</task>

## Success Criteria
- [ ] GPS stalling fixed.
- [ ] Proactive warm-up logic implemented.
- [ ] Release signing configured.
