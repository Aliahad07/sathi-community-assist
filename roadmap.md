# Sathi AI roadmap

## Stage 1 — Frontend prototype (done)
- [x] Landing page
- [x] Demo login with role selection
- [x] Citizen dashboard
- [x] Community helper dashboard
- [x] Officer dashboard
- [x] Shared demo data across all dashboards (one upload, one decision, one reset)
- [x] End-to-end demo verified in a browser: citizen upload → officer approve → citizen approved

## Stage 1 — Verification pass (done)
- [x] Build, type check and all tests
- [x] Browser journeys A–E (upload, officer review, approval, return with reason, reset/persistence/tabs)
- [x] Responsive check: desktop, tablet, mobile (incl. Reset demo button)
- [x] Regression: landing, login, all dashboards, search, filters, buttons

## Later
- [ ] Administrator dashboard
- [ ] Backend on the user's own Supabase project — blocked: user must connect it in Project Settings → General → External Supabase
  - First: real sign-in per role + saved applications shared across devices; then stored document files
- [ ] Real AI assistant
