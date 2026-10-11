import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ExternalLink, Code2, ArrowRight, Sparkles } from 'lucide-react';

interface ShowcaseProject {
  id: string;
  title: string;
  discipline: string;
  student: string;
  institution: string;
  description: string;
  tags: string[];
  metrics: string;
  featured?: boolean;
}

export const PortfolioShowcaseSection: React.FC = () => {
  const projects: ShowcaseProject[] = [
    {
      id: 'aeroperception',
      title: 'AeroPerception: Edge AI Vision Pipeline for Autonomous Drones',
      discipline: 'Robotics & Computer Vision',
      student: 'Maya Patel',
      institution: 'Stanford University',
      description:
        'Engineered real-time obstacle detection and stereo visual odometry using custom YOLOv8 models deployed to NVIDIA Jetson Orin Nano, maintaining 62 FPS under a strict 12W thermal envelope.',
      tags: ['PyTorch', 'TensorRT', 'C++', 'ROS2', 'CUDA'],
      metrics: '62.4 FPS • 14.2ms Latency • Open Source',
      featured: true,
    },
    {
      id: 'nexusdb',
      title: 'NexusDB: Distributed Raft Consensus Key-Value Store',
      discipline: 'Systems & Distributed Computing',
      student: 'Alex Liu',
      institution: 'UC Berkeley',
      description:
        'Implemented Raft leader election and log replication with memory-mapped LSM tree storage, achieving sub-3ms p99 write latency under heavy multi-node contention.',
      tags: ['Go', 'Raft', 'gRPC', 'Docker', 'Linux'],
      metrics: '3.1ms p99 • Zero Partition Loss',
    },
    {
      id: 'pulsecare',
      title: 'PulseCare: Pediatric Patient Telemetry & Alert Portal',
      discipline: 'Full-Stack Software & HealthTech',
      student: 'Sophia Chen',
      institution: 'MIT',
      description:
        'Full-stack clinical monitoring system featuring end-to-end encrypted WebSocket telemetry feeds, audit trails, and resilient offline synchronization.',
      tags: ['TypeScript', 'React', 'PostgreSQL', 'Tailwind', 'WebSockets'],
      metrics: 'HIPAA Architecture • 99.9% Uptime',
    },
    {
      id: 'quantumopt',
      title: 'QuantumOpt: Variational Quantum Algorithms for Molecular Simulation',
      discipline: 'Quantum Computing & Math',
      student: 'David Okafor',
      institution: 'Georgia Tech',
      description:
        'Benchmarked Variational Quantum Eigensolver (VQE) approximations for lithium hydride ground-state energy simulation across noisy quantum backends.',
      tags: ['Python', 'Qiskit', 'NumPy', 'Matplotlib'],
      metrics: 'Published in Undergrad Journal',
    },
  ];

  const featured = projects.find((p) => p.featured)!;
  const regular = projects.filter((p) => !p.featured);

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>STUDENT WORK IN ACTION</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Real projects, verified architectures,{' '}
              <span className="text-teal-600">honest proof</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore how students across disciplines document their engineering and creative work. High-signal case studies with reproducible code.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors shrink-0"
          >
            <span>Explore All Projects in Directory</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Editorial Project Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Featured Large Card (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-7 sm:p-10 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            {/* Background ambient lighting */}
            <div
              className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl"
              aria-hidden="true"
            />

            <div className="space-y-4 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 bg-teal-950/80 px-3 py-1 rounded-full border border-teal-800/80">
                  <Code2 className="h-3.5 w-3.5" />
                  {featured.discipline}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {featured.institution}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                {featured.title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {featured.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800 relative z-10">
              <div className="flex flex-wrap gap-2">
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700/80 px-2.5 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-2">
                <span className="font-mono text-teal-300">{featured.metrics}</span>
                <div className="flex items-center gap-2 text-slate-300">
                  <span>Author: {featured.student}</span>
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold"
                  >
                    <span>View Case Study</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Cards Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {regular.map((proj) => (
              <div
                key={proj.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-teal-700">{proj.discipline}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{proj.institution}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {proj.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">{proj.student}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Directory Exploration Footer Callout */}
        <div className="text-center pt-2">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-2xs"
          >
            <Compass className="h-4 w-4 text-teal-600" />
            <span>Search 100+ Verified Student Portfolios</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </section>
  );
};
