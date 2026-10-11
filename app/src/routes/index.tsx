import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AppLayout } from '../components/layout/AppLayout';

import { HomePage } from '../pages/HomePage';
import { ExplorePage } from '../pages/ExplorePage';
import { PublicProfilePage } from '../pages/PublicProfilePage';
import { PortfolioPage } from '../pages/PortfolioPage';
import { SharedLinkPage } from '../pages/SharedLinkPage';

import { SignInPage } from '../pages/auth/SignInPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { AuthCallbackPage } from '../pages/auth/AuthCallbackPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

import { DashboardOverviewPage } from '../pages/dashboard/DashboardOverviewPage';
import { ProfileEditorPage } from '../pages/dashboard/ProfileEditorPage';
import { ProfileOnboardingPage } from '../pages/dashboard/ProfileOnboardingPage';
import { PortfolioBuilderPage } from '../pages/dashboard/PortfolioBuilderPage';
import { ProjectsPage } from '../pages/dashboard/ProjectsPage';
import { PrivacyPage } from '../pages/dashboard/PrivacyPage';
import { SharingPage } from '../pages/dashboard/SharingPage';

import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'u/:handle', element: <PublicProfilePage /> },
      { path: 's/:token', element: <SharedLinkPage /> },
      { path: 'auth/sign-in', element: <SignInPage /> },
      { path: 'auth/sign-up', element: <SignUpPage /> },
      { path: 'auth/forgot-password', element: <ForgotPasswordPage /> },
      { path: 'auth/callback', element: <AuthCallbackPage /> },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/p/:slug',
    element: <PortfolioPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardOverviewPage /> },
      { path: 'profile', element: <ProfileEditorPage /> },
      { path: 'onboarding', element: <ProfileOnboardingPage /> },
      { path: 'portfolio', element: <PortfolioBuilderPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'sharing', element: <SharingPage /> },
      { path: '*', element: <Navigate to="/app" replace /> },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
  },
});
