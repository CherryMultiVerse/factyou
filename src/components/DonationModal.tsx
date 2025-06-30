import React, { useState } from 'react';
import { X, Heart, Coffee, Zap, Shield, CreditCard, DollarSign, Loader2, Star } from 'lucide-react';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface DonationModalProps {
  onClose: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDonation = async (product: typeof STRIPE_PRODUCTS[0], customPrice?: number) => {
    console.log('🎯 Starting donation process for:', product.name);
    
    setIsProcessing(true);
    setSelectedProduct(product.id);
    setError(null);

    // Set a timeout to prevent infinite processing
    const timeoutId = setTimeout(() => {
      console.error('❌ Donation request timed out');
      setError('Request timed out. Please try again.');
      setIsProcessing(false);
      setSelectedProduct(null);
    }, 30000); // 30 second timeout

    try {
      const priceId = product.priceId;
      
      if (product.id === 'prod_custom' && !customPrice) {
        setError('Please enter a valid amount');
        setIsProcessing(false);
        setSelectedProduct(null);
        clearTimeout(timeoutId);
        return;
      }

      console.log('🎯 Creating checkout session for:', {
        productId: product.id,
        priceId,
        mode: product.mode,
        customPrice
      });

      // Determine the correct base URL
      const baseUrl = import.meta.env.DEV 
        ? 'http://localhost:3001' 
        : window.location.origin;

      console.log('📡 Using base URL:', baseUrl);

      // First, test if the server is reachable
      try {
        console.log('🔍 Testing server connectivity...');
        const healthResponse = await fetch(`${baseUrl}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (!healthResponse.ok) {
          throw new Error('Server health check failed');
        }
        
        const healthData = await healthResponse.json();
        console.log('✅ Server is reachable:', healthData);
        
        if (!healthData.apis?.stripe) {
          throw new Error('Stripe is not configured on the server');
        }
      } catch (healthError) {
        console.error('❌ Server connectivity test failed:', healthError);
        throw new Error('Cannot connect to payment server. Please try again.');
      }

      // Test Stripe configuration
      try {
        console.log('🔍 Testing Stripe configuration...');
        const stripeTestResponse = await fetch(`${baseUrl}/api/stripe/test`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (stripeTestResponse.ok) {
          const stripeTestData = await stripeTestResponse.json();
          console.log('✅ Stripe configuration:', stripeTestData);
          
          if (!stripeTestData.stripe_configured) {
            throw new Error('Payment system is not configured');
          }
        }
      } catch (stripeTestError) {
        console.warn('⚠️ Stripe test failed:', stripeTestError);
        // Continue anyway, might still work
      }

      // Make the actual checkout request
      console.log('🚀 Creating checkout session...');
      const response = await fetch(`${baseUrl}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          mode: product.mode,
          success_url: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}&donation_success=true`,
          cancel_url: `${window.location.origin}?donation_cancelled=true`
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout for checkout creation
      });

      console.log('📡 Checkout response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Checkout response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorMessage = 'Failed to create checkout session';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Checkout session created:', responseData);

      const { url } = responseData;

      if (url) {
        console.log('🚀 Redirecting to Stripe checkout:', url);
        clearTimeout(timeoutId);
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('💥 Donation error:', error);
      
      // More user-friendly error messages
      let userMessage = 'Something went wrong with the donation process.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          userMessage = 'Unable to connect to payment service. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
          userMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('Stripe not configured') || error.message.includes('Payment system')) {
          userMessage = 'Payment system is not configured. Please contact support.';
        } else if (error.message.includes('AbortError')) {
          userMessage = 'Request was cancelled. Please try again.';
        } else {
          userMessage = error.message;
        }
      }
      
      setError(userMessage);
      setIsProcessing(false);
      setSelectedProduct(null);
    }
  };

  const handleCustomDonation = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 1) {
      setError('Please enter a valid amount of $1.00 or more');
      return;
    }
    
    const customProduct = STRIPE_PRODUCTS.find(p => p.id === 'prod_custom');
    if (customProduct) {
      handleDonation(customProduct, amount);
    }
  };

  // Filter out custom product for the grid
  const regularProducts = STRIPE_PRODUCTS.filter(p => p.id !== 'prod_custom');

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="modal-content rounded-3xl shadow-2xl max-w-4xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-red-400" />
            <h3 className="text-xl md:text-2xl font-bold text-white">Support FactYou!</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center space-x-2">
              <X className="w-4 h-4 text-red-400" />
              <p className="text-red-300 text-sm font-medium">Payment Error</p>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-xs mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-6 md:p-8 border border-red-500/20 mb-6">
            <h4 className="text-xl md:text-2xl font-bold text-white mb-4">We're Indie AF! 🚀</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              No corporate sponsors. No political parties. No agenda except cutting through the BS.
            </p>
            <p className="text-lg font-medium spectrum-text">
              Help us fight algo with algo!
            </p>
          </div>
        </div>

        {/* Donation Tiers Grid - Responsive */}
        <div className="mb-6 md:mb-8">
          <h4 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 text-center">Choose Your Support Level</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {regularProducts.map((product) => (
              <div
                key={product.id}
                className={`relative bg-gradient-to-br rounded-2xl p-4 md:p-6 border transition-all duration-300 hover:scale-105 ${
                  product.popular
                    ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30 ring-2 ring-purple-500/20'
                    : 'from-blue-500/10 to-purple-500/10 border-blue-500/20'
                }`}
              >
                {/* Popular Badge */}
                {product.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>POPULAR</span>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  {/* Emoji */}
                  <div className="text-3xl md:text-4xl mb-3">{product.emoji}</div>
                  
                  {/* Name - Replace $1.00 with A Buck */}
                  <h5 className="text-base md:text-lg font-bold text-white mb-2">
                    {product.name === '$1.00' ? 'A Buck' : product.name}
                  </h5>
                  
                  {/* Price */}
                  <div className="text-2xl md:text-3xl font-bold spectrum-text mb-3">
                    ${product.price?.toFixed(2)}
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-xs md:text-sm mb-4 md:mb-6 leading-relaxed min-h-[2.5rem] md:min-h-[3rem]">
                    {product.description}
                  </p>
                  
                  {/* Button */}
                  <button
                    onClick={() => handleDonation(product)}
                    disabled={isProcessing}
                    className={`w-full flex items-center justify-center space-x-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      product.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        : 'cta-button text-white'
                    }`}
                  >
                    {isProcessing && selectedProduct === product.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>${product.price?.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Amount Section - Responsive */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl p-4 md:p-6 border border-emerald-500/20">
            <div className="text-center mb-4">
              <div className="text-3xl md:text-4xl mb-3">🚀</div>
              <h5 className="text-lg md:text-xl font-bold text-white mb-2">Custom Amount</h5>
              <p className="text-gray-300 text-sm mb-4">
                Internet rich dopamine hit. Stick it to the man.
              </p>
            </div>

            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 px-4 md:px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
              >
                <DollarSign className="w-4 h-4" />
                <span>Enter Custom Amount</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="relative flex-1 w-full">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-3 input-field rounded-xl text-white placeholder-gray-500"
                      disabled={isProcessing}
                    />
                  </div>
                  <button
                    onClick={handleCustomDonation}
                    disabled={isProcessing || !customAmount || parseFloat(customAmount) < 1}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 cta-button rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing && selectedProduct === 'prod_custom' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Donate</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomAmount('');
                    setError(null);
                  }}
                  disabled={isProcessing}
                  className="text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* What Your Support Does - Responsive Grid */}
        <div className="mb-6 md:mb-8">
          <h4 className="text-lg font-semibold text-white mb-4 text-center">Your Support Helps Us:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="bg-blue-500/10 rounded-xl p-3 md:p-4 border border-blue-500/20">
              <div className="flex items-center space-x-3 mb-2">
                <Zap className="w-4 md:w-5 h-4 md:h-5 text-blue-400" />
                <span className="text-blue-300 font-medium text-sm md:text-base">Improve AI Analysis</span>
              </div>
              <p className="text-gray-300 text-xs md:text-sm">
                Better algorithms, faster processing, more accurate fact-checking
              </p>
            </div>
            
            <div className="bg-green-500/10 rounded-xl p-3 md:p-4 border border-green-500/20">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-4 md:w-5 h-4 md:h-5 text-green-400" />
                <span className="text-green-300 font-medium text-sm md:text-base">Stay Independent</span>
              </div>
              <p className="text-gray-300 text-xs md:text-sm">
                No corporate influence, no political bias, just cutting through BS
              </p>
            </div>
            
            <div className="bg-purple-500/10 rounded-xl p-3 md:p-4 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-2">
                <Coffee className="w-4 md:w-5 h-4 md:h-5 text-purple-400" />
                <span className="text-purple-300 font-medium text-sm md:text-base">Keep It Free</span>
              </div>
              <p className="text-gray-300 text-xs md:text-sm">
                Fact-checking for everyone, no paywalls or subscriptions
              </p>
            </div>
            
            <div className="bg-red-500/10 rounded-xl p-3 md:p-4 border border-red-500/20">
              <div className="flex items-center space-x-3 mb-2">
                <Heart className="w-4 md:w-5 h-4 md:h-5 text-red-400" />
                <span className="text-red-300 font-medium text-sm md:text-base">Fight Misinformation</span>
              </div>
              <p className="text-gray-300 text-xs md:text-sm">
                More sources, better coverage, stronger democracy
              </p>
            </div>
          </div>
        </div>

        {/* Debug Information (only in development) */}
        {import.meta.env.DEV && (
          <div className="mb-6 bg-neutral-800/40 rounded-xl p-4 border border-neutral-700/30">
            <h5 className="text-white font-medium mb-2">Debug Info (Dev Only)</h5>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Environment: {import.meta.env.DEV ? 'Development' : 'Production'}</p>
              <p>Base URL: {import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin}</p>
              <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
              <p>Selected Product: {selectedProduct || 'None'}</p>
              <p>Error: {error || 'None'}</p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mb-4 md:mb-6 bg-neutral-700/30 rounded-xl p-3 md:p-4 border border-neutral-600/30">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-medium text-sm">Secure Payment</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Payments are processed securely by Stripe. We never store your payment information. 
            All transactions are encrypted and PCI compliant.
          </p>
        </div>

        {/* No Account Required Notice */}
        <div className="mb-4 bg-green-500/10 rounded-xl p-3 md:p-4 border border-green-500/20">
          <p className="text-green-300 text-sm text-center">
            ✨ No account required! Quick and easy one-time donation to support independent fact-checking.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            FactYou! is an indie project. Donations are not tax-deductible but are deeply appreciated! 
            Every contribution helps us stay independent and keep fighting misinformation with maximum attitude.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;