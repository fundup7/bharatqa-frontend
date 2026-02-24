# BharatQA Context

## Vision: What is BharatQA?
**BharatQA** is a comprehensive crowd-sourced platform designed to connect app developers and companies with a vast network of real-world testers across India. 

The primary goal is to provide developers with genuine, structured feedback on their applications running on real devices in real network conditions. It streamlines the Quality Assurance (QA) process by providing:
- Detailed bug reports with device telemetry (RAM, App Version, Network Speed, Battery Drain, GPS Coordinates).
- Screen recordings of the issues being reproduced.
- AI-powered bug analysis that interprets what the tester found and provides actionable insights.
- A seamless payment system to compensate testers for their work.

## Tech Stack
### Frontend (`bharatqa-frontend`)
- **Core Framework**: React (v19.x) bootstrapped with Create React App.
- **Styling**: Vanilla CSS with a strong emphasis on a modern, **Glassmorphism** design system (`glass.css`, `tokens.css`, `animations.css`). **No TailwindCSS**.
- **Icons**: `lucide-react` for clean, consistent SVG iconography.
- **Authentication**: Google OAuth (`@react-oauth/google`).
- **Markdown Parsing**: `react-markdown` and `remark-gfm` for rendering AI insights.
- **Hosting**: Deployed on Vercel.

### Backend & Infrastructure (External Repo)
- **API**: Hosted on Render (`https://bharatqa-backend.onrender.com`).
- **Database**: Supabase (PostgreSQL).
- **Storage**: Backblaze B2 (used for securely storing bug report videos and screenshots).

## Current State
The web dashboard allows companies to:
1. **Manage Tests**: Create new test cycles, define tester targeting criteria (Device tier, Network type, maximum RAM, specific Indian States/Cities), and view eligible tester counts.
2. **Review Bugs**: Analyze reported issues. Each issue includes tester feedback, steps to reproduce, automated device telemetry, and screen recordings.
3. **AI Analysis**: Run an AI model to analyze individual bug reports and provide a technical summary of the problem.
4. **Global Reports**: Export highly detailed CSV files containing all reported bugs across all projects.
5. **Administration (Restricted)**: A protected `/admin` route allows the BharatQA internal team to monitor active/banned testers and process batch payments to testers via UPI.

## Rules & Coding Guidelines
1. **Design System Adherence**: All new UI components must strictly follow the *Glassmorphic* aesthetic. Rely on predefined CSS variables in `tokens.css` (e.g., `var(--glass-bg)`, `var(--glass-border)`, `var(--saffron)`) and utility classes from `glass.css` (e.g., `.glass-card`, `.btn-primary`). Do not introduce third-party styling frameworks.
2. **API Communication**: Always use the centralized `apiClient` defined in `src/utils/api.js` for backend communication. It automatically handles the injection of the `x-api-key` header and error parsing.
3. **Admin Security**: Access to the internal Admin Dashboard is governed by the `ADMIN_EMAILS` array exported from `src/App.js`. Until a custom BharatQA email domain is configured, this array must be manually updated to whitelist staff.
4. **Component Architecture**: Keep components modular. If a complex screen (like Test Details or Admin Panel) grows too large, considering breaking it down into smaller, reusable React components in the `src/components/...` directory.
5. **Robustness**: Always wrap API calls with `try/catch` and utilize the global `showToast` method to provide immediate success/error feedback to the user.
