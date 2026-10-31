import { useEffect, useRef, useState } from "react";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Check,
  Code2,
  Layers,
  X,
} from "lucide-react";
import { useApp } from "../state";
import type {
  ActivityRecord,
  CampusEvent,
  ContentItem,
  Student,
} from "../domain/types";
export const dateLabel = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export const timeLabel = (date: string) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  return (
    <button className={`button ${variant}`} {...props}>
      {children}
    </button>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Avatar({
  student,
  size = "normal",
}: {
  student: Pick<Student, "initials" | "color">;
  size?: string;
}) {
  return (
    <span className={`avatar ${student.color} ${size}`}>
      {student.initials}
    </span>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <Layers size={27} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  useEffect(() => {
    const listen = (e: Event) => setError((e as CustomEvent<string>).detail);
    window.addEventListener("aura-error", listen);
    return () => window.removeEventListener("aura-error", listen);
  }, []);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {error && (
        <p className="dialog-error" role="alert">
          {error}
        </p>
      )}
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Stat({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className="stat">
      <span className="stat-icon">{icon}</span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
export function EventArt({
  event,
  small = false,
}: {
  event: CampusEvent;
  small?: boolean;
}) {
  return (
    <div
      className={`event-art ${event.theme} ${small ? "small" : ""}`}
      aria-hidden="true"
    >
      <span className="art-label">
        AURA CAMPUS /{" "}
        {event.theme === "mint" ? "BUILD SERIES" : "COMMUNITY SESSIONS"}
      </span>
      <div className="art-symbol">
        {event.theme === "mint" ? <Code2 /> : <Layers />}
      </div>
      <div className="art-title">{event.name}</div>
      <span className="art-bottom">
        {dateLabel(event.date)} <ArrowUpRight size={19} />
      </span>
    </div>
  );
}
export function EventCard({ event }: { event: CampusEvent }) {
  const { db } = useApp();
  const club = db.clubs.find((c) => c.id === event.clubId)!;
  return (
    <Link className="event-card" to={`/events/${event.id}`}>
      <EventArt event={event} />
      <div className="event-card-body">
        <div className="row between">
          <span className="overline">{club.name}</span>
          <Badge tone={event.status === "completed" ? "neutral" : "green"}>
            {event.status === "published" ? "Upcoming" : event.status}
          </Badge>
        </div>
        <h3>
          {event.name}
          <ArrowUpRight size={18} />
        </h3>
        <div className="meta">
          <CalendarDays size={15} />
          {dateLabel(event.date)}
          <span>·</span>
          {timeLabel(event.date)}
        </div>
        <div className="meta">
          <MapPin size={15} />
          {event.venue}
        </div>
      </div>
    </Link>
  );
}
export function ProjectCard({
  item,
  index = 0,
}: {
  item: ContentItem;
  index?: number;
}) {
  return (
    <article className="project-card">
      <div
        className={`project-art ${index % 2 ? "blueprint" : "compass"}`}
        aria-hidden="true"
      >
        {index % 2 ? (
          <>
            <span className="leaf">⌁</span>
            <span className="project-art-tag">EXPERIMENT / 02</span>
          </>
        ) : (
          <>
            <div className="mini-ui">
              <span />
              <span />
              <div>
                <i />
                <i />
                <i />
              </div>
              <strong>
                Find your next
                <br />
                little adventure.
              </strong>
            </div>
            <span className="project-art-tag">DESIGN + DEVELOPMENT</span>
          </>
        )}
      </div>
      <div className="project-content">
        <h3>{item.title}</h3>
        <p className="project-subtitle">{item.subtitle}</p>
        <p>{item.description}</p>
        <div className="tags">
          {item.tags
            .split(",")
            .filter(Boolean)
            .map((t) => (
              <span key={t}>{t.trim()}</span>
            ))}
        </div>
        {item.url && (
          <a
            className="text-link"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            View project <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </article>
  );
}
export function RecordCard({
  record,
  actions,
}: {
  record: ActivityRecord;
  actions?: ReactNode;
}) {
  const { db } = useApp();
  const club = db.clubs.find((c) => c.id === record.clubId)!;
  const event = db.events.find((e) => e.id === record.eventId)!;
  return (
    <article
      className={`record-card ${record.status === "revoked" ? "revoked" : ""}`}
    >
      <div className="record-icon">
        <ShieldCheck size={22} />
      </div>
      <div className="record-body">
        <div className="row wrap between">
          <span className="overline">
            {record.type} · {club.name}
          </span>
          <Badge
            tone={
              record.status === "revoked"
                ? "red"
                : record.acceptance === "pending"
                  ? "amber"
                  : "green"
            }
          >
            {record.status === "revoked"
              ? "Confirmation revoked"
              : record.acceptance === "pending"
                ? "Pending acceptance"
                : record.acceptance === "declined"
                  ? "Declined"
                  : "Club-confirmed"}
          </Badge>
        </div>
        <h3>{event.name}</h3>
        <p>{record.description}</p>
        {record.status === "revoked" && (
          <p className="revocation-note">Reason: {record.revokedReason}</p>
        )}
        <div className="row wrap between">
          <small>
            Issued by {db.students.find((s) => s.id === record.issuerId)?.name}{" "}
            · {dateLabel(record.issuedAt)}
          </small>
          <Link className="text-link" to={`/records/${record.id}`}>
            View record <ArrowUpRight size={14} />
          </Link>
        </div>
        {actions && <div className="record-actions">{actions}</div>}
      </div>
    </article>
  );
}
export function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="step">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <ShieldCheck size={18} />
      <span>{children}</span>
    </div>
  );
}
export function CheckLine({ children }: { children: ReactNode }) {
  return (
    <span className="check-line">
      <Check size={15} />
      {children}
    </span>
  );
}
export function ArrowLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
