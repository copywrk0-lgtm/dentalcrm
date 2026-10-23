import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Dental Workspace | Clinic Management",
  description:
    "Dental clinic workspace for patients, treatment plans, billing and appointments.",
  openGraph: {
    title: "Dental Workspace | Clinic Management",
    description:
      "Patients, treatment plans, billing and appointments for dental clinics.",
    type: "website",
    locale: "en_IN",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
