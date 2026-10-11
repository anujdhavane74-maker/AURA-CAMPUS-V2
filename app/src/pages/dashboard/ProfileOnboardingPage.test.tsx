import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProfileOnboardingPage } from './ProfileOnboardingPage';
import { profileService } from '../../services/profile';
import { UserProfile } from '../../types';

// Mock useAuth
vi.mock('../../context/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123', email: 'maya@berkeley.edu' },
    isAuthenticated: true,
  }),
}));

describe('ProfileOnboardingPage Suite', () => {
  const mockProfile: UserProfile = {
    id: 'test-user-123',
    handle: 'mayapatel',
    displayName: 'Maya Patel',
    headline: 'EECS Student',
    bio: 'Building systems and tools.',
    institution: 'UC Berkeley',
    program: 'Computer Science',
    visibility: 'private',
    discoverable: false,
    createdAt: '2026-10-11T00:00:00Z',
    updatedAt: '2026-10-11T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(profileService, 'getFullProfile').mockResolvedValue({
      data: {
        profile: mockProfile,
        education: [],
        experience: [],
        skills: [],
        credentials: [],
        externalLinks: [],
        sections: [],
        completeness: {
          score: 50,
          completedWeight: 50,
          totalWeight: 100,
          criteria: [],
          missingCount: 3,
          topSuggestions: [],
        },
      },
      error: null,
    });
  });

  const renderOnboarding = (initialStep = '1') => {
    return render(
      <MemoryRouter initialEntries={[`/app/onboarding?step=${initialStep}`]}>
        <Routes>
          <Route path="/app/onboarding" element={<ProfileOnboardingPage />} />
          <Route path="/app/profile" element={<div>Profile Editor Target</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders Step 1 Welcome page with title and step navigation', async () => {
    renderOnboarding('1');

    await waitFor(() => {
      expect(screen.getByText('Profile Setup Onboarding')).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Why student identity matters/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Early-Career Fair/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save & Exit/i })).toBeInTheDocument();
  });

  it('navigates from Step 1 to Step 2 when Continue is clicked', async () => {
    renderOnboarding('1');

    await waitFor(() => {
      expect(screen.getByText('Profile Setup Onboarding')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Personal Info/i).length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/Display Name \*/i)).toBeInTheDocument();
    });
  });

  it('validates required display name on Step 2 before submitting', async () => {
    renderOnboarding('2');

    await waitFor(() => {
      expect(screen.getByLabelText(/Display Name \*/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Display Name \*/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Display Name is required/i)).toBeInTheDocument();
    });
  });

  it('allows skipping optional steps such as Step 5 Experience', async () => {
    renderOnboarding('5');

    await waitFor(() => {
      expect(screen.getAllByText(/Experience & Work/i).length).toBeGreaterThan(0);
    });

    const skipButton = screen.getByRole('button', { name: /Skip for now/i });
    expect(skipButton).toBeInTheDocument();

    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(screen.getAllByText(/External Links/i).length).toBeGreaterThan(0);
    });
  });

  it('navigates to previous step when Back button is clicked', async () => {
    renderOnboarding('3');

    await waitFor(() => {
      expect(screen.getAllByText(/University & program details/i).length).toBeGreaterThan(0);
    });

    const backButton = screen.getByRole('button', { name: /Back/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Personal Info/i).length).toBeGreaterThan(0);
    });
  });

  it('saves and exits to profile page when Save & Exit is clicked', async () => {
    renderOnboarding('2');

    await waitFor(() => {
      expect(screen.getByLabelText(/Display Name \*/i)).toBeInTheDocument();
    });

    vi.spyOn(profileService, 'updateProfile').mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    fireEvent.click(screen.getByRole('button', { name: /Save & Exit/i }));

    await waitFor(() => {
      expect(screen.getByText('Profile Editor Target')).toBeInTheDocument();
    });
  });
});
