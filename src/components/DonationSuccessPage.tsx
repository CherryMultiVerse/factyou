import React, { useEffect, useState } from 'react';
import { CheckCircle, Heart, ArrowLeft, Copy, ExternalLink } from 'lucide-react';

interface DonationSuccessPageProps {
  onBack: () => void;
}

const DonationSuccessPage: React.FC<DonationSuccessPageProps> = ({ onBack }) => {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // In a real implementation, you might want to verify the session
      // For now, we'll just show a success message
      setSessionData({ sessionId, amount: 1.00 });
    }
    setLoading(false);
  }, []);

  const shareMessage = "I just supported FactYou! - independent fact-checking that cuts through the BS! 🚀 Help fight misinformation with AI-powered analysis across the political spectrum. #FactCheck #FactYou #TruthMatters";

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black geometric-bg constellation-bg sci-fi-lines flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300">Verifying your donation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black geometric-bg constellation-bg sci-fi-lines flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to FactYou!</span>
        </button>

        {/* Success Card */}
        <div className="card rounded-3xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Thank You! 🎉
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Your support means the world to us! You're helping keep independent fact-checking alive and fighting misinformation.
          </p>

          {/* Donation Details */}
          {sessionData && (
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/20 mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-red-400" />
                <span className="text-lg font-semibold text-white">Donation Confirmed</span>
              </div>
              <p className="text-green-300 font-medium text-lg">
                ${sessionData.amount?.toFixed(2)} contribution received!
              </p>
              <p className="text-gray-400 text-sm mt-2">
                You'll receive a confirmation email from Stripe shortly.
              </p>
            </div>
          )}

          {/* Impact Message */}
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-red-500/10 rounded-2xl p-6 border border-blue-500/20 mb-8">
            <h3 className="text-xl font-bold spectrum-text mb-4">Your Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-white font-medium">Stronger AI Analysis</p>
                  <p className="text-gray-400 text-sm">Better algorithms for more accurate fact-checking</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-white font-medium">Independent Voice</p>
                  <p className="text-gray-400 text-sm">No corporate influence, just truth</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-white font-medium">Free for Everyone</p>
                  <p className="text-gray-400 text-sm">Keeping fact-checking accessible to all</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-white font-medium">Fighting Misinformation</p>
                  <p className="text-gray-400 text-sm">Making democracy stronger, one fact at a time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Spread the Word! 📢</h3>
            <p className="text-gray-300 mb-6">
              Help us reach more people by sharing FactYou! with your network.
            </p>
            
            {/* Share Message Preview */}
            <div className="bg-neutral-800/40 rounded-xl p-4 border border-neutral-700/30 mb-6 text-left">
              <p className="text-gray-300 text-sm leading-relaxed">
                {shareMessage}
              </p>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCopyShare}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-neutral-700/50 hover:bg-neutral-700/70 rounded-xl text-white font-medium transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Message'}</span>
              </button>
              
              <button
                onClick={shareToX}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-black hover:bg-neutral-900 rounded-xl text-white font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Share on X</span>
              </button>
              
              <button
                onClick={shareToFacebook}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Share on Facebook</span>
              </button>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20 mb-8">
            <h3 className="text-lg font-bold text-white mb-2">Keep Fighting the Good Fight! 💪</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your support helps us stay independent and keep improving our fact-checking capabilities. 
              Together, we're making the internet a more truthful place.
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={onBack}
            className="px-8 py-4 cta-button rounded-2xl text-white font-semibold"
          >
            Continue Fact-Checking
          </button>

          {/* Optional Account Creation */}
          <div className="mt-8 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <p className="text-blue-300 text-sm text-center">
              💡 Want to track your donations and get updates? You can create an account anytime to see your contribution history and stay connected with our progress!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccessPage;