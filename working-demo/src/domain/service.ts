import { createSeed } from "./seed";
import type {
  Database,
  Session,
  Student,
  Collection,
  ContentItem,
  CampusEvent,
  ClaimType,
  Club,
  ActivityRecord,
} from "./types";
export interface Persistence {
  read(): string | null;
  write(value: string): void;
}
export const STORAGE_KEY = "aura-campus.demo.v1";
const id = () =>
  globalThis.crypto.randomUUID?.() ??
  Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
const required = (value: string, label: string, max = 2000) => {
  if (!value.trim()) throw new Error(`${label} is required.`);
  if (value.length > max) throw new Error(`${label} is too long.`);
  return value.trim();
};
export function safeUrl(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) throw 0;
    return url.href;
  } catch {
    throw new Error("Use a complete https:// or http:// link.");
  }
}
export function publicProfile(db: Database, slug: string) {
  const s = db.students.find((s) => s.slug === slug);
  if (!s || !s.public || s.status !== "active") return null;
  const clean = structuredClone(s);
  clean.email = "";
  for (const field of [
    "education",
    "skills",
    "projects",
    "certificates",
    "achievements",
    "experience",
  ] as const)
    if (!clean.visibility[field]) clean[field] = [];
  return {
    student: clean,
    clubs: s.visibility.memberships
      ? db.clubs.filter((c) => c.members.some((m) => m.studentId === s.id))
      : [],
    records: s.visibility.records
      ? db.records.filter(
          (r) =>
            r.studentId === s.id && r.acceptance === "accepted" && r.public,
        )
      : [],
  };
}
export class DemoService {
  state: Database;
  warning = "";
  listeners = new Set<() => void>();
  constructor(private persistence?: Persistence) {
    this.state = createSeed();
    if (persistence)
      try {
        const raw = persistence.read();
        if (raw) {
          const data = JSON.parse(raw);
          if (
            data.version !== 1 ||
            ![
              "students",
              "clubs",
              "events",
              "registrations",
              "records",
              "audit",
              "reports",
            ].every((k) => Array.isArray(data[k])) ||
            !data.students.length ||
            !data.clubs.length ||
            !data.students.every(
              (s: Student) =>
                s.visibility &&
                Array.isArray(s.projects) &&
                Array.isArray(s.skills),
            )
          )
            throw new Error();
          this.state = data;
        }
      } catch {
        this.warning =
          "Saved demo data could not be read. Fresh demo data is loaded; use Reset demo to replace the damaged save.";
      }
  }
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  snapshot = () => this.state;
  private transaction(fn: (d: Database) => void) {
    const next = structuredClone(this.state);
    fn(next);
    try {
      this.persistence?.write(JSON.stringify(next));
    } catch {
      throw new Error(
        "Could not save this change. Browser storage may be full or unavailable.",
      );
    }
    this.state = next;
    this.listeners.forEach((f) => f());
  }
  private actor(d: Database, s: Session) {
    const actor = d.students.find((u) => u.id === s.userId);
    if (s.role !== "admin" && (!actor || actor.status === "suspended"))
      throw new Error(
        "This demo account is suspended. Switch role or ask the platform admin to restore it.",
      );
    return actor;
  }
  private student(d: Database, s: Session) {
    this.actor(d, s);
    if (s.role !== "student")
      throw new Error("Switch to a student role first.");
    return d.students.find((x) => x.id === s.userId)!;
  }
  private club(d: Database, s: Session, clubId: string) {
    this.actor(d, s);
    const club = d.clubs.find((c) => c.id === clubId);
    if (
      !club ||
      s.role !== "club" ||
      s.clubId !== clubId ||
      !club.members.some((m) => m.studentId === s.userId && m.role !== "member")
    )
      throw new Error("Only an authorized club administrator can do this.");
    if (club.status === "suspended") throw new Error("This club is suspended.");
    return club;
  }
  private log(
    d: Database,
    s: Session,
    action: string,
    target: string,
    detail = "",
  ) {
    d.audit.push({
      id: id(),
      date: new Date().toISOString(),
      actor: s.role === "admin" ? "Platform admin" : s.userId,
      action,
      target,
      detail,
    });
  }
  createStudent(name: string, slug: string) {
    let studentId = "";
    this.transaction((d) => {
      name = required(name, "Name", 80);
      slug = slug.trim().toLowerCase();
      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        d.students.some((u) => u.slug === slug)
      )
        throw new Error(
          "Choose a unique lowercase profile URL using letters, numbers and hyphens.",
        );
      studentId = id();
      d.students.push({
        id: studentId,
        name,
        slug,
        headline: "",
        bio: "",
        college: "Aura Institute of Technology",
        course: "",
        year: "",
        location: "",
        initials: name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join(""),
        color: "mint",
        email: "",
        website: "",
        status: "active",
        public: false,
        visibility: {
          education: true,
          skills: true,
          projects: true,
          certificates: true,
          achievements: true,
          experience: true,
          memberships: true,
          records: true,
        },
        skills: [],
        education: [],
        projects: [],
        certificates: [],
        achievements: [],
        experience: [],
      });
      this.log(
        d,
        { role: "student", userId: studentId, clubId: "" },
        "Demo profile created",
        studentId,
      );
    });
    return studentId;
  }
  createClub(s: Session, name: string, slug: string, description: string) {
    let clubId = "";
    this.transaction((d) => {
      this.student(d, s);
      name = required(name, "Club name", 80);
      slug = slug.toLowerCase().trim();
      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        d.clubs.some((c) => c.slug === slug)
      )
        throw new Error("Choose a unique lowercase club URL.");
      clubId = id();
      d.clubs.push({
        id: clubId,
        name,
        slug,
        description: required(description, "Description"),
        objective: "Create a welcoming student community.",
        category: "Technology",
        initials: name
          .split(/\s+/)
          .slice(0, 2)
          .map((x) => x[0])
          .join(""),
        color: "mint",
        status: "pending",
        members: [
          { studentId: s.userId, role: "owner", title: "Founding organizer" },
        ],
        handoverTo: null,
        announcements: [],
      });
      this.log(d, s, "Demo club created", clubId, "Issuer review pending");
    });
    return clubId;
  }
  updateProfile(s: Session, patch: Partial<Student>) {
    this.transaction((d) => {
      const u = this.student(d, s);
      const name = required(patch.name ?? u.name, "Name", 80);
      const slug = (patch.slug ?? u.slug).toLowerCase().trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
        throw new Error(
          "Profile URL must use lowercase letters, numbers and single hyphens.",
        );
      if (d.students.some((x) => x.id !== u.id && x.slug === slug))
        throw new Error("That profile URL is already taken.");
      const allowed = [
        "headline",
        "bio",
        "college",
        "course",
        "year",
        "location",
        "website",
        "public",
        "visibility",
      ] as const;
      for (const key of allowed)
        if (patch[key] !== undefined)
          (u as unknown as Record<string, unknown>)[key] = patch[key];
      u.name = name;
      u.slug = slug;
      u.website = safeUrl(u.website);
      u.initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0])
        .join("");
      this.log(d, s, "Profile updated", u.id);
    });
  }
  saveItem(s: Session, collection: Collection, item: ContentItem) {
    this.transaction((d) => {
      const u = this.student(d, s);
      item = {
        ...item,
        title: required(item.title, "Title", 120),
        description: required(item.description, "Description"),
        url: safeUrl(item.url),
      };
      const index = u[collection].findIndex((i) => i.id === item.id);
      if (index < 0) u[collection].push({ ...item, id: id() });
      else u[collection][index] = item;
      this.log(d, s, "Profile content saved", u.id, collection);
    });
  }
  removeItem(s: Session, collection: Collection, itemId: string) {
    this.transaction((d) => {
      const u = this.student(d, s);
      u[collection] = u[collection].filter((i) => i.id !== itemId);
      this.log(d, s, "Profile content removed", u.id, collection);
    });
  }
  setSkills(s: Session, value: string) {
    this.transaction((d) => {
      const u = this.student(d, s);
      const skills = [
        ...new Set(
          value
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        ),
      ];
      if (skills.length > 30 || skills.some((x) => x.length > 50))
        throw new Error("Use up to 30 skills, each under 50 characters.");
      u.skills = skills;
      this.log(d, s, "Skills updated", u.id);
    });
  }
  saveClub(
    s: Session,
    patch: Pick<Club, "name" | "description" | "objective" | "category">,
  ) {
    this.transaction((d) => {
      const c = this.club(d, s, s.clubId);
      Object.assign(c, {
        ...patch,
        name: required(patch.name, "Club name", 80),
        description: required(patch.description, "Description"),
        objective: required(patch.objective, "Objective"),
      });
      this.log(d, s, "Club profile updated", c.id);
    });
  }
  saveEvent(s: Session, event: CampusEvent) {
    let eventId = event.id;
    this.transaction((d) => {
      const c = this.club(d, s, s.clubId);
      const existing = d.events.find((e) => e.id === event.id);
      if (
        existing?.status === "completed" &&
        event.status !== "completed" &&
        d.records.some((r) => r.eventId === event.id)
      )
        throw new Error(
          "Completed events with confirmed history must remain completed.",
        );
      if (existing && existing.clubId !== c.id)
        throw new Error("This event belongs to another club.");
      if (
        !Number.isInteger(event.capacity) ||
        event.capacity < 1 ||
        event.capacity > 10000
      )
        throw new Error("Capacity must be between 1 and 10,000.");
      const count = d.registrations.filter(
        (r) => r.eventId === event.id && r.status === "registered",
      ).length;
      if (event.capacity < count)
        throw new Error(
          `Capacity cannot be below the ${count} existing registrations.`,
        );
      if (!Number.isFinite(Date.parse(event.date)))
        throw new Error("Choose a valid date and time.");
      if (event.status === "published" && Date.parse(event.date) <= Date.now())
        throw new Error(
          "A published upcoming event needs a future date. Mark past events completed.",
        );
      const next = {
        ...event,
        id: existing?.id ?? id(),
        clubId: c.id,
        name: required(event.name, "Event name", 120),
        description: required(event.description, "Description"),
        venue: required(event.venue, "Venue", 160),
      };
      if (next.status !== "published") next.registrationOpen = false;
      if (existing) Object.assign(existing, next);
      else d.events.push(next);
      eventId = next.id;
      this.log(
        d,
        s,
        existing ? "Event updated" : "Event created",
        next.id,
        next.status,
      );
    });
    return eventId;
  }
  deleteEvent(s: Session, eventId: string) {
    this.transaction((d) => {
      const e = d.events.find((e) => e.id === eventId);
      if (!e) throw new Error("Event not found.");
      this.club(d, s, e.clubId);
      if (
        d.registrations.some((r) => r.eventId === eventId) ||
        d.records.some((r) => r.eventId === eventId)
      )
        throw new Error(
          "An event with registration history cannot be deleted. Cancel it to preserve records.",
        );
      d.events = d.events.filter((x) => x.id !== eventId);
      this.log(d, s, "Event deleted", eventId);
    });
  }
  register(s: Session, eventId: string) {
    this.transaction((d) => {
      this.student(d, s);
      const e = d.events.find((e) => e.id === eventId);
      if (
        !e ||
        e.status !== "published" ||
        !e.registrationOpen ||
        Date.parse(e.date) <= Date.now()
      )
        throw new Error("Registration is closed for this event.");
      if (d.clubs.find((c) => c.id === e.clubId)?.status === "suspended")
        throw new Error(
          "Registration is unavailable while the club is suspended.",
        );
      const old = d.registrations.find(
        (r) => r.eventId === eventId && r.studentId === s.userId,
      );
      if (old?.status === "registered")
        throw new Error("You are already registered.");
      if (
        d.registrations.filter(
          (r) => r.eventId === eventId && r.status === "registered",
        ).length >= e.capacity
      )
        throw new Error("This event is full.");
      if (old) {
        old.status = "registered";
        old.attended = false;
        old.date = new Date().toISOString();
      } else
        d.registrations.push({
          id: id(),
          eventId,
          studentId: s.userId,
          status: "registered",
          attended: false,
          date: new Date().toISOString(),
        });
      this.log(d, s, "Event registration", eventId);
    });
  }
  cancelRegistration(s: Session, eventId: string) {
    this.transaction((d) => {
      this.student(d, s);
      const r = d.registrations.find(
        (r) =>
          r.eventId === eventId &&
          r.studentId === s.userId &&
          r.status === "registered",
      );
      if (!r) throw new Error("No active registration found.");
      if (
        r.attended ||
        d.records.some((x) => x.studentId === s.userId && x.eventId === eventId)
      )
        throw new Error(
          "A registration with participation history cannot be cancelled. Contact the organizer.",
        );
      r.status = "cancelled";
      this.log(d, s, "Registration cancelled", eventId);
    });
  }
  markAttendance(s: Session, registrationId: string, attended: boolean) {
    this.transaction((d) => {
      const r = d.registrations.find((r) => r.id === registrationId);
      if (!r || r.status !== "registered")
        throw new Error("An active registration is required.");
      const e = d.events.find((e) => e.id === r.eventId)!;
      this.club(d, s, e.clubId);
      if (e.status !== "completed")
        throw new Error(
          "Mark the event completed before recording actual participation.",
        );
      if (
        !attended &&
        d.records.some(
          (x) =>
            x.eventId === e.id &&
            x.studentId === r.studentId &&
            x.status === "confirmed",
        )
      )
        throw new Error(
          "Revoke existing confirmations before removing participation.",
        );
      r.attended = attended;
      this.log(
        d,
        s,
        attended ? "Participation recorded" : "Participation corrected",
        r.id,
      );
    });
  }
  issue(
    s: Session,
    input: {
      eventId: string;
      studentId: string;
      type: ClaimType;
      description: string;
      reviewed: boolean;
    },
  ) {
    let recordId = "";
    this.transaction((d) => {
      const e = d.events.find((e) => e.id === input.eventId);
      if (!e) throw new Error("Event not found.");
      const c = this.club(d, s, e.clubId);
      if (c.status !== "approved")
        throw new Error(
          "The platform admin must approve this club as a demo issuer first.",
        );
      if (!input.reviewed)
        throw new Error("Review the contribution before issuing.");
      if (input.studentId === s.userId)
        throw new Error(
          "Another club admin must confirm your own contribution.",
        );
      if (e.status !== "completed")
        throw new Error("Complete the event before confirming contributions.");
      if (
        !d.registrations.some(
          (r) =>
            r.eventId === e.id &&
            r.studentId === input.studentId &&
            r.status === "registered" &&
            r.attended,
        )
      )
        throw new Error(
          "Record actual participation before issuing a confirmation.",
        );
      if (
        d.records.some(
          (r) =>
            r.eventId === e.id &&
            r.studentId === input.studentId &&
            r.type === input.type &&
            r.status === "confirmed",
        )
      )
        throw new Error(
          "This contribution type is already confirmed for this student.",
        );
      recordId = id();
      d.records.push({
        id: recordId,
        studentId: input.studentId,
        clubId: c.id,
        eventId: e.id,
        type: input.type,
        description: required(input.description, "Contribution description"),
        issuerId: s.userId,
        issuedAt: new Date().toISOString(),
        status: "confirmed",
        acceptance: "pending",
        public: false,
      });
      this.log(
        d,
        s,
        "Confirmation issued",
        recordId,
        `${input.type} · ${e.name}`,
      );
    });
    return recordId;
  }
  respond(
    s: Session,
    recordId: string,
    acceptance: "accepted" | "declined",
    visible: boolean,
  ) {
    this.transaction((d) => {
      this.student(d, s);
      const r = d.records.find(
        (r) => r.id === recordId && r.studentId === s.userId,
      );
      if (!r) throw new Error("Record not found.");
      if (r.status === "revoked")
        throw new Error("Revoked records cannot be accepted.");
      r.acceptance = acceptance;
      r.public = acceptance === "accepted" && visible;
      this.log(
        d,
        s,
        `Record ${acceptance}`,
        r.id,
        visible
          ? "Student selected public visibility"
          : "Hidden from public profile",
      );
    });
  }
  recordVisibility(s: Session, recordId: string, visible: boolean) {
    this.transaction((d) => {
      this.student(d, s);
      const r = d.records.find(
        (r) => r.id === recordId && r.studentId === s.userId,
      );
      if (!r || r.acceptance !== "accepted")
        throw new Error("Accept this record first.");
      r.public = visible;
      this.log(
        d,
        s,
        "Record visibility changed",
        r.id,
        visible ? "Public" : "Private",
      );
    });
  }
  revoke(s: Session, recordId: string, reason: string) {
    this.transaction((d) => {
      const r = d.records.find((r) => r.id === recordId);
      if (!r) throw new Error("Record not found.");
      this.club(d, s, r.clubId);
      if (r.status === "revoked")
        throw new Error("This record is already revoked.");
      r.status = "revoked";
      r.revokedReason = required(reason, "Reason");
      this.log(d, s, "Confirmation revoked", r.id, r.revokedReason);
    });
  }
  member(
    s: Session,
    studentId: string,
    action: "add" | "remove" | "admin" | "member",
    title = "Community Member",
  ) {
    this.transaction((d) => {
      const c = this.club(d, s, s.clubId);
      if (!d.students.some((u) => u.id === studentId))
        throw new Error("Student not found.");
      const owner = c.members.find((m) => m.role === "owner");
      if (["admin", "member"].includes(action) && owner?.studentId !== s.userId)
        throw new Error("Only the owner can change committee permissions.");
      const m = c.members.find((m) => m.studentId === studentId);
      if (m?.role === "admin" && owner?.studentId !== s.userId)
        throw new Error(
          "Only the club owner can change another administrator.",
        );
      if (m?.role === "owner")
        throw new Error("Use ownership handover to change the owner.");
      if (c.handoverTo === studentId)
        throw new Error(
          "Cancel the pending handover before changing this member.",
        );
      if (action === "add") {
        if (m) throw new Error("This student is already a member.");
        c.members.push({
          studentId,
          title: required(title, "Member title", 80),
          role: "member",
        });
      } else if (!m) throw new Error("Member not found.");
      else if (action === "remove")
        c.members = c.members.filter((x) => x.studentId !== studentId);
      else {
        m.role = action;
        m.title = required(title, "Committee title", 80);
      }
      this.log(d, s, `Membership ${action}`, c.id, studentId);
    });
  }
  handover(s: Session, to: string | null) {
    this.transaction((d) => {
      const c = this.club(d, s, s.clubId);
      if (
        !c.members.some((m) => m.studentId === s.userId && m.role === "owner")
      )
        throw new Error("Only the owner can initiate a handover.");
      if (to && (!c.members.some((m) => m.studentId === to) || to === s.userId))
        throw new Error("Choose another current member.");
      c.handoverTo = to;
      this.log(
        d,
        s,
        to ? "Ownership handover requested" : "Ownership handover cancelled",
        c.id,
        to ?? "",
      );
    });
  }
  acceptHandover(s: Session, clubId: string) {
    this.transaction((d) => {
      this.actor(d, s);
      const c = d.clubs.find((c) => c.id === clubId);
      if (
        !c ||
        c.handoverTo !== s.userId ||
        s.role !== "student" ||
        c.status === "suspended"
      )
        throw new Error(
          "Switch to the nominated student to accept this handover.",
        );
      const old = c.members.find((m) => m.role === "owner")!;
      old.role = "admin";
      old.title = "Former President · Admin";
      const next = c.members.find((m) => m.studentId === s.userId)!;
      next.role = "owner";
      next.title = "Club President";
      c.handoverTo = null;
      this.log(d, s, "Ownership handover accepted", c.id);
    });
  }
  announcement(s: Session, title: string, body: string, deleteId?: string) {
    this.transaction((d) => {
      const c = this.club(d, s, s.clubId);
      if (deleteId)
        c.announcements = c.announcements.filter((a) => a.id !== deleteId);
      else
        c.announcements.unshift({
          id: id(),
          title: required(title, "Title", 100),
          body: required(body, "Announcement"),
          date: new Date().toISOString(),
        });
      this.log(
        d,
        s,
        deleteId ? "Announcement deleted" : "Announcement published",
        c.id,
      );
    });
  }
  report(s: Session, recordId: string, reason: string) {
    this.transaction((d) => {
      this.student(d, s);
      if (!d.records.some((r) => r.id === recordId && r.studentId === s.userId))
        throw new Error("You can dispute your own records.");
      if (d.reports.some((r) => r.recordId === recordId && r.status === "open"))
        throw new Error("There is already an open dispute for this record.");
      d.reports.push({
        id: id(),
        studentId: s.userId,
        recordId,
        reason: required(reason, "Reason"),
        status: "open",
        resolution: "",
      });
      this.log(d, s, "Dispute opened", recordId);
    });
  }
  admin(
    s: Session,
    kind: "club" | "user" | "report",
    target: string,
    value: string,
  ) {
    this.transaction((d) => {
      if (s.role !== "admin")
        throw new Error("Platform administrator role required.");
      if (kind === "club") {
        const c = d.clubs.find((c) => c.id === target)!;
        if (!["pending", "approved", "suspended"].includes(value))
          throw new Error("Invalid status.");
        c.status = value as Club["status"];
      }
      if (kind === "user") {
        const u = d.students.find((u) => u.id === target)!;
        if (!["active", "suspended"].includes(value))
          throw new Error("Invalid status.");
        u.status = value as Student["status"];
      }
      if (kind === "report") {
        const r = d.reports.find((r) => r.id === target)!;
        r.resolution = required(value, "Resolution");
        r.status = "resolved";
      }
      this.log(d, s, `${kind} review updated`, target, value);
    });
  }
  reset(s: Session) {
    if (s.role !== "admin")
      throw new Error("Platform administrator role required.");
    const fresh = createSeed();
    try {
      this.persistence?.write(JSON.stringify(fresh));
    } catch {
      throw new Error("Could not reset browser storage.");
    }
    this.state = fresh;
    this.warning = "";
    this.listeners.forEach((f) => f());
  }
}
export function recordLabel(r: ActivityRecord) {
  return r.status === "revoked"
    ? "Confirmation revoked"
    : r.acceptance === "pending"
      ? "Awaiting your acceptance"
      : r.acceptance === "declined"
        ? "Declined"
        : "Club-confirmed contribution";
}
