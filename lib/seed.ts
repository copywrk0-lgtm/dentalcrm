export type Clinic = {
  id: string;
  name: string;
  address: string;
  phone: string;
};
export type Therapist = {
  id: string;
  name: string;
  role: string;
  clinicId: string;
  initials: string;
  color: string;
};
export type Patient = {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  clinicId: string;
  therapistId: string;
  complaint: string;
  region: string;
  onset: string;
  alerts: string;
  status: "Active" | "Paused" | "Completed";
  joined: string;
  assessments: { date: string; pain: number; rom: string; diagnosis: string }[];
};
export type Session = {
  id: string;
  patientId: string;
  therapistId: string;
  clinicId: string;
  date: string;
  painBefore: number;
  painAfter: number;
  modalities: string[];
  notes: string;
  status: "Completed" | "Scheduled";
};
export type Appointment = {
  id: string;
  patientId: string;
  therapistId: string;
  clinicId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: "Scheduled" | "Completed" | "Cancelled";
};
export type Exercise = {
  id: string;
  name: string;
  region: string;
  sets: string;
  reps: string;
  hold: string;
  notes: string;
};
export type Package = {
  id: string;
  patientId: string;
  clinicId: string;
  name: string;
  totalSessions: number;
  usedSessions: number;
  price: number;
  paid: number;
  tax: number;
  date: string;
  status: "Active" | "Completed";
};

export const clinics: Clinic[] = [
  {
    id: "c1",
    name: "Dental Clinic · Dwarka",
    address: "Sector 12, Dwarka, New Delhi 110078",
    phone: "+91 98765 43210",
  },
  {
    id: "c2",
    name: "Dental Clinic · Janakpuri",
    address: "C Block, Janakpuri, New Delhi 110058",
    phone: "+91 98765 43211",
  },
];
export const therapists: Therapist[] = [
  {
    id: "t1",
    name: "Dr. Meera Kapoor",
    role: "Senior Dentist",
    clinicId: "c1",
    initials: "MK",
    color: "#DCEFE6",
  },
  {
    id: "t2",
    name: "Rohan Mehta",
    role: "Dentist",
    clinicId: "c1",
    initials: "RM",
    color: "#E8E7F8",
  },
  {
    id: "t3",
    name: "Ananya Iyer",
    role: "Dentist",
    clinicId: "c2",
    initials: "AI",
    color: "#F8E9D9",
  },
];

const patientNames = [
  "Aarav Sharma",
  "Ishita Verma",
  "Kabir Malhotra",
  "Diya Nair",
  "Vihaan Gupta",
  "Saanvi Reddy",
  "Arnav Khanna",
  "Myra Bansal",
  "Reyansh Joshi",
  "Anika Chopra",
  "Dhruv Saxena",
  "Kiara Bhatia",
  "Advait Menon",
  "Navya Kulkarni",
  "Arjun Patel",
  "Riya Sethi",
  "Krish Agarwal",
  "Tara Ahuja",
  "Yash Chauhan",
  "Pooja Rawat",
];
const complaints = [
  "Tooth sensitivity",
  "Premolar sensitivity",
  "Incisor toothache",
  "Gum inflammation",
  "Wisdom tooth Extraction follow-up",
  "Routine cleaning",
  "Lower arch Dental consultation",
  "Gums Cavity assessment",
];
const regions = [
  "Molar",
  "Premolar",
  "Incisor",
  "Canine",
  "Wisdom tooth",
  "Upper arch",
  "Lower arch",
  "Gums",
];

/* New patients: first visit is today's initial assessment, so no past sessions or assessment yet. */
const newPatientIdx: Record<number, string> = {
  2: "2026-10-21",
  6: "2026-10-20",
  12: "2026-10-22",
};
/* Patients with a billing package: session history length matches the package's used sessions. */
const sessionCounts: Record<number, number> = { 0: 6, 1: 4, 3: 2, 5: 10, 8: 3 };
const pad = (n: number) => String(n).padStart(2, "0");

export const patients: Patient[] = patientNames.map((name, i) => {
  const isNew = i in newPatientIdx;
  const c2 = i % 5 === 4 || i % 4 === 3;
  return {
    id: `p${String(i + 1).padStart(3, "0")}`,
    name,
    age: 24 + ((i * 7) % 48),
    phone: `+91 98765 ${40000 + i * 137}`,
    email: `${name.toLowerCase().replace(" ", ".")}@example.test`,
    clinicId: c2 ? "c2" : "c1",
    therapistId: c2 ? "t3" : i % 3 === 0 ? "t1" : "t2",
    complaint: complaints[i % complaints.length],
    region: regions[i % regions.length],
    onset: [
      "About 3 weeks ago",
      "Gradual over 2 months",
      "After recreational activity",
      "About 10 days ago",
    ][i % 4],
    alerts:
      i === 2
        ? "Reports penicillin allergy (fictional)."
        : i === 7
          ? "Dental anxiety noted (fictional)."
          : "None reported",
    status: i === 8 || i === 15 ? "Paused" : "Active",
    joined: isNew ? newPatientIdx[i] : `2026-08-${pad(3 + i)}`,
    assessments: isNew
      ? []
      : [
          {
            date: `2026-09-${pad(1 + (i % 8))}`,
            pain: Math.min(9, 4 + (i % 5)),
            rom: [
              "Clinical findings pending",
              "Clinical findings pending",
              "Clinical findings pending",
            ][i % 3],
            diagnosis: "Dentist-entered findings pending.",
          },
        ],
  };
});

