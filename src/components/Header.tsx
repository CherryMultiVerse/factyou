import React, { useState } from 'react';
import { Scale, X, HelpCircle, User, LogIn, LogOut, UserPlus } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface HeaderProps {
  user?: any;
  onAuthRequest?: (mode: 'login' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ user, onAuthRequest }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
  };

  const HowItWorksModal = () => (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="modal-content rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white">How It Works</h3>
          <button
            onClick={() => setShowHowItWorks(false)}
            className="p-2 hover:bg-neutral-700/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p className="text-lg">
            We scrape headlines, tweets, and viral noise—then pull from a wide spectrum of credible sources 
            (left, right, center, and global) to cut through the spin and surface the facts.
          </p>
          
          <p>
            Instead of wasting your time bouncing between 10 tabs and 4 news sites, we do the homework 
            and give you the receipts.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <h4 className="font-semibold text-blue-300 mb-2">🟦 Left Sources</h4>
              <p className="text-sm text-gray-400">NPR, Guardian, Vox, MSNBC</p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <h4 className="font-semibold text-red-300 mb-2">🟥 Right Sources</h4>
              <p className="text-sm text-gray-400">Fox News, WSJ, NY Post</p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <h4 className="font-semibold text-purple-300 mb-2">⚪ Center Sources</h4>
              <p className="text-sm text-gray-400">Reuters, AP, BBC, PBS</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-300 mb-2">🌍 Global Sources</h4>
              <p className="text-sm text-gray-400">Al Jazeera, Ground News</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AboutModal = () => (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="modal-content rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white">About FactYou!</h3>
          <button
            onClick={() => setShowAbout(false)}
            className="p-2 hover:bg-neutral-700/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p className="text-lg">
            The creator of this app was tired of deciphering facts by doomscrolling a mess of biased headlines, 
            comment wars, and opinion pieces disguised as facts.
          </p>
          
          <p>
            So he built FactYou!—a no-nonsense, AI-powered BS filter that saves you time and mental bandwidth. 
            Built with intelligence and attitude.
          </p>

          <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-emerald-500/20 mb-6">
            <h4 className="font-semibold text-emerald-300 mb-3">🎯 Complete Independence</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              We are completely independent of any media outlets, political party, or corporation. 
              Just trying to support nuanced, critical thinking and save us all some time.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-red-500/10 rounded-xl p-6 border border-purple-500/20">
            <h4 className="font-semibold spectrum-text mb-3">🚀 Our Mission</h4>
            <p className="text-sm text-gray-400">
              Cut through the noise, save your sanity, and give you the facts without the spin. 
              Because life's too short to fact-check everything yourself.
            </p>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 italic">
              "In a world full of spin, we're just here to help you think."
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FactYou!</h1>
                <div className="text-xs text-gray-400 font-medium">BETA</div>
              </div>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <button 
                onClick={() => setShowHowItWorks(true)}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>How It Works</span>
              </button>
              <button 
                onClick={() => setShowAbout(true)}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>About</span>
              </button>

              {/* Auth Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="max-w-32 truncate">{user.email}</span>
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-xl border border-neutral-700 shadow-xl z-50">
                      <div className="p-3 border-b border-neutral-700">
                        <p className="text-white font-medium truncate">{user.email}</p>
                        <p className="text-gray-400 text-xs">FactYou! Supporter</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-neutral-700/50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onAuthRequest?.('login')}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => onAuthRequest?.('signup')}
                    className="flex items-center space-x-2 px-4 py-2 cta-button rounded-lg text-white font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center space-x-2">
              <button 
                onClick={() => setShowHowItWorks(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="How It Works"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowAbout(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="About"
              >
                <User className="w-5 h-5" />
              </button>
              
              {/* Mobile Auth */}
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-sm font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => onAuthRequest?.('login')}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Sign In"
                >
                  <LogIn className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile User Menu */}
        {showUserMenu && user && (
          <div className="md:hidden border-t border-white/5 bg-black/80 backdrop-blur-xl">
            <div className="px-6 py-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user.email}</p>
                  <p className="text-gray-400 text-sm">FactYou! Supporter</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Modals */}
      {showHowItWorks && <HowItWorksModal />}
      {showAbout && <AboutModal />}
    </>
  );
};

export default Header;