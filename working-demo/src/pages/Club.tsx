import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Users,
  CalendarDays,
  ShieldCheck,
  Pencil,
  Trash2,
  Check,
  Download,
  Search,
  ArrowLeft,
  Repeat2,
  Megaphone,
} from "lucide-react";
import { useApp } from "../state";
import type { CampusEvent, ClaimType, Member } from "../domain/types";
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
  dateLabel,
  timeLabel,
} from "../components/ui";
export function ClubDashboard() {
  const { db, session } = useApp();
  const c = db.clubs.find((c) => c.id === session.clubId)!;
  const events = db.events.filter((e) => e.clubId === c.id);
  return (
    <>
      <Heading
        eyebrow="MAKE GOOD THINGS HAPPEN"
        title={`Hello, ${c.name}.`}
        description="A home for your community. A little less admin. A little more doing."
        action={
          <Link className="button primary" to="/club/events/new">
            <Plus size={17} />
            Create an event
          </Link>
        }
      />
      <div className="club-workspace-banner">
        <span className={`club-avatar big ${c.color}`}>{c.initials}</span>
        <div>
          <Badge tone={c.status === "approved" ? "green" : "amber"}>
            {c.status === "approved"
              ? "Approved demo issuer"
              : c.status === "pending"
                ? "Issuer review pending"
                : "Club suspended"}
          </Badge>
          <h2>A community built by you.</h2>
          <p>{c.description}</p>
        </div>
        <Link className="button secondary" to={`/clubs/${c.slug}`}>
          View club page
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="stats-grid">
        <Stat
          value={c.members.length}
          label="Community members"
          icon={<Users />}
        />
        <Stat
          value={events.length}
          label="Campus experiences"
          icon={<CalendarDays />}
        />
        <Stat
          value={
            db.records.filter(
              (r) => r.clubId === c.id && r.status === "confirmed",
            ).length
          }
          label="Contributions confirmed"
          icon={<ShieldCheck />}
        />
      </div>
      <div className="section-top">
        <h2>Your events.</h2>
        <Link className="text-link" to="/club/events">
          Manage all
          <ArrowRight size={16} />
        </Link>
      </div>
      <EventTable events={events} />
      <div className="workflow-guide">
        <div className="eyebrow">FROM SHOWING UP TO GETTING RECOGNIZED</div>
        <h2>A simple workflow. A meaningful record.</h2>
        <div className="workflow-steps">
          {[
            "Publish an event",
            "Collect registrations",
            "Record participation",
            "Review & confirm",
          ].map((t, i) => (
            <div key={t}>
              <span>{i + 1}</span>
              <strong>{t}</strong>
            </div>
          ))}
        </div>
        <p>
          Students accept their records and choose what to share. Registration
          never counts as attendance automatically.
        </p>
      </div>
    </>
  );
}
function EventTable({ events }: { events: CampusEvent[] }) {
  const { db } = useApp();
  return events.length ? (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Experience</th>
            <th>Date</th>
            <th>Registrations</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>
                <Link className="table-title" to={`/club/events/${e.id}`}>
                  {e.name}
                </Link>
                <small>{e.venue}</small>
              </td>
              <td>{dateLabel(e.date)}</td>
              <td>
                {
                  db.registrations.filter(
                    (r) => r.eventId === e.id && r.status === "registered",
                  ).length
                }{" "}
                / {e.capacity}
              </td>
              <td>
                <Badge
                  tone={
                    e.status === "published"
                      ? "green"
                      : e.status === "draft"
                        ? "amber"
                        : "neutral"
                  }
                >
                  {e.status}
                </Badge>
              </td>
              <td>
                <Link className="text-link" to={`/club/events/${e.id}`}>
                  Manage
                  <ArrowUpRight size={15} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      title="Your next event starts here"
      action={
        <Link className="button primary" to="/club/events/new">
          <Plus size={16} />
          Create an event
        </Link>
      }
    >
      Give your community something to look forward to.
    </Empty>
  );
}
export function ClubEvents() {
  const { db, session } = useApp();
  return (
    <>
      <Heading
        eyebrow="GATHER. BUILD. REPEAT."
        title="Experiences worth showing up for."
        description="Create upcoming events, manage participation, and preserve the moments that mattered."
        action={
          <Link className="button primary" to="/club/events/new">
            <Plus size={17} />
            Create event
          </Link>
        }
      />
      <EventTable
        events={db.events.filter((e) => e.clubId === session.clubId)}
      />
    </>
  );
}
export function ClubEditor() {
  const { db, session, service, act } = useApp();
  const c = db.clubs.find((c) => c.id === session.clubId)!;
  const [form, setForm] = useState({
    name: c.name,
    description: c.description,
    objective: c.objective,
    category: c.category,
  });
  return (
    <>
      <Heading
        eyebrow="YOUR COMMUNITY’S HOME"
        title="Make your club feel like your club."
        description="Tell students who you are, what you care about, and why they might belong."
        action={
          <Link className="button secondary" to={`/clubs/${c.slug}`}>
            Preview page
            <ArrowUpRight size={16} />
          </Link>
        }
      />
      <form
        className="form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          act(() => service.saveClub(session, form), "Club profile updated");
        }}
      >
        <div className="profile-form-top">
          <span className={`club-avatar big ${c.color}`}>{c.initials}</span>
          <div>
            <h3>Club identity</h3>
            <p>Aura Institute of Technology · Fictional demo affiliation</p>
          </div>
        </div>
        <div className="form-grid">
          <Field label="Club name">
            <input
              required
              maxLength={80}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {[
                "Technology",
                "Entrepreneurship",
                "Culture",
                "Design",
                "Sports",
                "Volunteering",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <div className="full">
            <Field label="About the community">
              <textarea
                required
                maxLength={2000}
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="full">
            <Field label="Our objective">
              <textarea
                required
                maxLength={2000}
                rows={3}
                value={form.objective}
                onChange={(e) =>
                  setForm({ ...form, objective: e.target.value })
                }
              />
            </Field>
          </div>
        </div>
        <div className="form-actions">
          <Button type="submit">
            Save club profile
            <Check size={16} />
          </Button>
        </div>
      </form>
    </>
  );
}
function localDateTime(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
export function EventEditor() {
  const { id } = useParams();
  const { db, session, service, act } = useApp();
  const nav = useNavigate();
  const existing = db.events.find((e) => e.id === id);
  const [form, setForm] = useState<CampusEvent>(
    existing ?? {
      id: "",
      clubId: session.clubId,
      name: "",
      description: "",
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      venue: "",
      capacity: 30,
      status: "draft",
      registrationOpen: true,
      theme: "mint",
    },
  );
  const [deleting, setDeleting] = useState(false);
  if (id && (!existing || existing.clubId !== session.clubId))
    return <Empty title="Event not found in this club" />;
  return (
    <>
      <Heading
        eyebrow="CREATE A REASON TO SHOW UP"
        title={
          existing ? "Shape the experience." : "A new experience starts here."
        }
        description="Keep the details clear. Give students something to look forward to."
      />
      <form
        className="form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          let saved = "";
          if (
            act(
              () => {
                saved = service.saveEvent(session, form);
              },
              form.status === "published" ? "Event published" : "Event saved",
            )
          )
            nav(`/club/events/${saved}`);
        }}
      >
        <Field label="Event name">
          <input
            required
            maxLength={120}
            placeholder="Something worth showing up for…"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="About the experience">
          <textarea
            required
            maxLength={2000}
            rows={5}
            placeholder="What will students do, learn, or contribute?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <div className="form-grid">
          <Field
            label="Date and time"
            hint="Entered in your browser’s local timezone."
          >
            <input
              type="datetime-local"
              required
              value={localDateTime(form.date)}
              onChange={(e) => {
                if (e.target.value)
                  setForm({
                    ...form,
                    date: new Date(e.target.value).toISOString(),
                  });
              }}
            />
          </Field>
          <Field label="Venue">
            <input
              required
              maxLength={160}
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="Innovation Lab · Block B"
            />
          </Field>
          <Field label="Registration capacity">
            <input
              type="number"
              required
              min={1}
              max={10000}
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as CampusEvent["status"],
                  registrationOpen: e.target.value === "published",
                })
              }
            >
              <option value="draft">Draft — not publicly listed</option>
              <option value="published">Published — upcoming</option>
              <option value="completed">
                Completed — participation can be recorded
              </option>
              <option value="cancelled">Cancelled — history retained</option>
            </select>
          </Field>
          <Field label="Poster style">
            <select
              value={form.theme}
              onChange={(e) => setForm({ ...form, theme: e.target.value })}
            >
              <option value="mint">Fresh mint / Build series</option>
              <option value="lilac">Soft lilac / Community sessions</option>
              <option value="peach">Warm peach / New possibilities</option>
            </select>
          </Field>
          <div className="field">
            <span>Registration settings</span>
            <label className="check-input">
              <input
                type="checkbox"
                disabled={form.status !== "published"}
                checked={form.registrationOpen && form.status === "published"}
                onChange={(e) =>
                  setForm({ ...form, registrationOpen: e.target.checked })
                }
              />
              Accept registrations
            </label>
          </div>
        </div>
        <Notice>
          For the demo journey, you may mark an event completed to simulate its
          conclusion. Only then can organizers record actual participation.
        </Notice>
        <div className="form-actions">
          {existing && (
            <Button
              type="button"
              variant="danger-text"
              onClick={() => setDeleting(true)}
            >
              Delete event
            </Button>
          )}
          <Link className="button secondary" to="/club/events">
            Cancel
          </Link>
          <Button type="submit">
            {form.status === "published" ? "Publish event" : "Save event"}
            <Check size={16} />
          </Button>
        </div>
      </form>
      {deleting && (
        <Modal title="Delete this event?" onClose={() => setDeleting(false)}>
          <p>
            Only events without registrations or activity history can be
            deleted. Otherwise, set the event status to Cancelled.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setDeleting(false)}>
              Keep event
            </Button>
            <Button
              variant="danger-button"
              onClick={() => {
                if (
                  act(() => service.deleteEvent(session, id!), "Event deleted")
                )
                  nav("/club/events");
              }}
            >
              Delete event
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function EventOperations() {
  const { id } = useParams();
  const { db, session, service, act, notify } = useApp();
  const e = db.events.find((e) => e.id === id && e.clubId === session.clubId);
  const [search, setSearch] = useState("");
  const [issue, setIssue] = useState<{
    studentId: string;
    type: ClaimType;
    description: string;
  } | null>(null);
  const [review, setReview] = useState(false);
  const [complete, setComplete] = useState(false);
  if (!e) return <Empty title="Event not found in this club" />;
  const regs = db.registrations.filter((r) => r.eventId === e.id);
  const filtered = regs.filter((r) =>
    db.students
      .find((s) => s.id === r.studentId)!
      .name.toLowerCase()
      .includes(search.toLowerCase()),
  );
  const exportRoster = () => {
    const csvValue = (v: string) =>
      '"' + (/^[=+@-]/.test(v) ? "'" + v : v).replaceAll('"', '""') + '"';
    const lines = [
      ["Student", "Registration", "Actual participation"],
      ...regs.map((r) => [
        db.students.find((s) => s.id === r.studentId)!.name,
        r.status,
        r.attended ? "Yes" : "Not recorded",
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob([lines.map((row) => row.map(csvValue).join(",")).join("\n")], {
        type: "text/csv",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "aura-event-roster.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Roster exported");
  };
  return (
    <>
      <Link className="text-link" to="/club/events">
        <ArrowLeft size={15} />
        All events
      </Link>
      <Heading
        eyebrow="EVENT WORKSPACE"
        title={e.name}
        description={`${dateLabel(e.date)} · ${timeLabel(e.date)} · ${e.venue}`}
        action={
          <div className="row">
            <Link className="button secondary" to={`/events/${e.id}`}>
              Public page
              <ArrowUpRight size={16} />
            </Link>
            <Link className="button primary" to={`/club/events/${e.id}/edit`}>
              <Pencil size={16} />
              Edit event
            </Link>
          </div>
        }
      />
      <div className="stats-grid">
        <Stat
          value={`${regs.filter((r) => r.status === "registered").length} / ${e.capacity}`}
          label="Active registrations"
          icon={<Users />}
        />
        <Stat
          value={regs.filter((r) => r.attended).length}
          label="Actual participants"
          icon={<Check />}
        />
        <Stat
          value={
            db.records.filter(
              (r) => r.eventId === e.id && r.status === "confirmed",
            ).length
          }
          label="Confirmed contributions"
          icon={<ShieldCheck />}
        />
      </div>
      <div className="action-banner">
        <div>
          <Badge tone={e.status === "completed" ? "green" : "amber"}>
            {e.status}
          </Badge>
          <p>
            {e.status === "completed"
              ? "Record actual participation, then review and issue a contribution."
              : "Registration is not attendance. Complete the event before recording actual participation."}
          </p>
        </div>
        {e.status === "published" && (
          <Button variant="secondary" onClick={() => setComplete(true)}>
            Mark event completed
            <Check size={16} />
          </Button>
        )}
      </div>
      <div className="toolbar">
        <h2>Registration & participation</h2>
        <div className="row wrap">
          <div className="search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={(x) => setSearch(x.target.value)}
              aria-label="Search registration roster"
              placeholder="Find a student…"
            />
          </div>
          <Button variant="secondary small" onClick={exportRoster}>
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>
      {filtered.length ? (
        <div className="table-scroll roster-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Registration</th>
                <th>Actual participation</th>
                <th>Recognition</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const s = db.students.find((s) => s.id === r.studentId)!;
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="row">
                        <Avatar student={s} size="small" />
                        <div>
                          <strong>{s.name}</strong>
                          <small>{s.course}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Registration">
                      <Badge
                        tone={r.status === "registered" ? "green" : "neutral"}
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td data-label="Participation">
                      <label className="check-input">
                        <input
                          aria-label={`Mark participation for ${s.name}`}
                          type="checkbox"
                          disabled={
                            e.status !== "completed" ||
                            r.status !== "registered"
                          }
                          checked={r.attended}
                          onChange={(x) =>
                            act(
                              () =>
                                service.markAttendance(
                                  session,
                                  r.id,
                                  x.target.checked,
                                ),
                              "Participation updated",
                            )
                          }
                        />
                        {r.attended ? "Participated" : "Not recorded"}
                      </label>
                    </td>
                    <td data-label="Recognition">
                      <Button
                        variant="secondary small"
                        disabled={
                          !r.attended ||
                          e.status !== "completed" ||
                          r.status !== "registered" ||
                          r.studentId === session.userId
                        }
                        title={
                          r.studentId === session.userId
                            ? "Another club admin must confirm your contribution"
                            : undefined
                        }
                        onClick={() => {
                          setIssue({
                            studentId: s.id,
                            type: "Participant",
                            description: "",
                          });
                          setReview(false);
                        }}
                      >
                        Confirm contribution
                        <ArrowRight size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title={
            regs.length ? "No matching students" : "The guest list starts here"
          }
        >
          Share the public event page and register using a student demo role.
        </Empty>
      )}
      <Notice>
        Issuing requires an approved demo club issuer. A club admin cannot
        confirm their own contribution. Switch the acting administrator to
        another committee admin if needed.
      </Notice>
      {complete && (
        <Modal
          title="Simulate the event’s completion?"
          onClose={() => setComplete(false)}
        >
          <p>
            This closes registrations and enables attendance recording. It does
            not automatically mark anyone as a participant.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setComplete(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (
                  act(
                    () =>
                      service.saveEvent(session, {
                        ...e,
                        status: "completed",
                        registrationOpen: false,
                      }),
                    "Event marked completed",
                  )
                )
                  setComplete(false);
              }}
            >
              Complete event
            </Button>
          </div>
        </Modal>
      )}
      {issue && (
        <Modal
          title={
            review ? "Review before confirming" : "Recognize a contribution"
          }
          onClose={() => setIssue(null)}
        >
          {review ? (
            <>
              <div className="review-sheet">
                <Badge tone="green">CLUB-CONFIRMED CONTRIBUTION</Badge>
                <h2>
                  {db.students.find((s) => s.id === issue.studentId)!.name}
                </h2>
                <p>
                  <strong>{issue.type}</strong> · {e.name}
                </p>
                <p>{issue.description}</p>
                <small>
                  Issued by{" "}
                  {db.students.find((s) => s.id === session.userId)!.name}. The
                  student must accept this record before publishing it.
                </small>
              </div>
              <Notice>
                This confirms only the specific activity described. It is not an
                institutional verification.
              </Notice>
              <div className="form-actions">
                <Button variant="secondary" onClick={() => setReview(false)}>
                  Back to edit
                </Button>
                <Button
                  onClick={() => {
                    if (
                      act(
                        () =>
                          service.issue(session, {
                            ...issue,
                            eventId: e.id,
                            reviewed: true,
                          }),
                        "Confirmation issued. It is now pending student acceptance.",
                      )
                    )
                      setIssue(null);
                  }}
                >
                  Issue confirmation
                  <ShieldCheck size={16} />
                </Button>
              </div>
            </>
          ) : (
            <form
              onSubmit={(x) => {
                x.preventDefault();
                setReview(true);
              }}
            >
              <p>
                For{" "}
                <strong>
                  {db.students.find((s) => s.id === issue.studentId)!.name}
                </strong>{" "}
                at {e.name}
              </p>
              <Field label="Contribution type">
                <select
                  value={issue.type}
                  onChange={(x) =>
                    setIssue({ ...issue, type: x.target.value as ClaimType })
                  }
                >
                  {[
                    "Participant",
                    "Volunteer",
                    "Organizer",
                    "Winner",
                    "Speaker",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="What did this student contribute?"
                hint="Describe the actual contribution. Avoid broad claims about competence."
              >
                <textarea
                  required
                  maxLength={2000}
                  rows={4}
                  value={issue.description}
                  onChange={(x) =>
                    setIssue({ ...issue, description: x.target.value })
                  }
                  placeholder="Built and presented a prototype during the workshop…"
                />
              </Field>
              <div className="form-actions">
                <Button type="submit">
                  Review confirmation
                  <ArrowRight size={16} />
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
export function Members() {
  const { db, session, service, act } = useApp();
  const c = db.clubs.find((c) => c.id === session.clubId)!;
  const [add, setAdd] = useState(false);
  const [selected, setSelected] = useState("");
  const [title, setTitle] = useState("Community Member");
  const [edit, setEdit] = useState<Member | null>(null);
  const [remove, setRemove] = useState<string | null>(null);
  const available = db.students.filter(
    (s) => !c.members.some((m) => m.studentId === s.id),
  );
  const isOwner = c.members.some(
    (m) => m.studentId === session.userId && m.role === "owner",
  );
  return (
    <>
      <Heading
        eyebrow="THE PEOPLE MAKE THE COMMUNITY"
        title="Members & committee."
        description="Keep responsibilities clear and your community connected."
        action={
          <Button
            onClick={() => {
              setSelected(available[0]?.id ?? "");
              setAdd(true);
            }}
            disabled={!available.length}
          >
            <Plus size={16} />
            Add member
          </Button>
        }
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Position</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {c.members.map((m) => {
              const s = db.students.find((s) => s.id === m.studentId)!;
              return (
                <tr key={s.id}>
                  <td>
                    <div className="row">
                      <Avatar student={s} />
                      <div>
                        <strong>{s.name}</strong>
                        <small>{s.year}</small>
                      </div>
                    </div>
                  </td>
                  <td>{m.title}</td>
                  <td>
                    <Badge tone={m.role === "owner" ? "green" : "neutral"}>
                      {m.role}
                    </Badge>
                  </td>
                  <td>
                    {m.role === "owner" ? (
                      <Link className="text-link" to="/club/handover">
                        Handover
                        <ArrowUpRight size={14} />
                      </Link>
                    ) : (
                      <div className="row">
                        {isOwner && (
                          <button
                            className="icon-button"
                            aria-label={`Edit role for ${s.name}`}
                            onClick={() => setEdit({ ...m })}
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        <button
                          className="icon-button danger"
                          aria-label={`Remove ${s.name}`}
                          onClick={() => setRemove(s.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Notice>
        Owners manage committee permissions and handovers. Admins manage club
        operations. Members have no organizer permissions.
      </Notice>
      {add && (
        <Modal title="Welcome a new member" onClose={() => setAdd(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                act(
                  () => service.member(session, selected, "add", title),
                  "Member added",
                )
              )
                setAdd(false);
            }}
          >
            <Field label="Demo student">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                required
              >
                {available.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Position or title">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <div className="form-actions">
              <Button type="submit">Add member</Button>
            </div>
          </form>
        </Modal>
      )}
      {edit && (
        <Modal title="Edit committee role" onClose={() => setEdit(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                act(
                  () =>
                    service.member(
                      session,
                      edit.studentId,
                      edit.role as "admin" | "member",
                      edit.title,
                    ),
                  "Committee role updated",
                )
              )
                setEdit(null);
            }}
          >
            <Field label="Title">
              <input
                required
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </Field>
            <Field label="Permissions">
              <select
                value={edit.role}
                onChange={(e) =>
                  setEdit({ ...edit, role: e.target.value as Member["role"] })
                }
              >
                <option value="member">Member</option>
                <option value="admin">Club admin</option>
              </select>
            </Field>
            <div className="form-actions">
              <Button type="submit">Save role</Button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal title="Remove this member?" onClose={() => setRemove(null)}>
          <p>
            Membership and club access will be removed. Previously issued
            activity records remain intact.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="danger-button"
              onClick={() => {
                if (
                  act(
                    () => service.member(session, remove, "remove"),
                    "Member removed",
                  )
                )
                  setRemove(null);
              }}
            >
              Remove member
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function ClubRecords() {
  const { db, session, service, act } = useApp();
  const [revoke, setRevoke] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const records = db.records.filter((r) => r.clubId === session.clubId);
  return (
    <>
      <Heading
        eyebrow="RECOGNITION WITH RESPONSIBILITY"
        title="Contributions you’ve confirmed."
        description="Every record has a named issuer and a history. Corrections remain visible."
      />
      <div className="stack">
        {records.map((r) => (
          <div key={r.id}>
            <div className="record-student">
              {db.students.find((s) => s.id === r.studentId)!.name}
            </div>
            <RecordCard
              record={r}
              actions={
                r.status === "confirmed" ? (
                  <div className="row between wrap">
                    <span className="muted small-text">
                      Student response: {r.acceptance} ·{" "}
                      {r.public ? "Marked public" : "Private"}
                    </span>
                    <Button
                      variant="danger-text small"
                      onClick={() => {
                        setRevoke(r.id);
                        setReason("");
                      }}
                    >
                      Revoke confirmation
                    </Button>
                  </div>
                ) : undefined
              }
            />
          </div>
        ))}
      </div>
      {!records.length && (
        <Empty
          title="Give a contribution its place"
          action={
            <Link className="button secondary" to="/club/events">
              Manage an event
              <ArrowRight size={16} />
            </Link>
          }
        >
          Record actual participation in a completed event, then issue a
          confirmation.
        </Empty>
      )}
      {revoke && (
        <Modal
          title="Revoke this confirmation?"
          onClose={() => setRevoke(null)}
        >
          <p>
            The record will remain in its history, clearly marked revoked. It
            will no longer represent a valid club confirmation.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                act(
                  () => service.revoke(session, revoke, reason),
                  "Confirmation revoked; history preserved",
                )
              )
                setRevoke(null);
            }}
          >
            <Field label="Reason for correction">
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </Field>
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRevoke(null)}
              >
                Keep confirmation
              </Button>
              <Button type="submit" variant="danger-button">
                Revoke confirmation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function Announcements() {
  const { db, session, service, act } = useApp();
  const c = db.clubs.find((c) => c.id === session.clubId)!;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [remove, setRemove] = useState<string | null>(null);
  return (
    <>
      <Heading
        eyebrow="KEEP YOUR COMMUNITY IN THE LOOP"
        title="A note from the club."
        description="Publish updates on your club’s public page. Conversations can stay in your existing channels."
      />
      <form
        className="form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            act(
              () => service.announcement(session, title, body),
              "Announcement published",
            )
          ) {
            setTitle("");
            setBody("");
          }
        }}
      >
        <Field label="Headline">
          <input
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What’s happening?"
          />
        </Field>
        <Field label="Announcement">
          <textarea
            required
            maxLength={2000}
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </Field>
        <div className="form-actions">
          <Button type="submit">
            Publish announcement
            <Megaphone size={16} />
          </Button>
        </div>
      </form>
      <div className="stack">
        {c.announcements.map((a) => (
          <article key={a.id} className="announcement">
            <div className="row between">
              <small>{dateLabel(a.date)}</small>
              <button
                className="icon-button danger"
                aria-label={`Delete announcement ${a.title}`}
                onClick={() => setRemove(a.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h3>{a.title}</h3>
            <p>{a.body}</p>
          </article>
        ))}
      </div>
      {remove && (
        <Modal title="Remove announcement?" onClose={() => setRemove(null)}>
          <p>This update will no longer appear on the club page.</p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="danger-button"
              onClick={() => {
                if (
                  act(
                    () => service.announcement(session, "", "", remove),
                    "Announcement removed",
                  )
                )
                  setRemove(null);
              }}
            >
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Handover() {
  const { db, session, service, act } = useApp();
  const c = db.clubs.find((c) => c.id === session.clubId)!;
  const owner = c.members.find((m) => m.role === "owner")!;
  const [to, setTo] = useState(
    c.members.find((m) => m.studentId !== owner.studentId)?.studentId ?? "",
  );
  const [review, setReview] = useState(false);
  const next = c.handoverTo
    ? db.students.find((s) => s.id === c.handoverTo)
    : null;
  return (
    <>
      <Heading
        eyebrow="KEEP THE COMMUNITY GOING"
        title="A thoughtful change of hands."
        description="Transfer ownership without losing your club’s events, members, or contribution history."
      />
      <div className="handover-panel">
        <div className="handover-icon">
          <Repeat2 size={30} />
        </div>
        <h2>A new chapter, same community.</h2>
        <p>
          Current owner:{" "}
          <strong>
            {db.students.find((s) => s.id === owner.studentId)!.name}
          </strong>
        </p>
        {next ? (
          <>
            <Badge tone="amber">Awaiting {next.name}’s acceptance</Badge>
            <p>
              Switch to the Student role and select {next.name}. The invitation
              appears on their dashboard. Ownership changes only when they
              accept.
            </p>
            {owner.studentId === session.userId && (
              <Button
                variant="secondary"
                onClick={() =>
                  act(
                    () => service.handover(session, null),
                    "Handover cancelled",
                  )
                }
              >
                Cancel handover
              </Button>
            )}
          </>
        ) : owner.studentId === session.userId ? (
          <>
            <Field label="Nominate the next owner">
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {c.members
                  .filter((m) => m.studentId !== owner.studentId)
                  .map((m) => (
                    <option key={m.studentId} value={m.studentId}>
                      {db.students.find((s) => s.id === m.studentId)!.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Button disabled={!to} onClick={() => setReview(true)}>
              Review handover
              <ArrowRight size={17} />
            </Button>
          </>
        ) : (
          <Notice>Only the current owner can nominate a successor.</Notice>
        )}
      </div>
      <Notice>
        After acceptance, the previous owner becomes an admin. The transition is
        recorded in the audit history.
      </Notice>
      {review && (
        <Modal title="Nominate a new owner?" onClose={() => setReview(false)}>
          <p>
            <strong>{db.students.find((s) => s.id === to)!.name}</strong> will
            receive an ownership invitation for {c.name}. They must accept from
            their student workspace.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setReview(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (
                  act(
                    () => service.handover(session, to),
                    "Ownership invitation created",
                  )
                )
                  setReview(false);
              }}
            >
              Send demo invitation
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
