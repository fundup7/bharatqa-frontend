# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Enhancement to BharatQA to provide comprehensive admin control and configurable testing packages for companies, along with clear consumer-facing pricing.

## Goals
1. Add robust admin controls (approve/reject tests, manually assign testers, delete companies, view all tasks).
2. Enable companies to select specific testing parameters (number of testers, number of testing iterations) during test creation.
3. Calculate pricing dynamically (₹70 per tester per session, rounded to nearest zero) and display estimated price before test creation.
4. Showcase dynamic/editable pricing packages on the homepage.

## Users
- **Admins:** To moderate and manage the platform's supply (testers) and demand (company tasks).
- **Companies:** Front-facing customers buying specific testing packages.

## Constraints
- Needs coordinated backend changes for new business logic.
