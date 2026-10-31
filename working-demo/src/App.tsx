import { Component, Suspense, lazy, useEffect } from "react";
import type { ReactNode } from "react";
import { HashRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { Provider } from "./state";
import { PublicLayout, Workspace } from "./components/Layout";
import * as Public from "./pages/Public";
import * as Student from "./pages/Student";
import * as Club from "./pages/Club";
const adminPage = (name: keyof typeof import("./pages/Admin")) =>
  lazy(() =>
    import("./pages/Admin").then((module) => ({ default: module[name] })),
  );
const Admin = {
  AdminDashboard: adminPage("AdminDashboard"),
  IssuerReview: adminPage("IssuerReview"),
  UserManagement: adminPage("UserManagement"),
  Reports: adminPage("Reports"),
  AuditHistory: adminPage("AuditHistory"),
  DemoSettings: adminPage("DemoSettings"),
};
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="access-page">
        <h1>Something interrupted this page.</h1>
        <p>Your changes may still be saved. Reload to try again.</p>
        <button className="button primary" onClick={() => location.reload()}>
          Reload demo
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      pathname === "/"
        ? "Aura Campus — Make your journey count"
        : `${pathname.startsWith("/student") ? "Student workspace" : pathname.startsWith("/club/") || pathname === "/club" ? "Club workspace" : pathname.startsWith("/admin") ? "Platform administration" : "Explore"} · Aura Campus`;
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <ErrorBoundary>
      <Provider>
        <HashRouter>
          <ScrollToTop />
          <a
            className="skip-link"
            href="#main-content"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("main-content")?.focus();
              document.getElementById("main-content")?.scrollIntoView();
            }}
          >
            Skip to content
          </a>
          <Suspense
            fallback={
              <div className="loading-state" role="status">
                Opening your workspace…
              </div>
            }
          >
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Public.Home />} />
                <Route path="about" element={<Public.About />} />
                <Route path="demo" element={<Public.DemoAccess />} />
                <Route path="students" element={<Public.Students />} />
                <Route path="u/:slug" element={<Public.Profile />} />
                <Route path="clubs" element={<Public.Clubs />} />
                <Route path="clubs/:slug" element={<Public.ClubPublic />} />
                <Route path="events" element={<Public.Events />} />
                <Route path="events/:id" element={<Public.EventDetail />} />
                <Route path="records/:id" element={<Public.RecordDetail />} />
              </Route>
              <Route path="student" element={<Workspace kind="student" />}>
                <Route index element={<Student.StudentDashboard />} />
                <Route path="profile" element={<Student.ProfileEditor />} />
                <Route path="projects" element={<Student.Projects />} />
                <Route path="records" element={<Student.StudentRecords />} />
                <Route path="memberships" element={<Student.Memberships />} />
                <Route path="privacy" element={<Student.Privacy />} />
              </Route>
              <Route path="club" element={<Workspace kind="club" />}>
                <Route index element={<Club.ClubDashboard />} />
                <Route path="profile" element={<Club.ClubEditor />} />
                <Route path="events" element={<Club.ClubEvents />} />
                <Route path="events/new" element={<Club.EventEditor />} />
                <Route path="events/:id/edit" element={<Club.EventEditor />} />
                <Route path="events/:id" element={<Club.EventOperations />} />
                <Route path="members" element={<Club.Members />} />
                <Route path="records" element={<Club.ClubRecords />} />
                <Route path="announcements" element={<Club.Announcements />} />
                <Route path="handover" element={<Club.Handover />} />
              </Route>
              <Route path="admin" element={<Workspace kind="admin" />}>
                <Route index element={<Admin.AdminDashboard />} />
                <Route path="clubs" element={<Admin.IssuerReview />} />
                <Route path="users" element={<Admin.UserManagement />} />
                <Route path="reports" element={<Admin.Reports />} />
                <Route path="audit" element={<Admin.AuditHistory />} />
                <Route path="settings" element={<Admin.DemoSettings />} />
              </Route>
              <Route
                path="*"
                element={
                  <div className="access-page">
                    <h1>This page took a different path.</h1>
                    <Link className="button primary" to="/">
                      Back to Aura Campus
                    </Link>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </HashRouter>
      </Provider>
    </ErrorBoundary>
  );
}
