import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  FolderKanban,
  ShieldCheck,
  Users,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Check,
  Globe,
  GraduationCap,
  Download,
} from "lucide-react";
import { useApp } from "../state";
import type { Collection, ContentItem, Student } from "../domain/types";
import { SECTIONS } from "../domain/types";
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Field,
  Heading,
  Modal,
  Notice,
  RecordCard,
  Stat,
  EventCard,
} from "../components/ui";
export function StudentDashboard() {
  const { db, session, service, act } = useApp();
  const s = db.students.find((s) => s.id === session.userId)!;
  const pending = db.records.filter(
    (r) =>
      r.studentId === s.id &&
      r.acceptance === "pending" &&
      r.status === "confirmed",
  );
  const clubs = db.clubs.filter((c) =>
    c.members.some((m) => m.studentId === s.id),
  );
  const regs = db.registrations.filter(
    (r) => r.studentId === s.id && r.status === "registered",
  );
  const invites = db.clubs.filter((c) => c.handoverTo === s.id);
  return (
    <>
      <Heading
        eyebrow="YOUR CAMPUS, YOUR CHAPTER"
        title={`Good to see you, ${s.name.split(" ")[0]}.`}
        description="A little progress, a new connection, a story taking shape."
        action={
          <Link className="button secondary" to={`/u/${s.slug}`}>
            View public profile
            <ArrowUpRight size={16} />
          </Link>
        }
      />
      {s.status === "suspended" && (
        <Notice>
          This demo account is suspended. Ask the platform administrator to
          restore it.
        </Notice>
      )}
      <div className="dashboard-welcome">
        <div>
          <Badge tone="green">YOUR JOURNEY IS UNDERWAY</Badge>
          <h2>
            You’re becoming
            <br />
            someone interesting.
          </h2>
          <p>Keep your projects close and your possibilities open.</p>
          <Link className="button primary" to="/student/profile">
            Make your profile yours
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="welcome-art">
          <Avatar student={s} size="hero" />
          <span className="welcome-orbit" />
          <span className="welcome-star">✳</span>
          <span className="welcome-tag">
            a work in progress, in the best way.
          </span>
        </div>
      </div>
      <div className="stats-grid">
        <Stat
          value={s.projects.length}
          label="Projects in your story"
          icon={<FolderKanban />}
        />
        <Stat
          value={
            db.records.filter(
              (r) =>
                r.studentId === s.id &&
                r.acceptance === "accepted" &&
                r.status === "confirmed",
            ).length
          }
          label="Accepted contributions"
          icon={<ShieldCheck />}
        />
        <Stat
          value={clubs.length}
          label="Communities you’re part of"
          icon={<Users />}
        />
      </div>
      {invites.map((c) => (
        <div className="action-banner" key={c.id}>
          <div>
            <h3>You’ve been nominated to lead {c.name}.</h3>
            <p>Accepting transfers club ownership to your demo account.</p>
          </div>
          <Button
            onClick={() =>
              act(
                () => service.acceptHandover(session, c.id),
                "You’re now the club owner. Switch to Club admin to explore.",
              )
            }
          >
            Accept ownership
            <Check size={17} />
          </Button>
        </div>
      ))}
      <div className="dashboard-columns">
        <section>
          <div className="section-top">
            <h2>A little recognition.</h2>
            <Link className="text-link" to="/student/records">
              All records
              <ArrowRight size={16} />
            </Link>
          </div>
          {pending.length ? (
            <div className="stack">
              {pending.slice(0, 2).map((r) => (
                <RecordCard
                  key={r.id}
                  record={r}
                  actions={
                    <Link
                      className="button secondary small"
                      to="/student/records"
                    >
                      Review contribution
                      <ArrowRight size={15} />
                    </Link>
                  }
                />
              ))}
            </div>
          ) : (
            <Empty title="You’re all caught up">
              New club-confirmed contributions will arrive here.
            </Empty>
          )}
        </section>
        <aside className="quick-actions">
          <h2>Your next little step.</h2>
          <Link to="/student/projects">
            <span>
              <FolderKanban size={20} />
            </span>
            <div>
              <strong>Add something you built</strong>
              <small>Your work deserves a place.</small>
            </div>
            <ArrowUpRight size={18} />
          </Link>
          <Link to="/clubs">
            <span>
              <Users size={20} />
            </span>
            <div>
              <strong>Meet your people</strong>
              <small>Find a community that fits.</small>
            </div>
            <ArrowUpRight size={18} />
          </Link>
          <Link to="/student/privacy">
            <span>
              <Eye size={20} />
            </span>
            <div>
              <strong>Decide what to share</strong>
              <small>Your story, your choice.</small>
            </div>
            <ArrowUpRight size={18} />
          </Link>
        </aside>
      </div>
      <section className="space-top">
        <div className="section-top">
          <h2>On your calendar.</h2>
          <Link className="text-link" to="/events">
            Find an experience
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="event-grid">
          {db.events
            .filter(
              (e) =>
                regs.some((r) => r.eventId === e.id) &&
                e.status === "published",
            )
            .map((e) => (
              <EventCard event={e} key={e.id} />
            ))}
        </div>
        {!db.events.some(
          (e) =>
            regs.some((r) => r.eventId === e.id) && e.status === "published",
        ) && (
          <Empty
            title="Your next experience is waiting"
            action={
              <Link className="button secondary" to="/events">
                Explore campus events
                <ArrowUpRight size={16} />
              </Link>
            }
          >
            Find an event that sparks your curiosity.
          </Empty>
        )}
      </section>
    </>
  );
}
const emptyItem: ContentItem = {
  id: "",
  title: "",
  subtitle: "",
  description: "",
  url: "",
  tags: "",
};
export function ContentManager({ collection }: { collection: Collection }) {
  const { db, session, service, act } = useApp();
  const s = db.students.find((s) => s.id === session.userId)!;
  const [edit, setEdit] = useState<ContentItem | null>(null);
  const [remove, setRemove] = useState<ContentItem | null>(null);
  const singular = {
    projects: "project",
    education: "education entry",
    certificates: "certificate",
    achievements: "achievement",
    experience: "experience",
  }[collection];
  return (
    <section className="content-manager">
      <div className="section-top">
        <h2 className="capitalize">{collection}</h2>
        <Button
          variant="secondary small"
          onClick={() => setEdit({ ...emptyItem })}
        >
          <Plus size={16} />
          Add {singular}
        </Button>
      </div>
      {s[collection].length ? (
        <div className="editable-items">
          {s[collection].map((item, i) => (
            <article className="editable-item" key={item.id}>
              <div className={`item-icon ${i % 2 ? "lilac" : "mint"}`}>
                <FolderKanban size={21} />
              </div>
              <div>
                <h3>{item.title}</h3>
                <small>{item.subtitle}</small>
                <p>{item.description}</p>
                {item.tags && (
                  <div className="tags">
                    {item.tags.split(",").map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="row item-actions">
                <button
                  className="icon-button"
                  onClick={() => setEdit({ ...item })}
                  aria-label={`Edit ${item.title}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => setRemove(item)}
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={`Your ${singular} belongs here.`}
          action={
            <Button
              variant="secondary"
              onClick={() => setEdit({ ...emptyItem })}
            >
              <Plus size={16} />
              Add your first {singular}
            </Button>
          }
        >
          Start with something meaningful. It doesn’t have to be perfect.
        </Empty>
      )}
      {edit && (
        <Modal
          title={`${edit.id ? "Edit" : "Add"} ${singular}`}
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                act(
                  () => service.saveItem(session, collection, edit),
                  "Saved to your profile",
                )
              )
                setEdit(null);
            }}
          >
            <Field label="Title">
              <input
                required
                maxLength={120}
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </Field>
            <Field
              label={
                collection === "projects"
                  ? "Short tagline"
                  : "Institution, organization, or dates"
              }
            >
              <input
                maxLength={180}
                value={edit.subtitle}
                onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })}
              />
            </Field>
            <Field label="Description and your contribution">
              <textarea
                required
                maxLength={2000}
                rows={4}
                value={edit.description}
                onChange={(e) =>
                  setEdit({ ...edit, description: e.target.value })
                }
              />
            </Field>
            {collection === "projects" && (
              <Field
                label="Tools and technologies"
                hint="Separate with commas."
              >
                <input
                  value={edit.tags}
                  onChange={(e) => setEdit({ ...edit, tags: e.target.value })}
                />
              </Field>
            )}
            <Field
              label={
                collection === "projects"
                  ? "Project or repository URL (optional)"
                  : "Evidence URL (optional)"
              }
              hint="Use an https:// link. This demo stores links, not uploaded files."
            >
              <input
                type="url"
                value={edit.url}
                onChange={(e) => setEdit({ ...edit, url: e.target.value })}
                placeholder="https://…"
              />
            </Field>
            <p className="muted small-text">
              This content is self-reported. It does not receive a club
              confirmation badge.
            </p>
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEdit(null)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save {singular}
                <Check size={16} />
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal title={`Remove ${singular}?`} onClose={() => setRemove(null)}>
          <p>“{remove.title}” will be removed from your demo profile.</p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setRemove(null)}>
              Keep it
            </Button>
            <Button
              variant="danger-button"
              onClick={() => {
                if (
                  act(
                    () => service.removeItem(session, collection, remove.id),
                    "Entry removed",
                  )
                )
                  setRemove(null);
              }}
            >
              Remove entry
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
export function ProfileEditor() {
  const { db, session, service, act } = useApp();
  const s = db.students.find((s) => s.id === session.userId)!;
  const [form, setForm] = useState({ ...s });
  const [skills, setSkills] = useState(s.skills.join(", "));
  const [tab, setTab] = useState("personal");
  const patch = (key: keyof Student, value: string) =>
    setForm({ ...form, [key]: value });
  return (
    <>
      <Heading
        eyebrow="MAKE IT YOURS"
        title="A profile that feels like you."
        description="Bring together what you know, what you’re learning, and what you’ve made."
        action={
          <Link className="button secondary" to={`/u/${s.slug}`}>
            Public preview
            <ArrowUpRight size={16} />
          </Link>
        }
      />
      <div className="tabs scroll-tabs">
        {[
          "personal",
          "education",
          "skills",
          "certificates",
          "achievements",
          "experience",
        ].map((t) => (
          <button
            className={tab === t ? "active capitalize" : "capitalize"}
            key={t}
            onClick={() => setTab(t)}
          >
            {t === "personal" ? "Personal information" : t}
          </button>
        ))}
      </div>
      {tab === "personal" ? (
        <form
          className="form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            act(
              () =>
                service.updateProfile(session, {
                  name: form.name,
                  slug: form.slug,
                  headline: form.headline,
                  bio: form.bio,
                  college: form.college,
                  course: form.course,
                  year: form.year,
                  location: form.location,
                  website: form.website,
                }),
              "Profile saved. Your public page is up to date.",
            );
          }}
        >
          <div className="profile-form-top">
            <Avatar student={form} size="large" />
            <div>
              <h3>Your personal details</h3>
              <p>An initials avatar keeps this demo lightweight.</p>
            </div>
          </div>
          <div className="form-grid">
            <Field label="Full name">
              <input
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => patch("name", e.target.value)}
              />
            </Field>
            <Field
              label="Public profile URL"
              hint="Lowercase letters, numbers, and hyphens."
            >
              <div className="input-prefix">
                <span>/u/</span>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => patch("slug", e.target.value)}
                />
              </div>
            </Field>
            <div className="full">
              <Field label="A line that sounds like you">
                <input
                  maxLength={160}
                  value={form.headline}
                  onChange={(e) => patch("headline", e.target.value)}
                />
              </Field>
            </div>
            <div className="full">
              <Field label="Your introduction">
                <textarea
                  rows={4}
                  maxLength={1500}
                  value={form.bio}
                  onChange={(e) => patch("bio", e.target.value)}
                />
              </Field>
            </div>
            <Field label="College">
              <input
                maxLength={120}
                value={form.college}
                onChange={(e) => patch("college", e.target.value)}
              />
            </Field>
            <Field label="Course">
              <input
                maxLength={120}
                value={form.course}
                onChange={(e) => patch("course", e.target.value)}
              />
            </Field>
            <Field label="Academic year">
              <input
                maxLength={50}
                value={form.year}
                onChange={(e) => patch("year", e.target.value)}
              />
            </Field>
            <Field label="Location">
              <input
                maxLength={100}
                value={form.location}
                onChange={(e) => patch("location", e.target.value)}
              />
            </Field>
            <div className="full">
              <Field label="Website or social profile (optional)">
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => patch("website", e.target.value)}
                  placeholder="https://…"
                />
              </Field>
            </div>
          </div>
          <div className="form-actions">
            <Button type="submit">
              Save profile
              <Check size={16} />
            </Button>
          </div>
        </form>
      ) : tab === "skills" ? (
        <form
          className="form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            act(() => service.setSkills(session, skills), "Skills updated");
          }}
        >
          <h2>Your current toolkit.</h2>
          <Field
            label="Skills"
            hint="Separate skills with commas. Up to 30 skills."
          >
            <textarea
              rows={4}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </Field>
          <div className="tags large-tags">
            {[
              ...new Set(
                skills
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              ),
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="form-actions">
            <Button type="submit">Save skills</Button>
          </div>
        </form>
      ) : (
        <ContentManager collection={tab as Collection} />
      )}
    </>
  );
}
export function Projects() {
  return (
    <>
      <Heading
        eyebrow="IDEAS INTO SOMETHING REAL"
        title="Things you’ve been building."
        description="A working prototype, a design exploration, a side project. They all tell a story."
      />
      <ContentManager collection="projects" />
    </>
  );
}
export function StudentRecords() {
  const { db, session, service, act } = useApp();
  const [filter, setFilter] = useState("all");
  const [publish, setPublish] = useState<Record<string, boolean>>({});
  const records = db.records.filter(
    (r) =>
      r.studentId === session.userId &&
      (filter === "all" ||
        (filter === "revoked" && r.status === "revoked") ||
        (r.acceptance === filter && r.status !== "revoked")),
  );
  return (
    <>
      <Heading
        eyebrow="YOUR CONTRIBUTIONS COUNT"
        title="Recognition, with context."
        description="Review club-confirmed activity. Accept what’s accurate, and decide what you want to share."
      />
      <div className="tabs">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All records
        </button>
        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={filter === "accepted" ? "active" : ""}
          onClick={() => setFilter("accepted")}
        >
          Accepted
        </button>
        <button
          className={filter === "revoked" ? "active" : ""}
          onClick={() => setFilter("revoked")}
        >
          Revoked
        </button>
      </div>
      <div className="stack">
        {records.map((r) => (
          <RecordCard
            key={r.id}
            record={r}
            actions={
              r.status === "revoked" ? (
                <>
                  <span className="muted small-text">
                    History retained. This is no longer a valid confirmation.
                  </span>
                  {r.acceptance === "accepted" && (
                    <label className="check-input">
                      <input
                        type="checkbox"
                        checked={r.public}
                        onChange={(e) =>
                          act(
                            () =>
                              service.recordVisibility(
                                session,
                                r.id,
                                e.target.checked,
                              ),
                            "Record visibility updated",
                          )
                        }
                      />
                      Show corrected record publicly
                    </label>
                  )}
                </>
              ) : r.acceptance !== "accepted" ? (
                <>
                  <label className="check-input">
                    <input
                      type="checkbox"
                      checked={publish[r.id] ?? false}
                      onChange={(e) =>
                        setPublish({ ...publish, [r.id]: e.target.checked })
                      }
                    />
                    Show on my public profile after acceptance
                  </label>
                  <div className="row wrap">
                    <Button
                      onClick={() =>
                        act(
                          () =>
                            service.respond(
                              session,
                              r.id,
                              "accepted",
                              publish[r.id] ?? false,
                            ),
                          "Contribution accepted",
                        )
                      }
                    >
                      Accept contribution
                      <Check size={15} />
                    </Button>
                    {r.acceptance !== "declined" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          act(
                            () =>
                              service.respond(session, r.id, "declined", false),
                            "Contribution declined",
                          )
                        }
                      >
                        Decline
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <label className="check-input">
                  <input
                    type="checkbox"
                    checked={r.public}
                    onChange={(e) =>
                      act(
                        () =>
                          service.recordVisibility(
                            session,
                            r.id,
                            e.target.checked,
                          ),
                        "Record visibility updated",
                      )
                    }
                  />
                  {r.public ? <Eye size={16} /> : <EyeOff size={16} />}Show on
                  my public profile
                </label>
              )
            }
          />
        ))}
      </div>
      {!records.length && (
        <Empty title="Nothing here yet">
          When a club confirms a contribution, it will appear here for your
          review.
        </Empty>
      )}
      <Notice>
        A club confirms a specific contribution, not your entire profile.
        Institutional verification is not supported in this demo.
      </Notice>
    </>
  );
}
export function Memberships() {
  const { db, session } = useApp();
  const clubs = db.clubs.filter((c) =>
    c.members.some((m) => m.studentId === session.userId),
  );
  return (
    <>
      <Heading
        eyebrow="BETTER TOGETHER"
        title="Your kind of people."
        description="The communities you’re part of and the roles you play."
      />
      <div className="club-grid">
        {clubs.map((c) => (
          <article className="membership-card" key={c.id}>
            <span className={`club-avatar big ${c.color}`}>{c.initials}</span>
            <Badge>{c.category}</Badge>
            <h2>{c.name}</h2>
            <p>{c.description}</p>
            <div className="membership-role">
              <Users size={18} />
              {c.members.find((m) => m.studentId === session.userId)?.title}
            </div>
            <Link className="text-link" to={`/clubs/${c.slug}`}>
              Visit community
              <ArrowUpRight size={17} />
            </Link>
          </article>
        ))}
      </div>
      {!clubs.length && (
        <Empty
          title="Find somewhere you belong"
          action={
            <Link className="button secondary" to="/clubs">
              Discover communities
            </Link>
          }
        >
          Club administrators can add members in the demo.
        </Empty>
      )}
    </>
  );
}
export function Privacy() {
  const { db, session, service, act, notify } = useApp();
  const s = db.students.find((s) => s.id === session.userId)!;
  const exportProfile = () => {
    const data = {
      student: s,
      records: db.records.filter((r) => r.studentId === s.id),
      registrations: db.registrations.filter((r) => r.studentId === s.id),
    };
    const a = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    a.href = url;
    a.download = `${s.slug}-aura-data.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Your demo profile export is ready");
  };
  return (
    <>
      <Heading
        eyebrow="YOUR STORY. YOUR CHOICE."
        title="Choose what the world sees."
        description="Public profile controls affect the simulated public pages. All demo data remains in this browser."
      />
      <section className="form-panel">
        <div className="setting-row">
          <div>
            <h3>
              <Globe size={19} />
              Public profile
            </h3>
            <p>Allow your profile to appear at /u/{s.slug}.</p>
          </div>
          <label className="switch">
            <input
              aria-label="Public profile"
              type="checkbox"
              checked={s.public}
              onChange={(e) =>
                act(
                  () =>
                    service.updateProfile(session, {
                      public: e.target.checked,
                    }),
                  "Profile visibility updated",
                )
              }
            />
            <span />
          </label>
        </div>
        {SECTIONS.map((section) => (
          <div className="setting-row" key={section}>
            <div>
              <h3 className="capitalize">
                {section === "records"
                  ? "Club-confirmed activity records"
                  : section}
              </h3>
              <p>
                {section === "records"
                  ? "Only accepted records individually marked public are shown."
                  : `Show your ${section} on the public profile.`}
              </p>
            </div>
            <label className="switch">
              <input
                aria-label={`Show ${section}`}
                type="checkbox"
                checked={s.visibility[section]}
                onChange={(e) =>
                  act(
                    () =>
                      service.updateProfile(session, {
                        visibility: {
                          ...s.visibility,
                          [section]: e.target.checked,
                        },
                      }),
                    "Section visibility saved",
                  )
                }
              />
              <span />
            </label>
          </div>
        ))}
      </section>
      <div className="form-panel">
        <h2>Take your story with you.</h2>
        <p>
          Export your synthetic profile, activity records, and registrations as
          JSON.
        </p>
        <Button variant="secondary" onClick={exportProfile}>
          <Download size={16} />
          Export my demo data
        </Button>
      </div>
      <Notice>
        This is not secure storage for personal information. There is no
        production authentication or server access control. Use the Platform
        admin’s Reset demo action to clear changes.
      </Notice>
    </>
  );
}
