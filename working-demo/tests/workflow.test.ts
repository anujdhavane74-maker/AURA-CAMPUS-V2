import { beforeEach, describe, expect, it } from "vitest";
import { DemoService, publicProfile } from "../src/domain/service";
import type { CampusEvent, Session } from "../src/domain/types";
const student: Session = { role: "student", userId: "anuj", clubId: "coding" };
const club: Session = { role: "club", userId: "riya", clubId: "coding" };
const admin: Session = { ...student, role: "admin" };
let repo: DemoService;
let saved: string | null;
beforeEach(() => {
  saved = null;
  repo = new DemoService({
    read: () => saved,
    write: (v) => {
      saved = v;
    },
  });
});
const create = (capacity = 2) =>
  repo.saveEvent(club, {
    ...repo.state.events[0],
    id: "",
    name: "Demo Build Lab",
    capacity,
    status: "published",
    registrationOpen: true,
  });
const complete = (eid: string) =>
  repo.saveEvent(club, {
    ...repo.state.events.find((e) => e.id === eid)!,
    status: "completed",
  });
const signup = (eid: string) => repo.register(student, eid);
const claim = (eid: string, reviewed = true) =>
  repo.issue(club, {
    eventId: eid,
    studentId: "anuj",
    type: "Volunteer",
    description: "Designed a registration prototype.",
    reviewed,
  });
const registered = (eid: string) =>
  repo.state.registrations.find(
    (r) => r.eventId === eid && r.studentId === "anuj",
  )!;
const visible = (rid: string) =>
  publicProfile(repo.state, "anuj-dhavane")?.records.some((r) => r.id === rid);