const sessionDates = [
  "2026-09-29",
  "2026-10-02",
  "2026-10-05",
  "2026-10-07",
  "2026-10-09",
  "2026-10-12",
  "2026-10-14",
  "2026-10-16",
  "2026-10-19",
  "2026-10-21",
  "2026-10-22",
];
const modalityPool = [
  ["Dental examination", "Dental cleaning"],
  ["Dental check-up", "Education"],
  ["Dental treatment", "Oral hygiene review"],
];
const notePool = [
  "Reviewed tolerance and movement quality.",
  "Patient completed planned activities with breaks.",
  "Discussed pacing and home routine.",
];

/* All seeded sessions are completed visits dated before today. Today's visits live in `appointments`. */
export const sessions: Session[] = patients.flatMap((p, pi) => {
  if (pi in newPatientIdx) return [];
  const n = sessionCounts[pi] ?? 2;
  const start = n >= 8 ? 0 : pi % 4;
  const b0 = Math.min(9, 4 + (pi % 5));
  return Array.from({ length: n }, (_, j) => {
    const idx =
      n === 2
        ? j === 0
          ? pi % 5
          : 5 + ((pi * 3) % 6)
        : Math.min(
            10,
            start + Math.floor((j * (10 - start)) / Math.max(n - 1, 1)),
          );
    const before = Math.max(2, b0 - Math.floor(j * 0.7));
    return {
      id: `s-${p.id}-${j + 1}`,
      patientId: p.id,
      therapistId: p.therapistId,
      clinicId: p.clinicId,
      date: sessionDates[idx],
      painBefore: before,
      painAfter: Math.max(1, before - 1),
      modalities: modalityPool[(pi + j) % 3],
      notes: notePool[(pi + j) % 3],
      status: "Completed" as const,
    };
  });
});

/* Today's schedule: each visit uses the patient's own therapist and clinic. Initial consultations = patients with no history. */
const todayPatientIdx = [0, 1, 3, 6, 2, 4, 12, 5, 7, 18, 10, 9];
const slots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
];
export const appointments: Appointment[] = todayPatientIdx.map((pi, i) => {
  const p = patients[pi];
  return {
    id: `a${i + 1}`,
    patientId: p.id,
    therapistId: p.therapistId,
    clinicId: p.clinicId,
    date: "2026-10-23",
    time: slots[i],
    duration: 30,
    type: pi in newPatientIdx ? "Initial consultation" : "Follow-up",
    status: i === 1 ? "Completed" : "Scheduled",
  };
});

export const exercises: Exercise[] = [
  {
    id: "e1",
    name: "Dental examination",
    region: "Assessment",
    sets: "",
    reps: "",
    hold: "",
    notes: "Selected by the treating dentist.",
  },
  {
    id: "e2",
    name: "Scaling and polishing",
    region: "Cleaning",
    sets: "",
    reps: "",
    hold: "",
    notes: "Selected by the treating dentist.",
  },
  {
    id: "e3",
    name: "Restorative consultation",
    region: "Restoration",
    sets: "",
    reps: "",
    hold: "",
    notes: "Selected by the treating dentist.",
  },
  {
    id: "e4",
    name: "Periodontal review",
    region: "Gums",
    sets: "",
    reps: "",
    hold: "",
    notes: "Selected by the treating dentist.",
  },
  {
    id: "e5",
    name: "Follow-up examination",
    region: "Review",
    sets: "",
    reps: "",
    hold: "",
    notes: "Selected by the treating dentist.",
  },
  {
    id: "e6",
    name: "Oral hygiene review",
    region: "Review",
    sets: "",
    reps: "",
    hold: "",
    notes: "Selected by the treating dentist.",
  },
];

/* Amounts in INR. Tax defaults to 0 (configurable in Billing); package clinic matches the patient's clinic. */
export const packages: Package[] = [
  {
    id: "i1",
    patientId: "p001",
    clinicId: "c1",
    name: "Recovery · 10 sessions",
    totalSessions: 10,
    usedSessions: 6,
    price: 8000,
    paid: 4000,
    tax: 0,
    date: "2026-10-02",
    status: "Active",
  },
  {
    id: "i2",
    patientId: "p002",
    clinicId: "c1",
    name: "Mobility · 6 sessions",
    totalSessions: 6,
    usedSessions: 4,
    price: 4800,
    paid: 4800,
    tax: 0,
    date: "2026-10-05",
    status: "Active",
  },
  {
    id: "i3",
    patientId: "p006",
    clinicId: "c1",
    name: "Recovery · 10 sessions",
    totalSessions: 10,
    usedSessions: 10,
    price: 8000,
    paid: 8000,
    tax: 0,
    date: "2026-09-18",
    status: "Completed",
  },
  {
    id: "i4",
    patientId: "p004",
    clinicId: "c2",
    name: "Starter · 4 sessions",
    totalSessions: 4,
    usedSessions: 2,
    price: 3200,
    paid: 1600,
    tax: 0,
    date: "2026-10-11",
    status: "Active",
  },
  {
    id: "i5",
    patientId: "p009",
    clinicId: "c1",
    name: "Recovery · 10 sessions",
    totalSessions: 10,
    usedSessions: 3,
    price: 8000,
    paid: 6000,
    tax: 0,
    date: "2026-10-14",
    status: "Active",
  },
];
export const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
