import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import UnifiedInput from './components/UnifiedInput';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsDisplay from './components/ResultsDisplay';
import Footer from './components/Footer';
import AuthModal from './components/auth/AuthModal';
import DonationSuccessPage from './components/DonationSuccessPage';
import UserSubscriptionDisplay from './components/UserSubscriptionDisplay';
import { AnalysisResult } from './types';
import { FactCheckAPI } from './services/api';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentClaim, setCurrentClaim] = useState('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<any>(null);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);

  // Check for donation success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('donation_success') === 'true' || urlParams.get('session_id')) {
      setShowDonationSuccess(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Auth state management
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowAuth(false); // Close auth modal when user signs in
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleClaimSubmit = async (claim: string, inputType?: string, metadata?: any) => {
    setIsLoading(true);
    setCurrentClaim(claim);
    setResults(null);
    setError(null);

    try {
      console.log('🎯 Submitting for analysis:', { claim, inputType, metadata });
      const result = await FactCheckAPI.analyzeClaim(claim);
      console.log('✅ Analysis complete:', result);
      setResults(result);
    } catch (err) {
      console.error('💥 Analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Our system is having a coffee break.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setResults(null);
    setCurrentClaim('');
    setError(null);
    setShowDonationSuccess(false);
  };

  const handleAuthRequest = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  // Show donation success page
  if (showDonationSuccess) {
    return <DonationSuccessPage onBack={handleNewSearch} />;
  }

  return (
    <div className="min-h-screen bg-black geometric-bg constellation-bg sci-fi-lines">
      <Header user={user} onAuthRequest={handleAuthRequest} />
      
      <main className="relative z-10">
        {/* User Subscription Display - Only show if user is logged in */}
        {user && (
          <div className="max-w-4xl mx-auto px-6 pt-6">
            <UserSubscriptionDisplay user={user} />
          </div>
        )}

        {!isLoading && !results && !error && (
          <div className="py-20">
            <UnifiedInput onSubmit={handleClaimSubmit} isLoading={isLoading} />
          </div>
        )}
        
        {isLoading && (
          <LoadingSpinner claim={currentClaim} />
        )}
        
        {error && (
          <div className="max-w-3xl mx-auto px-6 py-20">
            <div className="card rounded-3xl p-8 md:p-12 text-center border-red-500/20">
              <h3 className="text-2xl font-bold text-red-400 mb-6">Connection Issue</h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">{error}</p>
              <p className="text-gray-500 mb-8 text-sm">
                This could be a temporary network issue or server maintenance. Please try again in a moment.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                  onClick={handleNewSearch}
                  className="px-8 py-4 cta-button rounded-2xl text-white font-semibold"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 micro-glow rounded-2xl text-gray-300 font-semibold"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )}
        
        {results && !isLoading && (
          <ResultsDisplay results={results} onNewSearch={handleNewSearch} />
        )}
      </main>
      
      <Footer />

      {/* Auth Modal - Optional for users who want to track donations */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          initialMode={authMode}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;