import React, { useState } from 'react';
import { Share2, ThumbsUp, ThumbsDown, MessageSquare, Copy, CheckCircle, ChevronDown, ChevronUp, BarChart3, Zap, Image, Clock, Target } from 'lucide-react';
import { AnalysisResult } from '../types';
import ResultCard from './ResultCard';
import FeedbackModal from './FeedbackModal';
import SocialShareModal from './SocialShareModal';
import VisualExportModal from './VisualExportModal';

interface ResultsDisplayProps {
  results: AnalysisResult;
  onNewSearch?: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onNewSearch }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showVisualExport, setShowVisualExport] = useState(false);
  const [showDetailedSources, setShowDetailedSources] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyTweet = async () => {
    try {
      await navigator.clipboard.writeText(results.tweetableSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleNewSearchClick = () => {
    if (onNewSearch) {
      onNewSearch();
    } else {
      window.location.reload();
    }
  };

  const getOverallRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'verified': 
      case 'mostly verified': 
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
      case 'mixed': 
      case 'misleading':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'mostly false': 
      case 'false': 
        return 'text-red-300 bg-red-500/10 border-red-500/30';
      case 'satirical':
        return 'text-purple-300 bg-purple-500/10 border-purple-500/30';
      case 'error':
        return 'text-orange-300 bg-orange-500/10 border-orange-500/30';
      default: 
        return 'text-neutral-300 bg-neutral-500/10 border-neutral-500/30';
    }
  };

  const getOverallRatingEmoji = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'verified': 
      case 'mostly verified': 
        return '✅';
      case 'mixed': 
      case 'misleading':
        return '⚠️';
      case 'mostly false': 
      case 'false': 
        return '❌';
      case 'satirical':
        return '😂';
      case 'error':
        return '🔧';
      default: 
        return '🤔';
    }
  };

  // Generate concise witty commentary
  const getVerdictCommentary = () => {
    const rating = results.overallRating.toLowerCase();
    const confidence = results.confidence;
    
    const commentaries = {
      'verified': [
        `Well, well, well... someone actually told the truth. Mark your calendars.`,
        `Plot twist: this claim is actually accurate. Reality has entered the chat.`,
        `*Surprised Pikachu face* This claim checks out. Nature is healing.`
      ],
      'mostly verified': [
        `Close enough for government work. Largely accurate with some fine print.`,
        `This claim gets a B+ for accuracy. Not perfect, but we'll take it.`
      ],
      'mixed': [
        `It's complicated (shocking, I know). Reality refuses to be simple.`,
        `This claim has more layers than an onion. Context is everything.`,
        `Welcome to the gray area, where certainty goes to die.`
      ],
      'mostly false': [
        `This claim has more holes than Swiss cheese. Time to update those talking points.`,
        `Facts don't care about your feelings, as someone once said.`
      ],
      'false': [
        `Nope, nope, and more nope. Reality called, it wants its facts back.`,
        `This claim is more fictional than my dating profile.`,
        `FALSE. This claim failed the vibe check harder than a TikTok dance at a funeral.`
      ],
      'satirical': [
        `This appears to be satire. It's a joke, folks. Literally.`,
        `SATIRICAL content detected. The Onion strikes again.`
      ],
      'unverified': [
        `The evidence is playing hard to get. Some mysteries remain unsolved.`,
        `This claim is giving us "citation needed" vibes.`
      ],
      'error': [
        `Something went wrong. Even robots need coffee breaks.`,
        `Technical difficulties detected. The internet is being moody today.`
      ]
    };

    const options = commentaries[rating as keyof typeof commentaries] || commentaries['unverified'];
    let commentary = options[Math.floor(Math.random() * options.length)];

    // Add confidence context if very high or very low
    if (confidence >= 90) {
      commentary += ` We're ${confidence}% confident, which is more certain than most people are about their own names.`;
    } else if (confidence < 40) {
      commentary += ` Only ${confidence}% confidence, so take this with a grain of salt.`;
    }

    return commentary;
  };

  // Calculate source balance for spectrum bar
  const getSourceBalance = () => {
    const categories = results.results.reduce((acc, result) => {
      acc[result.category] = (acc[result.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = results.results.length;
    return {
      left: ((categories.left || 0) / total) * 100,
      center: ((categories.center || 0) / total) * 100,
      right: ((categories.right || 0) / total) * 100,
      international: ((categories.international || 0) / total) * 100,
      external: ((categories.external || 0) / total) * 100
    };
  };

  const sourceBalance = getSourceBalance();
  const verdictCommentary = getVerdictCommentary();

  // Get favicons from sources used in the analysis
  const getSourceFavicons = () => {
    return results.results.slice(0, 8).map(result => {
      let domain = '';
      
      if (result.url && result.url !== '#' && result.url.trim() !== '') {
        try {
          const url = new URL(result.url);
          domain = url.hostname.replace('www.', '');
        } catch (error) {
          domain = result.source ? result.source.toLowerCase().replace(/\s+/g, '') + '.com' : 'example.com';
        }
      } else {
        domain = result.source ? result.source.toLowerCase().replace(/\s+/g, '') + '.com' : 'example.com';
      }

      return {
        domain,
        favicon: result.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        source: result.source,
        rating: result.rating
      };
    });
  };

  const sourceFavicons = getSourceFavicons();

  // Get analysis type display info
  const getAnalysisTypeInfo = () => {
    const analysisType = (results as any).analysisType || 'standard';
    
    switch (analysisType) {
      case 'comprehensive_instant_debunk':
        return {
          badge: '⚡ Instant Debunk',
          description: 'Well-known false claim instantly debunked',
          color: 'bg-red-500/10 border-red-500/20 text-red-300'
        };
      case 'comprehensive_real_time':
        return {
          badge: '🚀 Live Analysis',
          description: 'Real-time comprehensive fact-checking',
          color: 'bg-blue-500/10 border-blue-500/20 text-blue-300'
        };
      case 'comprehensive_cross_spectrum_fallback':
        return {
          badge: '🌐 Cross-Spectrum',
          description: 'Comprehensive cross-spectrum analysis',
          color: 'bg-purple-500/10 border-purple-500/20 text-purple-300'
        };
      default:
        return {
          badge: '🔍 Standard',
          description: 'Standard fact-checking analysis',
          color: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-300'
        };
    }
  };

  const analysisInfo = getAnalysisTypeInfo();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* UNIFIED Main Verdict & Shareable Card */}
      <div className="card rounded-3xl p-8 md:p-12 mb-12 text-center spectrum-glow">
        {/* Header with Verdict */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <span className="text-4xl">{getOverallRatingEmoji(results.overallRating)}</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">The Verdict</h2>
          <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>
        
        {/* Claim Display */}
        <div className="bg-neutral-800/30 rounded-2xl p-4 md:p-6 border border-neutral-700/30 mb-8">
          <p className="text-neutral-200 font-light text-lg md:text-xl leading-relaxed">"{results.claim}"</p>
        </div>
        
        {/* Verdict Badge */}
        <div className={`inline-block px-6 md:px-8 py-3 md:py-4 rounded-2xl text-xl md:text-2xl font-bold border ${getOverallRatingColor(results.overallRating)} shadow-lg mb-6`}>
          {results.overallRating}
        </div>

        {/* Analysis Type Badge */}
        <div className="mb-6">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border ${analysisInfo.color}`}>
            <span className="text-sm font-medium">{analysisInfo.badge}</span>
            <span className="text-xs opacity-75">{analysisInfo.description}</span>
          </div>
        </div>

        {/* INTEGRATED Sarcastic Commentary - Now Part of Shareable Content */}
        <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-red-500/10 rounded-2xl p-6 border border-purple-500/20 mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-lg font-bold spectrum-text">FactYou! Analysis</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-white text-base md:text-lg leading-relaxed font-medium italic mb-4">
            "{verdictCommentary}"
          </p>
          
          {/* Stats Row - Part of Shareable Content */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-300 mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Confidence: <span className="text-white font-medium">{results.confidence}%</span></span>
            </div>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Sources: <span className="text-white font-medium">{results.results.length}</span></span>
            </div>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Time: <span className="text-white font-medium">{results.analysisTime}s</span></span>
            </div>
          </div>

          {/* Source Balance Bar - Part of Shareable Content */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>🟦 Left</span>
              <span>Cross-Spectrum Analysis</span>
              <span>🟥 Right</span>
            </div>
            
            <div className="h-3 bg-neutral-700/30 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 rounded-full">
                <div className="h-full w-full bg-gradient-to-r from-blue-500/80 via-purple-500/80 via-emerald-500/80 via-amber-500/80 to-red-500/80 rounded-full"></div>
              </div>
              
              <div className="absolute inset-0 flex rounded-full overflow-hidden">
                {sourceBalance.left > 0 && (
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600/90 to-blue-500/70 transition-all duration-1000"
                    style={{ width: `${sourceBalance.left}%` }}
                  ></div>
                )}
                
                {sourceBalance.center > 0 && (
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600/90 to-purple-500/70 transition-all duration-1000"
                    style={{ width: `${sourceBalance.center}%` }}
                  ></div>
                )}
                
                {sourceBalance.international > 0 && (
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600/90 to-emerald-500/70 transition-all duration-1000"
                    style={{ width: `${sourceBalance.international}%` }}
                  ></div>
                )}
                
                {sourceBalance.external > 0 && (
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600/90 to-amber-500/70 transition-all duration-1000"
                    style={{ width: `${sourceBalance.external}%` }}
                  ></div>
                )}
                
                {sourceBalance.right > 0 && (
                  <div 
                    className="h-full bg-gradient-to-r from-red-600/90 to-red-500/70 transition-all duration-1000"
                    style={{ width: `${sourceBalance.right}%` }}
                  ></div>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{Math.round(sourceBalance.left)}%</span>
              <span>⚪ {Math.round(sourceBalance.center)}%</span>
              <span>🌍 {Math.round(sourceBalance.international)}%</span>
              <span>🔍 {Math.round(sourceBalance.external)}%</span>
              <span>{Math.round(sourceBalance.right)}%</span>
            </div>
          </div>

          {/* Source Icons - Part of Shareable Content */}
          {sourceFavicons.length > 0 && (
            <div className="flex items-center justify-center space-x-2 flex-wrap mb-4">
              <span className="text-sm text-gray-400">Sources analyzed:</span>
              {sourceFavicons.map((source, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={source.favicon}
                    alt={source.source}
                    className="w-6 h-6 rounded opacity-75 hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {source.source}
                  </div>
                </div>
              ))}
              {results.results.length > 8 && (
                <span className="text-sm text-gray-400">+{results.results.length - 8} more</span>
              )}
            </div>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            ✨ Independent fact-checking with maximum attitude and minimum BS
          </p>
        </div>

        {/* Share Actions - Now for the Complete Package */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-4">
            <button
              onClick={handleCopyTweet}
              className="flex items-center justify-center space-x-2 px-6 py-3 micro-glow rounded-xl text-gray-300 font-medium mobile-button-fix"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            
            <button
              onClick={() => setShowVisualExport(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium mobile-button-fix transition-all"
            >
              <Image className="w-4 h-4" />
              <span>Create Visual</span>
            </button>
            
            <button
              onClick={() => setShowSocialShare(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 cta-button rounded-xl text-white font-medium mobile-button-fix"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Everywhere</span>
            </button>
          </div>
        </div>

        {/* Feedback Actions */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-4">
          <button 
            className="w-full md:w-auto p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-xl transition-colors border border-emerald-500/20"
            title="Helpful"
          >
            <div className="flex items-center justify-center space-x-2">
              <ThumbsUp className="w-5 h-5" />
              <span className="md:hidden">Helpful</span>
            </div>
          </button>
          <button 
            className="w-full md:w-auto p-3 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl transition-colors border border-red-500/20"
            title="Not Helpful"
          >
            <div className="flex items-center justify-center space-x-2">
              <ThumbsDown className="w-5 h-5" />
              <span className="md:hidden">Not Helpful</span>
            </div>
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            className="w-full md:w-auto p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl transition-colors border border-purple-500/20"
            title="Feedback"
          >
            <div className="flex items-center justify-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span className="md:hidden">Feedback</span>
            </div>
          </button>
        </div>
      </div>

      {/* Detailed Sources Section */}
      {results.results.length > 0 && (
        <div className="mb-12">
          <button
            onClick={() => setShowDetailedSources(!showDetailedSources)}
            className="w-full flex items-center justify-between p-4 card rounded-2xl mb-6 hover:bg-neutral-800/60 transition-colors"
          >
            <h3 className="text-lg md:text-xl font-bold text-white">
              Detailed Source Analysis ({results.results.length} sources)
            </h3>
            {showDetailedSources ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {showDetailedSources && (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
              {results.results.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Results Fallback */}
      {results.results.length === 0 && (
        <div className="card rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-300 mb-6">No Sources Found</h3>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed">
            Our comprehensive analysis couldn't find coverage from trusted news sources. 
            This could mean the claim is too new, too niche, or doesn't meet journalistic standards.
          </p>
        </div>
      )}

      {/* CTA Section */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-red-500/10 rounded-2xl p-6 md:p-8 border border-purple-500/20">
          <h3 className="text-xl md:text-2xl font-bold spectrum-text mb-4">🎯 Comprehensive Analysis Complete</h3>
          <p className="text-gray-300 mb-6 text-sm md:text-base">
            Cross-spectrum analysis complete. Truth served with a side of attitude and maximum credibility.
          </p>
          <button
            onClick={handleNewSearchClick}
            className="px-6 md:px-8 py-3 md:py-4 cta-button rounded-2xl text-white font-semibold mobile-button-fix"
          >
            Analyze Another Claim
          </button>
        </div>
      </div>

      {/* Modals */}
      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          onSubmit={(feedback) => {
            console.log('Feedback submitted:', feedback);
            setShowFeedback(false);
          }}
        />
      )}

      {showSocialShare && (
        <SocialShareModal
          onClose={() => setShowSocialShare(false)}
          verdict={results.overallRating}
          claim={results.claim}
          confidence={results.confidence}
          tweetableSummary={results.tweetableSummary}
        />
      )}

      {showVisualExport && (
        <VisualExportModal
          onClose={() => setShowVisualExport(false)}
          verdict={results.overallRating}
          claim={results.claim}
          confidence={results.confidence}
        />
      )}
    </div>
  );
};

export default ResultsDisplay;