import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Layers,
  Shield,
  Share2,
} from 'lucide-react';

const APP_NAV_ITEMS = [
  { path: '/app', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/app/profile', label: 'My Profile', icon: User },
  { path: '/app/portfolio', label: 'Portfolio Builder', icon: Layers },
  { path: '/app/projects', label: 'Projects', icon: Briefcase },
  { path: '/app/privacy', label: 'Privacy & Visibility', icon: Shield },
  { path: '/app/sharing', label: 'Share & QR Links', icon: Share2 },
];

export const AppLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/60">
      <Navbar />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col md:flex-row px-4 py-6 sm:px-6 lg:px-8 gap-6">
        {/* Secondary App Navigation Sidebar */}
        <aside className="w-full md:w-56 shrink-0" aria-label="Dashboard Navigation">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
            {APP_NAV_ITEMS.map((item) => {
              const active = isActive(item.path, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-teal-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-600'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Dashboard Main Content Area */}
        <main className="flex-1 min-w-0" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
