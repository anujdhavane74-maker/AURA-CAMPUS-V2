import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService, calculateProfileCompleteness } from './profile';
import { supabase } from '../lib/supabase';
import { UserProfile, EducationItem, ExperienceItem, SkillItem, CredentialItem, ExternalLinkItem } from '../types';

describe('Profile Service & Completeness Logic (Mocked Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateProfileCompleteness()', () => {
    it('returns score 0 and all missing criteria for null profile and empty collections', () => {
      const res = calculateProfileCompleteness(null, [], [], [], [], []);
      expect(res.score).toBe(0);
      expect(res.completedWeight).toBe(0);
      expect(res.missingCount).toBe(8);
      expect(res.topSuggestions.length).toBe(3);
    });

    it('calculates partial completeness accurately', () => {
      const mockProfile: UserProfile = {
        id: 'u-1',
        handle: 'janesmith',
        displayName: 'Jane Smith',
        headline: 'CS Student',
        bio: 'Interested in operating systems and compiler design.',
        visibility: 'private',
        discoverable: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = calculateProfileCompleteness(mockProfile, [], [], [], [], []);
      // display_name (15) + handle (10) + headline (10) + bio (15) = 50%
      expect(res.score).toBe(50);
      expect(res.criteria.find((c) => c.id === 'display_name')?.isComplete).toBe(true);
      expect(res.criteria.find((c) => c.id === 'education')?.isComplete).toBe(false);
      expect(res.criteria.find((c) => c.id === 'skills')?.isComplete).toBe(false);
    });

    it('rewards early-career students for credentials even if work experience is empty', () => {
      const mockProfile: UserProfile = {
        id: 'u-1',
        handle: 'alexchen',
        displayName: 'Alex Chen',
        headline: 'First-Year CS Student',
        bio: 'Passionate about web standards and accessibility.',
        visibility: 'private',
        discoverable: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCredentials: CredentialItem[] = [
        {
          id: 'c-1',
          userId: 'u-1',
          kind: 'Certificate',
          title: 'Meta Frontend Professional',
          issuer: 'Coursera',
          visibility: 'public',
          createdAt: new Date().toISOString(),
        },
      ];

      const res = calculateProfileCompleteness(mockProfile, [], [], [], mockCredentials, []);
      const expOrCred = res.criteria.find((c) => c.id === 'experience_or_credentials');
      expect(expOrCred?.isComplete).toBe(true);
    });

    it('returns 100% when all foundation criteria are satisfied', () => {
      const mockProfile: UserProfile = {
        id: 'u-1',
        handle: 'fullstudent',
        displayName: 'Full Student',
        headline: 'Computer Science Major',
        bio: 'Building accessible student career tools and distributed applications.',
        visibility: 'public',
        discoverable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockEdu: EducationItem[] = [
        {
          id: 'e-1',
          userId: 'u-1',
          institution: 'MIT',
          visibility: 'public',
          createdAt: new Date().toISOString(),
        },
      ];

      const mockSkills: SkillItem[] = [
        { id: 's-1', userId: 'u-1', skill: 'TypeScript', sortOrder: 0, createdAt: new Date().toISOString() },
        { id: 's-2', userId: 'u-1', skill: 'React', sortOrder: 1, createdAt: new Date().toISOString() },
        { id: 's-3', userId: 'u-1', skill: 'PostgreSQL', sortOrder: 2, createdAt: new Date().toISOString() },
      ];

      const mockLinks: ExternalLinkItem[] = [
        {
          id: 'l-1',
          userId: 'u-1',
          label: 'GitHub',
          url: 'https://github.com/fullstudent',
          visibility: 'public',
          sortOrder: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      const mockExp: ExperienceItem[] = [
        {
          id: 'x-1',
          userId: 'u-1',
          organization: 'Aura Lab',
          role: 'Research Assistant',
          visibility: 'public',
          createdAt: new Date().toISOString(),
        },
      ];

      const res = calculateProfileCompleteness(mockProfile, mockEdu, mockExp, mockSkills, [], mockLinks);
      expect(res.score).toBe(100);
      expect(res.missingCount).toBe(0);
      expect(res.topSuggestions.length).toBe(0);
    });
  });

  describe('checkHandleAvailability()', () => {
    it('rejects reserved handles immediately without querying database', async () => {
      const res = await profileService.checkHandleAvailability('admin');
      expect(res.available).toBe(false);
      expect(res.error).toContain('reserved');
    });

    it('rejects handles with invalid format or length', async () => {
      const res1 = await profileService.checkHandleAvailability('ab');
      expect(res1.available).toBe(false);
      expect(res1.error).toContain('3-30');

      const res2 = await profileService.checkHandleAvailability('invalid--handle');
      expect(res2.available).toBe(false);
    });

    it('queries Supabase and reports available when count is 0', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const res = await profileService.checkHandleAvailability('valid-student-handle', 'user-123');
      expect(res.available).toBe(true);
      expect(res.error).toBeNull();
    });

    it('reports unavailable when handle exists for another user', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockResolvedValue({ count: 1, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const res = await profileService.checkHandleAvailability('taken-handle', 'user-123');
      expect(res.available).toBe(false);
    });
  });

  describe('profileService CRUD methods', () => {
    it('fetches profile and maps snake_case fields correctly', async () => {
      const mockRow = {
        id: 'u-123',
        handle: 'teststudent',
        display_name: 'Test Student',
        headline: 'Engineer',
        bio: 'Hello world',
        visibility: 'private',
        discoverable: false,
        created_at: '2026-10-11T00:00:00Z',
        updated_at: '2026-10-11T00:00:00Z',
      };

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockRow, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const res = await profileService.getProfile('u-123');
      expect(res.error).toBeNull();
      expect(res.data?.displayName).toBe('Test Student');
      expect(res.data?.handle).toBe('teststudent');
      expect(res.data?.visibility).toBe('private');
    });

    it('handles unique handle collision error gracefully on profile update', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: '23505', message: 'duplicate key value violates unique constraint' },
              }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const res = await profileService.updateProfile('u-123', { handle: 'collision' });
      expect(res.data).toBeNull();
      expect(res.error).toContain('already taken');
    });

    it('creates, updates, and deletes education records cleanly', async () => {
      const mockEduRow = {
        id: 'e-1',
        user_id: 'u-123',
        institution: 'Berkeley',
        qualification: 'B.S.',
        dates: '2022 - 2026',
        description: 'EECS',
        visibility: 'private',
        created_at: '2026-10-11T00:00:00Z',
      };

      // Create
      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockEduRow, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const createRes = await profileService.createEducation('u-123', {
        institution: 'Berkeley',
        qualification: 'B.S.',
        visibility: 'private',
      });
      expect(createRes.error).toBeNull();
      expect(createRes.data?.institution).toBe('Berkeley');

      // Delete
      vi.spyOn(supabase, 'from').mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const delRes = await profileService.deleteEducation('u-123', 'e-1');
      expect(delRes.success).toBe(true);
      expect(delRes.error).toBeNull();
    });

    it('prevents adding duplicate skill within the user list', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: 's-existing' }, error: null }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const res = await profileService.createSkill('u-123', {
        skill: 'typescript',
        sortOrder: 0,
      });

      expect(res.data).toBeNull();
      expect(res.error).toContain('already added');
    });
  });

  describe('Avatar services and magic byte validation', () => {
    it('validates authentic JPEG images based on magic bytes', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      const file = new File([jpegBytes], 'avatar.jpg', { type: 'image/jpeg' });

      const res = await profileService.validateAvatarFile(file);
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
      expect(res.detectedType).toBe('image/jpeg');
    });

    it('validates authentic PNG images based on magic bytes', async () => {
      const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      const file = new File([pngBytes], 'avatar.png', { type: 'image/png' });

      const res = await profileService.validateAvatarFile(file);
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
      expect(res.detectedType).toBe('image/png');
    });

    it('rejects files exceeding the 5MB size limit', async () => {
      const largeData = new Uint8Array(6 * 1024 * 1024);
      largeData[0] = 0xff;
      largeData[1] = 0xd8;
      largeData[2] = 0xff;
      const file = new File([largeData], 'large.jpg', { type: 'image/jpeg' });

      const res = await profileService.validateAvatarFile(file);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('5MB');
    });

    it('rejects files with invalid magic byte headers', async () => {
      const textBytes = new TextEncoder().encode('Hello world, not an image!');
      const file = new File([textBytes], 'fake.png', { type: 'image/png' });

      const res = await profileService.validateAvatarFile(file);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Invalid file format');
    });

    it('resolves avatar URLs cleanly for external, data URI, and storage paths', () => {
      expect(profileService.getAvatarUrl(null)).toBeNull();
      expect(profileService.getAvatarUrl(undefined)).toBeNull();
      expect(profileService.getAvatarUrl('https://example.com/avatar.jpg')).toBe(
        'https://example.com/avatar.jpg'
      );
      expect(profileService.getAvatarUrl('data:image/png;base64,abc')).toBe(
        'data:image/png;base64,abc'
      );

      vi.spyOn(supabase.storage, 'from').mockReturnValue({
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://supabase.co/storage/v1/object/public/avatars/user-1/avatar.webp' },
        }),
      } as unknown as ReturnType<typeof supabase.storage.from>);

      const storageUrl = profileService.getAvatarUrl('user-1/avatar.webp');
      expect(storageUrl).toContain('avatar.webp');
    });

    it('handles missing storage bucket gracefully on avatar upload', async () => {
      vi.spyOn(supabase.storage, 'from').mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Bucket not found: avatars' },
        }),
      } as unknown as ReturnType<typeof supabase.storage.from>);

      const blob = new Blob(['test-image'], { type: 'image/webp' });
      const res = await profileService.uploadAvatar('user-123', blob);

      expect(res.data).toBeNull();
      expect(res.error).toContain('avatars');
      expect(res.error).toContain('provisioned');
    });

    it('removes avatar from storage and clears profile record on delete', async () => {
      const removeMock = vi.fn().mockResolvedValue({ data: [], error: null });
      vi.spyOn(supabase.storage, 'from').mockReturnValue({
        remove: removeMock,
      } as unknown as ReturnType<typeof supabase.storage.from>);

      vi.spyOn(profileService, 'updateProfile').mockResolvedValue({
        data: null,
        error: null,
      });

      const res = await profileService.deleteAvatar('user-123', 'user-123/old-avatar.webp');
      expect(res.success).toBe(true);
      expect(removeMock).toHaveBeenCalledWith(['user-123/old-avatar.webp']);
    });
  });
});

