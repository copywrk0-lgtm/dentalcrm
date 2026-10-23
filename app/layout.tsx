import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ODDWORK Dental OS | Clinic workspace demo",
  description: "Interactive demo of a dental clinic workspace: patients, treatment plans, billing and appointments. Sample data only.",
  openGraph: { title: "ODDWORK Dental OS | Clinic workspace demo", description: "Patients, treatment plans, billing and appointments for dental clinics. Sample data only.", type: "website", locale: "en_IN" }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-IN"><body>{children}</body></html>; }
