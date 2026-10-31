import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Activity,
  RotateCcw,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { useApp } from "../state";
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Field,
  Heading,
  Modal,
  Notice,
  Stat,
  dateLabel,
  timeLabel,
} from "../components/ui";
export function AdminDashboard() {
  const { db } = useApp();
  return (
    <>
      <Heading
        eyebrow="CARE FOR THE ECOSYSTEM"
        title="A clear view of campus."
        description="Review issuers, resolve concerns, and keep the history understandable."
      />
      <div className="stats-grid">
        <Stat
          value={db.students.length}
          label="Demo students"
          icon={<Users />}
        />
        <Stat
          value={db.clubs.filter((c) => c.status === "pending").length}
          label="Clubs awaiting review"
          icon={<ShieldCheck />}
        />
        <Stat
          value={db.reports.filter((r) => r.status === "open").length}
          label="Open disputes"
          icon={<Activity />}
        />
      </div>
      <div className="admin-links">
        <Link to="/admin/clubs">
          <ShieldCheck />
          <h2>Who can confirm contributions?</h2>
          <p>
            Review club issuer status and suspend issuing privileges when
            needed.
          </p>
          <span className="text-link">
            Review clubs
            <ArrowUpRight size={16} />
          </span>
        </Link>
        <Link to="/admin/reports">
          <Activity />
          <h2>Every concern deserves context.</h2>
          <p>Read student disputes and document a clear resolution.</p>
          <span className="text-link">
            Open reports
            <ArrowUpRight size={16} />
          </span>
        </Link>
      </div>
      <AuditTable limit={6} />
    </>
  );
}
export function IssuerReview() {
  const { db, session, service, act } = useApp();
  return (
    <>
      <Heading
        eyebrow="SPECIFIC CLAIMS. RESPONSIBLE ISSUERS."
        title="Club issuer review."
        description="Approval enables club confirmations in this demo. It does not establish real institutional affiliation."
      />
      <div className="stack">
        {db.clubs.map((c) => (
          <article className="issuer-card" key={c.id}>
            <span className={`club-avatar ${c.color}`}>{c.initials}</span>
            <div>
              <h2>{c.name}</h2>
              <p>{c.description}</p>
              <small>Fictional affiliation: Aura Institute of Technology</small>
              <div className="row wrap space-top-small">
                <Badge
                  tone={
                    c.status === "approved"
                      ? "green"
                      : c.status === "suspended"
                        ? "red"
                        : "amber"
                  }
                >
                  {c.status}
                </Badge>
                <Link className="text-link" to={`/clubs/${c.slug}`}>
                  Inspect club page
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
            <Field label={`Issuer status for ${c.name}`}>
              <select
                value={c.status}
                onChange={(e) =>
                  act(
                    () => service.admin(session, "club", c.id, e.target.value),
                    "Club issuer status updated",
                  )
                }
              >
                <option value="pending">Pending review</option>
                <option value="approved">Approved demo issuer</option>
                <option value="suspended">Suspended</option>
              </select>
            </Field>
          </article>
        ))}
      </div>
      <Notice>
        In production, issuer approval would require evidence and an authorized
        review process. Here, it is a simulated administrative action.
      </Notice>
    </>
  );
}
export function UserManagement() {
  const { db, session, service, act } = useApp();
  return (
    <>
      <Heading
        eyebrow="STUDENT ACCOUNTS"
        title="People, not just profiles."
        description="Inspect synthetic demo users and simulate account suspension or restoration."
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Public profile</th>
              <th>Account status</th>
            </tr>
          </thead>
          <tbody>
            {db.students.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="row">
                    <Avatar student={s} />
                    <div>
                      <strong>{s.name}</strong>
                      <small>{s.course}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <Link className="text-link" to={`/u/${s.slug}`}>
                    /{s.slug}
                    <ArrowUpRight size={14} />
                  </Link>
                </td>
                <td>
                  <select
                    aria-label={`Account status for ${s.name}`}
                    value={s.status}
                    onChange={(e) =>
                      act(
                        () =>
                          service.admin(session, "user", s.id, e.target.value),
                        "Account status updated",
                      )
                    }
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function Reports() {
  const { db, session, service, act } = useApp();
  const [target, setTarget] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  return (
    <>
      <Heading
        eyebrow="LISTEN. REVIEW. RESOLVE."
        title="Reports & disputes."
        description="Review a concern in its context. Resolutions are recorded without silently rewriting contributions."
      />
      <div className="stack">
        {db.reports.map((r) => (
          <article className="report-card" key={r.id}>
            <div className="row between">
              <strong>
                {db.students.find((s) => s.id === r.studentId)!.name}
              </strong>
              <Badge tone={r.status === "open" ? "amber" : "green"}>
                {r.status}
              </Badge>
            </div>
            <h3>{r.reason}</h3>
            {r.resolution && (
              <p>
                <strong>Resolution:</strong> {r.resolution}
              </p>
            )}
            <div className="row between">
              <Link className="text-link" to={`/records/${r.recordId}`}>
                Inspect record
                <ArrowUpRight size={15} />
              </Link>
              {r.status === "open" && (
                <Button
                  variant="secondary small"
                  onClick={() => {
                    setTarget(r.id);
                    setResolution("");
                  }}
                >
                  Resolve report
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!db.reports.length && (
        <Empty title="No reports to review">
          Student disputes will appear here.
        </Empty>
      )}
      {target && (
        <Modal title="Document a resolution" onClose={() => setTarget(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                act(
                  () => service.admin(session, "report", target, resolution),
                  "Report resolved",
                )
              )
                setTarget(null);
            }}
          >
            <Field label="What was reviewed and resolved?">
              <textarea
                required
                rows={4}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </Field>
            <Notice>
              Resolving a report does not revoke a record. The issuing club must
              make and record that correction separately.
            </Notice>
            <div className="form-actions">
              <Button type="submit">Resolve report</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
function AuditTable({ limit }: { limit?: number }) {
  const { db } = useApp();
  const [q, setQ] = useState("");
  const all = [...db.audit]
    .reverse()
    .filter((a) =>
      `${a.action} ${a.detail} ${a.target}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    );
  const audit = limit ? all.slice(0, limit) : all;
  return (
    <>
      <div className="toolbar">
        <h2>{limit ? "Latest activity" : "Every action, in context."}</h2>
        {!limit && (
          <div className="search-box">
            <Search size={16} />
            <input
              aria-label="Search audit history"
              placeholder="Search actions, details, or record ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Actor</th>
              <th>When</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{a.action}</strong>
                </td>
                <td>
                  {db.students.find((s) => s.id === a.actor)?.name ?? a.actor}
                </td>
                <td>
                  {dateLabel(a.date)}
                  <small>{timeLabel(a.date)}</small>
                </td>
                <td>
                  {a.detail || "—"}
                  {db.records.some((r) => r.id === a.target) && (
                    <Link className="text-link" to={`/records/${a.target}`}>
                      View record
                      <ArrowUpRight size={13} />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!audit.length && <Empty title="No matching audit entries" />}
    </>
  );
}
export function AuditHistory() {
  return (
    <>
      <Heading
        eyebrow="AN UNDERSTANDABLE HISTORY"
        title="Nothing quietly disappears."
        description="Confirmations, corrections, role changes, and student choices leave a trail in this browser-local demo."
      />
      <AuditTable />
    </>
  );
}
export function DemoSettings() {
  const { session, service, act } = useApp();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <>
      <Heading
        eyebrow="A FRESH START"
        title="Demo settings."
        description="Return the demo to its original sample data whenever you want to explore again."
      />
      <div className="reset-panel">
        <RotateCcw size={30} />
        <h2>Start the story again.</h2>
        <p>
          Reset restores the three students, two clubs, sample events,
          registrations, and example records. All changes made in this browser
          will be replaced.
        </p>
        <Button
          variant="danger-button"
          onClick={() => {
            setText("");
            setOpen(true);
          }}
        >
          Reset demo data
        </Button>
      </div>
      <Notice>
        Data is stored locally in your browser. Different browsers and devices
        do not share changes. Clearing browser storage also resets the demo.
      </Notice>
      {open && (
        <Modal title="Reset all demo changes?" onClose={() => setOpen(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                text === "RESET" &&
                act(
                  () => service.reset(session),
                  "Demo restored to its original sample data",
                )
              )
                setOpen(false);
            }}
          >
            <p>
              This cannot be undone. Type <strong>RESET</strong> to replace all
              local demo changes.
            </p>
            <Field label="Confirmation">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoComplete="off"
              />
            </Field>
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Keep my changes
              </Button>
              <Button
                type="submit"
                variant="danger-button"
                disabled={text !== "RESET"}
              >
                Reset everything
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
