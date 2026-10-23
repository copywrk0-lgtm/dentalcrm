# Family Physio — Clinic Workspace Demo

A front-end-only physiotherapy clinic management demo intended for a 60–90 second product walkthrough. All names, contact details, dates, patient notes, pain scores, and billing records are fictional.

## Windows setup

1. Install **Node.js 20.9 or newer** from https://nodejs.org/.
2. Extract this project folder.
3. Open the extracted `family-physio-demo` folder in VS Code.
4. In VS Code, choose **Terminal → New Terminal**.
5. Install dependencies:
   ```powershell
   npm install
   ```
6. Start the development server:
   ```powershell
   npm run dev
   ```
7. Open http://localhost:3000 in Chrome or Edge.
8. For a production compile check, stop the dev server and run:
   ```powershell
   npm run build
   npm run start
   ```

## What's included

- **Dashboard:** clinic selector, derived counts, today's schedule, therapist workload, active patients and outstanding package balances.
- **Patient profile:** fictional patient details and alerts, therapist-entered assessment form, session timeline, and SVG pain-score trend drawn from completed session records.
- **Treatment plan & handout:** editable session count, frequency and goals; six selectable exercise templates; session logging; A4 print layout with clinic and therapist details.
- **Billing:** five fictional session packages in INR (₹, `en-IN` formatting), remaining-session counters, partial-payment entry, configurable package tax rate (defaults to 0%; physiotherapy at clinical establishments is generally GST-exempt in India, but confirm with your CA), outstanding balance calculations, and A4 invoice print layout.
- **Appointments:** daily therapist calendar, add, reschedule and cancel actions.
- **Persistence:** demo changes are stored in this browser's `localStorage` and are not sent to a server.
- Responsive fixed desktop sidebar and compact mobile bottom navigation; print layouts are optimized for A4.

## Demo recording script (60–90 seconds)

1. **Dashboard (10–15 sec):** Start on the dashboard. Point out the clinic selector and the automatically derived counts for today's visits, active patients and outstanding payments. Switch clinics briefly to show the filters.
2. **Patient & pain trend (20 sec):** Open a patient such as Aarav Sharma. Show the complaint, body region and medical-alert panel. Point to the therapist-entered assessment form, then scroll to the session timeline and real pain-score trend.
3. **Exercise handout (20–25 sec):** Open **Treatment plan & home exercise**. Show the session goal and frequency, select or deselect an exercise, then click **Print handout** to show the A4 print preview. Cancel printing to return to the demo.
4. **Package billing (15–20 sec):** Open **Billing**, select a package and show sessions used/remaining, tax and balance due. Optionally record a small partial payment, then click **Print A4 invoice**.
5. **Close (5 sec):** Briefly show the appointments day view and mention that visits can be added, moved or cancelled.

For a clean screen recording, use a 1440×900 desktop browser window, zoom at 100%, and close browser developer tools. Use the seeded patient and package data for the most predictable walkthrough.

## Known limitations

- This is a **demo only**: no backend, authentication, server sync, live notifications, real clinic records or multi-user functionality.
- All seed data is fictional. Do not enter real patient information.
- `localStorage` is browser/device-specific; clearing site data resets local changes to the bundled seed records. This is not a backup system.
- The demo starts with seeded records dated around October 23, 2026 so the recording has predictable content. The dashboard date label and appointment date are demo fixtures, not a live calendar integration.
- Patient assessment, treatment goals, modalities and exercise selections are entered/selected by the therapist. The app does not generate diagnoses, treatment plans or prescriptions.
- Billing math is illustrative and does not provide tax, accounting or payment processing functionality.
- Appointment collision detection, recurring appointments, reminders, waitlists and drag-and-drop scheduling are not included.
- Print preview appearance depends on the browser and printer settings. Use A4 paper and enable background graphics if desired.
- The UI uses Tailwind CSS utilities and custom lightweight components styled in a shadcn-inspired visual system; no backend services are included.

## Data model notes

- Today's visits, dashboard counts and the schedule all derive from the `appointments` array. Each appointment uses the patient's own therapist and clinic.
- "Initial assessment" appears only for patients with no past sessions; those patients have no assessment record yet.
- Seeded session history per patient matches the `usedSessions` count on their billing package.
- "Last visit" and "Recently active patients" use completed sessions only, most recent first.
- Seed data is localized for India (Delhi NCR clinics, `+91` numbers, INR, `en-IN` dates). Currency lives in `money()` in `lib/seed.ts`.
- `npm run lint` was removed because ESLint isn't installed; add ESLint and the script back if you want linting.

## Reset demo data

To restore the original seed records, open DevTools → Application → Local Storage for `http://localhost:3000` and delete `family-physio-demo-v2`, then refresh the page.
