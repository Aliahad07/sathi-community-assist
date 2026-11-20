/**
 * SYNTHETIC DEMO DATA ONLY.
 * Every name, ID, number and record below is invented for the Sathi AI prototype.
 * None of it refers to a real person, office or government programme.
 */

export type AppStatus = "submitted" | "in_review" | "approved" | "returned" | "doc_pending";

export const statusMeta: Record<
  AppStatus,
  { label: string; urdu: string; variant: "info" | "warning" | "success" | "destructive" }
> = {
  submitted: { label: "Submitted", urdu: "جمع شدہ", variant: "info" },
  in_review: { label: "In review", urdu: "زیرِ جائزہ", variant: "warning" },
  approved: { label: "Approved", urdu: "منظور شدہ", variant: "success" },
  returned: { label: "Returned", urdu: "واپس بھیجی گئی", variant: "destructive" },
  doc_pending: {
    label: "Document Submitted – Pending Review",
    urdu: "دستاویز جمع — زیرِ جائزہ",
    variant: "info",
  },
};

/* ---------------- Citizen ---------------- */

export const demoCitizen = {
  name: "Ayesha Bibi",
  district: "Demo District",
  citizenId: "DEMO-CZ-0142",
};

export interface CitizenApplication {
  id: string;
  service: string;
  serviceUrdu: string;
  department: string;
  submitted: string;
  status: AppStatus;
  step: number; // 1-4
  note?: string;
}

export const citizenApplications: CitizenApplication[] = [
  {
    id: "APP-DEMO-1021",
    service: "Family Support Grant",
    serviceUrdu: "خاندانی امدادی گرانٹ",
    department: "Social Welfare (Demo)",
    submitted: "12 Nov 2026",
    status: "in_review",
    step: 2,
  },
  {
    id: "APP-DEMO-0987",
    service: "Birth Certificate Request",
    serviceUrdu: "پیدائش سرٹیفکیٹ",
    department: "Union Council (Demo)",
    submitted: "28 Oct 2026",
    status: "approved",
    step: 4,
  },
  {
    id: "APP-DEMO-1050",
    service: "Electricity Bill Relief",
    serviceUrdu: "بجلی بل ریلیف",
    department: "Energy Relief Cell (Demo)",
    submitted: "17 Nov 2026",
    status: "returned",
    step: 2,
    note: "Please upload a clearer photo of your latest bill.",
  },
];

export const applicationSteps = [
  { label: "Submitted", urdu: "جمع" },
  { label: "In review", urdu: "جائزہ" },
  { label: "Decision", urdu: "فیصلہ" },
  { label: "Completed", urdu: "مکمل" },
];

export type DocStatus = "verified" | "pending" | "needs_update";

export const citizenDocuments: { name: string; urdu: string; status: DocStatus; updated: string }[] =
  [
    { name: "Identity card copy", urdu: "شناختی کارڈ کی کاپی", status: "verified", updated: "02 Nov 2026" },
    { name: "Proof of address", urdu: "پتے کا ثبوت", status: "verified", updated: "02 Nov 2026" },
    { name: "Electricity bill (Oct)", urdu: "بجلی کا بل", status: "needs_update", updated: "17 Nov 2026" },
    { name: "Family registration form", urdu: "خاندانی اندراج فارم", status: "pending", updated: "12 Nov 2026" },
  ];

export const docStatusMeta: Record<
  DocStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  verified: { label: "Verified", variant: "success" },
  pending: { label: "Pending check", variant: "warning" },
  needs_update: { label: "Needs update", variant: "destructive" },
};

export const assistantSuggestions = [
  {
    q: "How do I apply for family support?",
    qUrdu: "خاندانی امداد کے لیے کیسے درخواست دوں؟",
    a: "You need 3 things: your identity card copy, proof of address and a family registration form. You already have 2 of them verified. I can guide you through the form step by step.",
  },
  {
    q: "Why was my bill relief returned?",
    qUrdu: "میری بل ریلیف درخواست واپس کیوں آئی؟",
    a: "The officer could not read your electricity bill photo. Take a new photo in good light, with all four corners visible, then upload it under My documents.",
  },
  {
    q: "Who can help me in person?",
    qUrdu: "مجھے ذاتی طور پر کون مدد کر سکتا ہے؟",
    a: "Your community helper is Bilal Ahmed (demo). He visits Ward 7 on Tuesdays and Thursdays and can help you fill forms.",
  },
];

/* ---------------- Community helper ---------------- */

export const demoHelper = {
  name: "Bilal Ahmed",
  area: "Ward 7, Demo Town",
  helperId: "DEMO-HL-0031",
};

export type FamilyStatus = "needs_attention" | "on_track" | "new";

export const familyStatusMeta: Record<
  FamilyStatus,
  { label: string; urdu: string; variant: "destructive" | "success" | "info" }
