import React, { useEffect } from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { ProductShowcaseSection } from '../components/landing/ProductShowcaseSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { PortfolioShowcaseSection } from '../components/landing/PortfolioShowcaseSection';
import { ClosingCtaSection } from '../components/landing/ClosingCtaSection';

export const HomePage: React.FC = () => {
  useEffect(() => {
    // Handle smooth scrolling for in-page anchors if present in URL
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="space-y-0 text-slate-900 bg-slate-50/50">
      {/* 1. Hero Section — The Centerpiece */}
      <HeroSection />

      {/* 2. Product Showcase Section — What Students Can Build */}
      <ProductShowcaseSection />

      {/* 3. How It Works — Three-Step Student Journey */}
      <HowItWorksSection />

      {/* 4. Portfolio Showcase — Real Engineering Projects Gallery */}
      <PortfolioShowcaseSection />

      {/* 5. Closing CTA — High-Impact Final Call to Action */}
      <ClosingCtaSection />
    </div>
  );
};
