import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowLeft,
  Menu,
  X,
  LayoutDashboard,
  UserRound,
  FolderKanban,
  ShieldCheck,
  Users,
  CalendarDays,
  Megaphone,
  Settings,
  Repeat2,
  BookOpen,
  LogOut,
  Compass,
  Activity,
} from "lucide-react";
import { useApp } from "../state";
import { Avatar, Badge } from "./ui";
export function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="logo-symbol">a</span>
      <span>
        aura<span className="logo-light">campus</span>
        <i />
      </span>
    </Link>
  );
}
export function RoleControl() {
  const { db, session, setSession } = useApp();
  const nav = useNavigate();
  return (
    <div className="role-control">
      <Repeat2 size={15} />
      <select
        aria-label="Demo role"
        value={session.role}
        onChange={(e) => {
          const role = e.target.value as typeof session.role;
          const owner = db.clubs
            .find((c) => c.id === session.clubId)!
            .members.find((m) => m.role === "owner")!;
          setSession({
            ...session,
            role,
            userId: role === "club" ? owner.studentId : "anuj",
          });
          nav(
            role === "student"
              ? "/student"
              : role === "club"
                ? "/club"
                : "/admin",
          );
        }}
      >
        <option value="student">Student demo</option>
        <option value="club">Club admin demo</option>
        <option value="admin">Platform admin</option>
      </select>
    </div>
  );
}
export function PublicLayout() {
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  return (
    <>
      <header className="public-header">
        <div className="header-inner">
          <Logo />
          <nav
            className={menu ? "open" : ""}
            aria-label="Main navigation"
            onClick={() => setMenu(false)}
          >
            <NavLink to="/about">The experience</NavLink>
            <NavLink to="/students">Student stories</NavLink>
            <NavLink to="/clubs">Clubs & communities</NavLink>
            <NavLink to="/events">Explore events</NavLink>
          </nav>
          <Link className="button primary header-cta" to="/demo">
            Explore demo <ArrowUpRight size={16} />
          </Link>
          <button
            className="icon-button mobile-menu"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main key={loc.pathname} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer">
        <div>
          <Logo />
          <p>A little more you. A little more connected.</p>
        </div>
        <div>
          <Link to="/demo">Open demo</Link>
          <Link to="/about">About the experience</Link>
          <span>Demo data only — not an official college verification.</span>
        </div>
      </footer>
    </>
  );
}
const studentNav = [
  ["/student", "Overview", LayoutDashboard],
  ["/student/profile", "My profile", UserRound],
  ["/student/projects", "Projects", FolderKanban],
  ["/student/records", "Activity records", ShieldCheck],
  ["/student/memberships", "My communities", Users],
  ["/student/privacy", "Privacy & settings", Settings],
] as const;
const clubNav = [
  ["/club", "Overview", LayoutDashboard],
  ["/club/profile", "Club identity", UserRound],
  ["/club/events", "Events", CalendarDays],
  ["/club/members", "Members & committee", Users],
  ["/club/records", "Confirmations", ShieldCheck],
  ["/club/announcements", "Announcements", Megaphone],
  ["/club/handover", "Ownership handover", Repeat2],
] as const;
const adminNav = [
  ["/admin", "Overview", LayoutDashboard],
  ["/admin/clubs", "Issuer review", ShieldCheck],
  ["/admin/users", "Students", Users],
  ["/admin/reports", "Reports & disputes", BookOpen],
  ["/admin/audit", "Audit history", Activity],
  ["/admin/settings", "Demo settings", Settings],
] as const;
export function Workspace({ kind }: { kind: "student" | "club" | "admin" }) {
  const { session, db, setSession } = useApp();
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  const user = db.students.find((s) => s.id === session.userId)!;
  const club = db.clubs.find((c) => c.id === session.clubId)!;
  if (session.role !== kind)
    return (
      <div className="access-page">
        <Logo />
        <h1>Choose your demo workspace.</h1>
        <p>
          This page belongs to the{" "}
          {kind === "club" ? "club administrator" : kind} experience.
        </p>
        <RoleControl />
        <Link className="button secondary" to="/demo">
          All demo roles
        </Link>
      </div>
    );
  const items =
    kind === "student" ? studentNav : kind === "club" ? clubNav : adminNav;
  const title =
    kind === "student"
      ? "Student workspace"
      : kind === "club"
        ? "Club workspace"
        : "Platform workspace";
  return (
    <div className="workspace">
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <Logo />
        <div className="sidebar-label">{title}</div>
        <nav aria-label="Workspace navigation">
          {items.map(([path, label, Icon]) => (
            <NavLink
              end={path === `/${kind}`}
              key={path}
              to={path}
              onClick={() => setMenu(false)}
            >
              <Icon size={18} />
              {label}
              {path === "/student/records" &&
                db.records.filter(
                  (r) =>
                    r.studentId === session.userId &&
                    r.acceptance === "pending" &&
                    r.status === "confirmed",
                ).length > 0 && (
                  <span className="nav-count">
                    {
                      db.records.filter(
                        (r) =>
                          r.studentId === session.userId &&
                          r.acceptance === "pending" &&
                          r.status === "confirmed",
                      ).length
                    }
                  </span>
                )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/events">
            <Compass size={17} />
            Explore campus
            <ArrowUpRight size={15} />
          </Link>
          <Link to="/">
            <LogOut size={17} />
            Back to public site
          </Link>
          <div className="sidebar-tip">
            <span className="tiny-dot" /> A safe space to explore
            <p>Synthetic data. Real workflows. Make it your own.</p>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-header">
          <div className="row">
            <button
              className="icon-button mobile-menu"
              aria-label="Toggle workspace navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
            <span className="breadcrumb">
              Aura Campus <span>/</span> {title}
            </span>
          </div>
          <div className="row">
            <RoleControl />
            <Avatar student={user} size="small" />
          </div>
        </header>
        <div className="demo-bar">
          <span>
            <span className="tiny-dot" />
            Demo data only — not an official college verification.
          </span>
          <Badge>Browser-local demo</Badge>
        </div>
        <div className="identity-bar">
          <span>Exploring as</span>
          {kind === "student" ? (
            <select
              aria-label="Demo student"
              value={session.userId}
              onChange={(e) =>
                setSession({ ...session, userId: e.target.value })
              }
            >
              {db.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : kind === "club" ? (
            <>
              <select
                aria-label="Demo club"
                value={session.clubId}
                onChange={(e) => {
                  const c = db.clubs.find((c) => c.id === e.target.value)!;
                  setSession({
                    ...session,
                    clubId: c.id,
                    userId: c.members.find((m) => m.role === "owner")!
                      .studentId,
                  });
                }}
              >
                {db.clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Club acting administrator"
                value={session.userId}
                onChange={(e) =>
                  setSession({ ...session, userId: e.target.value })
                }
              >
                {club.members
                  .filter((m) => m.role !== "member")
                  .map((m) => (
                    <option key={m.studentId} value={m.studentId}>
                      {db.students.find((u) => u.id === m.studentId)!.name} ·{" "}
                      {m.role}
                    </option>
                  ))}
              </select>
            </>
          ) : (
            <strong>Platform administrator</strong>
          )}
          <small>
            Role switching is simulated, not production authentication.
          </small>
        </div>
        <main
          className="workspace-content"
          key={`${loc.pathname}-${session.userId}-${session.clubId}`}
          id="main-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
    </div>
  );
}
