import React, { useState } from 'react';
import { X, Facebook, Instagram, MessageCircle, Copy, CheckCircle, ExternalLink, Music } from 'lucide-react';

// Updated X (Twitter) icon component
const XIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// BlueSky icon component
const BlueSkyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-2.67-.296-5.568.628-6.383 3.364C.378 17.703 0 22.663 0 23.353c0 .688.139 1.86.902 2.203.659.299 1.664.621 4.3-1.24C7.954 22.314 10.913 18.375 12 16.261c1.087 2.114 4.046 6.053 6.798 7.995 2.636 1.861 3.641 1.539 4.3 1.24.763-.343.902-1.515.902-2.203 0-.69-.378-5.65-.624-6.479-.815-2.736-3.713-3.66-6.383-3.364-.139.016-.277.034-.415.056.138-.017.276-.036.415-.056 2.67.296 5.568-.628 6.383-3.364.246-.829.624-5.789.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.747 13.087 8.686 12 10.8Z"/>
  </svg>
);

// TikTok icon component
const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface SocialShareModalProps {
  onClose: () => void;
  verdict: string;
  claim: string;
  confidence: number;
  tweetableSummary: string;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({ 
  onClose, 
  verdict, 
  claim, 
  confidence, 
  tweetableSummary 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getVerdictEmoji = (verdict: string) => {
    switch (verdict.toUpperCase()) {
      case 'VERIFIED': return '✅';
      case 'MOSTLY VERIFIED': return '✅';
      case 'FALSE': return '❌';
      case 'MOSTLY FALSE': return '❌';
      case 'MIXED': 
      case 'MISLEADING': return '⚠️';
      case 'UNVERIFIED': return '🤔';
      case 'SATIRICAL': return '😂';
      default: return '🔍';
    }
  };

  // Generate a shareable link (in production, this would create a unique verdict page)
  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const verdictId = btoa(claim.substring(0, 50)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    return `${baseUrl}/verdict/${verdictId}`;
  };

  const shareableLink = generateShareableLink();
  const poweredByText = 'Fact-checked by FactYou! - Cut through the BS';

  const generateContent = (platform: string) => {
    const emoji = getVerdictEmoji(verdict);
    const shortClaim = claim.length > 50 ? claim.substring(0, 47) + '...' : claim;
    
    switch (platform) {
      case 'x':
        return `${emoji} FACT-CHECKED: "${shortClaim}" - ${verdict.toUpperCase()} (${confidence}% confidence)\n\n${tweetableSummary}\n\n${poweredByText}: ${shareableLink}\n\n#FactCheck #FactYou`;
      
      case 'bluesky':
        return `${emoji} FACT-CHECKED: "${shortClaim}" - ${verdict.toUpperCase()} (${confidence}% confidence)\n\n${tweetableSummary}\n\n${poweredByText}: ${shareableLink}\n\n#FactCheck #FactYou`;
      
      case 'facebook':
        return `${emoji} FACT-CHECK RESULTS ${emoji}\n\nClaim: "${claim}"\n\nVerdict: ${verdict.toUpperCase()}\nConfidence: ${confidence}%\n\nAnalysis: ${tweetableSummary}\n\n${poweredByText}: ${shareableLink}\n\n#FactCheck #FactYou`;
      
      case 'instagram':
        return `${emoji} FACT-CHECKED ${emoji}\n\n"${shortClaim}"\n\n${verdict.toUpperCase()} (${confidence}% confidence)\n\n${tweetableSummary}\n\n${poweredByText}:\n${shareableLink}\n\n#FactCheck #FactYou #TruthMatters #MediaLiteracy #CriticalThinking`;
      
      case 'threads':
        return `${emoji} "${shortClaim}" - ${verdict.toUpperCase()}\n\nConfidence: ${confidence}%\n\n${tweetableSummary}\n\n${poweredByText}: ${shareableLink}\n\n#FactCheck #FactYou`;
      
      case 'tiktok':
        // TikTok-optimized content (shorter, more engaging)
        const tiktokClaim = claim.length > 40 ? claim.substring(0, 37) + '...' : claim;
        return `${emoji} FACT-CHECK: "${tiktokClaim}"\n\nVERDICT: ${verdict.toUpperCase()}\nCONFIDENCE: ${confidence}%\n\n${poweredByText}\n\n#FactCheck #FactYou #TruthMatters #MediaLiteracy #CriticalThinking #FactsMatter #CutThroughTheBS #AIFactCheck #TikTokMadeMeDoIt #LearnOnTikTok`;
      
      default:
        return `${tweetableSummary}\n\n${poweredByText}: ${shareableLink}`;
    }
  };

  const shareToX = () => {
    const content = generateContent('x');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToBlueSky = () => {
    const content = generateContent('bluesky');
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(content)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const content = generateContent('facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}&quote=${encodeURIComponent(content)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToThreads = () => {
    const content = generateContent('threads');
    const url = `https://threads.net/intent/post?text=${encodeURIComponent(content)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const copyForInstagram = () => {
    const content = generateContent('instagram');
    handleCopy(content);
  };

  const copyForTikTok = () => {
    const content = generateContent('tiktok');
    handleCopy(content);
  };

  const openTikTokApp = () => {
    // Try to open TikTok app on mobile
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    
    if (isMobile) {
      // Try to open TikTok app
      window.location.href = 'tiktok://';
      
      // Fallback to TikTok website after a delay
      setTimeout(() => {
        window.open('https://www.tiktok.com/', '_blank');
      }, 1000);
    } else {
      // On desktop, just open TikTok website
      window.open('https://www.tiktok.com/', '_blank');
    }
  };

  const platforms = [
    {
      name: 'X',
      icon: <XIcon className="w-6 h-6" />,
      color: 'bg-black hover:bg-neutral-900',
      action: shareToX,
      description: 'Share as a post'
    },
    {
      name: 'TikTok',
      icon: <TikTokIcon className="w-6 h-6" />,
      color: 'bg-black hover:bg-neutral-900',
      action: copyForTikTok,
      description: 'Copy for TikTok video',
      special: true
    },
    {
      name: 'BlueSky',
      icon: <BlueSkyIcon className="w-6 h-6" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: shareToBlueSky,
      description: 'Share to BlueSky'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: shareToFacebook,
      description: 'Share to timeline'
    },
    {
      name: 'Threads',
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'bg-neutral-700 hover:bg-neutral-800',
      action: shareToThreads,
      description: 'Share to Threads'
    },
    {
      name: 'Instagram',
      icon: <Instagram className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      action: copyForInstagram,
      description: 'Copy for Instagram'
    }
  ];

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="modal-content rounded-3xl shadow-2xl max-w-lg w-full p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white">Share Verdict</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Verdict Summary */}
        <div className="mb-8 p-6 bg-neutral-700/30 rounded-2xl border border-neutral-600/30">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">{getVerdictEmoji(verdict)}</span>
            <div className="text-lg font-bold text-white">
              {verdict.toUpperCase()}
            </div>
            <span className="text-gray-300">({confidence}%)</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {tweetableSummary}
          </p>
        </div>

        {/* Shareable Link Preview */}
        <div className="mb-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <ExternalLink className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-medium text-sm">Shareable Verdict Link</span>
          </div>
          <p className="text-xs text-gray-400 font-mono break-all">{shareableLink}</p>
          <p className="text-xs text-gray-500 mt-2">
            This link will show the full analysis with sources (coming soon!)
          </p>
        </div>

        {/* Platform Options */}
        <div className="space-y-3 mb-8">
          {platforms.map((platform, index) => (
            <button
              key={index}
              onClick={platform.action}
              className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border border-neutral-600/30 hover:border-neutral-500/50 bg-neutral-700/20 hover:bg-neutral-700/40"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl text-white ${platform.color} shadow-lg`}>
                  {platform.icon}
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold flex items-center space-x-2">
                    <span>{platform.name}</span>
                    {platform.special && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                        HOT
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">{platform.description}</div>
                </div>
              </div>
              {platform.name === 'TikTok' ? (
                <Copy className="w-5 h-5 text-gray-400" />
              ) : (
                <ExternalLink className="w-5 h-5 text-gray-400" />
              )}
            </button>
          ))}
        </div>

        {/* TikTok Special Section */}
        <div className="mb-8 bg-gradient-to-r from-black/20 to-neutral-800/20 rounded-2xl p-6 border border-neutral-600/30">
          <div className="flex items-center space-x-3 mb-4">
            <TikTokIcon className="w-6 h-6 text-white" />
            <h4 className="text-lg font-bold text-white">TikTok Video Ideas</h4>
            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
              VIRAL POTENTIAL
            </span>
          </div>
          
          <div className="space-y-3 text-sm text-gray-300">
            <div className="bg-neutral-800/40 rounded-lg p-3 border border-neutral-700/30">
              <p className="font-medium text-white mb-1">📱 "Fact-Check This Claim" Video</p>
              <p>Show the claim, reveal the verdict with dramatic effect, explain why it matters</p>
            </div>
            
            <div className="bg-neutral-800/40 rounded-lg p-3 border border-neutral-700/30">
              <p className="font-medium text-white mb-1">🎭 "Plot Twist" Format</p>
              <p>"You think [claim] is true? Plot twist..." then reveal the fact-check results</p>
            </div>
            
            <div className="bg-neutral-800/40 rounded-lg p-3 border border-neutral-700/30">
              <p className="font-medium text-white mb-1">🔥 "This You?" Challenge</p>
              <p>Call out misinformation spreaders with receipts from your fact-check</p>
            </div>
          </div>

          <button
            onClick={openTikTokApp}
            className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-black hover:bg-neutral-900 rounded-xl text-white font-medium transition-colors"
          >
            <Music className="w-4 h-4" />
            <span>Open TikTok App</span>
          </button>
        </div>

        {/* Quick Copy */}
        <button
          onClick={() => handleCopy(generateContent('default'))}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl transition-colors border border-purple-500/30"
        >
          {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          <span>{copied ? 'Copied!' : 'Copy Generic Text'}</span>
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Share the truth, cut through the BS. Fight algo with algo! 🚀
        </p>
      </div>
    </div>
  );
};

export default SocialShareModal;