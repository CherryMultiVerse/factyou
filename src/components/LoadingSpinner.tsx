import React, { useState, useEffect } from 'react';
import { Brain, Search, BookOpen, BarChart3, CheckCircle, Lightbulb, Globe, Users, Building, Flag, Shield } from 'lucide-react';

interface LoadingSpinnerProps {
  claim: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ claim }) => {
  const [message, setMessage] = useState('Initializing comprehensive cross-spectrum analysis...');
  const [dots, setDots] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [sourcesFound, setSourcesFound] = useState(0);

  // ENHANCED COMPREHENSIVE ANALYSIS TIMING - Total ~40-50 seconds for thorough fact-checking
  const loadingSteps = [
    {
      message: 'Initializing comprehensive AI fact-checking systems...',
      duration: 5000, // 5 seconds
      description: '🌐 Booting neural networks and loading cross-spectrum source databases with credibility scoring'
    },
    {
      message: 'Deep-analyzing claim structure and extracting key entities...',
      duration: 6000, // 6 seconds  
      description: '🔍 AI is performing semantic analysis, entity extraction, and generating targeted search queries'
    },
    {
      message: 'Searching across comprehensive political spectrum sources...',
      duration: 15000, // 15 seconds - longest step for thorough searching
      description: '📰 Querying left, center, right, international, and fact-checking databases in parallel'
    },
    {
      message: 'AI analyzing content patterns and cross-referencing evidence...',
      duration: 10000, // 10 seconds
      description: '🧠 Deep neural analysis of source credibility, evidence quality, and cross-spectrum consensus'
    },
    {
      message: 'Generating comprehensive verdict with maximum attitude...',
      duration: 5000, // 5 seconds
      description: '⚖️ Synthesizing cross-spectrum analysis into balanced, shareable verdict with signature wit'
    },
    {
      message: 'Finalizing comprehensive analysis and adding BS-cutting commentary...',
      duration: 4000, // 4 seconds
      description: '✅ Polishing the comprehensive verdict and adding maximum shareability across platforms'
    }
  ];

  const stepIcons = [
    <Globe className="w-6 h-6" />,
    <Search className="w-6 h-6" />,
    <BookOpen className="w-6 h-6" />,
    <Brain className="w-6 h-6" />,
    <BarChart3 className="w-6 h-6" />,
    <CheckCircle className="w-6 h-6" />
  ];

  // ENHANCED CRITICAL THINKING TIPS - More comprehensive and educational
  const criticalThinkingTips = [
    {
      tip: "Cross-spectrum analysis reveals truth better than echo chambers.",
      explanation: "We check left, center, right, and international sources to cut through partisan spin and find consensus."
    },
    {
      tip: "Source credibility matters more than source popularity.",
      explanation: "Reuters and AP have higher credibility scores than viral TikToks. Shocking, we know."
    },
    {
      tip: "If the headline ends in a question mark, it's probably clickbait.",
      explanation: "Headlines like 'Is X Causing Y?' usually mean 'No, but we need clicks.' Real news makes statements."
    },
    {
      tip: "Extraordinary claims require extraordinary evidence.",
      explanation: "The bigger the claim, the stronger the proof should be. Screenshots and memes don't count as evidence."
    },
    {
      tip: "Check the date. That 'breaking news' might be from 2019.",
      explanation: "Old stories get recycled faster than plastic bottles. Always verify timestamps and context."
    },
    {
      tip: "If it makes you really angry, pause before sharing.",
      explanation: "Outrage is the internet's favorite currency. Don't be the bank that prints emotional money."
    },
    {
      tip: "Anonymous sources can be legit, but 'people are saying' isn't journalism.",
      explanation: "Real reporters protect sources with their careers. Fake news protects feelings with vague attribution."
    },
    {
      tip: "Correlation doesn't imply causation, but it sure loves to pretend it does.",
      explanation: "Just because two things happen together doesn't mean one caused the other. Ice cream sales and drownings both peak in summer."
    },
    {
      tip: "If only one source is reporting it, it's probably not that important.",
      explanation: "Real news spreads through multiple credible outlets, not just your uncle's Facebook page."
    },
    {
      tip: "Beware of articles that confirm everything you already believe.",
      explanation: "Echo chambers are comfortable, but they're terrible for critical thinking. Seek out challenging perspectives."
    },
    {
      tip: "Statistics without context are just numbers in fancy clothes.",
      explanation: "'Studies show' means nothing without knowing who, when, where, how many, and who paid for it."
    },
    {
      tip: "If it sounds too good (or bad) to be true, it probably is.",
      explanation: "Reality is usually more boring than viral content suggests. Sensational claims need sensational proof."
    },
    {
      tip: "Check who's paying for the research before accepting the results.",
      explanation: "Follow the money. Tobacco companies once 'proved' cigarettes were healthy. Oil companies fund climate denial."
    },
    {
      tip: "Anecdotes are not data, no matter how compelling the story.",
      explanation: "Your friend's cousin's experience doesn't represent universal patterns. Personal stories ≠ scientific evidence."
    },
    {
      tip: "Be suspicious of articles with ALL CAPS and excessive exclamation points!!!",
      explanation: "Good journalism doesn't need to shout. Facts speak for themselves without typographical steroids."
    },
    {
      tip: "If the 'expert' isn't actually an expert in the relevant field, they're just opinionated.",
      explanation: "A PhD in physics doesn't make you a climate expert. A medical degree doesn't make you an economist. Stay in your lane."
    },
    {
      tip: "Memes are not sources, no matter how clever they seem.",
      explanation: "If your political opinion fits in a meme, it might need more nuance. Complex issues require complex analysis."
    },
    {
      tip: "When everyone agrees on social media, someone's probably getting blocked.",
      explanation: "Real consensus is rare. Artificial consensus is common in echo chambers and filter bubbles."
    },
    {
      tip: "The most confident person in the room is often the least informed.",
      explanation: "Dunning-Kruger effect: ignorance breeds confidence, knowledge breeds doubt. Experts know what they don't know."
    },
    {
      tip: "If it's 'too dangerous for them to tell you,' it's probably nonsense.",
      explanation: "Conspiracy theories love the 'forbidden knowledge' angle. Real secrets don't stay secret for long in the digital age."
    },
    {
      tip: "Primary sources beat secondary sources, which beat social media posts.",
      explanation: "Go to the original study, document, or statement. Each layer of interpretation adds potential distortion."
    },
    {
      tip: "Peer review isn't perfect, but it's better than no review.",
      explanation: "Scientific peer review catches errors and bias. It's not foolproof, but it's the best system we have."
    },
    {
      tip: "Fact-checkers aren't perfect, but they're better than no checking.",
      explanation: "Professional fact-checkers have standards, methods, and accountability. Random internet users... don't."
    },
    {
      tip: "If you can't explain it simply, you probably don't understand it.",
      explanation: "Real experts can break down complex topics. If someone can't explain their position clearly, be suspicious."
    },
    {
      tip: "Absence of evidence isn't evidence of absence, but it's not evidence of presence either.",
      explanation: "Just because we can't prove something false doesn't make it true. The burden of proof is on the claim maker."
    }
  ];

  const categories = [
    { 
      name: '🟦 Left', 
      icon: <Users className="w-4 h-4" />,
      color: 'from-blue-500 to-blue-600', 
      bgColor: 'bg-blue-500/10', 
      borderColor: 'border-blue-400/20',
      indicatorClass: 'category-indicator-left',
      sources: ['NPR', 'Guardian', 'Vox', 'CNN']
    },
    { 
      name: '⚪ Center', 
      icon: <Building className="w-4 h-4" />,
      color: 'from-purple-500 to-purple-600', 
      bgColor: 'bg-purple-500/10', 
      borderColor: 'border-purple-400/20',
      indicatorClass: 'category-indicator-center',
      sources: ['Reuters', 'AP', 'BBC', 'PBS']
    },
    { 
      name: '🟥 Right', 
      icon: <Flag className="w-4 h-4" />,
      color: 'from-red-500 to-red-600', 
      bgColor: 'bg-red-500/10', 
      borderColor: 'border-red-400/20',
      indicatorClass: 'category-indicator-right',
      sources: ['WSJ', 'Fox News', 'NY Post', 'Daily Wire']
    },
    { 
      name: '🌍 Global', 
      icon: <Globe className="w-4 h-4" />,
      color: 'from-emerald-500 to-emerald-600', 
      bgColor: 'bg-emerald-500/10', 
      borderColor: 'border-emerald-400/20',
      indicatorClass: 'category-indicator-international',
      sources: ['Al Jazeera', 'BBC World', 'Deutsche Welle']
    },
    { 
      name: '🔍 Fact Check', 
      icon: <Shield className="w-4 h-4" />,
      color: 'from-amber-500 to-amber-600', 
      bgColor: 'bg-amber-500/10', 
      borderColor: 'border-amber-400/20',
      indicatorClass: 'category-indicator-external',
      sources: ['Snopes', 'FactCheck.org', 'PolitiFact', 'AP Fact Check']
    }
  ];

  // COMPREHENSIVE step progression with realistic timing
  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;
    let elapsedTimer: NodeJS.Timeout;
    let sourcesTimer: NodeJS.Timeout;
    
    const currentStepData = loadingSteps[currentStep];
    const stepDuration = currentStepData.duration;
    
    // Update progress within each step (every 200ms for smoother animation)
    const progressInterval = 200;
    const progressIncrement = 100 / (stepDuration / progressInterval);
    
    progressTimer = setInterval(() => {
      setStepProgress(prev => {
        const newProgress = prev + progressIncrement;
        if (newProgress >= 100) {
          return 100;
        }
        return newProgress;
      });
    }, progressInterval);
    
    // Track total elapsed time
    elapsedTimer = setInterval(() => {
      setTotalElapsed(prev => prev + 0.1);
    }, 100);
    
    // Simulate finding sources during search step
    if (currentStep === 2) { // Search step
      sourcesTimer = setInterval(() => {
        setSourcesFound(prev => {
          const newCount = prev + 1;
          return newCount > 18 ? 18 : newCount; // Cap at 18 sources
        });
      }, 700); // Find a new source every 700ms
    }
    
    // Move to next step after duration
    stepTimer = setTimeout(() => {
      if (currentStep < loadingSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setStepProgress(0);
      }
    }, stepDuration);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
      clearInterval(elapsedTimer);
      clearInterval(sourcesTimer);
    };
  }, [currentStep]);

  // Dots animation
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 800);

    return () => clearInterval(dotsInterval);
  }, []);

  // Tip cycling - 6 seconds per tip for better reading
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % criticalThinkingTips.length);
    }, 6000);

    return () => clearInterval(tipInterval);
  }, []);

  // Update message when step changes
  useEffect(() => {
    setMessage(loadingSteps[currentStep].message);
  }, [currentStep]);

  // Calculate total progress across all steps
  const totalProgress = ((currentStep * 100 + stepProgress) / (loadingSteps.length * 100)) * 100;

  return (
    <div className="max-w-4xl mx-auto px-8 py-20">
      <div className="bg-neutral-800/30 backdrop-blur-xl rounded-3xl p-12 text-center border border-neutral-700/30 shadow-2xl">
        <div className="relative mb-12">
          <div className="w-32 h-32 mx-auto relative">
            {/* Outer static ring */}
            <div className="absolute inset-0 border-2 border-neutral-800/30 rounded-full"></div>
            
            {/* COMPREHENSIVE spectrum animated border - 12 seconds per rotation */}
            <div className="absolute inset-0 border-2 border-transparent rounded-full">
              <div className="absolute inset-0 rounded-full spectrum-animated opacity-70" style={{
                animation: 'spectrum-rotate 12s linear infinite'
              }}></div>
              <div className="absolute inset-1 bg-neutral-800/30 rounded-full"></div>
            </div>
            
            {/* Step progress ring with smooth animation */}
            <div className="absolute inset-2 rounded-full border-2 border-neutral-700/30">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${stepProgress * 2.83} 283`}
                  className="text-blue-400 transition-all duration-500"
                />
              </svg>
            </div>
            
            {/* Center icon with subtle pulse */}
            <div className="absolute inset-0 flex items-center justify-center spectrum-text">
              <div className="animate-pulse">
                {stepIcons[currentStep]}
              </div>
            </div>
          </div>
          
          {/* Thinking indicator */}
          <div className="absolute -top-2 -right-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.5s' }}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1.5s' }}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '600ms', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <h3 className="text-2xl font-semibold text-white">
            Comprehensive AI Analysis in Progress
          </h3>
          
          <div className="bg-neutral-700/30 rounded-2xl p-6 border border-neutral-600/30">
            <p className="text-neutral-200 font-light text-lg leading-relaxed">"{claim}"</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-lg spectrum-text font-medium">
              {message}{dots}
            </p>
            
            {/* Current step description with more detail */}
            <div className="text-sm text-neutral-400 font-light max-w-2xl mx-auto">
              <p>{loadingSteps[currentStep].description}</p>
            </div>
            
            {/* Enhanced step progress indicator */}
            <div className="text-xs text-neutral-500 space-y-1">
              <div>Step {currentStep + 1} of {loadingSteps.length} • {Math.round(stepProgress)}% complete</div>
              <div>Total elapsed: {totalElapsed.toFixed(1)}s • Est. remaining: {Math.max(0, 45 - totalElapsed).toFixed(0)}s</div>
              {currentStep === 2 && sourcesFound > 0 && (
                <div className="text-green-400">Sources found: {sourcesFound}/18 • Cross-spectrum coverage active</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced source categories with COMPREHENSIVE timing */}
        <div className="mt-12 flex justify-center gap-4">
          {categories.map((category, index) => {
            // More realistic activation timing - activate during search step (step 2)
            const isSearchStep = currentStep === 2;
            const isActive = isSearchStep && stepProgress > (index * 12); // Stagger activation
            const isCompleted = currentStep > 2;
            const isAnalyzing = currentStep === 3 && index === Math.floor((stepProgress / 20) % 5);
            
            return (
              <div key={category.name} className="flex flex-col items-center space-y-3">
                <div className={`
                  relative w-20 h-20 rounded-2xl backdrop-blur-xl border transition-all duration-2000
                  ${isCompleted
                    ? `${category.bgColor} ${category.borderColor} scale-105 opacity-90`
                    : isActive || isAnalyzing
                    ? `${category.bgColor} ${category.borderColor} scale-110 shadow-lg spectrum-glow-enhanced` 
                    : isSearchStep
                    ? `${category.bgColor} ${category.borderColor} scale-100 opacity-60`
                    : 'bg-neutral-800/20 border-neutral-700/30 scale-95 opacity-40'
                  }
                `}>
                  <div className={`
                    absolute inset-2 rounded-xl transition-all duration-2000
                    ${isCompleted
                      ? `bg-gradient-to-br ${category.color} opacity-25`
                      : isActive || isAnalyzing
                      ? `bg-gradient-to-br ${category.color} opacity-50` 
                      : isSearchStep
                      ? `bg-gradient-to-br ${category.color} opacity-20`
                      : 'bg-neutral-600/10'
                    }
                  `}></div>
                  <div className={`
                    absolute inset-0 flex items-center justify-center transition-all duration-2000
                    ${isActive || isAnalyzing ? 'scale-110' : 'scale-100'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : isActive || isAnalyzing ? (
                      <div className="relative">
                        {category.icon}
                        <div className={`absolute inset-0 ${category.indicatorClass} rounded-full animate-pulse opacity-70`}></div>
                      </div>
                    ) : isSearchStep ? (
                      <div className={`w-3 h-3 rounded-full ${category.indicatorClass} animate-pulse opacity-50`}></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-neutral-500 opacity-30"></div>
                    )}
                  </div>
                </div>
                <span className={`
                  text-xs font-medium transition-colors duration-2000 text-center
                  ${isCompleted ? 'text-green-300' : isActive || isAnalyzing ? 'text-white' : isSearchStep ? 'text-neutral-300' : 'text-neutral-500'}
                `}>
                  {category.name}
                </span>
                {(isActive || isAnalyzing) && (
                  <div className="text-xs spectrum-text animate-pulse text-center">
                    {isAnalyzing ? 'Analyzing...' : 'Searching...'}
                  </div>
                )}
                {isCompleted && (
                  <div className="text-xs text-green-400 text-center">
                    Complete
                  </div>
                )}
                {/* Show sample sources during search */}
                {isActive && category.sources && (
                  <div className="text-xs text-gray-400 text-center max-w-20">
                    {category.sources.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Political Spectrum Balance Indicator with enhanced animation */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="text-sm text-blue-400 font-medium">Left</span>
            <div className="flex-1 h-3 bg-neutral-700/30 rounded-full overflow-hidden max-w-xs">
              <div className="h-full spectrum-balance rounded-full" style={{
                animation: 'spectrum-pulse 8s ease-in-out infinite'
              }}></div>
            </div>
            <span className="text-sm text-red-400 font-medium">Right</span>
          </div>
          <p className="text-xs text-neutral-500">Comprehensive cross-spectrum analysis in progress</p>
        </div>

        {/* ENHANCED Critical Thinking Pro Tips Section with more educational content */}
        <div className="mt-12 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-8 border border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Lightbulb className="w-6 h-6 text-amber-400 animate-pulse" style={{ animationDuration: '2s' }} />
            <h4 className="text-xl font-semibold text-amber-300">Critical Thinking Pro Tip</h4>
            <Lightbulb className="w-6 h-6 text-amber-400 animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
          
          <div className="space-y-4">
            <div className="bg-neutral-800/40 rounded-xl p-6 border border-neutral-700/30">
              <p className="text-amber-200 font-medium text-lg leading-relaxed mb-3">
                💡 {criticalThinkingTips[currentTip].tip}
              </p>
              <p className="text-neutral-300 text-sm leading-relaxed font-light">
                {criticalThinkingTips[currentTip].explanation}
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500">
              <span>Tip {currentTip + 1} of {criticalThinkingTips.length}</span>
              <span>•</span>
              <span>Building your BS detector since 2024</span>
            </div>
          </div>
        </div>

        {/* Enhanced progress indicator with comprehensive timing */}
        <div className="mt-10">
          <div className="w-full bg-neutral-700/30 rounded-full h-3">
            <div 
              className="spectrum-gradient h-3 rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ 
                width: `${totalProgress}%`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-neutral-500">
              Step {currentStep + 1} of {loadingSteps.length} • {Math.round(totalProgress)}% overall
            </p>
            <p className="text-xs text-neutral-500">
              Comprehensive AI Analysis Mode
            </p>
          </div>
        </div>

        {/* Analysis quality indicators with comprehensive features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-xs">
          <div className={`p-3 rounded-xl border transition-all duration-2000 ${
            currentStep >= 1 ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-neutral-700/20 border-neutral-600/20 text-neutral-500'
          }`}>
            <div className="font-medium">Neural Analysis</div>
            <div className="text-xs opacity-75">Semantic processing</div>
          </div>
          <div className={`p-3 rounded-xl border transition-all duration-2000 ${
            currentStep >= 3 ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-neutral-700/20 border-neutral-600/20 text-neutral-500'
          }`}>
            <div className="font-medium">Cross-Spectrum</div>
            <div className="text-xs opacity-75">Balanced coverage</div>
          </div>
          <div className={`p-3 rounded-xl border transition-all duration-2000 ${
            currentStep >= 5 ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-neutral-700/20 border-neutral-600/20 text-neutral-500'
          }`}>
            <div className="font-medium">Witty Summary</div>
            <div className="text-xs opacity-75">Maximum shareability</div>
          </div>
        </div>

        {/* Comprehensive analysis disclaimer */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-red-500/10 rounded-xl border border-purple-500/20">
          <p className="spectrum-text text-sm font-medium mb-2">🚀 Comprehensive AI Analysis Active</p>
          <p className="text-neutral-200 text-xs leading-relaxed">
            This system uses advanced neural networks to perform comprehensive fact-checking across the political spectrum, 
            analyzing credibility scores, cross-referencing evidence, and generating balanced results with maximum attitude and minimum BS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;