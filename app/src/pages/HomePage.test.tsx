import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { HomePage } from './HomePage';
import * as authContext from '../context/useAuth';

describe('HomePage Landing Page Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      isAuthenticated: false,
      isConfigured: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    });
  });

  const renderHomePage = () => {
    return render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  };

  it('renders Hero section with bold headline, supporting copy, and CTAs', () => {
    renderHomePage();

    // Eyebrow and Headline
    expect(screen.getByText(/YOUR JOURNEY. YOUR PROOF./i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /build your future/i,
      })
    ).toBeInTheDocument();

    // Supporting copy
    expect(
      screen.getByText(/Turn the things you learn, build and achieve into a student profile/i)
    ).toBeInTheDocument();

    // CTAs
    expect(screen.getByRole('link', { name: /build your profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore student portfolios/i })).toBeInTheDocument();

    // Factual trust statement
    expect(
      screen.getByText(/Free for students • Private by default with strict PostgreSQL RLS/i)
    ).toBeInTheDocument();

    // Realistic product preview card with honest demo content
    expect(screen.getByText('Maya Patel')).toBeInTheDocument();
    expect(screen.getByText(/Computer Science • B\.S\. Candidate '26/i)).toBeInTheDocument();
    expect(screen.getByText('NexusDB: Distributed Key-Value Store')).toBeInTheDocument();
    expect(screen.getByText('12 Distinct Themes')).toBeInTheDocument();
  });

  it('renders Product Showcase section with interactive theme switcher', () => {
    renderHomePage();

    // Features Section title
    expect(screen.getByText(/PURPOSE-BUILT FOR STUDENTS/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Proof over promises/i,
      })
    ).toBeInTheDocument();

    // 12 Validated themes interactive switcher
    const studioButton = screen.getByRole('button', { name: /Studio/i });
    expect(studioButton).toBeInTheDocument();
    fireEvent.click(studioButton);
    expect(screen.getAllByText(/Theme: studio/i).length).toBeGreaterThan(0);

    const brutalistButton = screen.getByRole('button', { name: /Brutalist/i });
    expect(brutalistButton).toBeInTheDocument();
    fireEvent.click(brutalistButton);
    expect(screen.getByText(/Theme: brutalist/i)).toBeInTheDocument();

    // Share link simulator
    expect(screen.getByText(/Live Share Token Simulator/i)).toBeInTheDocument();
  });

  it('renders How It Works three-step sequence welcoming first-year students', () => {
    renderHomePage();

    expect(
      screen.getByRole('heading', {
        name: /From first semester project to career breakthrough/i,
      })
    ).toBeInTheDocument();

    // Steps 01, 02, 03
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText(/Create your identity/i)).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText(/Showcase your work/i)).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText(/Share your growth/i)).toBeInTheDocument();
  });

  it('renders Portfolio Showcase with multi-disciplinary engineering projects', () => {
    renderHomePage();

    expect(
      screen.getByRole('heading', {
        name: /Real projects, verified architectures/i,
      })
    ).toBeInTheDocument();

    // Featured and supporting projects
    expect(
      screen.getByText(/AeroPerception: Edge AI Vision Pipeline for Autonomous Drones/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/NexusDB: Distributed Raft Consensus Key-Value Store/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/PulseCare: Pediatric Patient Telemetry & Alert Portal/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/QuantumOpt: Variational Quantum Algorithms for Molecular Simulation/i)
    ).toBeInTheDocument();
  });

  it('renders Closing CTA with strong call to action and directory link', () => {
    renderHomePage();

    expect(
      screen.getByRole('heading', {
        name: /Your next opportunity starts with what you build today/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /create your profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore campus directory/i })).toBeInTheDocument();
  });

  it('adapts CTA buttons when a user is already authenticated', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'u-123', email: 'test@student.edu' } as unknown as User,
      session: null,
      loading: false,
      isAuthenticated: true,
      isConfigured: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    });

    renderHomePage();

    // Hero CTA should update for authenticated user
    expect(screen.getAllByRole('link', { name: /continue profile setup/i }).length).toBeGreaterThan(0);
  });
});
