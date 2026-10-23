# Dental Workspace

A front-end dental clinic workspace built with Next.js, TypeScript and Tailwind CSS. Patient records, assessments, visits, appointments and package billing are held in browser state and localStorage.

## Run

```sh
npm ci
npm run dev
npm run build
```

## Interface

The patient summary and clinical content are separate, aligned columns on large screens and a single column on phones. The bottom navigation has six equal touch targets, and wide record tables scroll within their own panels. The interface uses neutral Dental Workspace branding.

All initial records are fictional. This project has no server database or authentication. Changes stay in the current browser on the current device. Prescription output is explicitly a draft and does not sign or issue a clinical document. Medicines and instructions are entered manually.

The browser storage key is versioned. Existing records from the previous interface are loaded as a fallback so an update does not erase local edits.
