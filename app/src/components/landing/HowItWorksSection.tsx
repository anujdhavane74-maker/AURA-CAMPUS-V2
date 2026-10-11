import React from 'react';
import { User, Code2, Globe, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export const HowItWorksSection: React.FC = () => {
  const { user } = useAuth();

  const steps = [
    {
      number: '01',
      title: 'Create your identity',
      subtitle: 'Build a profile that introduces who you are and what you are learning.',
      description:
        'Add your institution, degree program, bio, and interests. First-year student? No prior internships required—focus on your coursework, student clubs, and self-directed learning goals.',
      icon: User,
      color: 'teal',
      visualPreview: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
              ST
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Student Identity</span>
              <span className="text-[11px] text-slate-500">University &bull; B.S. CS &apos;27</span>
            </div>
          </div>
          <div className="rounded-lg bg-teal-50/70 border border-teal-100 p-2 text-[11px] text-teal-800 font-medium">
            &bull; Coursework &bull; Lab Projects &bull; Self-Taught
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: 'Showcase your work',
      subtitle: 'Document projects, skills, achievements and evidence of your progress.',
      description:
        'Transform repositories into structured engineering case studies. Describe the problem, approach, tech stack, and verifiable deployment outcomes. Connect real skills to real code.',
      icon: Code2,
      color: 'sky',
      visualPreview: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Project Case Study</span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Autonomous Drone Perception with YOLOv8 &amp; TensorRT
          </p>
          <div className="flex flex-wrap gap-1">
            {['PyTorch', 'ROS2', 'C++'].map((t) => (
              <span
                key={t}
                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: 'Share your growth',
      subtitle: 'Publish eligible public content and let others explore your work.',
      description:
        'Keep drafts private until you are confident. Generate revocable high-entropy share links for specific job applications, or publish publicly to the Aura Campus directory for discovery.',
      icon: Globe,
      color: 'emerald',
      visualPreview: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Sharing &amp; Privacy</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <ShieldCheck className="h-3 w-3" />
              RLS Active
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-[10px] font-mono text-slate-600 truncate">
            auracampus.org/s/tok_student_proof
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span>Revocable token</span>
            <span className="text-emerald-700 font-semibold">1-Click Toggle</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50/70 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              HOW IT WORKS
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            From first semester project to{' '}
            <span className="text-teal-600">career breakthrough</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            A simple three-step journey designed to build real credibility, no matter what year you are in.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                {/* Step header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-3xl sm:text-4xl text-teal-600/30">
                      {step.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Visual Preview */}
                <div className="pt-2">{step.visualPreview}</div>

                {/* Step footer indicator */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Step {idx + 1} of 3</span>
                  <div className="flex items-center gap-1 text-teal-700 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Included in Free Tier</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA trigger */}
        <div className="text-center pt-4">
          <Link
            to={user ? '/app/onboarding' : '/auth/sign-up'}
            className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-teal-700 transition-colors"
          >
            <span>{user ? 'Resume Profile Setup' : 'Start Your Journey Free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
