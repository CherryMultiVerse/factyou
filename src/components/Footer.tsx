import React, { useState } from 'react';
import { Facebook, CheckCircle, Mail, Instagram, MessageCircle, X, Shield, FileText, Heart, Zap } from 'lucide-react';
import DonationModal from './DonationModal';

// Updated X (Twitter) icon component
const XIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// BlueSky icon component
const BlueSkyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-2.67-.296-5.568.628-6.383 3.364C.378 17.703 0 22.663 0 23.353c0 .688.139 1.86.902 2.203.659.299 1.664.621 4.3-1.24C7.954 22.314 10.913 18.375 12 16.261c1.087 2.114 4.046 6.053 6.798 7.995 2.636 1.861 3.641 1.539 4.3 1.24.763-.343.902-1.515.902-2.203 0-.69-.378-5.65-.624-6.479-.815-2.736-3.713-3.66-6.383-3.364-.139.016-.277.034-.415.056.138-.017.276-.036.415-.056 2.67.296 5.568-.628 6.383-3.364.246-.829.624-5.789.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.747 13.087 8.686 12 10.8Z"/>
  </svg>
);

// TikTok icon component
const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const shareToX = () => {
    const text = "Check out FactYou! - AI-powered fact-checking that cuts through the BS";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToThreads = () => {
    const text = "Check out FactYou! - AI-powered fact-checking that cuts through the BS";
    const url = `https://threads.net/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToBlueSky = () => {
    const text = "Check out FactYou! - AI-powered fact-checking that cuts through the BS";
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(text + ' ' + window.location.href)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToTikTok = () => {
    // TikTok doesn't have direct web sharing, so we'll open the app/website
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

  const PrivacyModal = () => (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="modal-content rounded-3xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">Privacy Policy</h3>
          </div>
          <button
            onClick={() => setShowPrivacy(false)}
            className="p-2 hover:bg-neutral-700/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20 mb-6">
            <p className="text-blue-300 font-medium">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Information We Collect</h4>
            <p className="mb-4">
              FactYou! collects minimal information to provide our fact-checking service:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Claims you submit for fact-checking (temporarily stored for analysis)</li>
              <li>Basic usage analytics (anonymized)</li>
              <li>Email addresses for newsletter subscriptions (optional)</li>
              <li>Feedback and ratings you provide (optional)</li>
            </ul>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To analyze and fact-check your submitted claims</li>
              <li>To improve our AI models and accuracy</li>
              <li>To send newsletter updates (if subscribed)</li>
              <li>To understand usage patterns and improve the service</li>
            </ul>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Data Storage & Security</h4>
            <p className="mb-4">
              We take your privacy seriously:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Claims are processed temporarily and not permanently stored</li>
              <li>We use industry-standard encryption for data transmission</li>
              <li>No personal information is shared with third parties</li>
              <li>You can request deletion of any data we have about you</li>
            </ul>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Third-Party Services</h4>
            <p className="mb-4">
              FactYou! uses the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>OpenAI API for AI analysis (subject to their privacy policy)</li>
              <li>News source APIs for content retrieval</li>
              <li>Analytics services for usage insights (anonymized)</li>
            </ul>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Your Rights</h4>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Unsubscribe from communications at any time</li>
            </ul>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Contact Us</h4>
            <p>
              For privacy-related questions or requests, contact us at{' '}
              <a href="mailto:privacy@factyou.app" className="text-blue-400 hover:text-blue-300">
                privacy@factyou.app
              </a>
            </p>
          </section>

          <div className="bg-neutral-700/30 rounded-xl p-6 border border-neutral-600/30 mt-8">
            <p className="text-sm text-gray-400">
              We may update this privacy policy from time to time. We will notify users of any 
              material changes via email or through the service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const TermsModal = () => (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="modal-content rounded-3xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">Terms of Service</h3>
          </div>
          <button
            onClick={() => setShowTerms(false)}
            className="p-2 hover:bg-neutral-700/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/20 mb-6">
            <p className="text-purple-300 font-medium">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Acceptance of Terms</h4>
            <p>
              By accessing and using FactYou!, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Service Description</h4>
            <p className="mb-4">
              FactYou! is an AI-powered fact-checking service that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Analyzes claims across multiple news sources</li>
              <li>Provides verdicts based on available evidence</li>
              <li>Offers confidence ratings and source citations</li>
              <li>Generates shareable summaries</li>
            </ul>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Acceptable Use</h4>
            <p className="mb-4">You agree to use FactYou! only for lawful purposes and in a way that does not:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Submit false, misleading, or malicious content</li>
              <li>Attempt to circumvent or abuse the service</li>
              <li>Use the service for commercial purposes without permission</li>
            </ul>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Disclaimers & Limitations</h4>
            <div className="bg-amber-500/10 rounded-xl p-6 border border-amber-500/20 mb-4">
              <p className="text-amber-300 font-medium mb-2">⚠️ Important Disclaimer</p>
              <p className="text-sm">
                FactYou! provides analysis based on available sources and AI interpretation. 
                Results should not be considered definitive and should be supplemented 
                with your own critical thinking and additional research.
              </p>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We do not guarantee the accuracy or completeness of our analysis</li>
              <li>AI systems can make errors or have biases</li>
              <li>Source availability and quality may vary</li>
              <li>The service is provided "as is" without warranties</li>
            </ul>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Intellectual Property</h4>
            <p className="mb-4">
              The FactYou! service, including its design, functionality, and content, is owned by 
              FactYou! and protected by intellectual property laws. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Copy, modify, or distribute our proprietary technology</li>
              <li>Reverse engineer or attempt to extract our algorithms</li>
              <li>Use our branding or trademarks without permission</li>
            </ul>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Privacy</h4>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand 
              how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Termination</h4>
            <p>
              We reserve the right to terminate or suspend access to our service immediately, 
              without prior notice, for any reason, including breach of these Terms.
            </p>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Changes to Terms</h4>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of 
              any material changes. Continued use of the service after changes constitutes 
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h4 className="text-xl font-semibold text-white mb-4">Contact Information</h4>
            <p>
              For questions about these Terms of Service, contact us at{' '}
              <a href="mailto:legal@factyou.app" className="text-purple-400 hover:text-purple-300">
                legal@factyou.app
              </a>
            </p>
          </section>

          <div className="bg-neutral-700/30 rounded-xl p-6 border border-neutral-600/30 mt-8">
            <p className="text-sm text-gray-400">
              By using FactYou!, you acknowledge that you have read, understood, and agree to 
              be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F!</span>
                </div>
                <span className="text-xl font-bold text-white">FactYou!</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Fight algo with algo!
              </p>
            </div>

            {/* Center: Navigation */}
            <div className="lg:text-center">
              <nav className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <a 
                    href="mailto:facts@factyou.com" 
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact</span>
                  </a>
                  <button 
                    onClick={() => setShowDonation(true)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-left"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Support</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowPrivacy(true)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-left"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Privacy</span>
                  </button>
                  <button 
                    onClick={() => setShowTerms(true)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-left"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Terms</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Right: Social & Newsletter */}
            <div className="lg:text-right">
              {/* Social Icons */}
              <div className="flex items-center justify-start lg:justify-end space-x-3 mb-6">
                <button
                  onClick={shareToX}
                  className="p-2 micro-glow rounded-lg text-gray-400 hover:text-white transition-all"
                  title="Share on X"
                >
                  <XIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={shareToBlueSky}
                  className="p-2 micro-glow rounded-lg text-gray-400 hover:text-blue-400 transition-all"
                  title="Share on BlueSky"
                >
                  <BlueSkyIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={shareToTikTok}
                  className="p-2 micro-glow rounded-lg text-gray-400 hover:text-white transition-all"
                  title="Share on TikTok"
                >
                  <TikTokIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={shareToFacebook}
                  className="p-2 micro-glow rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                  title="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={shareToThreads}
                  className="p-2 micro-glow rounded-lg text-gray-400 hover:text-white transition-all"
                  title="Share on Threads"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <a
                  href="https://instagram.com/factyou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 micro-glow rounded-lg text-gray-400 hover:text-pink-500 transition-all"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>

              {/* Newsletter Signup */}
              <div className="max-w-sm lg:ml-auto">
                <h3 className="text-white font-bold mb-2">Stay Updated</h3>
                <p className="text-gray-400 text-sm mb-4">Get the latest BS-cutting updates</p>
                
                <form onSubmit={handleSubscribe} className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="flex-1 px-3 py-2 input-field rounded-lg text-white placeholder-gray-500 text-sm"
                    disabled={subscribed}
                  />
                  <button
                    type="submit"
                    disabled={!email.trim() || subscribed}
                    className="px-4 py-2 cta-button rounded-lg text-white font-medium disabled:opacity-50 text-sm flex items-center space-x-1"
                  >
                    {subscribed ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Done!</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Subscribe</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-6 text-xs text-gray-500">
                <span>🧠 AI-Powered</span>
                <span>⚖️ Cross-Spectrum</span>
                <span>🎯 BS-Free</span>
              </div>
              
              <div className="text-xs text-gray-500">
                © 2025 FactYou!
              </div>
            </div>

            {/* Built on Bolt Badge - Hackathon Special */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <a
                    href="https://bolt.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl text-purple-300 hover:text-purple-200 transition-all duration-300 group"
                  >
                    <Zap className="w-4 h-4 group-hover:animate-pulse" />
                    <span className="text-sm font-medium">Built on Bolt</span>
                    <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                  </a>
                  <span className="text-xs text-gray-500">
                    Hackathon 2025 Entry
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 text-center sm:text-right">
                  <p>Powered by AI • Built with ❤️ • Fighting misinformation one fact at a time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showPrivacy && <PrivacyModal />}
      {showTerms && <TermsModal />}
      {showDonation && <DonationModal onClose={() => setShowDonation(false)} />}
    </>
  );
};

export default Footer;