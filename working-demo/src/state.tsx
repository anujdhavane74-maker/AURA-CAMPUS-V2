import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { DemoService, STORAGE_KEY } from "./domain/service";
import type { Session } from "./domain/types";
const service = new DemoService({
  read: () => localStorage.getItem(STORAGE_KEY),
  write: (v) => localStorage.setItem(STORAGE_KEY, v),
});
function initialSession(): Session {
  try {
    const s = JSON.parse(sessionStorage.getItem("aura-session") ?? "null");
    if (
      s &&
      ["student", "club", "admin"].includes(s.role) &&
      service.state.students.some((u) => u.id === s.userId) &&
      service.state.clubs.some((c) => c.id === s.clubId)
    )
      return s;
  } catch {}
  return { role: "student", userId: "anuj", clubId: "coding" };
}
interface ContextValue {
  db: ReturnType<DemoService["snapshot"]>;
  service: DemoService;
  session: Session;
  setSession: (s: Session) => void;
  notify: (message: string, error?: boolean) => void;
  act: (fn: () => unknown, message?: string) => boolean;
}
const Context = createContext<ContextValue>(null!);
export function Provider({ children }: { children: ReactNode }) {
  const db = useSyncExternalStore(service.subscribe, service.snapshot);
  const [session, set] = useState(initialSession);
  const [toast, setToast] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>();
  const notify = useCallback(
    (text: string, error = false) => {
      if (timer) clearTimeout(timer);
      setToast({ text, error });
      if (error)
        window.dispatchEvent(new CustomEvent("aura-error", { detail: text }));
      setTimer(setTimeout(() => setToast(null), 6000));
    },
    [timer],
  );
  const setSession = (s: Session) => {
    set(s);
    try {
      sessionStorage.setItem("aura-session", JSON.stringify(s));
    } catch {}
  };
  const act = (fn: () => unknown, message = "Changes saved") => {
    try {
      fn();
      notify(message);
      return true;
    } catch (e) {
      notify(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
        true,
      );
      return false;
    }
  };
  return (
    <Context.Provider value={{ db, service, session, setSession, notify, act }}>
      {children}
      {service.warning && (
        <div className="storage-warning" role="alert">
          {service.warning}
        </div>
      )}
      {toast && (
        <div
          className={`toast ${toast.error ? "error" : ""}`}
          role={toast.error ? "alert" : "status"}
        >
          <span>{toast.error ? "!" : "✓"}</span>
          {toast.text}
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
