import React from 'react';
import { ExternalLink, Shield, AlertTriangle, CheckCircle, XCircle, HelpCircle, Search, Users, Building, Flag, Globe } from 'lucide-react';
import { FactCheckResult } from '../types';

interface ResultCardProps {
  result: FactCheckResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'left': return 'from-blue-500 to-blue-600';
      case 'center': return 'from-purple-500 to-purple-600';
      case 'right': return 'from-red-500 to-red-600';
      case 'international': return 'from-emerald-500 to-emerald-600';
      case 'external': return 'from-amber-500 to-amber-600';
      default: return 'from-neutral-500 to-neutral-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'left': return <Users className="w-3 h-3" />;
      case 'center': return <Building className="w-3 h-3" />;
      case 'right': return <Flag className="w-3 h-3" />;
      case 'international': return <Globe className="w-3 h-3" />;
      case 'external': return <Search className="w-3 h-3" />;
      default: return <HelpCircle className="w-3 h-3" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'left': return '🟦 Left';
      case 'center': return '⚪ Center';
      case 'right': return '🟥 Right';
      case 'international': return '🌍 Global';
      case 'external': return '🔍 Fact Check';
      default: return category;
    }
  };

  const getCategoryHoverClass = (category: string) => {
    switch (category) {
      case 'left': return 'spectrum-hover-left';
      case 'center': return 'spectrum-hover-center';
      case 'right': return 'spectrum-hover-right';
      case 'international': return 'spectrum-hover-international';
      case 'external': return 'hover:bg-amber-500/20';
      default: return '';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'true':
      case 'mostly-true':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'false':
      case 'mostly-false':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'mixed':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'unverified':
        return <HelpCircle className="w-4 h-4 text-neutral-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'true': return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
      case 'mostly-true': return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
      case 'mixed': return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'mostly-false': return 'text-red-300 bg-red-500/10 border-red-500/20';
      case 'false': return 'text-red-300 bg-red-500/10 border-red-500/20';
      case 'unverified': return 'text-neutral-300 bg-neutral-500/10 border-neutral-500/20';
      default: return 'text-neutral-300 bg-neutral-500/10 border-neutral-500/20';
    }
  };

  const isSearchUrl = (url: string) => {
    return url.includes('/search') || url.includes('?q=') || url.includes('?query=') || url.includes('?s=');
  };

  const getLinkText = () => {
    if (result.rating === 'unverified' || isSearchUrl(result.url) || result.url === '#') {
      return 'Search this source';
    }
    return 'Read full article';
  };

  const getLinkIcon = () => {
    if (result.rating === 'unverified' || isSearchUrl(result.url) || result.url === '#') {
      return <Search className="w-3 h-3" />;
    }
    return <ExternalLink className="w-3 h-3" />;
  };

  return (
    <div className="bg-neutral-800/40 backdrop-blur-xl rounded-2xl border border-neutral-700/30 overflow-hidden hover:bg-neutral-800/60 hover:border-neutral-600/40 transition-all duration-300 shadow-xl spectrum-glow">
      <div className={`h-1 bg-gradient-to-r ${getCategoryColor(result.category)}`}></div>
      
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {result.favicon && (
              <div className="w-6 h-6 flex-shrink-0 rounded-sm overflow-hidden bg-neutral-700/30 flex items-center justify-center border border-neutral-600/30">
                <img 
                  src={result.favicon} 
                  alt={`${result.source} favicon`}
                  className="w-4 h-4 object-contain filter brightness-90"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    // Show fallback icon with spectrum colors
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '🌐';
                      parent.className = 'w-6 h-6 flex-shrink-0 rounded-sm bg-neutral-700/30 border border-neutral-600/30 flex items-center justify-center text-xs text-neutral-400';
                    }
                  }}
                />
              </div>
            )}
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(result.category)} shadow-lg whitespace-nowrap flex items-center space-x-1 ${getCategoryHoverClass(result.category)} transition-all duration-200`}>
              {getCategoryIcon(result.category)}
              <span>{getCategoryLabel(result.category)}</span>
            </div>
            <h3 className="font-semibold text-white text-base md:text-lg truncate">{result.source}</h3>
          </div>
          <div className="flex items-center space-x-2 bg-neutral-700/30 rounded-full px-3 py-1.5 flex-shrink-0 border border-neutral-600/30 spectrum-glow">
            <Shield className="w-3 h-3 text-neutral-400" />
            <span className="text-xs text-neutral-300 font-medium">{result.credibilityScore}%</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-6">
          {getRatingIcon(result.rating)}
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getRatingColor(result.rating)}`}>
            {result.rating.toUpperCase().replace('-', ' ')}
          </span>
        </div>

        <p className="text-neutral-300 mb-6 leading-relaxed font-light text-sm md:text-base line-clamp-3">
          {result.summary}
        </p>

        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 spectrum-text hover:opacity-80 font-medium transition-all duration-200 text-sm"
        >
          <span>{getLinkText()}</span>
          {getLinkIcon()}
        </a>
      </div>
    </div>
  );
};

export default ResultCard;