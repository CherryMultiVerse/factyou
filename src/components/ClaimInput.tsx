import React, { useState } from 'react';
import { Search, Sparkles, Zap } from 'lucide-react';

interface ClaimInputProps {
  onSubmit: (claim: string) => void;
  isLoading: boolean;
}

const ClaimInput: React.FC<ClaimInputProps> = ({ onSubmit, isLoading }) => {
  const [claim, setClaim] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claim.trim() && !isLoading) {
      onSubmit(claim.trim());
    }
  };

  const exampleClaims = [
    "Climate change is a hoax created by China",
    "Vaccines contain microchips for tracking", 
    "The 2020 election was stolen",
    "5G towers cause COVID-19",
    "Drinking bleach cures coronavirus",
    "The Earth is flat and NASA is lying"
  ];

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white dark:text-white light:text-slate-900 mb-3 transition-colors duration-300">
          Ready to separate fact from fiction?
        </h2>
        <p className="text-lg text-slate-400 dark:text-slate-400 light:text-slate-600 font-light transition-colors duration-300">
          Drop your claim below and watch our AI dissect it with precision and attitude.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-500 dark:text-slate-500 light:text-slate-400 group-focus-within:text-purple-400 transition-colors duration-200" />
          </div>
          <input
            type="text"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Enter a claim to fact-check... (Go ahead, we dare you)"
            className="w-full pl-16 pr-40 py-6 text-lg font-light bg-slate-800/50 dark:bg-slate-800/50 light:bg-white/80 backdrop-blur-xl border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300/50 rounded-2xl focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 text-white dark:text-white light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-400 shadow-xl"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!claim.trim() || isLoading}
            className="absolute inset-y-0 right-0 mr-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-3 shadow-lg group"
          >
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            <span>Fact-Check This</span>
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-slate-500 dark:text-slate-500 light:text-slate-600 font-medium mb-8 transition-colors duration-300">
          Need inspiration? Try these crowd favorites (spoiler alert: they're all terrible)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exampleClaims.map((example, index) => (
            <button
              key={index}
              onClick={() => setClaim(example)}
              disabled={isLoading}
              className="p-4 text-sm font-light bg-slate-800/30 dark:bg-slate-800/30 light:bg-slate-100/60 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-slate-200/80 text-slate-300 dark:text-slate-300 light:text-slate-700 rounded-xl transition-all duration-200 disabled:opacity-50 border border-slate-700/30 dark:border-slate-700/30 light:border-slate-300/30 hover:border-slate-600/50 dark:hover:border-slate-600/50 light:hover:border-slate-400/50 backdrop-blur-sm text-left hover:scale-105 hover:shadow-lg group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-slate-500 dark:bg-slate-500 light:bg-slate-400 rounded-full mt-2 group-hover:bg-purple-400 transition-colors"></div>
                <span className="leading-relaxed">{example}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-slate-800/20 dark:bg-slate-800/20 light:bg-slate-100/40 rounded-xl border border-slate-700/30 dark:border-slate-700/30 light:border-slate-300/30 transition-colors duration-300">
          <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600 font-light transition-colors duration-300">
            💡 <strong>Pro tip:</strong> The more outrageous the claim, the more fun our analysis becomes. 
            We live for the challenge of debunking the truly ridiculous.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaimInput;