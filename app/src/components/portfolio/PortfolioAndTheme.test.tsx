import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PortfolioThemeRenderer } from './PortfolioThemeRenderer';
import { VisualThemePicker } from './VisualThemePicker';
import { ALL_THEME_IDS, PORTFOLIO_THEMES } from '../../design/themes';
import { portfolioService } from '../../services/portfolio';
import {
  Portfolio,
  Project,
  UserProfile,
} from '../../types';

const sampleProfile: UserProfile = {
  id: 'usr-42',
  handle: 'alexchen',
  displayName: 'Alex Chen',
  headline: 'Systems & Distributed Computing Student',
  bio: 'Building deterministic scheduling primitives and fault-tolerant storage systems.',
  institution: 'University of Washington',
  program: 'B.S. Computer Science',
  graduationYear: 2026,
  locationLabel: 'Seattle, WA',
  visibility: 'public',
  discoverable: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const sampleProjects: Project[] = [
  {
    id: 'proj-1',
    ownerId: 'usr-42',
    slug: 'distributed-task-scheduler',
    title: 'Distributed Task Scheduler',
    summary: 'High-throughput cluster coordinator with raft consensus and leader election.',
    problem: 'Mitigate split-brain failures under partitioned cluster environments.',
    approach: 'Implemented heartbeat health checks and deterministic state machine replication.',
    outcome: '99.99% availability during simulated network packet drops.',
    technologies: ['Go', 'Raft', 'gRPC', 'PostgreSQL'],
    status: 'completed',
    visibility: 'public',
    sortOrder: 0,
    demoUrl: 'https://demo.scheduler.dev',
    repositoryUrl: 'https://github.com/alexchen/scheduler',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'proj-2',
    ownerId: 'usr-42',
    slug: 'cache-invalidation-engine',
    title: 'Cache Invalidation Engine',
    summary: 'Near real-time invalidation pipeline with Kafka event streams.',
    problem: 'Stale reads across global microservices during heavy write bursts.',
    approach: 'Change-data-capture pipeline feeding local in-memory caches.',
    outcome: 'Reduced stale cache reads from 4.2% to 0.01%.',
    technologies: ['Rust', 'Kafka', 'Redis'],
    status: 'in_progress',
    visibility: 'public',
    sortOrder: 1,
    repositoryUrl: 'https://github.com/alexchen/cache-engine',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
];

const samplePortfolio: Portfolio = {
  id: 'port-1',
  userId: 'usr-42',
  slug: 'alexchen',
  title: 'Alex Chen Portfolio',
  theme: 'studio',
  accent: 'teal',
  visibility: 'public',
  data: {
    introduction: 'Welcome to my engineering portfolio and project showcase.',
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Portfolio Theme Differentiation & Rendering Suite', () => {
  it('renders Studio theme with balanced clean card layout', () => {
    const { container } = render(
      <MemoryRouter>
        <PortfolioThemeRenderer
          themeId="studio"
          portfolio={{ ...samplePortfolio, theme: 'studio' }}
          profile={sampleProfile}
          projects={sampleProjects}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    expect(screen.getByText(/Featured Case Studies/i)).toBeInTheDocument();
    expect(screen.getByText('Distributed Task Scheduler')).toBeInTheDocument();
    expect(screen.getByText('Cache Invalidation Engine')).toBeInTheDocument();
    expect(container.querySelector('.font-sans')).toBeInTheDocument();
  });

  it('renders Noir theme with cinematic dark aesthetic and index structure', () => {
    const { container } = render(
      <MemoryRouter>
        <PortfolioThemeRenderer
          themeId="noir"
          portfolio={{ ...samplePortfolio, theme: 'noir' }}
          profile={sampleProfile}
          projects={sampleProjects}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    expect(screen.getByText(/Index of Works/i)).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getAllByText('02').length).toBe(2);
    expect(container.querySelector('.bg-\\[\\#090a0f\\]')).toBeInTheDocument();
  });

  it('renders Brutalist theme with hard black borders and neo-brutalist styling', () => {
    const { container } = render(
      <MemoryRouter>
        <PortfolioThemeRenderer
          themeId="brutalist"
          portfolio={{ ...samplePortfolio, theme: 'brutalist' }}
          profile={sampleProfile}
          projects={sampleProjects}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('STUDENT_RECORD.EXE')).toBeInTheDocument();
    expect(screen.getByText(/PROJECT ARTIFACTS/i)).toBeInTheDocument();
    expect(screen.getByText('LIVE DEMO')).toBeInTheDocument();
    expect(container.querySelector('.border-3.border-black')).toBeInTheDocument();
  });

  it('renders Resume theme as a document CV with professional summary and timeline', () => {
    render(
      <MemoryRouter>
        <PortfolioThemeRenderer
          themeId="resume"
          portfolio={{ ...samplePortfolio, theme: 'resume' }}
          profile={sampleProfile}
          projects={sampleProjects}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Professional Summary')).toBeInTheDocument();
    expect(screen.getByText('Technical Projects & Implementations')).toBeInTheDocument();
    expect(screen.getByText('Distributed Task Scheduler')).toBeInTheDocument();
    expect(screen.getAllByText(/Challenge addressed:/i).length).toBe(2);
  });

  it('renders Sticker theme with playful rotated collage cards and stickers', () => {
    render(
      <MemoryRouter>
        <PortfolioThemeRenderer
          themeId="sticker"
          portfolio={{ ...samplePortfolio, theme: 'sticker' }}
          profile={sampleProfile}
          projects={sampleProjects}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/👋 student portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/🚀 Cool Stuff I Built/i)).toBeInTheDocument();
    expect(screen.getByText('Play Demo')).toBeInTheDocument();
  });

  it('renders Editorial theme with broadsheet masthead and dispatch formatting', () => {
    render(
      <MemoryRouter>
        <PortfolioThemeRenderer
          themeId="editorial"
          portfolio={{ ...samplePortfolio, theme: 'editorial' }}
          profile={sampleProfile}
          projects={sampleProjects}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/THE ACADEMIC & ENGINEERING DISPATCH/i)).toBeInTheDocument();
    expect(screen.getByText(/DOCUMENTED PROOF OF WORK/i)).toBeInTheDocument();
    expect(screen.getByText('Exhibit Demo')).toBeInTheDocument();
  });

  it('renders Midnight theme with unix terminal chrome and commands', () => {
    render(
      <MemoryRouter>
        <PortfolioThemeRenderer
          themeId="midnight"
          portfolio={{ ...samplePortfolio, theme: 'midnight' }}
          profile={sampleProfile}
          projects={sampleProjects}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/user@alexchen: ~\/portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ whoami/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ ls -la \.\/projects\//i)).toBeInTheDocument();
    expect(screen.getByText('Distributed Task Scheduler.ts')).toBeInTheDocument();
  });
});

describe('VisualThemePicker Component Suite', () => {
  it('renders all 12 registered themes in gallery with accessible selection', () => {
    const onSelect = vi.fn();
    render(
      <VisualThemePicker
        selectedThemeId="brutalist"
        onSelectTheme={onSelect}
      />
    );

    expect(screen.getByText(/Theme Gallery \(12 Distinct Visual Archetypes\)/i)).toBeInTheDocument();
    expect(screen.getByText('Selected: Brutalist')).toBeInTheDocument();

    // Verify all 12 themes exist as options
    ALL_THEME_IDS.forEach((id) => {
      const themeName = PORTFOLIO_THEMES[id].name;
      expect(screen.getAllByText(themeName).length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('portfolioService Suite', () => {
  it('exports all required methods for complete portfolio & project lifecycle', () => {
    expect(typeof portfolioService.fetchUserPortfolio).toBe('function');
    expect(typeof portfolioService.upsertPortfolio).toBe('function');
    expect(typeof portfolioService.fetchUserProjects).toBe('function');
    expect(typeof portfolioService.createProject).toBe('function');
    expect(typeof portfolioService.updateProject).toBe('function');
    expect(typeof portfolioService.deleteProject).toBe('function');
    expect(typeof portfolioService.getPublicPortfolioBySlug).toBe('function');
  });
});
