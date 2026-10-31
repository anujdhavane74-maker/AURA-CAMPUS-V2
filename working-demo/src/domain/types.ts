export type Role = "student" | "club" | "admin";
export interface Session {
  role: Role;
  userId: string;
  clubId: string;
}
export type Section =
  | "education"
  | "skills"
  | "projects"
  | "certificates"
  | "achievements"
  | "experience"
  | "memberships"
  | "records";
export interface ContentItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  tags: string;
}
export interface Student {
  id: string;
  name: string;
  slug: string;
  headline: string;
  bio: string;
  college: string;
  course: string;
  year: string;
  location: string;
  initials: string;
  color: string;
  email: string;
  website: string;
  status: "active" | "suspended";
  public: boolean;
  visibility: Record<Section, boolean>;
  skills: string[];
  education: ContentItem[];
  projects: ContentItem[];
  certificates: ContentItem[];
  achievements: ContentItem[];
  experience: ContentItem[];
}
export interface Member {
  studentId: string;
  title: string;
  role: "owner" | "admin" | "member";
}
export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
}
export interface Club {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  objective: string;
  initials: string;
  color: string;
  status: "pending" | "approved" | "suspended";
  members: Member[];
  announcements: Announcement[];
  handoverTo: string | null;
}
export interface CampusEvent {
  id: string;
  clubId: string;
  name: string;
  description: string;
  date: string;
  venue: string;
  capacity: number;
  status: "draft" | "published" | "completed" | "cancelled";
  registrationOpen: boolean;
  theme: string;
}
export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  status: "registered" | "cancelled";
  attended: boolean;
  date: string;
}
export type ClaimType =
  "Participant" | "Volunteer" | "Organizer" | "Winner" | "Speaker";
export interface ActivityRecord {
  id: string;
  studentId: string;
  clubId: string;
  eventId: string;
  type: ClaimType;
  description: string;
  issuerId: string;
  issuedAt: string;
  status: "confirmed" | "revoked";
  acceptance: "pending" | "accepted" | "declined";
  public: boolean;
  revokedReason?: string;
}
export interface Audit {
  id: string;
  date: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
}
export interface Report {
  id: string;
  studentId: string;
  recordId: string;
  reason: string;
  status: "open" | "resolved";
  resolution: string;
}
export interface Database {
  version: 1;
  students: Student[];
  clubs: Club[];
  events: CampusEvent[];
  registrations: Registration[];
  records: ActivityRecord[];
  audit: Audit[];
  reports: Report[];
}
export type Collection =
  "education" | "projects" | "certificates" | "achievements" | "experience";
export const SECTIONS: Section[] = [
  "education",
  "skills",
  "projects",
  "certificates",
  "achievements",
  "experience",
  "memberships",
  "records",
];
