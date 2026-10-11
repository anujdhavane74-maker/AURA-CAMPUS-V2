import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Loader2, Globe } from 'lucide-react';
import { portfolioService } from '../services/portfolio';
import { Portfolio, Project, UserProfile } from '../types';
import { PortfolioThemeRenderer } from '../components/portfolio/PortfolioThemeRenderer';

export const PortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState<{
    portfolio: Portfolio;
    projects: Project[];
    owner: UserProfile | null;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPortfolio() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);

      const res = await portfolioService.getPublicPortfolioBySlug(slug);

      if (!isMounted) return;

      if (res.error || !res.data) {
        setNotFound(true);
        setPortfolioData(null);
      } else {
        setPortfolioData(res.data);
        setNotFound(false);
      }
      setLoading(false);
    }

    loadPortfolio();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-3 bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold text-slate-500">Loading student portfolio...</p>
      </div>
    );
  }

  if (notFound || !portfolioData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-6 bg-slate-50">
        <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Lock className="h-8 w-8" />
        </div>
        <div className="text-center space-y-1.5 max-w-md">
          <h1 className="text-xl font-bold text-slate-900">Portfolio Private or Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            This portfolio is either in private draft mode or does not exist. Only published portfolios are accessible via public canonical routes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Discover Portfolios</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PortfolioThemeRenderer
      themeId={portfolioData.portfolio.theme}
      portfolio={portfolioData.portfolio}
      profile={portfolioData.owner}
      projects={portfolioData.projects}
      isPreview={false}
    />
  );
};
