"use client";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  CreditCard,
  FileText,
  HeartPulse,
  Home,
  Menu,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  Settings2,
  Stethoscope,
  Users,
  Wallet,
  X,
  ClipboardList,
  Dumbbell,
  TrendingDown,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  CalendarPlus,
  RotateCcw,
} from "lucide-react";
import {
  clinics,
  therapists,
  patients as seedPatients,
  sessions as seedSessions,
  appointments as seedAppointments,
  exercises,
  packages as seedPackages,
  money,
  type Patient,
  type Session,
  type Appointment,
  type Package,
} from "@/lib/seed";
type Page =
  | "Dashboard"
  | "Patients"
  | "Dental plan"
  | "Prescriptions"
  | "Billing"
  | "Appointments";
const nav: { name: Page; icon: any }[] = [
  { name: "Dashboard", icon: Home },
  { name: "Patients", icon: Users },
  { name: "Dental plan", icon: ClipboardList },
  { name: "Prescriptions", icon: FileText },
  { name: "Billing", icon: CreditCard },
  { name: "Appointments", icon: CalendarDays },
];
const today = "2026-10-23";
const lastVisitDate = (ss: Session[], id: string) =>
  ss
    .filter((s) => s.patientId === id && s.status === "Completed")
    .map((s) => s.date)
    .sort()
    .pop();
const fmtDate = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const initials = (name: string) =>
  name
    .replace(/^(dr|mr|mrs|ms)\.?\s+/i, "")
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span
      className={`badge ${tone === "green" ? "badge-green" : tone === "amber" ? "badge-amber" : tone === "red" ? "badge-red" : "badge-neutral"}`}
    >
      {children}
    </span>
  );
}
function Btn({
  children,
  onClick,
  primary = false,
  soft = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  soft?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`btn ${primary ? "btn-primary" : soft ? "btn-soft" : ""}`}
    >
      {children}
    </button>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const child = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, { id })
    : children;
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {child}
    </div>
  );
}
function Avatar({ name, size }: { name: string; size?: number }) {
  return (
    <div
      className="avatar"
      style={size ? { width: size, height: size } : undefined}
    >
      {initials(name)}
    </div>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const headingId = useId();
  const content = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    content.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current();
      if (event.key !== "Tab") return;
      const controls = Array.from(
        content.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex='0']",
        ) || [],
      );
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        ref={content}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            id={headingId}
            className="font-display"
            style={{ fontSize: 20, fontWeight: 800 }}
          >
            {title}
          </h2>
          <button className="btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PrescriptionWorkspace({
  patients,
  clinicId,
}: {
  patients: Patient[];
  clinicId: string;
}) {
  const visible = patients.filter(
    (p) => clinicId === "all" || p.clinicId === clinicId,
  );
  const [patientId, setPatientId] = useState("p001");
  const [items, setItems] = useState([
    { name: "", dose: "", frequency: "", duration: "" },
  ]);
  const [instructions, setInstructions] = useState("");
  const [doctor, setDoctor] = useState("Dr. Meera Kapoor");
  const [registration, setRegistration] = useState("");
  const [saved, setSaved] = useState(false);
  const patient = visible.find((p) => p.id === patientId) || visible[0];
  const clinic = clinics.find((c) => c.id === patient?.clinicId) || clinics[0];
  return (
    <div className="prescription-workspace">
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div className="eyebrow">CLINICAL DOCUMENTS</div>
          <h1
            className="font-display"
            style={{ fontSize: 27, fontWeight: 800, marginTop: 5 }}
          >
            Prescription editor
          </h1>
          <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
            Medicines and instructions entered by the treating dentist.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 rx-layout">
        <section className="card no-print" style={{ padding: 22 }}>
          <div
            className="font-display"
            style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}
          >
            Prescription details
          </div>
          <div style={{ display: "grid", gap: 13 }}>
            <Field label="Patient">
              <select
                className="select"
                value={patient?.id || ""}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  setSaved(false);
                }}
              >
                {visible.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.id}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prescribing dentist">
              <input
                className="input"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
              />
            </Field>
            <Field label="Registration number">
              <input
                className="input"
                placeholder="Enter professional registration"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
              />
            </Field>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>
              Medicines (entered by dentist)
            </div>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <b style={{ fontSize: 12 }}>Medicine {i + 1}</b>
                  <button
                    className="btn"
                    onClick={() => setItems((x) => x.filter((_, j) => j !== i))}
                    disabled={items.length === 1}
                  >
                    Remove
                  </button>
                </div>
                {(["name", "dose", "frequency", "duration"] as const).map(
                  (k) => (
                    <Field
                      key={k}
                      label={
                        {
                          name: "Medicine name",
                          dose: "Dose (doctor-entered)",
                          frequency: "Frequency",
                          duration: "Duration",
                        }[k]
                      }
                    >
                      <input
                        className="input"
                        value={item[k]}
                        onChange={(e) => {
                          setSaved(false);
                          setItems((x) =>
                            x.map((v, j) =>
                              j === i ? { ...v, [k]: e.target.value } : v,
                            ),
                          );
                        }}
                        placeholder="Enter manually"
                      />
                    </Field>
                  ),
                )}
              </div>
            ))}
            <button
              className="btn"
              onClick={() =>
                setItems((x) => [
                  ...x,
                  { name: "", dose: "", frequency: "", duration: "" },
                ])
              }
            >
              <Plus size={14} /> Add medicine
            </button>
            <Field label="Additional instructions">
              <textarea
                className="textarea"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Doctor's notes"
              />
            </Field>
            <button className="btn btn-primary" onClick={() => setSaved(true)}>
              <Check size={14} /> Mark draft reviewed
            </button>
            <p className="muted" style={{ fontSize: 11 }}>
              This is a draft review marker. It does not sign or issue the
              prescription.
            </p>
          </div>
        </section>
        <section
          className="card rx-preview"
          style={{ padding: 26, alignSelf: "start" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              borderBottom: "2px solid #123F40",
              paddingBottom: 18,
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#123F40" }}>
                Dental Workspace
              </div>
              <div style={{ fontSize: 11, marginTop: 6 }}>
                {clinic.name}
                <br />
                {clinic.address}
                <br />
                {clinic.phone}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 11 }}>
              <b>PRESCRIPTION DRAFT</b>
              <div style={{ marginTop: 8 }}>{today}</div>
            </div>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, lineHeight: 1.9 }}>
            <b>Patient:</b> {patient?.name || "Select patient"}
            <br />
            <b>Patient ID:</b> {patient?.id || "—"}
            <br />
            <b>Doctor:</b> {doctor || "—"}
            <br />
            <b>Registration:</b> {registration || "Not entered"}
          </div>
          <h3
            style={{
              fontWeight: 800,
              fontSize: 19,
              marginTop: 25,
              marginBottom: 12,
            }}
          >
            Rx
          </h3>
          {items.filter((x) => x.name.trim()).length ? (
            items
              .filter((x) => x.name.trim())
              .map((x, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #e4ebe7",
                    fontSize: 12,
                  }}
                >
                  <b>
                    {i + 1}. {x.name}
                  </b>
                  <div style={{ marginTop: 5, color: "#5a6c65" }}>
                    {[x.dose, x.frequency, x.duration]
                      .filter(Boolean)
                      .join(" · ") || "Details pending"}
                  </div>
                </div>
              ))
          ) : (
            <p className="muted" style={{ fontSize: 12 }}>
              No medicine entered. The dentist must type all medicines and
              instructions.
            </p>
          )}
          {instructions && (
            <p style={{ marginTop: 20, fontSize: 12, whiteSpace: "pre-wrap" }}>
              <b>Instructions:</b> {instructions}
            </p>
          )}
          <div
            style={{
              marginTop: 45,
              paddingTop: 15,
              borderTop: "1px solid #e4ebe7",
              fontSize: 11,
            }}
          >
            {saved ? "DRAFT REVIEWED" : "DRAFT · NOT FINALIZED"}
            <br />
            Not issued. Clinician approval is required before use.
          </div>
          <button
            className="btn btn-primary no-print"
            style={{ marginTop: 20, width: "100%" }}
            onClick={() => window.print()}
          >
            <Printer size={14} /> Print draft
          </button>
        </section>
      </div>
    </div>
  );
}

