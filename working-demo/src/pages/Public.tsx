import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
  CalendarDays,
  MapPin,
  Code2,
  Sparkles,
  GraduationCap,
  Users,
  Globe,
  LockKeyhole,
  Layers,
  Search,
  BriefcaseBusiness,
} from "lucide-react";
import { useApp } from "../state";
import { createSeed } from "../domain/seed";
import { publicProfile } from "../domain/service";
import {
  Avatar,
  Badge,
  Button,
  CheckLine,
  Empty,
  EventArt,
  EventCard,
  Heading,
  Notice,
  ProjectCard,
  RecordCard,
  Step,
  dateLabel,
  timeLabel,
  Modal,
  Field,
} from "../components/ui";
export function Home() {
  const { db } = useApp();
  const examples = createSeed().students;
  const s = examples[0];
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-pill">
            <span className="tiny-dot" /> YOUR NEXT CHAPTER STARTS HERE
          </div>
          <h1>
            Your college life.
            <br />
            Your identity.
            <br />
            <span>Your community.</span>
            <i className="hero-spark">✳</i>
          </h1>
          <p>
            Bring your projects, skills, and club-confirmed contributions
            together in a student portfolio you choose to share.
          </p>
          <div className="hero-actions">
            <Link className="button primary large" to="/demo">
              Find your aura <ArrowUpRight size={19} />
            </Link>
            <Link className="button text large" to="/students">
              Meet the possibilities <ArrowRight size={18} />
            </Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              {examples.map((s) => (
                <Avatar key={s.id} student={s} size="small" />
              ))}
            </div>
            <span>
              Built for the builders, thinkers & doers.
              <small>Explore three fictional student journeys.</small>
            </span>
          </div>
        </div>
        <div className="hero-stage">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="floating-label">
            <span className="tiny-dot" /> A journey worth sharing
          </div>
          <div className="hero-profile">
            <div className="hero-profile-cover">
              <span>KEEP MAKING. KEEP BECOMING.</span>
              <div className="cover-shape" />
            </div>
            <div className="hero-profile-inner">
              <div className="row between">
                <Avatar student={s} size="large" />
                <span className="mini-link">
                  aura / {s.slug}
                  <ArrowUpRight size={12} />
                </span>
              </div>
              <h2>
                {s.name}
                <span className="online-dot" />
              </h2>
              <p className="hero-profile-line">
                AI & Data Science · Curious by default.
              </p>
              <div className="tags">
                <span>Builder</span>
                <span>Problem solver</span>
                <span>Community member</span>
              </div>
              <div className="profile-mini-project">
                <div className="mini-project-icon">
                  <Code2 size={26} />
                </div>
                <div>
                  <span>FEATURED PROJECT</span>
                  <strong>Campus Compass</strong>
                  <small>Helping students find their next thing.</small>
                </div>
                <ArrowUpRight size={20} />
              </div>
              <div className="hero-profile-footer">
                <span>
                  <strong>{s.projects.length}</strong> Projects
                </span>
                <span>
                  <strong>{s.skills.length}</strong> Skills
                </span>
                <span>
                  <strong>1</strong> Community
                </span>
              </div>
            </div>
          </div>
          <div className="floating-record">
            <span className="record-icon">
              <ShieldCheck size={22} />
            </span>
            <div>
              <small>YOUR CONTRIBUTIONS COUNT</small>
              <strong>More than “I was there.”</strong>
              <span>
                Activity confirmed by Coding Club <Check size={13} />
              </span>
            </div>
          </div>
          <div className="floating-sticker">
            Made of
            <br />
            <em>possibilities.</em>
            <Sparkles size={24} />
          </div>
        </div>
      </section>
      <div className="intro-strip">
        <span>YOUR JOURNEY, ALL TOGETHER</span>
        <span>
          <Code2 size={19} />
          Projects
        </span>
        <span>
          <ShieldCheck size={19} />
          Contributions
        </span>
        <span>
          <Users size={19} />
          Communities
        </span>
        <span>
          <CalendarDays size={19} />
          Experiences
        </span>
      </div>
      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">A SPACE THAT GROWS WITH YOU</div>
          <h2>
            You’re more than
            <br />
            your latest résumé.
          </h2>
          <p>Connect what you know, what you make, and how you show up.</p>
        </div>
        <div className="feature-grid">
          <Link to="/students" className="feature feature-profile">
            <span className="feature-number">01 / YOUR IDENTITY</span>
            <h3>
              A little more you.
              <br />
              All in one place.
            </h3>
            <p>
              Projects, skills, and experiences.
              <br />A profile that tells the whole story.
            </p>
            <span className="feature-link">
              Explore student profiles <ArrowUpRight size={18} />
            </span>
            <div className="identity-tiles">
              <span>
                <Code2 />
                Built something
              </span>
              <span>
                <GraduationCap />
                Learned something
              </span>
              <span>
                <Sparkles />
                Made a difference
              </span>
            </div>
          </Link>
          <Link to="/clubs" className="feature feature-community">
            <span className="feature-number">02 / YOUR PEOPLE</span>
            <h3>
              Find your kind
              <br />
              of curious.
            </h3>
            <p>
              Meet communities that turn shared
              <br />
              interests into something real.
            </p>
            <span className="feature-link">
              Discover communities <ArrowUpRight size={18} />
            </span>
            <div className="community-tiles">
              <span>&lt;/&gt;</span>
              <span>↗</span>
              <span>✳</span>
            </div>
          </Link>
          <Link to="/about" className="feature feature-trust">
            <span className="feature-number">03 / YOUR CONTRIBUTIONS</span>
            <ShieldCheck size={48} />
            <h3>
              Real activity.
              <br />
              Clear recognition.
            </h3>
            <p>
              Let your club confirm your contribution. You decide what to share.
            </p>
            <span className="feature-link">
              See how it works <ArrowUpRight size={18} />
            </span>
          </Link>
        </div>
      </section>
      <section className="section events-home">
        <div className="row between wrap">
          <div>
            <div className="eyebrow">GOOD THINGS HAPPEN TOGETHER</div>
            <h2>Your next “glad I went.”</h2>
          </div>
          <Link className="text-link" to="/events">
            Explore all events <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="event-grid">
          {db.events
            .filter((e) => ["published", "completed"].includes(e.status))
            .slice(0, 2)
            .map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
        </div>
      </section>
      <section className="closing">
        <span className="eyebrow">LESS SCATTERED. MORE CONNECTED.</span>
        <h2>
          Your story is already happening.
          <br />
          <span>Give it a place to grow.</span>
        </h2>
        <Link className="button lime large" to="/demo">
          Explore the working demo <ArrowUpRight size={18} />
        </Link>
        <p>Demo data only — not an official college verification.</p>
      </section>
    </>
  );
}
export function About() {
  return (
    <div className="public-container">
      <Heading
        eyebrow="THE AURA EXPERIENCE"
        title="Your story. With a little more context."
        description="A student portfolio and a campus community, connected through the things you actually do."
      />
      <div className="steps-grid">
        <Step number="01" title="Make it yours">
          Bring together your projects, skills, experiences, and interests.
        </Step>
        <Step number="02" title="Show up & contribute">
          Join a club event. Build, volunteer, organize, or share something
          useful.
        </Step>
        <Step number="03" title="Keep the recognition">
          Your club confirms the contribution. You accept it and choose whether
          to share.
        </Step>
      </div>
      <div className="editorial-panel">
        <div>
          <div className="eyebrow">TRUST, WITHOUT THE GUESSWORK</div>
          <h2>
            A specific contribution.
            <br />A named confirmer.
          </h2>
          <p>
            A club-confirmed record tells you who confirmed an activity and what
            the student contributed. It does not certify every skill on a
            profile.
          </p>
        </div>
        <div className="trust-list">
          <div>
            <Badge>Added by student</Badge>
            <p>Projects and experiences written by the student.</p>
          </div>
          <div>
            <Badge tone="green">Club-confirmed</Badge>
            <p>
              A specific contribution confirmed by a demo club administrator.
            </p>
          </div>
          <div>
            <Badge tone="red">Confirmation revoked</Badge>
            <p>A corrected record, with its history preserved.</p>
          </div>
        </div>
      </div>
      <Notice>
        All people, clubs, and activities in this demo are synthetic.
        Institutional verification is not supported or implied.
      </Notice>
      <Link className="button primary" to="/demo">
        Try the complete journey <ArrowRight size={17} />
      </Link>
    </div>
  );
}
export function DemoAccess() {
  const { db, session, service, act, setSession } = useApp();
  const nav = useNavigate();
  const [creating, setCreating] = useState<"" | "student" | "club">("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="public-container demo-access">
      <div className="center-heading">
        <div className="eyebrow">THREE PERSPECTIVES. ONE CONNECTED CAMPUS.</div>
        <h1>Step into Aura Campus.</h1>
        <p>Choose a role. Explore freely. Your changes stay in this browser.</p>
      </div>
      <div className="role-cards">
        {[
          {
            role: "student" as const,
            title: "The student",
            icon: GraduationCap,
            copy: "Tell your story. Add a project, accept a contribution, and make your profile yours.",
            cta: "Enter as Anuj",
            tags: [
              "Personal portfolio",
              "Activity records",
              "Privacy controls",
            ],
          },
          {
            role: "club" as const,
            title: "The club organizer",
            icon: Users,
            copy: "Bring your community together. Publish an event and recognize the people behind it.",
            cta: "Enter as Riya",
            tags: [
              "Events & registration",
              "Participation",
              "Club confirmation",
            ],
          },
          {
            role: "admin" as const,
            title: "The platform admin",
            icon: ShieldCheck,
            copy: "See how trust is managed. Review club issuers, resolve reports, and inspect the audit trail.",
            cta: "Explore administration",
            tags: ["Issuer review", "Reports & disputes", "Demo reset"],
          },
        ].map(({ role, title, icon: Icon, copy, cta, tags }) => (
          <article className={`role-card ${role}`} key={role}>
            <div className="role-icon">
              <Icon size={28} />
            </div>
            <h2>{title}</h2>
            <p>{copy}</p>
            <div className="role-features">
              {tags.map((t) => (
                <CheckLine key={t}>{t}</CheckLine>
              ))}
            </div>
            <Button
              onClick={() => {
                setSession({
                  role,
                  userId:
                    role === "club"
                      ? db.clubs[0].members.find((m) => m.role === "owner")!
                          .studentId
                      : "anuj",
                  clubId: "coding",
                });
                nav(`/${role}`);
              }}
            >
              {cta}
              <ArrowRight size={17} />
            </Button>
          </article>
        ))}
      </div>
      <Notice>
        This role switcher is a demonstration mechanism, not production
        authentication or security. Demo data only — not an official college
        verification.
      </Notice>
      <p className="muted center">
        Tip: Start with a student, switch to the club organizer, then return to
        the student to accept a record.
      </p>
      <div className="sandbox-create">
        <h2>Try a fresh start.</h2>
        <p>
          Create another fictional profile or start a demo club. Use sample
          information only.
        </p>
        <div className="row wrap">
          <Button
            variant="secondary"
            onClick={() => {
              setName("");
              setSlug("");
              setCreating("student");
            }}
          >
            Create demo student
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setName("");
              setSlug("");
              setDescription("");
              setCreating("club");
            }}
          >
            Create demo club
          </Button>
        </div>
      </div>
      {creating && (
        <Modal
          title={
            creating === "student"
              ? "Create a fictional student"
              : "Create a demo club"
          }
          onClose={() => setCreating("")}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (creating === "student") {
                let userId = "";
                if (
                  act(() => {
                    userId = service.createStudent(name, slug);
                  }, "Private demo profile created")
                ) {
                  setSession({ role: "student", userId, clubId: "coding" });
                  nav("/student/profile");
                }
              } else {
                const acting = { ...session, role: "student" as const };
                let clubId = "";
                if (
                  act(() => {
                    clubId = service.createClub(
                      acting,
                      name,
                      slug,
                      description,
                    );
                  }, "Club created. Issuer review is pending.")
                ) {
                  setSession({ ...acting, role: "club", clubId });
                  nav("/club");
                }
              }
            }}
          >
            <Field
              label={creating === "student" ? "Student name" : "Club name"}
            >
              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field
              label="Unique URL handle"
              hint="Lowercase letters, numbers and hyphens."
            >
              <input
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </Field>
            {creating === "club" && (
              <>
                <Field label="About the club">
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
                <p>
                  Founding demo organizer:{" "}
                  {db.students.find((s) => s.id === session.userId)?.name}. A
                  platform admin must approve this club before it can confirm
                  contributions.
                </p>
              </>
            )}
            <div className="form-actions">
              <Button type="submit">
                Create{" "}
                {creating === "student" ? "private profile" : "club page"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
export function Students() {
  const { db } = useApp();
  return (
    <div className="public-container">
      <Heading
        eyebrow="STUDENT STORIES"
        title="Different interests. Endless possibilities."
        description="Three fictional students, each building a journey of their own."
      />
      <div className="student-grid">
        {db.students
          .filter((s) => s.public && s.status === "active")
          .map((s) => (
            <Link className="student-card" key={s.id} to={`/u/${s.slug}`}>
              <div className={`student-cover ${s.color}`}>
                <span>MAKE YOUR JOURNEY COUNT.</span>
              </div>
              <Avatar student={s} size="large" />
              <div className="student-card-content">
                <h2>
                  {s.name}
                  <ArrowUpRight size={20} />
                </h2>
                <p>{s.headline}</p>
                <small>{s.course}</small>
                <div className="tags">
                  {s.visibility.skills &&
                    s.skills.slice(0, 3).map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
export function Profile() {
  const { slug } = useParams();
  const { db, session, notify } = useApp();
  const result = publicProfile(db, slug!);
  if (!result)
    return (
      <div className="public-container">
        <Empty title="This profile isn’t public">
          The student may have made it private or changed their profile URL.
        </Empty>
      </div>
    );
  const { student: s, clubs, records } = result;
  return (
    <div className="portfolio">
      <div className={`portfolio-cover ${s.color}`}>
        <span>A WORK IN PROGRESS. A STORY WORTH SHARING.</span>
        <div className="cover-orbit" />
      </div>
      <div className="portfolio-inner">
        <div className="portfolio-identity">
          <Avatar student={s} size="hero" />
          <div className="row">
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(location.href);
                  notify("Profile link copied");
                } catch {
                  notify(
                    "Copy this page’s URL from your browser to share it.",
                    true,
                  );
                }
              }}
            >
              <Globe size={15} />
              Share profile
            </Button>
            {session.role === "student" && session.userId === s.id && (
              <Link className="button primary" to="/student/profile">
                Edit profile
                <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </div>
        <div className="portfolio-intro">
          <div>
            <div className="eyebrow">HELLO, I’M</div>
            <h1>
              {s.name}
              <span className="online-dot" />
            </h1>
            <h2>{s.headline}</h2>
            <p>{s.bio}</p>
            <div className="meta wrap">
              <GraduationCap size={17} />
              {s.college}
              <span>·</span>
              {s.course}
              <span>·</span>
              {s.year}
            </div>
            <div className="meta">
              <MapPin size={16} />
              {s.location}
            </div>
            {s.website && (
              <a
                className="text-link"
                href={s.website}
                target="_blank"
                rel="noreferrer"
              >
                Personal website <ArrowUpRight size={15} />
              </a>
            )}
          </div>
          <aside>
            <span className="overline">CURRENT TOOLKIT</span>
            <div className="tags large-tags">
              {s.skills.length ? (
                s.skills.map((t) => <span key={t}>{t}</span>)
              ) : (
                <span>Always learning</span>
              )}
            </div>
            <small>Skills are self-reported.</small>
          </aside>
        </div>
        {s.visibility.projects && (
          <section className="portfolio-section">
            <div className="section-top">
              <h2>
                Things I’ve been building
                <span>{s.projects.length.toString().padStart(2, "0")}</span>
              </h2>
              <span className="overline">IDEAS INTO SOMETHING REAL</span>
            </div>
            <div className="project-grid">
              {s.projects.map((p, i) => (
                <ProjectCard key={p.id} item={p} index={i} />
              ))}
            </div>
            {!s.projects.length && (
              <Empty title="Something new is taking shape">
                Projects will appear here when the student adds them.
              </Empty>
            )}
          </section>
        )}
        {s.visibility.records && records.length > 0 && (
          <section className="portfolio-section">
            <div className="section-top">
              <h2>Showing up. Making a difference.</h2>
              <ShieldCheck size={24} />
            </div>
            <p className="section-description">
              Specific contributions, confirmed by the clubs behind them.
            </p>
            <div className="stack">
              {records.map((r) => (
                <RecordCard key={r.id} record={r} />
              ))}
            </div>
          </section>
        )}
        <div className="portfolio-columns">
          {(
            ["education", "experience", "achievements", "certificates"] as const
          )
            .filter((key) => s[key].length > 0)
            .map((key) => (
              <section key={key} className="portfolio-section">
                <h2 className="capitalize">{key}</h2>
                {s[key].map((item) => (
                  <div className="timeline-item" key={item.id}>
                    <h3>{item.title}</h3>
                    <small>{item.subtitle}</small>
                    <p>{item.description}</p>
                    {key !== "education" && <Badge>Added by student</Badge>}
                    {item.url && (
                      <a
                        className="text-link"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View evidence
                        <ArrowUpRight size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </section>
            ))}
        </div>
        {clubs.length > 0 && (
          <section className="portfolio-section">
            <h2>My kind of people.</h2>
            <div className="club-mini-grid">
              {clubs.map((c) => (
                <Link key={c.id} to={`/clubs/${c.slug}`} className="club-mini">
                  <span className={`club-avatar ${c.color}`}>{c.initials}</span>
                  <div>
                    <h3>{c.name}</h3>
                    <p>{c.members.find((m) => m.studentId === s.id)?.title}</p>
                  </div>
                  <ArrowUpRight size={20} />
                </Link>
              ))}
            </div>
          </section>
        )}
        <Notice>
          Demo data only — not an official college verification. Club
          confirmation applies only to the specific record shown.
        </Notice>
      </div>
    </div>
  );
}
export function Clubs() {
  const { db } = useApp();
  const [q, setQ] = useState("");
  const clubs = db.clubs.filter(
    (c) =>
      c.status !== "suspended" &&
      `${c.name} ${c.category}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="public-container">
      <Heading
        eyebrow="FIND YOUR PEOPLE"
        title="Big ideas start with good company."
        description="Discover the communities making things happen at Aura Institute of Technology."
      />
      <div className="search-box">
        <Search size={18} />
        <input
          aria-label="Search clubs"
          placeholder="Find a community or interest…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="club-grid">
        {clubs.map((c) => (
          <Link className="club-card" to={`/clubs/${c.slug}`} key={c.id}>
            <div className={`club-cover ${c.color}`}>
              <span>{c.initials}</span>
              <Badge>{c.category}</Badge>
            </div>
            <div className="club-card-content">
              <h2>
                {c.name}
                <ArrowUpRight size={20} />
              </h2>
              <p>{c.description}</p>
              <div className="row between">
                <span className="meta">
                  <Users size={16} />
                  {c.members.length} members
                </span>
                <span className="text-link">
                  Meet the community <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!clubs.length && (
        <Empty title="No communities found">Try a different search.</Empty>
      )}
    </div>
  );
}
export function ClubPublic() {
  const { slug } = useParams();
  const { db } = useApp();
  const c = db.clubs.find((c) => c.slug === slug);
  if (!c || c.status === "suspended")
    return (
      <div className="public-container">
        <Empty title="Community unavailable" />
      </div>
    );
  const events = db.events.filter(
    (e) => e.clubId === c.id && ["published", "completed"].includes(e.status),
  );
  return (
    <div className="public-container">
      <div className={`club-banner ${c.color}`}>
        <span className="overline">
          AURA INSTITUTE OF TECHNOLOGY / COMMUNITY
        </span>
        <span className="club-banner-symbol">{c.initials}</span>
      </div>
      <div className="club-public-heading">
        <span className={`club-avatar big ${c.color}`}>{c.initials}</span>
        <Badge>{c.category}</Badge>
        <h1>{c.name}</h1>
        <p>{c.description}</p>
        <div className="meta">
          <Users size={16} />
          {c.members.length} members<span>·</span>
          <span>
            {c.status === "approved"
              ? "Demo issuer approved"
              : "Issuer review pending"}
          </span>
        </div>
      </div>
      <section className="club-about">
        <h2>What brings us together.</h2>
        <p>{c.objective}</p>
      </section>
      <section className="portfolio-section">
        <h2>The people behind the community.</h2>
        <div className="committee-grid">
          {c.members
            .filter((m) => m.role !== "member")
            .map((m) => {
              const s = db.students.find((s) => s.id === m.studentId)!;
              return (
                <Link
                  key={s.id}
                  to={`/u/${s.slug}`}
                  className="committee-person"
                >
                  <Avatar student={s} />
                  <div>
                    <h3>{s.name}</h3>
                    <p>{m.title}</p>
                  </div>
                  <ArrowUpRight size={17} />
                </Link>
              );
            })}
        </div>
      </section>
      <section className="portfolio-section">
        <h2>Make something happen.</h2>
        <div className="event-grid">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
        {!events.length && (
          <Empty title="The next chapter is on its way">
            Upcoming events will be published here.
          </Empty>
        )}
      </section>
      {c.announcements.length > 0 && (
        <section className="portfolio-section">
          <h2>From the community.</h2>
          {c.announcements.map((a) => (
            <article className="announcement" key={a.id}>
              <small>{dateLabel(a.date)}</small>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
            </article>
          ))}
        </section>
      )}
      <Notice>Demo data only — not an official college verification.</Notice>
    </div>
  );
}
export function Events() {
  const { db } = useApp();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const events = db.events.filter(
    (e) =>
      ["published", "completed", "cancelled"].includes(e.status) &&
      db.clubs.find((c) => c.id === e.clubId)?.status !== "suspended" &&
      (filter === "all" || e.status === filter) &&
      e.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="public-container">
      <Heading
        eyebrow="GET OUT THERE"
        title="Your next spark is on campus."
        description="Learn something. Meet someone. Make a day of it."
      />
      <div className="toolbar">
        <div className="tabs">
          {[
            ["all", "All experiences"],
            ["published", "Upcoming"],
            ["completed", "Past events"],
          ].map(([v, l]) => (
            <button
              key={v}
              className={filter === v ? "active" : ""}
              onClick={() => setFilter(v)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={17} />
          <input
            aria-label="Search events"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find an event…"
          />
        </div>
      </div>
      <div className="event-grid">
        {events.map((e) => (
          <EventCard event={e} key={e.id} />
        ))}
      </div>
      {!events.length && (
        <Empty title="No events match just yet">
          Try another filter or search.
        </Empty>
      )}
    </div>
  );
}
export function EventDetail() {
  const { id } = useParams();
  const { db, session, setSession, service, act } = useApp();
  const nav = useNavigate();
  const e = db.events.find((e) => e.id === id);
  if (
    !e ||
    (e.status === "draft" &&
      !(session.role === "club" && session.clubId === e.clubId))
  )
    return (
      <div className="public-container">
        <Empty title="Event not available" />
      </div>
    );
  const c = db.clubs.find((c) => c.id === e.clubId)!;
  const reg = db.registrations.find(
    (r) =>
      r.eventId === e.id &&
      r.studentId === session.userId &&
      r.status === "registered",
  );
  const count = db.registrations.filter(
    (r) => r.eventId === e.id && r.status === "registered",
  ).length;
  const open =
    e.status === "published" &&
    e.registrationOpen &&
    Date.parse(e.date) > Date.now() &&
    c.status !== "suspended";
  return (
    <div className="public-container event-detail">
      <Link className="text-link" to="/events">
        ← All experiences
      </Link>
      <EventArt event={e} />
      <div className="event-detail-columns">
        <article>
          <div className="row wrap">
            <Badge tone={e.status === "published" ? "green" : "neutral"}>
              {e.status === "published" ? "Upcoming" : e.status}
            </Badge>
            <Link className="text-link" to={`/clubs/${c.slug}`}>
              Hosted by {c.name}
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <h1>{e.name}</h1>
          <h2>Good ideas deserve a day.</h2>
          <p className="event-description">{e.description}</p>
          <Notice>
            Registration and actual participation are separate. Organizers
            confirm participation after the event; you choose whether to display
            the record.
          </Notice>
        </article>
        <aside className="registration-panel">
          <div className="detail-row">
            <CalendarDays />
            <div>
              <strong>{dateLabel(e.date)}</strong>
              <span>{timeLabel(e.date)} · Your local time</span>
            </div>
          </div>
          <div className="detail-row">
            <MapPin />
            <div>
              <strong>{e.venue}</strong>
              <span>Aura Institute of Technology</span>
            </div>
          </div>
          <div className="detail-row">
            <Users />
            <div>
              <strong>
                {count} / {e.capacity} registered
              </strong>
              <span>{Math.max(e.capacity - count, 0)} places remaining</span>
            </div>
          </div>
          {session.role === "student" ? (
            <>
              <p className="registration-as">
                Registering as{" "}
                <strong>
                  {db.students.find((s) => s.id === session.userId)!.name}
                </strong>
              </p>
              {reg ? (
                <>
                  <div className="registered">
                    <Check size={18} />
                    You’re registered
                  </div>
                  {!reg.attended &&
                    !db.records.some(
                      (r) =>
                        r.studentId === session.userId && r.eventId === e.id,
                    ) && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          act(
                            () => service.cancelRegistration(session, e.id),
                            "Registration cancelled",
                          )
                        }
                      >
                        Cancel registration
                      </Button>
                    )}
                  {reg.attended && (
                    <Badge tone="green">Actual participation recorded</Badge>
                  )}
                </>
              ) : (
                <Button
                  disabled={!open || count >= e.capacity}
                  onClick={() =>
                    act(
                      () => service.register(session, e.id),
                      "You’re on the list. Registration confirmed!",
                    )
                  }
                >
                  {!open
                    ? "Registration closed"
                    : count >= e.capacity
                      ? "Event full"
                      : "Count me in"}
                  <ArrowRight size={17} />
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={() => {
                setSession({ ...session, role: "student", userId: "anuj" });
                nav(`/events/${e.id}`);
              }}
            >
              Explore as a student
              <ArrowRight size={17} />
            </Button>
          )}
          <small>No payment required. Synthetic demo event.</small>
          <Link className="text-link" to="/demo">
            Change demo role
            <ArrowUpRight size={14} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
export function RecordDetail() {
  const { id } = useParams();
  const { db, session, service, act } = useApp();
  const [reason, setReason] = useState("");
  const [report, setReport] = useState(false);
  const r = db.records.find((r) => r.id === id);
  const student = r ? db.students.find((u) => u.id === r.studentId) : undefined;
  const isOwner =
    r && session.role === "student" && session.userId === r.studentId;
  const canManage =
    r &&
    (session.role === "admin" ||
      (session.role === "club" && session.clubId === r.clubId));
  const isPublic =
    r &&
    student &&
    publicProfile(db, student.slug)?.records.some((x) => x.id === r.id);
  if (!r || (!isOwner && !canManage && !isPublic))
    return (
      <div className="public-container">
        <Empty title="This record is private">
          Only the student and authorized demo organizers can view it.
        </Empty>
      </div>
    );
  return (
    <div className="public-container narrow">
      <Heading
        eyebrow="ATTRIBUTABLE ACTIVITY RECORD"
        title="A contribution, in context."
        description="A specific claim with a named issuer and an understandable history."
      />
      <Notice>Demo data only — not an official college verification.</Notice>
      <RecordCard record={r} />
      <div className="record-facts">
        <div>
          <span>Student</span>
          <strong>{student!.name}</strong>
        </div>
        <div>
          <span>Student response</span>
          <strong className="capitalize">{r.acceptance}</strong>
        </div>
        <div>
          <span>Visibility</span>
          <strong>{isPublic ? "Shown on public profile" : "Private"}</strong>
        </div>
        <div>
          <span>Claim scope</span>
          <strong>Club confirmation only</strong>
        </div>
      </div>
      {isOwner && (
        <Button variant="secondary" onClick={() => setReport(true)}>
          Report a problem with this record
        </Button>
      )}
      <h2 className="space-top">Record history</h2>
      <div className="audit-timeline">
        {db.audit
          .filter((a) => a.target === r.id)
          .map((a) => (
            <div key={a.id}>
              <span className="audit-dot" />
              <small>
                {dateLabel(a.date)} · {timeLabel(a.date)}
              </small>
              <h3>{a.action}</h3>
              <p>{a.detail}</p>
              <small>
                By {db.students.find((s) => s.id === a.actor)?.name ?? a.actor}
              </small>
            </div>
          ))}
      </div>
      {report && (
        <Modal title="Report an issue" onClose={() => setReport(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                act(
                  () => service.report(session, r.id, reason),
                  "Dispute submitted to the platform admin",
                )
              )
                setReport(false);
            }}
          >
            <Field label="What needs correcting?">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Field>
            <div className="form-actions">
              <Button type="submit">Submit dispute</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
