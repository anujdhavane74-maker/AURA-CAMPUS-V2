import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileIdentityHeader } from './ProfileIdentityHeader';
import { ProfileCompletenessCard } from './ProfileCompletenessCard';
import { PersonalInfoTab } from './PersonalInfoTab';
import { EducationManagerTab } from './EducationManagerTab';
import { SkillsManagerTab } from './SkillsManagerTab';
import { ProfilePreviewTab } from './ProfilePreviewTab';
import { PrivacyVisibilityTab } from './PrivacyVisibilityTab';
import { ProfileSectionsOrganizerTab } from './ProfileSectionsOrganizerTab';
import { ProfileShareModal } from './ProfileShareModal';
import { CircularProgress } from './CircularProgress';
import { AvatarUploader } from './AvatarUploader';
import { calculateProfileCompleteness, profileService } from '../../services/profile';
import { UserProfile, EducationItem, SkillItem } from '../../types';

describe('Profile Management Component Suite (Mocked UI Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProfile: UserProfile = {
    id: 'usr-1',
    handle: 'mayapatel',
    displayName: 'Maya Patel',
    headline: 'Computer Science Student',
    bio: 'Passionate about distributed algorithms and open source web tools.',
    institution: 'UC Berkeley',
    program: 'EECS',
    graduationYear: 2026,
    locationLabel: 'Berkeley, CA',
    visibility: 'private',
    discoverable: false,
    createdAt: '2026-10-11T00:00:00Z',
    updatedAt: '2026-10-11T00:00:00Z',
  };

  describe('ProfileIdentityHeader', () => {
    it('renders profile initials fallback, display name, handle, and private badge', () => {
      const completeness = calculateProfileCompleteness(mockProfile, [], [], [], [], []);
      render(
        <MemoryRouter>
          <ProfileIdentityHeader
            profile={mockProfile}
            completeness={completeness}
            activeTab="overview"
            onTabChange={vi.fn()}
            onShareClick={vi.fn()}
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Maya Patel')).toBeInTheDocument();
      expect(screen.getByText('@mayapatel')).toBeInTheDocument();
      expect(screen.getByText('Private')).toBeInTheDocument();
      expect(screen.getByLabelText('Avatar for Maya Patel')).toHaveTextContent('MP');
    });

    it('triggers tab change when Edit Profile is clicked', () => {
      const onTabChange = vi.fn();
      const completeness = calculateProfileCompleteness(mockProfile, [], [], [], [], []);
      render(
        <MemoryRouter>
          <ProfileIdentityHeader
            profile={mockProfile}
            completeness={completeness}
            activeTab="overview"
            onTabChange={onTabChange}
            onShareClick={vi.fn()}
          />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
      expect(onTabChange).toHaveBeenCalledWith('personal');
    });
  });

  describe('ProfileCompletenessCard', () => {
    it('displays completeness score and actionable navigation buttons', () => {
      const onNavigate = vi.fn();
      const completeness = calculateProfileCompleteness(mockProfile, [], [], [], [], []);
      render(
        <MemoryRouter>
          <ProfileCompletenessCard
            completeness={completeness}
            onNavigateTab={onNavigate}
          />
        </MemoryRouter>
      );

      expect(screen.getByText(/Profile Completeness/i)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`${completeness.score}%`, 'i'))).toBeInTheDocument();

      // Missing education button should be present
      const addBtns = screen.getAllByRole('button', { name: /Add/i });
      const firstAddBtn = addBtns[0];
      expect(firstAddBtn).toBeDefined();
      if (firstAddBtn) {
        fireEvent.click(firstAddBtn);
      }
      expect(onNavigate).toHaveBeenCalled();
    });
  });

  describe('PersonalInfoTab', () => {
    it('renders form with existing values and updates dirty state', () => {
      const onDirtyChange = vi.fn();
      render(
        <PersonalInfoTab
          profile={mockProfile}
          onProfileUpdated={vi.fn()}
          onDirtyChange={onDirtyChange}
        />
      );

      const nameInput = screen.getByLabelText(/Display Name \*/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Maya Patel');

      fireEvent.change(nameInput, { target: { value: 'Maya P.' } });
      expect(onDirtyChange).toHaveBeenCalledWith(true);
    });

    it('validates required fields before submitting', async () => {
      render(
        <PersonalInfoTab
          profile={mockProfile}
          onProfileUpdated={vi.fn()}
        />
      );

      const nameInput = screen.getByLabelText(/Display Name \*/i);
      fireEvent.change(nameInput, { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: /Save Personal Info/i }));
      await waitFor(() => {
        expect(screen.getByText(/Display name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('EducationManagerTab', () => {
    const mockEdu: EducationItem[] = [
      {
        id: 'edu-1',
        userId: 'usr-1',
        institution: 'UC Berkeley',
        qualification: 'B.S. EECS',
        dates: '2022 - 2026',
        visibility: 'private',
        createdAt: '2026-10-11T00:00:00Z',
      },
    ];

    it('renders existing education entries and handles deletion confirmation', async () => {
      vi.spyOn(profileService, 'deleteEducation').mockResolvedValue({ success: true, error: null });
      const onItemsChanged = vi.fn();

      render(
        <EducationManagerTab
          userId="usr-1"
          items={mockEdu}
          onItemsChanged={onItemsChanged}
        />
      );

      expect(screen.getByText('UC Berkeley')).toBeInTheDocument();
      expect(screen.getByText('B.S. EECS')).toBeInTheDocument();

      // Click delete button
      fireEvent.click(screen.getByLabelText(/Delete education entry/i));
      expect(screen.getByText('Delete?')).toBeInTheDocument();

      // Confirm delete
      fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
      await waitFor(() => {
        expect(onItemsChanged).toHaveBeenCalledWith([]);
      });
    });

    it('validates that end year cannot be before start year', async () => {
      render(
        <EducationManagerTab
          userId="usr-1"
          items={[]}
          onItemsChanged={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Add First Education Entry/i }));

      fireEvent.change(screen.getByLabelText(/Institution Name \*/i), {
        target: { value: 'Stanford University' },
      });
      fireEvent.change(screen.getByLabelText(/Start Year/i), {
        target: { value: '2026' },
      });
      fireEvent.change(screen.getByLabelText(/End Year/i), {
        target: { value: '2022' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Save Education/i }));

      await waitFor(() => {
        expect(screen.getByText(/End year cannot be earlier than start year/i)).toBeInTheDocument();
      });
    });
  });

  describe('SkillsManagerTab', () => {
    const mockSkills: SkillItem[] = [
      { id: 's-1', userId: 'usr-1', skill: 'TypeScript', sortOrder: 0, createdAt: '2026-10-11T00:00:00Z' },
      { id: 's-2', userId: 'usr-1', skill: 'React', sortOrder: 1, createdAt: '2026-10-11T00:00:00Z' },
    ];

    it('renders skills chip wall and prevents adding duplicates', async () => {
      render(
        <SkillsManagerTab
          userId="usr-1"
          items={mockSkills}
          onItemsChanged={vi.fn()}
        />
      );

      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();

      const input = screen.getByLabelText(/Add a Skill/i);
      fireEvent.change(input, { target: { value: 'typescript' } });
      fireEvent.click(screen.getByRole('button', { name: /Add Skill/i }));

      await waitFor(() => {
        expect(screen.getByText(/"typescript" is already in your skills list/i)).toBeInTheDocument();
      });
    });
  });

  describe('ProfilePreviewTab', () => {
    it('switches between visitor and owner views and displays private warning banner', () => {
      render(
        <ProfilePreviewTab
          profile={mockProfile}
          education={[]}
          experience={[]}
          skills={[]}
          credentials={[]}
          externalLinks={[]}
          sections={[]}
        />
      );

      // In visitor view for private profile:
      expect(screen.getByText(/Profile is Currently Private/i)).toBeInTheDocument();

      // Switch to owner view:
      fireEvent.click(screen.getByRole('button', { name: /Owner View/i }));
      expect(screen.queryByText(/Profile is Currently Private/i)).not.toBeInTheDocument();
    });
  });

  describe('PrivacyVisibilityTab', () => {
    it('renders private and public options and handles visibility change', async () => {
      const onProfileUpdated = vi.fn();
      vi.spyOn(profileService, 'updateProfile').mockResolvedValue({
        data: { ...mockProfile, visibility: 'public' },
        error: null,
      });

      render(
        <PrivacyVisibilityTab
          profile={mockProfile}
          onProfileUpdated={onProfileUpdated}
        />
      );

      expect(screen.getByText('Private by Default')).toBeInTheDocument();
      expect(screen.getByText('Public Profile')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Public Profile'));

      await waitFor(() => {
        expect(profileService.updateProfile).toHaveBeenCalledWith(
          'usr-1',
          expect.objectContaining({ visibility: 'public' })
        );
      });
    });
  });

  describe('ProfileShareModal', () => {
    it('renders share modal with canonical link and warning for private profile', () => {
      render(
        <ProfileShareModal
          isOpen={true}
          onClose={vi.fn()}
          profile={mockProfile}
          onNavigatePrivacy={vi.fn()}
        />
      );

      expect(screen.getByText(/Share Public Profile/i)).toBeInTheDocument();
      expect(screen.getByText(/Your profile is currently Private/i)).toBeInTheDocument();
      const input = screen.getByLabelText(/Public Profile URL/i) as HTMLInputElement;
      expect(input.value).toContain('/u/mayapatel');
    });
  });

  describe('CircularProgress Component', () => {
    it('renders accessible SVG progressbar with score percentage', () => {
      render(<CircularProgress score={75} size={64} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('clamps scores safely between 0 and 100', () => {
      const { rerender } = render(<CircularProgress score={-10} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

      rerender(<CircularProgress score={150} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('AvatarUploader Component', () => {
    it('renders initials fallback when no avatar path is set', () => {
      render(
        <AvatarUploader
          userId="usr-1"
          currentAvatarPath={null}
          displayName="Maya Patel"
          handle="mayapatel"
          onAvatarUpdated={vi.fn()}
        />
      );

      expect(screen.getByText('MP')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Upload Photo/i })).toBeInTheDocument();
    });

    it('renders avatar image and delete button when avatar path exists', () => {
      vi.spyOn(profileService, 'getAvatarUrl').mockReturnValue('https://example.com/avatar.jpg');

      render(
        <AvatarUploader
          userId="usr-1"
          currentAvatarPath="usr-1/avatar.webp"
          displayName="Maya Patel"
          handle="mayapatel"
          onAvatarUpdated={vi.fn()}
        />
      );

      const img = screen.getByAltText("Maya Patel's avatar");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument();
    });
  });

  describe('Section Persistence & Tab Persistence Regression Tests', () => {
    it('ProfileSectionsOrganizerTab calls upsertProfileSections and updates display', async () => {
      const upsertSpy = vi.spyOn(profileService, 'upsertProfileSections').mockResolvedValue({
        data: [
          {
            id: 'sec-1',
            userId: 'usr-1',
            sectionType: 'skills',
            title: 'Skills & Toolkit',
            sortOrder: 0,
            visibility: 'public',
            content: {},
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
          {
            id: 'sec-2',
            userId: 'usr-1',
            sectionType: 'education',
            title: 'Education & Academics',
            sortOrder: 1,
            visibility: 'public',
            content: {},
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
        ],
        error: null,
      });

      const onSectionsChanged = vi.fn();
      render(
        <ProfileSectionsOrganizerTab
          userId="usr-1"
          sections={[]}
          onSectionsChanged={onSectionsChanged}
        />
      );

      // Verify sections rendered
      expect(screen.getByText('Profile Sections & Organization')).toBeInTheDocument();
      const moveDownBtns = screen.getAllByLabelText(/section down/i);
      expect(moveDownBtns.length).toBeGreaterThan(0);

      fireEvent.click(moveDownBtns[0]!);
      await waitFor(() => {
        expect(upsertSpy).toHaveBeenCalled();
        expect(onSectionsChanged).toHaveBeenCalled();
      });
    });

    it('EducationManagerTab reports dirty state to prevent silent tab abandonment', () => {
      const onDirty = vi.fn();
      render(
        <EducationManagerTab
          userId="usr-1"
          items={[]}
          onItemsChanged={vi.fn()}
          onDirtyChange={onDirty}
        />
      );

      // Click Add Education
      fireEvent.click(screen.getByRole('button', { name: /Add Education/i }));
      expect(onDirty).toHaveBeenCalledWith(true);
    });

    it('ProfilePreviewTab renders student projects and graceful empty states', () => {
      render(
        <ProfilePreviewTab
          profile={mockProfile}
          education={[]}
          experience={[]}
          skills={[]}
          credentials={[]}
          externalLinks={[]}
          sections={[]}
          projects={[
            {
              id: 'p-1',
              ownerId: 'usr-1',
              slug: 'compiler-optimizer',
              title: 'LLVM Bytecode Optimizer',
              summary: 'Constant folding and dead code elimination pass for LLVM IR.',
              technologies: ['C++', 'LLVM'],
              status: 'completed',
              visibility: 'public',
              sortOrder: 0,
              createdAt: '2026-01-01',
              updatedAt: '2026-01-01',
            },
          ]}
        />
      );

      expect(screen.getByText('LLVM Bytecode Optimizer')).toBeInTheDocument();
      expect(screen.getByText(/Projects & Proof of Work/i)).toBeInTheDocument();
      expect(screen.getByText(/Verified Student/i)).toBeInTheDocument();
    });
  });
});