> = {
  needs_attention: { label: "Needs attention", urdu: "توجہ درکار", variant: "destructive" },
  on_track: { label: "On track", urdu: "درست سمت", variant: "success" },
  new: { label: "New", urdu: "نیا", variant: "info" },
};

export interface Family {
  id: string;
  head: string;
  members: number;
  location: string;
  openCases: number;
  status: FamilyStatus;
  lastVisit: string;
}

export const families: Family[] = [
  { id: "FAM-D-001", head: "Rashida Khatoon", members: 6, location: "Street 4", openCases: 2, status: "needs_attention", lastVisit: "14 Nov" },
  { id: "FAM-D-002", head: "Ghulam Rasool", members: 4, location: "Street 2", openCases: 1, status: "on_track", lastVisit: "16 Nov" },
  { id: "FAM-D-003", head: "Shazia Parveen", members: 5, location: "Market Lane", openCases: 0, status: "on_track", lastVisit: "10 Nov" },
  { id: "FAM-D-004", head: "Muhammad Akram", members: 7, location: "Street 9", openCases: 3, status: "needs_attention", lastVisit: "05 Nov" },
  { id: "FAM-D-005", head: "Nasreen Akhtar", members: 3, location: "Canal Road", openCases: 1, status: "new", lastVisit: "—" },
  { id: "FAM-D-006", head: "Zubair Hussain", members: 5, location: "Street 4", openCases: 1, status: "on_track", lastVisit: "18 Nov" },
  { id: "FAM-D-007", head: "Kalsoom Bibi", members: 2, location: "Mosque Road", openCases: 2, status: "needs_attention", lastVisit: "08 Nov" },
  { id: "FAM-D-008", head: "Asif Mehmood", members: 4, location: "Street 11", openCases: 0, status: "new", lastVisit: "—" },
];

export interface HelperTask {
  id: string;
  title: string;
  family: string;
  due: string;
  done: boolean;
}

export const helperTasks: HelperTask[] = [
  { id: "T1", title: "Re-upload electricity bill photo", family: "Rashida Khatoon", due: "Today", done: false },
  { id: "T2", title: "Fill family support form", family: "Muhammad Akram", due: "Today", done: false },
  { id: "T3", title: "First home visit and registration", family: "Nasreen Akhtar", due: "Tomorrow", done: false },
  { id: "T4", title: "Explain approval letter", family: "Ghulam Rasool", due: "21 Nov", done: true },
  { id: "T5", title: "Collect school enrolment proof", family: "Kalsoom Bibi", due: "22 Nov", done: false },
];

/* ---------------- Officer ---------------- */

export const demoOfficer = {
  name: "S. Malik",
  title: "Review Officer",
  department: "Social Welfare — Demo Unit",
};

export type Priority = "high" | "normal";

export interface QueueItem {
  id: string;
  applicant: string;
  service: string;
  area: string;
  submitted: string;
  priority: Priority;
  status: AppStatus;
  viaHelper: boolean;
}

export const officerQueue: QueueItem[] = [
  { id: "APP-DEMO-1021", applicant: "Ayesha B.", service: "Family Support Grant", area: "Ward 7", submitted: "12 Nov", priority: "high", status: "in_review", viaHelper: false },
  { id: "APP-DEMO-1033", applicant: "Rashida K.", service: "Family Support Grant", area: "Ward 7", submitted: "14 Nov", priority: "high", status: "submitted", viaHelper: true },
  { id: "APP-DEMO-1036", applicant: "Imran S.", service: "Disability Allowance", area: "Ward 3", submitted: "15 Nov", priority: "normal", status: "submitted", viaHelper: false },
  { id: "APP-DEMO-1040", applicant: "Muhammad A.", service: "School Fee Support", area: "Ward 7", submitted: "15 Nov", priority: "normal", status: "in_review", viaHelper: true },
  { id: "APP-DEMO-1044", applicant: "Fatima Z.", service: "Widow Support", area: "Ward 5", submitted: "16 Nov", priority: "high", status: "submitted", viaHelper: false },
  { id: "APP-DEMO-1047", applicant: "Tariq J.", service: "Disability Allowance", area: "Ward 1", submitted: "17 Nov", priority: "normal", status: "approved", viaHelper: false },
  { id: "APP-DEMO-1050", applicant: "Ayesha B.", service: "Electricity Bill Relief", area: "Ward 7", submitted: "17 Nov", priority: "normal", status: "returned", viaHelper: false },
  { id: "APP-DEMO-1052", applicant: "Kalsoom B.", service: "School Fee Support", area: "Ward 7", submitted: "18 Nov", priority: "normal", status: "submitted", viaHelper: true },
];

export const weeklyVolume = [
  { day: "Mon", count: 38 },
  { day: "Tue", count: 52 },
  { day: "Wed", count: 45 },
  { day: "Thu", count: 61 },
  { day: "Fri", count: 49 },
  { day: "Sat", count: 22 },
  { day: "Sun", count: 9 },
];
