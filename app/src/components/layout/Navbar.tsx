import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../context/useAuth';
import { APP_PALETTES } from '../../design/palettes';
import { AppPaletteId } from '../../types';
import { Sparkles, Menu, X, Compass, LayoutDashboard, User, LogOut, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { paletteId, setPaletteId } = useTheme();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isCurrent = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSectionScroll = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${id}`);
    }
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'My Account';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl p-1 text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Aura Campus Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-700/20">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold tracking-tight text-slate-900 text-lg leading-tight">
              Aura <span className="text-teal-600">Campus</span>
            </span>
            <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
              Student Identity &amp; Career
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          <Link
            to="/explore"
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${
              isCurrent('/explore')
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            <span>Explore Students</span>
          </Link>

          <button
            type="button"
            onClick={() => handleSectionScroll('features')}
            className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
          >
            Features
          </button>

          <button
            type="button"
            onClick={() => handleSectionScroll('how-it-works')}
            className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
          >
            How It Works
          </button>
        </nav>

        {/* Right Section: Palette Selector & Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Palette Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 rounded-xl px-2 py-1 text-xs border border-slate-200">
            <span className="text-slate-500 font-medium text-[11px]">Theme:</span>
            {(Object.keys(APP_PALETTES) as AppPaletteId[]).map((pid) => (
              <button
                key={pid}
                type="button"
                onClick={() => setPaletteId(pid)}
                title={`Switch to ${APP_PALETTES[pid].name} palette`}
                aria-label={`Switch to ${APP_PALETTES[pid].name} palette`}
                className={`h-4.5 w-4.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  paletteId === pid ? 'scale-110 ring-2 ring-slate-900 shadow-xs' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: APP_PALETTES[pid].primaryHex }}
              />
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-teal-50 text-teal-800 border border-teal-200/80 rounded-xl hover:bg-teal-100/80 transition-colors shadow-2xs"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-teal-700" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/app/profile"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                title="Manage Profile"
              >
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span className="max-w-[110px] truncate">{displayName}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out of Aura Campus"
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/sign-in"
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/auth/sign-up"
                aria-label="Get Started — Join Campus"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all hover:shadow-sm focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-2 pb-5 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Compass className="h-4 w-4 text-slate-500" />
              <span>Explore Students</span>
            </Link>

            <button
              type="button"
              onClick={() => handleSectionScroll('features')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 text-left w-full"
            >
              <span>Features</span>
            </button>

            <button
              type="button"
              onClick={() => handleSectionScroll('how-it-works')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 text-left w-full"
            >
              <span>How It Works</span>
            </button>

            {user && (
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Palette selector mobile */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-500">Palette:</span>
            <div className="flex items-center gap-2">
              {(Object.keys(APP_PALETTES) as AppPaletteId[]).map((pid) => (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setPaletteId(pid)}
                  aria-label={`Palette ${APP_PALETTES[pid].name}`}
                  className={`h-5 w-5 rounded-full ${
                    paletteId === pid ? 'ring-2 ring-slate-900 scale-110' : 'opacity-70'
                  }`}
                  style={{ backgroundColor: APP_PALETTES[pid].primaryHex }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 px-1">
                  Signed in as: <strong className="text-slate-800">{displayName}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-center px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-2 text-sm font-medium text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Get Started — Join Campus"
                  className="text-center px-3 py-2 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
