import { describe, it, expect } from 'vitest';
import { handleSchema, profileSchema, projectSchema, RESERVED_HANDLES } from './index';

describe('Zod Validation Schemas', () => {
  describe('handleSchema', () => {
    it('accepts valid lowercase handles', () => {
      const valid = ['alex-chen', 'jordan123', 'sara-m', 'student-dev'];
      valid.forEach((h) => {
        const res = handleSchema.safeParse(h);
        expect(res.success).toBe(true);
      });
    });

    it('rejects reserved keywords per specification', () => {
      Array.from(RESERVED_HANDLES).forEach((reserved) => {
        const res = handleSchema.safeParse(reserved);
        expect(res.success).toBe(false);
      });
    });

    it('rejects invalid formatting, spaces, and uppercase characters', () => {
      const invalid = ['Alex', 'alex chen', 'a', 'al', 'alex--chen', 'alex@chen'];
      invalid.forEach((inv) => {
        const res = handleSchema.safeParse(inv);
        expect(res.success).toBe(false);
      });
    });
  });

  describe('profileSchema', () => {
    it('validates a correct student profile', () => {
      const profileData = {
        displayName: 'Maya Patel',
        handle: 'maya-patel',
        headline: 'AI & Data Science Student',
        bio: 'Researching neural models and building accessible applications.',
        institution: 'Campus University',
        program: 'B.Tech in Artificial Intelligence',
        graduationYear: 2027,
        locationLabel: 'Seattle, WA',
        visibility: 'private',
        discoverable: false,
      };

      const res = profileSchema.safeParse(profileData);
      expect(res.success).toBe(true);
    });

    it('defaults visibility to private and discoverable to false', () => {
      const minimalProfile = {
        displayName: 'John Doe',
        handle: 'john-doe',
      };

      const res = profileSchema.safeParse(minimalProfile);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.visibility).toBe('private');
        expect(res.data.discoverable).toBe(false);
      }
    });

    it('rejects profiles with empty display name', () => {
      const res = profileSchema.safeParse({
        displayName: '   ',
        handle: 'valid-handle',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('projectSchema', () => {
    it('validates a correct project case study', () => {
      const projectData = {
        title: 'Real-time Canvas Collaboration',
        summary: 'WebSockets-based interactive whiteboard for student study groups.',
        problem: 'Latency in shared drafting sessions during remote classes.',
        approach: 'Used CRDTs with state vector compression.',
        outcome: 'Sub-50ms sync with zero packet loss.',
        technologies: ['TypeScript', 'WebSockets', 'Canvas API'],
        status: 'completed',
        repositoryUrl: 'https://github.com/example/collab-canvas',
        visibility: 'private',
      };

      const res = projectSchema.safeParse(projectData);
      expect(res.success).toBe(true);
    });

    it('rejects insecure http URLs for repository or demo', () => {
      const res = projectSchema.safeParse({
        title: 'Project Title',
        technologies: ['React'],
        repositoryUrl: 'http://insecure.example.com',
      });
      expect(res.success).toBe(false);
    });
  });
});