export default function PageApp() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [clinicId, setClinicId] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("p001");
  const [patients, setPatients] = useState<Patient[]>(seedPatients);
  const [sessions, setSessions] = useState<Session[]>(seedSessions);
  const [appointments, setAppointments] =
    useState<Appointment[]>(seedAppointments);
  const [packs, setPacks] = useState<Package[]>(seedPackages);
  const [modal, setModal] = useState("");
  const [toast, setToast] = useState("");
  const [taxDraft, setTaxDraft] = useState("0");
  const [plan, setPlan] = useState({
    patientId: "p001",
    total: "10",
    frequency: "2 sessions / week",
    goals: "",
  });
  const [planExercises, setPlanExercises] = useState<string[]>(["e3", "e5"]);
  const [assessment, setAssessment] = useState({
    pain: "4",
    rom: "",
    diagnosis: "",
  });
  const [log, setLog] = useState({
    date: today,
    before: "4",
    after: "3",
    modalities: "Dental examination, Dental cleaning",
    notes: "",
  });
  const [newAppt, setNewAppt] = useState({
    patientId: "p001",
    therapistId: "t1",
    date: today,
    time: "16:00",
    type: "Follow-up",
  });
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    complaint: "",
    region: "Molar",
    therapistId: "t1",
  });
  const [payment, setPayment] = useState({ packageId: "i1", amount: "1000" });
  const [invoiceId, setInvoiceId] = useState("i1");
  const [apptDate, setApptDate] = useState(today);
  const [apptFilter, setApptFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);
  const [editApptId, setEditApptId] = useState("");
  const [reschedule, setReschedule] = useState({
    date: today,
    time: "09:00",
    therapistId: "t1",
  });
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem("dental-workspace-v1") ||
        localStorage.getItem("oddwork-dental-demo-v1");
      if (raw) {
        const d = JSON.parse(raw);
        if (d.patients) setPatients(d.patients);
        if (d.sessions) setSessions(d.sessions);
        if (d.appointments) setAppointments(d.appointments);
        if (d.packs) setPacks(d.packs);
        if (d.plan) setPlan(d.plan);
        if (d.planExercises) setPlanExercises(d.planExercises);
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded)
      localStorage.setItem(
        "dental-workspace-v1",
        JSON.stringify({
          patients,
          sessions,
          appointments,
          packs,
          plan,
          planExercises,
        }),
      );
  }, [loaded, patients, sessions, appointments, packs, plan, planExercises]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 2600);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const entry = patients.find((p) => p.id === selectedId)?.assessments[0];
    setAssessment({
      pain: entry ? String(entry.pain) : "",
      rom: entry?.rom || "",
      diagnosis: entry?.diagnosis || "",
    });
  }, [selectedId, patients]);
  const clinicPatients = useMemo(
    () => patients.filter((p) => clinicId === "all" || p.clinicId === clinicId),
    [patients, clinicId],
  );
  const clinicSessions = useMemo(
    () => sessions.filter((s) => clinicId === "all" || s.clinicId === clinicId),
    [sessions, clinicId],
  );
  const clinicAppointments = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (clinicId === "all" || a.clinicId === clinicId) &&
          a.status !== "Cancelled",
      ),
    [appointments, clinicId],
  );
  const clinicPacks = useMemo(
    () => packs.filter((p) => clinicId === "all" || p.clinicId === clinicId),
    [packs, clinicId],
  );
  const selected = patients.find((p) => p.id === selectedId) || patients[0];
  const selectedSessions = sessions
    .filter((s) => s.patientId === selected?.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const selectedPack =
    packs.find((p) => p.patientId === selected?.id && p.status === "Active") ||
    packs.find((p) => p.patientId === selected?.id);
  const activeCount = clinicPatients.filter(
    (p) => p.status === "Active",
  ).length;
  const pending = clinicPacks.reduce(
    (sum, p) => sum + Math.max(0, p.price * (1 + p.tax / 100) - p.paid),
    0,
  );
  const todayAppts = clinicAppointments.filter((a) => a.date === today);
  const completedToday = todayAppts.filter(
    (a) => a.status === "Completed",
  ).length;
  const sessionsToday = todayAppts.length;
  const setTab = (p: Page) => {
    setPage(p);
    setSearch("");
  };
  const openPatient = (id: string) => {
    setSelectedId(id);
    const p = patients.find((x) => x.id === id);
    if (p?.assessments?.[0])
      setAssessment({
        pain: String(p.assessments[0].pain),
        rom: p.assessments[0].rom,
        diagnosis: p.assessments[0].diagnosis,
      });
    setPage("Patients");
  };
  const clinicName =
    clinicId === "all"
      ? "All clinics"
      : clinics.find((c) => c.id === clinicId)?.name || "All clinics";
  const saveAssessment = () => {
    const entry = {
      date: today,
      pain: Math.max(0, Math.min(10, Number(assessment.pain) || 0)),
      rom: assessment.rom,
      diagnosis: assessment.diagnosis,
    };
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              assessments: [
                entry,
                ...p.assessments.filter((a) => a.date !== today),
              ],
            }
          : p,
      ),
    );
    setToast("Assessment saved.");
  };
  const addSession = () => {
    const s: Session = {
      id: `s${Date.now()}`,
      patientId: selected.id,
      therapistId: selected.therapistId,
      clinicId: selected.clinicId,
      date: log.date,
      painBefore: Number(log.before),
      painAfter: Number(log.after),
      modalities: log.modalities
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      notes: log.notes,
      status: "Completed",
    };
    setSessions((prev) => [...prev, s]);
    setLog({ ...log, before: log.after, after: log.after });
    setModal("");
    setToast("Dental visit logged.");
  };
  const addPatient = () => {
    if (!newPatient.name.trim()) return;
    const therapist =
      therapists.find((t) => t.id === newPatient.therapistId) || therapists[0];
    const p: Patient = {
      id: `p${Date.now()}`,
      name: newPatient.name.trim(),
      age: 35,
      phone: newPatient.phone || "+91 98765 00000",
      email: "patient@example.test",
      clinicId: therapist.clinicId,
      therapistId: therapist.id,
      complaint: newPatient.complaint || "Assessment pending",
      region: newPatient.region,
      onset: "To be recorded",
      alerts: "None reported",
      status: "Active",
      joined: today,
      assessments: [],
    };
    setPatients((prev) => [p, ...prev]);
    setSelectedId(p.id);
    setNewPatient({
      name: "",
      phone: "",
      complaint: "",
      region: "Molar",
      therapistId: "t1",
    });
    setModal("");
    setPage("Patients");
    setToast("Patient added.");
  };
  const addAppointment = () => {
    const p = patients.find((x) => x.id === newAppt.patientId);
    const t = therapists.find((x) => x.id === newAppt.therapistId);
    if (!p || !t) return;
    const a: Appointment = {
      id: `a${Date.now()}`,
      patientId: p.id,
      therapistId: t.id,
      clinicId: t.clinicId,
      date: newAppt.date,
      time: newAppt.time,
      duration: 30,
      type: newAppt.type,
      status: "Scheduled",
    };
    setAppointments((prev) => [...prev, a]);
    setModal("");
    setToast("Appointment added.");
  };
  const print = () => window.print();
  const changeAppointment = (id: string, patch: Partial<Appointment>) =>
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  const shellNav = (
    <>
      {nav.map((n) => (
        <button
          key={n.name}
          onClick={() => {
            setTab(n.name);
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          aria-current={page === n.name ? "page" : undefined}
          className={`nav-item ${page === n.name ? "active" : ""}`}
        >
          <n.icon size={17} />
          <span>{n.name}</span>
          {n.name === "Appointments" && (
            <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.7 }}>
              {clinicAppointments.filter((a) => a.date === today).length}
            </span>
          )}
        </button>
      ))}
    </>
  );
  const header = (
    <header className="topbar no-print">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="mobile-top">
          <div className="brand-mark">
            <HeartPulse size={19} />
          </div>
        </div>
        <div className="clinic-desktop">
          <div className="eyebrow">Clinic workspace</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{clinicName}</div>
        </div>
        <div className="mobile-top" style={{ fontWeight: 700, fontSize: 13 }}>
          {page}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="btn"
          style={{ padding: 8 }}
          onClick={() =>
            setToast("Records are saved in this browser on this device.")
          }
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        <div
          className="hide-mobile"
          style={{ display: "flex", alignItems: "center", gap: 9 }}
        >
          <Avatar name="Meera Kapoor" size={32} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>
              Dr. Meera Kapoor
            </div>
            <div className="muted" style={{ fontSize: 10 }}>
              Clinic administrator
            </div>
          </div>
        </div>
      </div>
    </header>
  );
  const pageHead = (title: string, sub: string, actions?: React.ReactNode) => (
    <div
      className="page-head"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 25,
      }}
    >
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          {page === "Dashboard"
            ? "FRIDAY, OCTOBER 23, 2026"
            : "DENTAL CLINIC / WORKSPACE"}
        </div>
        <h1 className="page-title">{title}</h1>
        <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
          {sub}
        </p>
      </div>
      {actions && (
        <div className="page-head-actions" style={{ display: "flex", gap: 9 }}>
          {actions}
        </div>
      )}
    </div>
  );
  const stat = (
    title: string,
    value: string,
    caption: string,
    icon: any,
    trend?: string,
  ) => {
    const Icon = icon;
    return (
      <div className="card card-pad">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 17,
          }}
        >
          <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
            {title}
          </span>
          <div className="metric-icon">
            <Icon size={17} />
          </div>
        </div>
        <div className="metric-value">{value}</div>
        <div
          className="muted"
          style={{
            fontSize: 11,
            marginTop: 9,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {trend && (
            <span
              style={{
                color: "#4a8a6d",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <ArrowDownRight size={13} />
              {trend}
            </span>
          )}
          {caption}
        </div>
      </div>
    );
  };
  const renderDashboard = () => (
    <>
      {pageHead(
        "Good morning, Meera",
        "Here’s what’s happening across your clinics today.",
        <>
          <button className="btn" onClick={() => setPage("Appointments")}>
            <CalendarDays size={15} /> View schedule
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setNewAppt({ ...newAppt, date: today });
              setModal("appointment");
            }}
          >
            <Plus size={15} /> New appointment
          </button>
        </>,
      )}
      <div
        className="grid grid-cols-2 xl:grid-cols-4 gap-3"
        style={{ marginBottom: 22 }}
      >
        {stat(
          "Sessions today",
          String(sessionsToday),
          `${completedToday} completed`,
          Activity,
        )}
        {stat(
          "Active patients",
          String(activeCount),
          "Across selected clinics",
          Users,
        )}
        {stat(
          "Pending payments",
          money(pending),
          `${clinicPacks.filter((p) => p.price * (1 + p.tax / 100) > p.paid).length} packages outstanding`,
          Wallet,
        )}
        {stat(
          "Upcoming appointments",
          String(
            clinicAppointments.filter(
              (a) => a.date >= today && a.status === "Scheduled",
            ).length,
          ),
          "Excludes completed",
          CalendarDays,
        )}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-4 two-col">
        <section className="card">
          <div
            className="card-pad"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <h2
                className="font-display"
                style={{ fontWeight: 800, fontSize: 16 }}
              >
                Today’s schedule
              </h2>
              <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                Friday, 23 October · {todayAppts.length} appointments
              </p>
            </div>
            <button className="btn" onClick={() => setPage("Appointments")}>
              Full calendar <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Dentist</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppts.slice(0, 7).map((a) => {
                  const p = patients.find((x) => x.id === a.patientId)!;
                  const t = therapists.find((x) => x.id === a.therapistId)!;
                  return (
                    <tr key={a.id}>
                      <td>
                        <button
                          onClick={() => openPatient(p.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            textAlign: "left",
                          }}
                        >
                          <Avatar name={p.name} size={30} />
                          <span style={{ fontWeight: 700 }}>{p.name}</span>
                        </button>
                        <div
                          className="muted"
                          style={{ fontSize: 10, marginLeft: 39, marginTop: 2 }}
                        >
                          {a.type}
                        </div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{a.time}</td>
                      <td>{t.name.split(" ").slice(-1)[0]}</td>
                      <td>
                        <Badge
                          tone={a.status === "Completed" ? "green" : "neutral"}
                        >
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            className="card-pad"
            style={{
              borderTop: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="muted" style={{ fontSize: 11 }}>
              Appointments can be moved or cancelled
            </span>
            <button className="btn" onClick={() => setModal("appointment")}>
              <Plus size={14} /> Add visit
            </button>
          </div>
        </section>
        <section className="card">
          <div
            className="card-pad"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                className="font-display"
                style={{ fontWeight: 800, fontSize: 16 }}
              >
                Your dentists
              </h2>
              <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                Appointments by clinician today
              </p>
            </div>
            <Stethoscope size={18} color="var(--teal)" />
          </div>
          <div style={{ padding: "0 20px 20px" }}>
            {therapists
              .filter((t) => clinicId === "all" || t.clinicId === clinicId)
              .map((t) => {
                const count = clinicAppointments.filter(
                  (a) => a.date === today && a.therapistId === t.id,
                ).length;
                return (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "14px 0",
                      borderBottom: "1px solid #eff2f0",
                    }}
                  >
                    <Avatar name={t.name} size={39} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>
                        {t.name}
                      </div>
                      <div
                        className="muted"
                        style={{ fontSize: 10, marginTop: 4 }}
                      >
                        {t.role}
                      </div>
                      <div className="progress" style={{ marginTop: 10 }}>
                        <span
                          style={{
                            width: `${Math.min(100, (count / 6) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        className="font-display"
                        style={{ fontSize: 19, fontWeight: 800 }}
                      >
                        {count}
                      </div>
                      <div className="muted" style={{ fontSize: 10 }}>
                        visits
                      </div>
                    </div>
                  </div>
                );
              })}
            <div
              style={{
                background: "#f5faf7",
                borderRadius: 11,
                padding: 14,
                marginTop: 16,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div className="metric-icon">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12 }}>
                  Clinic at a glance
                </div>
                <div
                  className="muted"
                  style={{ fontSize: 11, lineHeight: 1.6, marginTop: 4 }}
                >
                  {clinicPatients.filter((p) => p.status === "Active").length}{" "}
                  active patients across {clinicId === "all" ? 2 : 1} clinic
                  {clinicId === "all" ? "s" : ""}. Select a clinic above to
                  filter the workspace.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div
          className="card-pad"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              className="font-display"
              style={{ fontWeight: 800, fontSize: 16 }}
            >
              Recently active patients
            </h2>
            <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
              Open a profile to review assessment and progress
            </p>
          </div>
          <button className="btn" onClick={() => setPage("Patients")}>
            All patients <ArrowRight size={14} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Primary complaint</th>
                <th>Dentist</th>
                <th>Last visit</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {[...clinicPatients]
                .filter((p) => lastVisitDate(sessions, p.id))
                .sort((a, b) =>
                  lastVisitDate(sessions, b.id)!.localeCompare(
                    lastVisitDate(sessions, a.id)!,
                  ),
                )
                .slice(0, 5)
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <button
                        onClick={() => openPatient(p.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          textAlign: "left",
                          fontWeight: 700,
                        }}
                      >
                        <Avatar name={p.name} size={30} />
                        {p.name}
                      </button>
                    </td>
                    <td>{p.complaint}</td>
                    <td>
                      {therapists.find((t) => t.id === p.therapistId)?.name}
                    </td>
                    <td>
                      {lastVisitDate(sessions, p.id)
                        ? fmtDate(lastVisitDate(sessions, p.id)!)
                        : "—"}
                    </td>
                    <td>
                      <Badge tone={p.status === "Active" ? "green" : "neutral"}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
  const filteredPatients = clinicPatients.filter((p) =>
    `${p.id} ${p.name} ${p.complaint} ${p.region} ${p.phone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const painChart = () => {
    const pts = selectedSessions
      .filter((s) => s.status === "Completed")
      .slice(-8);
    if (!pts.length)
      return (
        <div className="empty">
          Log a completed session to build a pain trend.
        </div>
      );
    const values = pts.map((s) => s.painAfter);
    const w = 500,
      h = 170,
      left = 28,
      right = 18,
      top = 16,
      bottom = 28;
    const x = (i: number) =>
      left +
      (pts.length === 1
        ? (w - left - right) / 2
        : (i * (w - left - right)) / (pts.length - 1));
    const y = (v: number) => top + ((10 - v) * (h - top - bottom)) / 10;
    const path = values
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`)
      .join(" ");
    return (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        role="img"
        aria-label="Pain score after each completed session"
      >
        <defs>
          <linearGradient id="painFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8AB7A4" stopOpacity=".3" />
            <stop offset="100%" stopColor="#8AB7A4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line
              x1={left}
              x2={w - right}
              y1={y(v)}
              y2={y(v)}
              className="chart-grid"
            />
            <text
              x={left - 9}
              y={y(v) + 3}
              textAnchor="end"
              className="chart-label"
            >
              {v}
            </text>
          </g>
        ))}
        <path
          d={`${path} L${x(pts.length - 1)},${h - bottom} L${x(0)},${h - bottom} Z`}
          fill="url(#painFill)"
        />
        <path
          d={path}
          fill="none"
          stroke="#397e67"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((s, i) => (
          <g key={s.id}>
            <circle
              cx={x(i)}
              cy={y(s.painAfter)}
              r="4"
              fill="#fff"
              stroke="#397e67"
              strokeWidth="2"
            />
            <text
              x={x(i)}
              y={h - 9}
              textAnchor="middle"
              className="chart-label"
            >
              {new Date(s.date + "T12:00:00").toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </text>
          </g>
        ))}
      </svg>
    );
  };
  const renderPatients = () =>
    selected ? (
      <>
        {pageHead(
          "Patient workspace",
          "Review patient details, assessments and progress.",
          <>
            <button className="btn" onClick={() => setPage("Dental plan")}>
              <ClipboardList size={15} /> Dental plan
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setModal("patient")}
            >
              <Plus size={15} /> Add patient
            </button>
          </>,
        )}
        <div className="patient-layout">
          <aside className="card patient-summary">
            <div className="card-pad">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <Avatar name={selected.name} size={48} />
                <div style={{ minWidth: 0 }}>
                  <h2
                    className="font-display"
                    style={{ fontWeight: 800, fontSize: 16 }}
                  >
                    {selected.name}
                  </h2>
                  <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                    Patient ID · {selected.id.toUpperCase()}
                  </p>
                </div>
              </div>
              <Badge tone={selected.status === "Active" ? "green" : "neutral"}>
                {selected.status} patient
              </Badge>
              <div
                className="patient-summary-details"
                style={{ display: "grid", gap: 14, marginTop: 22 }}
              >
                <div>
                  <div className="eyebrow">Primary complaint</div>
                  <div style={{ fontWeight: 600, marginTop: 5 }}>
                    {selected.complaint}
                  </div>
                </div>
                <div>
                  <div className="eyebrow">Tooth / region</div>
                  <div style={{ fontWeight: 600, marginTop: 5 }}>
                    {selected.region}
                  </div>
                </div>
                <div>
                  <div className="eyebrow">Onset</div>
                  <div style={{ fontWeight: 600, marginTop: 5 }}>
                    {selected.onset}
                  </div>
                </div>
                <div>
                  <div className="eyebrow">Assigned dentist</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 7,
                    }}
                  >
                    <Avatar
                      name={
                        therapists.find((t) => t.id === selected.therapistId)
                          ?.name || ""
                      }
                      size={28}
                    />
                    <span style={{ fontWeight: 600, fontSize: 12 }}>
                      {
                        therapists.find((t) => t.id === selected.therapistId)
                          ?.name
                      }
                    </span>
                  </div>
                </div>
                <div
                  style={{ borderTop: "1px solid var(--line)", paddingTop: 15 }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <AlertTriangle
                      size={16}
                      color={
                        selected.alerts === "None reported"
                          ? "#78968a"
                          : "#B77A2E"
                      }
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>
                        Medical alerts
                      </div>
                      <p
                        className="muted"
                        style={{ fontSize: 11, lineHeight: 1.6, marginTop: 5 }}
                      >
                        {selected.alerts}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderTop: "1px solid var(--line)",
                    paddingTop: 14,
                    display: "grid",
                    gap: 11,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      fontSize: 12,
                    }}
                  >
                    <Phone size={14} className="muted" />
                    {selected.phone}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      fontSize: 12,
                      overflowWrap: "anywhere",
                    }}
                  >
                    <Mail size={14} className="muted" />
                    {selected.email}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--line)", padding: 15 }}>
                <Field label="Switch patient">
                  <select
                    className="select"
                    value={selected.id}
                    onChange={(e) => openPatient(e.target.value)}
                  >
                    {clinicPatients.map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <button
                  className="btn"
                  style={{ width: "100%", marginTop: 10 }}
                  onClick={() => setPage("Billing")}
                >
                  <CreditCard size={14} /> View billing
                </button>
              </div>
            </div>
          </aside>
          <div className="patient-records">
            <div className="grid grid-cols-2 gap-3">
              {stat(
                "Sessions logged",
                String(
                  selectedSessions.filter((s) => s.status === "Completed")
                    .length,
                ),
                "Completed visits",
                Activity,
              )}
              {stat(
                "Latest pain score",
                selected.assessments?.[0]
                  ? `${selected.assessments[0].pain}/10`
                  : "—",
                "Latest assessment entry",
                HeartPulse,
              )}
            </div>
            <section className="card">
              <div
                className="card-pad"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <h2
                    className="font-display"
                    style={{ fontWeight: 800, fontSize: 16 }}
                  >
                    Clinical assessment
                  </h2>
                  <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                    Enter the dentist’s own findings. Nothing is generated
                    automatically.
                  </p>
                </div>
                <Badge>Clinician entered</Badge>
              </div>
              <div className="card-pad" style={{ paddingTop: 0 }}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pain score · 0–10">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max="10"
                        value={assessment.pain}
                        onChange={(e) =>
                          setAssessment({ ...assessment, pain: e.target.value })
                        }
                      />
                      <span
                        className="muted"
                        style={{ whiteSpace: "nowrap", fontSize: 11 }}
                      >
                        / 10
                      </span>
                    </div>
                  </Field>
                  <Field label="Dental findings">
                    <input
                      className="input"
                      value={assessment.rom}
                      onChange={(e) =>
                        setAssessment({ ...assessment, rom: e.target.value })
                      }
                      placeholder="Dentist's observations"
                    />
                  </Field>
                </div>
                <div style={{ marginTop: 14 }}>
                  <Field label="Dentist's clinical impression">
                    <textarea
                      className="textarea"
                      value={assessment.diagnosis}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          diagnosis: e.target.value,
                        })
                      }
                      placeholder="Enter your own clinical assessment…"
                    />
                  </Field>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 14,
                  }}
                >
                  <Btn primary onClick={saveAssessment}>
                    <Check size={14} /> Save assessment
                  </Btn>
                </div>
              </div>
            </section>
            <section className="card">
              <div
                className="card-pad"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <h2
                    className="font-display"
                    style={{ fontWeight: 800, fontSize: 16 }}
                  >
                    Pain score trend
                  </h2>
                  <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                    Pain after completed sessions · lower is better
                  </p>
                </div>
                <Badge tone="green">
                  {
                    selectedSessions.filter((s) => s.status === "Completed")
                      .length
                  }{" "}
                  entries
                </Badge>
              </div>
              <div style={{ padding: "0 14px 12px" }}>{painChart()}</div>
              <div
                style={{
                  borderTop: "1px solid var(--line)",
                  padding: "13px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                }}
              >
                <TrendingDown size={14} color="#4a8a6d" />
                <span className="muted">
                  Chart is drawn from the session records shown below.
                </span>
              </div>
            </section>
            <section className="card">
              <div
                className="card-pad"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h2
                    className="font-display"
                    style={{ fontWeight: 800, fontSize: 16 }}
                  >
                    Session timeline
                  </h2>
                  <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                    Recorded visits and pain scores
                  </p>
                </div>
                <Btn primary onClick={() => setModal("session")}>
                  <Plus size={14} /> Log session
                </Btn>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Modalities</th>
                      <th>Pain before</th>
                      <th>Pain after</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSessions
                      .slice()
                      .reverse()
                      .map((s) => (
                        <tr key={s.id}>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {fmtDate(s.date)}
                          </td>
                          <td>
                            <div>{s.modalities.join(", ")}</div>
                            <div
                              className="muted"
                              style={{ fontSize: 10, marginTop: 3 }}
                            >
                              {s.notes}
                            </div>
                          </td>
                          <td>
                            <Badge>{s.painBefore}/10</Badge>
                          </td>
                          <td>
                            <Badge
                              tone={
                                s.painAfter < s.painBefore ? "green" : "neutral"
                              }
                            >
                              {s.painAfter}/10
                            </Badge>
                          </td>
                          <td>
                            <Badge
                              tone={
                                s.status === "Completed" ? "green" : "amber"
                              }
                            >
                              {s.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!selectedSessions.length && (
                  <div className="empty">No sessions recorded yet.</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </>
    ) : null;
  const renderPlan = () => {
    const p = patients.find((x) => x.id === plan.patientId) || selected;
    const therapist =
      therapists.find((t) => t.id === p.therapistId) || therapists[0];
    const picked = exercises.filter((e) => planExercises.includes(e.id));
    return (
      <>
        {pageHead(
          "Dental treatment plan",
          "Create a dentist-led plan, record sessions and prepare a printable handout.",
          <>
            <button className="btn" onClick={() => setPage("Patients")}>
              <Users size={14} /> Patient profile
            </button>
            <button className="btn btn-primary" onClick={print}>
              <Printer size={14} /> Print handout
            </button>
          </>,
        )}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4 two-col">
          <section className="card">
            <div className="card-pad">
              <h2
                className="font-display"
                style={{ fontWeight: 800, fontSize: 16 }}
              >
                Plan details
              </h2>
              <p
                className="muted"
                style={{ fontSize: 11, marginTop: 5, marginBottom: 20 }}
              >
                All clinical content is entered by the dentist.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Patient">
                  <select
                    className="select"
                    value={plan.patientId}
                    onChange={(e) => {
                      setPlan({ ...plan, patientId: e.target.value });
                      setSelectedId(e.target.value);
                    }}
                  >
                    {clinicPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Planned sessions">
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="100"
                    value={plan.total}
                    onChange={(e) =>
                      setPlan({ ...plan, total: e.target.value })
                    }
                  />
                </Field>
                <Field label="Frequency">
                  <select
                    className="select"
                    value={plan.frequency}
                    onChange={(e) =>
                      setPlan({ ...plan, frequency: e.target.value })
                    }
                  >
                    <option>1 session / week</option>
                    <option>2 sessions / week</option>
                    <option>3 sessions / week</option>
                    <option>As clinically appropriate</option>
                  </select>
                </Field>
                <Field label="Treating dentist">
                  <input className="input" value={therapist.name} readOnly />
                </Field>
              </div>
              <div style={{ marginTop: 14 }}>
                <Field label="Goals (dentist-entered)">
                  <textarea
                    className="textarea"
                    value={plan.goals}
                    onChange={(e) =>
                      setPlan({ ...plan, goals: e.target.value })
                    }
                  />
                </Field>
              </div>
              <div
                style={{
                  background: "#f5faf7",
                  padding: 14,
                  borderRadius: 10,
                  marginTop: 16,
                  display: "flex",
                  gap: 10,
                }}
              >
                <ClipboardList size={18} color="var(--teal)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>
                    Plan overview
                  </div>
                  <p
                    className="muted"
                    style={{ fontSize: 11, lineHeight: 1.6, marginTop: 4 }}
                  >
                    {plan.total || 0} planned sessions · {plan.frequency}.
                    Review goals and procedures with the patient before sharing.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="card">
            <div className="card-pad">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <h2
                    className="font-display"
                    style={{ fontWeight: 800, fontSize: 16 }}
                  >
                    Planned procedures
                  </h2>
                  <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                    Select procedures to include in the clinician-reviewed plan.
                  </p>
                </div>
                <Badge>{picked.length} selected</Badge>
              </div>
              <div style={{ display: "grid", gap: 9, marginTop: 18 }}>
                {exercises.map((e) => {
                  const on = planExercises.includes(e.id);
                  return (
                    <label
                      key={e.id}
                      style={{
                        display: "flex",
                        gap: 11,
                        alignItems: "flex-start",
                        padding: 12,
                        border: on
                          ? "1px solid #9ebfb1"
                          : "1px solid var(--line)",
                        background: on ? "#f3faf6" : "#fff",
                        borderRadius: 11,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(ev) =>
                          setPlanExercises((prev) =>
                            ev.target.checked
                              ? [...prev, e.id]
                              : prev.filter((id) => id !== e.id),
                          )
                        }
                        style={{ marginTop: 3, accentColor: "var(--teal)" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: 12 }}>
                            {e.name}
                          </span>
                          <Badge>{e.region}</Badge>
                        </div>
                        <div
                          className="muted"
                          style={{
                            fontSize: 10,
                            lineHeight: 1.5,
                            marginTop: 5,
                          }}
                        >
                          {e.notes}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
        <section className="card" style={{ marginTop: 16 }}>
          <div
            className="card-pad"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <h2
                className="font-display"
                style={{ fontWeight: 800, fontSize: 16 }}
              >
                Log a dental visit
              </h2>
              <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                Add modalities, session notes and patient-reported pain.
              </p>
            </div>
            <Btn primary onClick={() => setModal("session")}>
              <Plus size={14} /> New session
            </Btn>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Modalities</th>
                  <th>Pain before → after</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sessions
                  .filter((s) => s.patientId === p.id)
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 6)
                  .map((s) => (
                    <tr key={s.id}>
                      <td>{fmtDate(s.date)}</td>
                      <td>{p.name}</td>
                      <td>{s.modalities.join(", ")}</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>
                          {s.painBefore} → {s.painAfter}
                        </span>{" "}
                        / 10
                      </td>
                      <td>{s.notes}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="print-only print-sheet" style={{ marginTop: 25 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "2px solid #123F40",
              paddingBottom: 18,
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#123F40" }}>
                Dental Workspace
              </div>
              <div style={{ fontSize: 11, color: "#75817D", marginTop: 5 }}>
                {clinics.find((c) => c.id === p.clinicId)?.address}
              </div>
              <div style={{ fontSize: 11, color: "#75817D", marginTop: 3 }}>
                {clinics.find((c) => c.id === p.clinicId)?.phone}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 19, fontWeight: 800 }}>
                Dental treatment plan
              </div>
              <div style={{ fontSize: 11, marginTop: 7 }}>
                Prepared {fmtDate(today)}
              </div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
                Dentist: {therapist.name}
              </div>
            </div>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>{p.name}</h2>
          <p style={{ fontSize: 11, marginTop: 6, color: "#75817D" }}>
            Plan: {plan.total} sessions · {plan.frequency}
          </p>
          <h3 style={{ fontSize: 13, fontWeight: 800, marginTop: 18 }}>
            Goals
          </h3>
          <p style={{ fontSize: 12, marginTop: 5, lineHeight: 1.6 }}>
            {plan.goals}
          </p>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 800,
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            Planned procedures
          </h3>
          {picked.length ? (
            picked.map((e) => (
              <div
                key={e.id}
                className="exercise-print"
                style={{
                  border: "1px solid #e5ebe8",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 9,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13 }}>{e.name}</div>
                <div style={{ fontSize: 11, lineHeight: 1.5, marginTop: 5 }}>
                  {e.notes}
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 12 }}>No procedures selected.</p>
          )}
          <p style={{ fontSize: 10, color: "#75817D", marginTop: 24 }}>
            Discuss the selected procedures and any instructions with your
            treating dentist before proceeding.
          </p>
        </div>
      </>
    );
  };
  const renderBilling = () => {
    const invoice = packs.find((p) => p.id === invoiceId) || packs[0];
    const ip = patients.find((p) => p.id === invoice.patientId) || patients[0];
    const clinic = clinics.find((c) => c.id === invoice.clinicId) || clinics[0];
    const gross = invoice.price * (1 + invoice.tax / 100);
    const outstanding = Math.max(0, gross - invoice.paid);
    return (
      <>
        {pageHead(
          "Billing & packages",
          "Track procedure packages, partial payments and outstanding balances.",
          <>
            <button className="btn" onClick={() => setModal("payment")}>
              <Plus size={14} /> Record payment
            </button>
            <button className="btn btn-primary" onClick={print}>
              <Printer size={14} /> Print invoice
            </button>
          </>,
        )}
        <div
          className="grid grid-cols-2 xl:grid-cols-4 gap-3"
          style={{ marginBottom: 18 }}
        >
          {stat(
            "Outstanding",
            money(
              clinicPacks.reduce(
                (n, p) => n + Math.max(0, p.price * (1 + p.tax / 100) - p.paid),
                0,
              ),
            ),
            "Including configured tax",
            Wallet,
          )}
          {stat(
            "Active packages",
            String(clinicPacks.filter((p) => p.status === "Active").length),
            "Packages in progress",
            ClipboardList,
          )}
          {stat(
            "Sessions remaining",
            String(
              clinicPacks
                .filter((p) => p.status === "Active")
                .reduce(
                  (n, p) => n + Math.max(0, p.totalSessions - p.usedSessions),
                  0,
                ),
            ),
            "Across active packages",
            Activity,
          )}
          {stat(
            "Collected",
            money(clinicPacks.reduce((n, p) => n + p.paid, 0)),
            "Payments recorded",
            CreditCard,
          )}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-4 two-col">
          <section className="card">
            <div
              className="card-pad"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div>
                <h2
                  className="font-display"
                  style={{ fontWeight: 800, fontSize: 16 }}
                >
                  Session packages
                </h2>
                <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                  Select a package to inspect invoice and balance.
                </p>
              </div>
              <Badge>{clinicPacks.length} packages</Badge>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient / package</th>
                    <th>Sessions</th>
                    <th>Price</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicPacks.map((p) => {
                    const patient = patients.find((x) => x.id === p.patientId)!;
                    const bal = Math.max(
                      0,
                      p.price * (1 + p.tax / 100) - p.paid,
                    );
                    return (
                      <tr
                        key={p.id}
                        style={{
                          background:
                            invoiceId === p.id ? "#f5faf7" : undefined,
                        }}
                      >
                        <td>
                          <button
                            onClick={() => {
                              setInvoiceId(p.id);
                              setTaxDraft(String(p.tax));
                            }}
                            style={{ textAlign: "left" }}
                          >
                            <div style={{ fontWeight: 700 }}>
                              {patient.name}
                            </div>
                            <div
                              className="muted"
                              style={{ fontSize: 10, marginTop: 4 }}
                            >
                              {p.name}
                            </div>
                          </button>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>
                            {p.usedSessions}/{p.totalSessions}
                          </div>
                          <div
                            className="progress"
                            style={{ width: 72, marginTop: 6 }}
                          >
                            <span
                              style={{
                                width:
                                  String(
                                    Math.min(
                                      100,
                                      (p.usedSessions / p.totalSessions) * 100,
                                    ),
                                  ) + "%",
                              }}
                            />
                          </div>
                        </td>
                        <td>{money(p.price)}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: bal > 0 ? "#a96a22" : "#438366",
                            }}
                          >
                            {money(bal)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              className="card-pad"
              style={{ borderTop: "1px solid var(--line)" }}
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Selected package">
                  <select
                    className="select"
                    value={invoiceId}
                    onChange={(e) => {
                      setInvoiceId(e.target.value);
                      setTaxDraft(
                        String(
                          packs.find((p) => p.id === e.target.value)?.tax ?? 0,
                        ),
                      );
                    }}
                  >
                    {clinicPacks.map((p) => (
                      <option key={p.id} value={p.id}>
                        {patients.find((x) => x.id === p.patientId)?.name} ·{" "}
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tax rate (%)">
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={taxDraft}
                    onChange={(e) => setTaxDraft(e.target.value)}
                    onBlur={() => {
                      const tax = Math.max(
                        0,
                        Math.min(30, Number(taxDraft) || 0),
                      );
                      setTaxDraft(String(tax));
                      setPacks((prev) =>
                        prev.map((p) =>
                          p.id === invoiceId ? { ...p, tax } : p,
                        ),
                      );
                    }}
                  />
                </Field>
              </div>
              <div className="muted" style={{ fontSize: 10, marginTop: 8 }}>
                Tax rate applies to the selected package.
              </div>
            </div>
          </section>
          <section className="card">
            <div className="card-pad">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    className="font-display"
                    style={{ fontWeight: 800, fontSize: 16 }}
                  >
                    Invoice preview
                  </h2>
                  <p className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                    Invoice #{invoice.id.toUpperCase()} ·{" "}
                    {fmtDate(invoice.date)}
                  </p>
                </div>
                <FileText size={20} color="var(--teal)" />
              </div>
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 11,
                  padding: 16,
                  marginTop: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    borderBottom: "1px solid var(--line)",
                    paddingBottom: 15,
                  }}
                >
                  <div>
                    <div
                      className="font-display"
                      style={{
                        fontWeight: 800,
                        fontSize: 18,
                        color: "var(--teal)",
                      }}
                    >
                      Dental Workspace
                    </div>
                    <div
                      className="muted"
                      style={{ fontSize: 10, marginTop: 5, lineHeight: 1.6 }}
                    >
                      {clinic.address}
                      <br />
                      {clinic.phone}
                    </div>
                  </div>
                  <Badge tone={outstanding > 0 ? "amber" : "green"}>
                    {outstanding > 0 ? "Payment due" : "Paid"}
                  </Badge>
                </div>
                <div style={{ marginTop: 15 }}>
                  <div className="eyebrow">Bill to</div>
                  <div style={{ fontWeight: 700, marginTop: 5 }}>{ip.name}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>
                    {ip.phone}
                  </div>
                </div>
                <div
                  style={{
                    padding: "16px 0",
                    marginTop: 12,
                    borderBottom: "1px solid var(--line)",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 12 }}>
                    {invoice.name}
                  </div>
                  <div className="muted" style={{ fontSize: 10, marginTop: 4 }}>
                    {invoice.totalSessions} dental procedures package
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 12,
                      fontSize: 12,
                    }}
                  >
                    <span>Package subtotal</span>
                    <span>{money(invoice.price)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 8,
                      fontSize: 12,
                    }}
                  >
                    <span>Tax ({invoice.tax}%)</span>
                    <span>{money(gross - invoice.price)}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 9, paddingTop: 15 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <span className="muted">Total</span>
                    <b>{money(gross)}</b>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <span className="muted">Payments received</span>
                    <b style={{ color: "#438366" }}>- {money(invoice.paid)}</b>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 15,
                      marginTop: 6,
                      paddingTop: 12,
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    <b>Balance due</b>
                    <b
                      style={{ color: outstanding > 0 ? "#a96a22" : "#438366" }}
                    >
                      {money(outstanding)}
                    </b>
                  </div>
                </div>
                <div style={{ marginTop: 18 }}>
                  <div className="eyebrow">Treatment allowance</div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 7,
                      fontSize: 12,
                    }}
                  >
                    <span>
                      {invoice.usedSessions} used of {invoice.totalSessions}
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {invoice.totalSessions - invoice.usedSessions} remaining
                    </span>
                  </div>
                  <div className="progress" style={{ marginTop: 8, height: 8 }}>
                    <span
                      style={{
                        width:
                          String(
                            (invoice.usedSessions / invoice.totalSessions) *
                              100,
                          ) + "%",
                      }}
                    />
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: 18 }}
                  onClick={print}
                >
                  <Printer size={14} /> Print A4 invoice
                </button>
              </div>
            </div>
          </section>
        </div>
        <div className="print-only print-sheet" style={{ marginTop: 25 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "2px solid #123F40",
              paddingBottom: 18,
            }}
          >
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#123F40" }}>
                Dental Workspace
              </div>
              <div style={{ fontSize: 11, marginTop: 5 }}>{clinic.address}</div>
              <div style={{ fontSize: 11, marginTop: 3 }}>{clinic.phone}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 23, fontWeight: 800 }}>INVOICE</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>
                #{invoice.id.toUpperCase()}
              </div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
                {fmtDate(invoice.date)}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 25 }}>
            <div
              style={{
                fontSize: 10,
                color: "#75817D",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Bill to
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 6 }}>
              {ip.name}
            </div>
            <div style={{ fontSize: 11, marginTop: 4 }}>{ip.phone}</div>
          </div>
          <table style={{ marginTop: 25 }}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Sessions</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{invoice.name}</td>
                <td>{invoice.totalSessions}</td>
                <td>{money(invoice.price)}</td>
              </tr>
              <tr>
                <td>Tax ({invoice.tax}%)</td>
                <td></td>
                <td>{money(gross - invoice.price)}</td>
              </tr>
            </tbody>
          </table>
          <div
            style={{
              marginLeft: "auto",
              width: 240,
              marginTop: 24,
              display: "grid",
              gap: 11,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Invoice total</span>
              <b>{money(gross)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Paid</span>
              <b>{money(invoice.paid)}</b>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #dce5e0",
                paddingTop: 12,
                fontSize: 17,
              }}
            >
              <b>Balance due</b>
              <b>{money(outstanding)}</b>
            </div>
          </div>
          <p style={{ fontSize: 10, color: "#75817D", marginTop: 40 }}>
            Thank you for choosing Dental Workspace. Please retain this
            statement for your records.
          </p>
        </div>
      </>
    );
  };
  const renderAppointments = () => {
    const days = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ];
    const visibleTherapists = therapists.filter(
      (t) =>
        (clinicId === "all" || t.clinicId === clinicId) &&
        (apptFilter === "all" || t.id === apptFilter),
    );
    const dayApps = appointments.filter(
      (a) =>
        a.date === apptDate &&
        (clinicId === "all" || a.clinicId === clinicId) &&
        a.status !== "Cancelled",
    );
    return (
      <>
        {pageHead(
          "Appointments",
          "A simple daily view to add, move or cancel patient visits.",
          <>
            <button className="btn" onClick={() => setApptDate(today)}>
              <RotateCcw size={14} /> Today
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setNewAppt({ ...newAppt, date: apptDate });
                setModal("appointment");
              }}
            >
              <Plus size={14} /> Add appointment
            </button>
          </>,
        )}
        <div className="card">
          <div
            className="card-pad"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <button
                className="btn"
                onClick={() => {
                  const d = new Date(apptDate + "T12:00:00");
                  d.setDate(d.getDate() - 1);
                  setApptDate(d.toISOString().slice(0, 10));
                }}
                aria-label="Previous day"
              >
                <ArrowLeft size={14} />
              </button>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>
                  {new Date(apptDate + "T12:00:00").toLocaleDateString(
                    "en-IN",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </div>
                <div className="muted" style={{ fontSize: 10, marginTop: 4 }}>
                  {dayApps.length} scheduled appointments
                </div>
              </div>
              <button
                className="btn"
                onClick={() => {
                  const d = new Date(apptDate + "T12:00:00");
                  d.setDate(d.getDate() + 1);
                  setApptDate(d.toISOString().slice(0, 10));
                }}
                aria-label="Next day"
              >
                <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ minWidth: 180 }}>
              <select
                className="select"
                value={apptFilter}
                onChange={(e) => setApptFilter(e.target.value)}
              >
                <option value="all">All dentists</option>
                {visibleTherapists.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table style={{ tableLayout: "fixed", minWidth: 550 }}>
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Time</th>
                  {visibleTherapists.map((t) => (
                    <th key={t.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <Avatar name={t.name} size={25} />
                        <span>{t.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((time) => (
                  <tr key={time}>
                    <td
                      style={{
                        fontSize: 10,
                        color: "var(--muted)",
                        verticalAlign: "top",
                        paddingTop: 14,
                      }}
                    >
                      {time}
                    </td>
                    {visibleTherapists.map((t) => {
                      const a = dayApps.find(
                        (a) => a.time === time && a.therapistId === t.id,
                      );
                      const p = a
                        ? patients.find((p) => p.id === a.patientId)
                        : null;
                      return (
                        <td
                          key={t.id}
                          style={{ verticalAlign: "top", padding: 4 }}
                        >
                          {a && p ? (
                            <div
                              style={{
                                borderRadius: 8,
                                padding: 8,
                                background:
                                  a.status === "Completed"
                                    ? "#f1f5f3"
                                    : "#e5f4eb",
                                borderLeft:
                                  a.status === "Completed"
                                    ? "3px solid #a3b6ad"
                                    : "3px solid #79a892",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {p.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 9,
                                  marginTop: 4,
                                  color: "#557368",
                                }}
                              >
                                {a.type} · {a.duration}m
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 4,
                                  flexWrap: "wrap",
                                  marginTop: 7,
                                }}
                              >
                                <button
                                  className="btn"
                                  style={{ padding: "4px 5px", fontSize: 9 }}
                                  onClick={() => {
                                    setEditApptId(a.id);
                                    setReschedule({
                                      date: a.date,
                                      time: a.time,
                                      therapistId: a.therapistId,
                                    });
                                    setModal("reschedule");
                                  }}
                                >
                                  Move
                                </button>
                                <button
                                  className="btn"
                                  style={{ padding: "4px 5px", fontSize: 9 }}
                                  onClick={() =>
                                    changeAppointment(a.id, {
                                      status: "Cancelled",
                                    })
                                  }
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="card-pad"
            style={{
              borderTop: "1px solid var(--line)",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div className="metric-icon">
              <CalendarPlus size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>
                Manage the day
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>
                Use Add appointment to schedule a visit. Move and Cancel update
                this calendar immediately.
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
  return (
    <div className="app-shell">
      <aside className="sidebar no-print">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 8px",
            marginBottom: 35,
          }}
        >
          <div className="brand-mark">
            <HeartPulse size={20} />
          </div>
          <div>
            <div
              className="font-display"
              style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.04em" }}
            >
              Dental<span style={{ color: "#679b86" }}> Workspace</span>
            </div>
            <div className="muted" style={{ fontSize: 10, marginTop: 2 }}>
              CLINIC WORKSPACE
            </div>
          </div>
        </div>
        <div className="eyebrow" style={{ padding: "0 13px", marginBottom: 9 }}>
          WORKSPACE
        </div>
        {shellNav}
        <div style={{ marginTop: "auto" }}>
          <div
            className="card"
            style={{
              padding: 14,
              background: "#f6faf7",
              borderColor: "#e3eee8",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div className="metric-icon" style={{ width: 29, height: 29 }}>
                <Activity size={14} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 12 }}>
                On this device
              </span>
            </div>
            <p className="muted" style={{ fontSize: 10, lineHeight: 1.6 }}>
              Patient records and changes are saved in this browser.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 8px",
              borderTop: "1px solid var(--line)",
            }}
          >
            <Avatar name="Meera Kapoor" size={35} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>
                Dr. Meera Kapoor
              </div>
              <div className="muted" style={{ fontSize: 10, marginTop: 3 }}>
                Lead dentist
              </div>
            </div>
            <MoreHorizontal size={16} className="muted" />
          </div>
        </div>
      </aside>
      <main className="main-area">
        {header}
        <div className="page-wrap">
          <div
            className="clinic-toolbar no-print"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 18,
            }}
          >
            <span className="eyebrow" style={{ whiteSpace: "nowrap" }}>
              Viewing clinic
            </span>
            <div style={{ position: "relative", maxWidth: 260, width: "100%" }}>
              <select
                className="select"
                value={clinicId}
                onChange={(e) => {
                  setClinicId(e.target.value);
                  setSelectedId(
                    (
                      patients.find(
                        (p) =>
                          e.target.value === "all" ||
                          p.clinicId === e.target.value,
                      ) || patients[0]
                    ).id,
                  );
                }}
                style={{
                  padding: "8px 32px 8px 11px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <option value="all">All clinics</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: "absolute",
                  right: 11,
                  top: 11,
                  pointerEvents: "none",
                  color: "var(--muted)",
                }}
              />
            </div>
            <span className="muted hide-mobile" style={{ fontSize: 11 }}>
              Metrics and lists update with your selection.
            </span>
          </div>
          {page === "Dashboard" ? (
            renderDashboard()
          ) : page === "Patients" ? (
            renderPatients()
          ) : page === "Dental plan" ? (
            renderPlan()
          ) : page === "Billing" ? (
            renderBilling()
          ) : page === "Prescriptions" ? (
            <PrescriptionWorkspace patients={patients} clinicId={clinicId} />
          ) : (
            renderAppointments()
          )}
          <div
            className="no-print"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 25,
              paddingTop: 17,
              borderTop: "1px solid var(--line)",
              fontSize: 10,
              color: "var(--muted)",
            }}
          >
            <span>Dental Workspace · Clinic workspace</span>
            <span></span>
          </div>
        </div>
      </main>
      <nav className="mobile-nav no-print">
        {nav.map((n) => (
          <button
            key={n.name}
            onClick={() => {
              setTab(n.name);
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
            aria-current={page === n.name ? "page" : undefined}
            className={page === n.name ? "active" : ""}
          >
            <n.icon size={18} />
            <span>
              {
                (
                  {
                    Dashboard: "Home",
                    Patients: "Patients",
                    "Dental plan": "Plan",
                    Prescriptions: "Rx",
                    Billing: "Billing",
                    Appointments: "Schedule",
                  } as const
                )[n.name]
              }
            </span>
          </button>
        ))}
      </nav>
      {modal === "appointment" && (
        <Modal title="Add appointment" onClose={() => setModal("")}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Patient">
              <select
                className="select"
                value={newAppt.patientId}
                onChange={(e) =>
                  setNewAppt({ ...newAppt, patientId: e.target.value })
                }
              >
                {clinicPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Dentist">
              <select
                className="select"
                value={newAppt.therapistId}
                onChange={(e) =>
                  setNewAppt({ ...newAppt, therapistId: e.target.value })
                }
              >
                {therapists
                  .filter((t) => clinicId === "all" || t.clinicId === clinicId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Date">
              <input
                className="input"
                type="date"
                value={newAppt.date}
                onChange={(e) =>
                  setNewAppt({ ...newAppt, date: e.target.value })
                }
              />
            </Field>
            <Field label="Start time">
              <input
                className="input"
                type="time"
                value={newAppt.time}
                onChange={(e) =>
                  setNewAppt({ ...newAppt, time: e.target.value })
                }
              />
            </Field>
            <div className="col-span-2">
              <Field label="Appointment type">
                <select
                  className="select"
                  value={newAppt.type}
                  onChange={(e) =>
                    setNewAppt({ ...newAppt, type: e.target.value })
                  }
                >
                  <option>Initial consultation</option>
                  <option>Follow-up</option>
                  <option>Dental review</option>
                </select>
              </Field>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 22,
            }}
          >
            <Btn onClick={() => setModal("")}>Cancel</Btn>
            <Btn primary onClick={addAppointment}>
              <CalendarPlus size={14} /> Save appointment
            </Btn>
          </div>
        </Modal>
      )}
      {modal === "reschedule" && (
        <Modal title="Reschedule appointment" onClose={() => setModal("")}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="New date">
              <input
                className="input"
                type="date"
                value={reschedule.date}
                onChange={(e) =>
                  setReschedule({ ...reschedule, date: e.target.value })
                }
              />
            </Field>
            <Field label="New time">
              <input
                className="input"
                type="time"
                value={reschedule.time}
                onChange={(e) =>
                  setReschedule({ ...reschedule, time: e.target.value })
                }
              />
            </Field>
            <div className="col-span-2">
              <Field label="Dentist">
                <select
                  className="select"
                  value={reschedule.therapistId}
                  onChange={(e) =>
                    setReschedule({
                      ...reschedule,
                      therapistId: e.target.value,
                    })
                  }
                >
                  {therapists
                    .filter(
                      (t) => clinicId === "all" || t.clinicId === clinicId,
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </Field>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 22,
            }}
          >
            <Btn onClick={() => setModal("")}>Cancel</Btn>
            <Btn
              primary
              onClick={() => {
                const t = therapists.find(
                  (t) => t.id === reschedule.therapistId,
                );
                if (t)
                  changeAppointment(editApptId, {
                    date: reschedule.date,
                    time: reschedule.time,
                    therapistId: t.id,
                    clinicId: t.clinicId,
                  });
                setModal("");
                setToast("Appointment rescheduled.");
              }}
            >
              Save changes
            </Btn>
          </div>
        </Modal>
      )}
      {modal === "patient" && (
        <Modal title="Add patient" onClose={() => setModal("")}>
          <div style={{ display: "grid", gap: 13 }}>
            <Field label="Patient name">
              <input
                className="input"
                value={newPatient.name}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, name: e.target.value })
                }
                placeholder="e.g. Taylor Morgan"
              />
            </Field>
            <Field label="Phone">
              <input
                className="input"
                value={newPatient.phone}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </Field>
            <Field label="Primary complaint">
              <input
                className="input"
                value={newPatient.complaint}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, complaint: e.target.value })
                }
                placeholder="Enter complaint"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tooth / region">
                <select
                  className="select"
                  value={newPatient.region}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, region: e.target.value })
                  }
                >
                  {[
                    "Molar",
                    "Premolar",
                    "Incisor",
                    "Canine",
                    "Wisdom tooth",
                    "Upper arch",
                    "Lower arch",
                    "Gums",
                  ].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Dentist">
                <select
                  className="select"
                  value={newPatient.therapistId}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      therapistId: e.target.value,
                    })
                  }
                >
                  {therapists
                    .filter(
                      (t) => clinicId === "all" || t.clinicId === clinicId,
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </Field>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 22,
            }}
          >
            <Btn onClick={() => setModal("")}>Cancel</Btn>
            <Btn
              primary
              onClick={addPatient}
              disabled={!newPatient.name.trim()}
            >
              <Plus size={14} /> Add patient
            </Btn>
          </div>
        </Modal>
      )}
      {modal === "session" && (
        <Modal title="Log dental visit" onClose={() => setModal("")}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Visit date">
              <input
                className="input"
                type="date"
                value={log.date}
                onChange={(e) => setLog({ ...log, date: e.target.value })}
              />
            </Field>
            <Field label="Patient">
              <input className="input" value={selected.name} readOnly />
            </Field>
            <Field label="Pain before · 0–10">
              <input
                className="input"
                type="number"
                min="0"
                max="10"
                value={log.before}
                onChange={(e) => setLog({ ...log, before: e.target.value })}
              />
            </Field>
            <Field label="Pain after · 0–10">
              <input
                className="input"
                type="number"
                min="0"
                max="10"
                value={log.after}
                onChange={(e) => setLog({ ...log, after: e.target.value })}
              />
            </Field>
            <div className="col-span-2">
              <Field label="Modalities used (comma-separated)">
                <input
                  className="input"
                  value={log.modalities}
                  onChange={(e) =>
                    setLog({ ...log, modalities: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Dentist notes">
                <textarea
                  className="textarea"
                  value={log.notes}
                  onChange={(e) => setLog({ ...log, notes: e.target.value })}
                />
              </Field>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 22,
            }}
          >
            <Btn onClick={() => setModal("")}>Cancel</Btn>
            <Btn primary onClick={addSession}>
              <Check size={14} /> Save session
            </Btn>
          </div>
        </Modal>
      )}
      {modal === "payment" && (
        <Modal title="Record partial payment" onClose={() => setModal("")}>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Package / patient">
              <select
                className="select"
                value={payment.packageId}
                onChange={(e) =>
                  setPayment({ ...payment, packageId: e.target.value })
                }
              >
                {clinicPacks.map((p) => (
                  <option key={p.id} value={p.id}>
                    {patients.find((x) => x.id === p.patientId)?.name} ·{" "}
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Payment amount">
              <input
                className="input"
                type="number"
                min="1"
                value={payment.amount}
                onChange={(e) =>
                  setPayment({ ...payment, amount: e.target.value })
                }
              />
            </Field>
            {(() => {
              const p = packs.find((p) => p.id === payment.packageId);
              return p ? (
                <div
                  style={{
                    background: "#f5faf7",
                    padding: 13,
                    borderRadius: 9,
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span className="muted">Current balance</span>
                    <b>
                      {money(Math.max(0, p.price * (1 + p.tax / 100) - p.paid))}
                    </b>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 22,
            }}
          >
            <Btn onClick={() => setModal("")}>Cancel</Btn>
            <Btn
              primary
              onClick={() => {
                const amount = Math.max(0, Number(payment.amount) || 0);
                const p = packs.find((p) => p.id === payment.packageId);
                if (!p || amount <= 0) {
                  setToast("Enter a payment amount greater than zero.");
                  return;
                }
                setPacks((prev) =>
                  prev.map((x) =>
                    x.id === p.id
                      ? {
                          ...x,
                          paid: Math.min(
                            x.price * (1 + x.tax / 100),
                            x.paid + amount,
                          ),
                        }
                      : x,
                  ),
                );
                setInvoiceId(p.id);
                setTaxDraft(String(p.tax));
                setModal("");
                setToast("Payment recorded.");
              }}
            >
              Record payment
            </Btn>
          </div>
        </Modal>
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 100,
            background: "#123F40",
            color: "#fff",
            borderRadius: 11,
            padding: "12px 16px",
            boxShadow: "0 8px 30px #102c2b2b",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