const issued = () => {
  const e = create();
  signup(e);
  complete(e);
  repo.markAttendance(club, registered(e).id, true);
  return claim(e);
};
describe("profile content and visibility", () => {
  it("edits identity, rejects duplicate handles, and survives rehydration", () => {
    repo.updateProfile(student, { name: "Anuj Demo", slug: "anuj-demo" });
    expect(() => repo.updateProfile(student, { slug: "riya-shah" })).toThrow(
      /taken/,
    );
    const reload = new DemoService({ read: () => saved, write: () => {} });
    expect(publicProfile(reload.state, "anuj-demo")?.student.name).toBe(
      "Anuj Demo",
    );
    expect(publicProfile(reload.state, "anuj-dhavane")).toBeNull();
  });
  it("creates private student profiles with empty personal content", () => {
    const id = repo.createStudent("Demo Builder", "demo-builder");
    expect(publicProfile(repo.state, "demo-builder")).toBeNull();
    repo.updateProfile({ ...student, userId: id }, { public: true });
    expect(
      publicProfile(repo.state, "demo-builder")?.student.projects,
    ).toHaveLength(0);
  });
  it("adds, edits and removes projects and rejects unsafe evidence URLs", () => {
    const item = {
      id: "",
      title: "My project",
      subtitle: "Demo",
      description: "Designed a prototype",
      url: "https://example.org/demo",
      tags: "React",
    };
    repo.saveItem(student, "projects", item);
    let added = repo.state.students[0].projects.at(-1)!;
    expect(added.title).toBe(item.title);
    repo.saveItem(student, "projects", { ...added, title: "Revised project" });
    expect(repo.state.students[0].projects.at(-1)?.title).toBe(
      "Revised project",
    );
    expect(() =>
      repo.saveItem(student, "projects", {
        ...added,
        url: "javascript:alert(1)",
      }),
    ).toThrow(/https/);
    repo.removeItem(student, "projects", added.id);
    expect(repo.state.students[0].projects.some((p) => p.id === added.id)).toBe(
      false,
    );
  });
  it("hides private sections and unpublished profiles", () => {
    const s = repo.state.students[0];
    repo.updateProfile(student, {
      visibility: {
        ...s.visibility,
        projects: false,
        skills: false,
        records: false,
        memberships: false,
      },
    });
    const profile = publicProfile(repo.state, s.slug)!;
    expect(profile.student.projects).toEqual([]);
    expect(profile.student.skills).toEqual([]);
    expect(profile.clubs).toEqual([]);
    expect(profile.records).toEqual([]);
    repo.updateProfile(student, { public: false });
    expect(publicProfile(repo.state, s.slug)).toBeNull();
  });
  it("normalizes skills without duplicating them", () => {
    repo.setSkills(student, "Python, UX,Python, ");
    expect(repo.state.students[0].skills).toEqual(["Python", "UX"]);
  });
});
describe("event lifecycle", () => {
  it("creates drafts, publishes, edits and deletes unused events", () => {
    const eid = repo.saveEvent(club, {
      ...repo.state.events[0],
      id: "",
      status: "draft",
    });
    expect(() => signup(eid)).toThrow(/closed/);
    const evt = repo.state.events.find((x) => x.id === eid)!;
    repo.saveEvent(club, {
      ...evt,
      name: "Published demo",
      status: "published",
      registrationOpen: true,
    });
    expect(repo.state.events.find((x) => x.id === eid)?.name).toBe(
      "Published demo",
    );
    repo.deleteEvent(club, eid);
    expect(repo.state.events.some((x) => x.id === eid)).toBe(false);
  });
  it("prevents duplicate registrations and does not turn registration into participation", () => {
    const e = create();
    signup(e);
    expect(() => signup(e)).toThrow(/already registered/);
    expect(registered(e).attended).toBe(false);
    expect(repo.state.records.filter((r) => r.eventId === e)).toHaveLength(0);
  });
  it("enforces capacity, frees cancelled places and supports re-registration", () => {
    const e = create(1);
    signup(e);
    expect(() => repo.register({ ...student, userId: "kabir" }, e)).toThrow(
      /full/,
    );
    repo.cancelRegistration(student, e);
    repo.register({ ...student, userId: "kabir" }, e);
    expect(() => signup(e)).toThrow(/full/);
    repo.cancelRegistration({ ...student, userId: "kabir" }, e);
    signup(e);
    expect(
      repo.state.registrations.filter(
        (r) => r.eventId === e && r.studentId === "anuj",
      ),
    ).toHaveLength(1);
  });
  it("prevents lowering capacity below active registrations and protects event history", () => {
    const e = create(2);
    signup(e);
    repo.register({ ...student, userId: "kabir" }, e);
    expect(() =>
      repo.saveEvent(club, {
        ...repo.state.events.find((x) => x.id === e)!,
        capacity: 1,
      }),
    ).toThrow(/below/);
    expect(() => repo.deleteEvent(club, e)).toThrow(/history/);
  });
  it("does not allow attendance before completion or confirmation before attendance", () => {
    const e = create();
    signup(e);
    expect(() => repo.markAttendance(club, registered(e).id, true)).toThrow(
      /completed/,
    );
    complete(e);
    expect(() => claim(e)).toThrow(/actual participation/);
    repo.markAttendance(club, registered(e).id, true);
    expect(() => claim(e, false)).toThrow(/Review/);
  });
  it("blocks unauthorized cross-club writes and self-confirmation", () => {
    const e = create();
    signup(e);
    complete(e);
    expect(() =>
      repo.markAttendance(
        { ...club, clubId: "enterprise" },
        registered(e).id,
        true,
      ),
    ).toThrow(/authorized/);
    expect(() =>
      repo.issue(
        { ...club, userId: "kabir" },
        {
          eventId: "design",
          studentId: "kabir",
          type: "Speaker",
          description: "Spoke",
          reviewed: true,
        },
      ),
    ).toThrow(/own contribution/);
  });
  it("rejects editing past events back to upcoming after issuance", () => {
    expect(() =>
      repo.saveEvent(club, {
        ...repo.state.events[1],
        status: "published",
        date: new Date(Date.now() + 86400000).toISOString(),
      }),
    ).toThrow(/history/);
  });
});
describe("connected recognition workflow", () => {
  it("goes from registration to review to acceptance to a visible public record", () => {
    const rid = issued();
    let r = repo.state.records.find((r) => r.id === rid)!;
    expect(r.issuerId).toBe("riya");
    expect(r.acceptance).toBe("pending");
    expect(visible(rid)).toBe(false);
    repo.respond(student, rid, "accepted", false);
    expect(visible(rid)).toBe(false);
    repo.recordVisibility(student, rid, true);
    expect(visible(rid)).toBe(true);
    expect(
      repo.state.audit.filter((a) => a.target === rid).map((a) => a.action),
    ).toEqual([
      "Confirmation issued",
      "Record accepted",
      "Record visibility changed",
    ]);
  });
  it("keeps declined and private records out of public profiles", () => {
    const rid = issued();
    repo.respond(student, rid, "declined", true);
    expect(visible(rid)).toBe(false);
    expect(() => repo.recordVisibility(student, rid, true)).toThrow(/Accept/);
    expect(() =>
      repo.respond({ ...student, userId: "kabir" }, rid, "accepted", true),
    ).toThrow(/not found/);
  });
  it("prevents double issuance and requires approved issuer status", () => {
    const rid = issued();
    const event = repo.state.records.find((r) => r.id === rid)!.eventId;
    expect(() => claim(event)).toThrow(/already confirmed/);
    repo.admin(admin, "club", "coding", "pending");
    expect(() => claim(event)).toThrow(/approve/);
  });
  it("retains revocation history and public corrections, and prevents acceptance of revoked claims", () => {
    const rid = issued();
    repo.respond(student, rid, "accepted", true);
    repo.revoke(club, rid, "Incorrect role");
    expect(
      publicProfile(repo.state, "anuj-dhavane")?.records.find(
        (r) => r.id === rid,
      ),
    ).toMatchObject({ status: "revoked", revokedReason: "Incorrect role" });
    expect(repo.state.audit.at(-1)?.action).toBe("Confirmation revoked");
    expect(() => repo.respond(student, rid, "accepted", true)).toThrow(
      /Revoked/,
    );
    repo.recordVisibility(student, rid, false);
    expect(visible(rid)).toBe(false);
  });
  it("preserves attendance history once confirmed", () => {
    const rid = issued();
    const eid = repo.state.records.find((r) => r.id === rid)!.eventId;
    expect(() => repo.markAttendance(club, registered(eid).id, false)).toThrow(
      /Revoke/,
    );
    expect(() => repo.cancelRegistration(student, eid)).toThrow(/history/);
  });
});
describe("club operations, governance, persistence", () => {
  it("creates a club with pending issuer status, and manages members, committee and announcements", () => {
    const id = repo.createClub(
      student,
      "Demo Makers",
      "demo-makers",
      "Practical projects",
    );
    const organizer = { ...student, role: "club" as const, clubId: id };
    repo.member(organizer, "kabir", "add");
    repo.member(organizer, "kabir", "admin", "Events Lead");
    repo.announcement(organizer, "First meetup", "Bring an idea");
    const c = repo.state.clubs.find((c) => c.id === id)!;
    expect(c.status).toBe("pending");
    expect(c.members.find((m) => m.studentId === "kabir")?.role).toBe("admin");
    expect(c.announcements).toHaveLength(1);
    repo.member(organizer, "kabir", "remove");
    expect(repo.state.clubs.find((c) => c.id === id)?.members).toHaveLength(1);
  });
  it("requires a nominee to accept an ownership handover and preserves exactly one owner", () => {
    repo.handover(club, "anuj");
    expect(
      repo.state.clubs[0].members.find((m) => m.role === "owner")?.studentId,
    ).toBe("riya");
    expect(() =>
      repo.acceptHandover({ ...student, userId: "kabir" }, "coding"),
    ).toThrow(/nominated/);
    repo.acceptHandover(student, "coding");
    const members = repo.state.clubs[0].members;
    expect(
      members.filter((m) => m.role === "owner").map((m) => m.studentId),
    ).toEqual(["anuj"]);
    expect(members.find((m) => m.studentId === "riya")?.role).toBe("admin");
  });
  it("rejects suspended accounts, inappropriate roles and unresolved duplicates", () => {
    repo.admin(admin, "user", "anuj", "suspended");
    expect(() => repo.updateProfile(student, { bio: "x" })).toThrow(
      /suspended/,
    );
    expect(publicProfile(repo.state, "anuj-dhavane")).toBeNull();
    repo.admin(admin, "user", "anuj", "active");
    repo.report(student, "record-pending", "Incorrect role");
    expect(() => repo.report(student, "record-pending", "Again")).toThrow(
      /open dispute/,
    );
    const report = repo.state.reports.at(-1)!;
    repo.admin(admin, "report", report.id, "Organizer contacted");
    expect(repo.state.reports.at(-1)?.status).toBe("resolved");
    expect(() => repo.admin(student, "club", "coding", "approved")).toThrow(
      /administrator/,
    );
  });
  it("restores the original sample after reset and persists the reset", () => {
    repo.updateProfile(student, { name: "Changed" });
    expect(() => repo.reset(student)).toThrow(/administrator/);
    repo.reset(admin);
    expect(repo.state.students[0].name).toBe("Anuj Dhavane");
    expect(JSON.parse(saved!).records).toHaveLength(3);
  });
  it("recovers visibly from unreadable saves, and rolls back failed writes", () => {
    const broken = new DemoService({
      read: () => "{broken",
      write: () => {
        throw Error("Quota exceeded");
      },
    });
    expect(broken.warning).toContain("could not be read");
    expect(() => broken.updateProfile(student, { name: "Not saved" })).toThrow(
      /Could not save/,
    );
    expect(broken.state.students[0].name).toBe("Anuj Dhavane");
  });
});
