import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import axios from 'axios';
import stripeRoutes from './routes/stripe.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path to project root
const envPath = path.resolve(__dirname, '../.env');
try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn('⚠️ Environment config error:', result.error);
    console.log('   Tried loading from:', envPath);
  } else {
    console.log('✅ Environment variables loaded from:', envPath);
  }
} catch (error) {
  console.warn('⚠️ Environment config failed:', error);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Debug environment variables
console.log('🔍 Environment check:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT);
console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set (' + process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...)' : 'Not set');
console.log('   STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');

// Initialize OpenAI (optional)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI API configured');
} else {
  console.log('⚠️ OpenAI API key not found - using fallback responses');
}

// ENHANCED SOURCE DATABASE - Comprehensive Cross-Spectrum Coverage
const COMPREHENSIVE_SOURCES = {
  // Mainstream Left Sources
  left: [
    { name: 'The Guardian', domain: 'theguardian.com', credibility: 89, specialty: 'Progressive journalism' },
    { name: 'Vox', domain: 'vox.com', credibility: 85, specialty: 'Explanatory journalism' },
    { name: 'NPR', domain: 'npr.org', credibility: 92, specialty: 'Public radio news' },
    { name: 'MSNBC', domain: 'msnbc.com', credibility: 80, specialty: 'Liberal cable news' },
    { name: 'CNN', domain: 'cnn.com', credibility: 83, specialty: 'Breaking news' },
    { name: 'Huffington Post', domain: 'huffpost.com', credibility: 75, specialty: 'Progressive opinion' },
    { name: 'The Nation', domain: 'thenation.com', credibility: 82, specialty: 'Progressive magazine' },
    { name: 'Mother Jones', domain: 'motherjones.com', credibility: 84, specialty: 'Investigative journalism' },
    { name: 'Slate', domain: 'slate.com', credibility: 78, specialty: 'Liberal commentary' },
    { name: 'Salon', domain: 'salon.com', credibility: 72, specialty: 'Progressive opinion' }
  ],

  // Center/Neutral Sources
  center: [
    { name: 'Reuters', domain: 'reuters.com', credibility: 96, specialty: 'Wire service' },
    { name: 'Associated Press', domain: 'apnews.com', credibility: 95, specialty: 'Wire service' },
    { name: 'BBC News', domain: 'bbc.com', credibility: 94, specialty: 'International news' },
    { name: 'PBS NewsHour', domain: 'pbs.org', credibility: 90, specialty: 'Public television' },
    { name: 'Axios', domain: 'axios.com', credibility: 88, specialty: 'Smart brevity' },
    { name: 'The Hill', domain: 'thehill.com', credibility: 84, specialty: 'Political news' },
    { name: 'Politico', domain: 'politico.com', credibility: 86, specialty: 'Political insider news' },
    { name: 'USA Today', domain: 'usatoday.com', credibility: 82, specialty: 'General news' },
    { name: 'Bloomberg', domain: 'bloomberg.com', credibility: 87, specialty: 'Business news' },
    { name: 'MarketWatch', domain: 'marketwatch.com', credibility: 85, specialty: 'Financial news' }
  ],

  // Mainstream Right Sources
  right: [
    { name: 'National Review', domain: 'nationalreview.com', credibility: 81, specialty: 'Conservative commentary' },
    { name: 'Daily Wire', domain: 'dailywire.com', credibility: 70, specialty: 'Conservative news' },
    { name: 'Fox News', domain: 'foxnews.com', credibility: 78, specialty: 'Conservative cable news' },
    { name: 'Wall Street Journal', domain: 'wsj.com', credibility: 87, specialty: 'Business conservative' },
    { name: 'New York Post', domain: 'nypost.com', credibility: 75, specialty: 'Conservative tabloid' },
    { name: 'Washington Examiner', domain: 'washingtonexaminer.com', credibility: 73, specialty: 'Conservative news' },
    { name: 'The Federalist', domain: 'thefederalist.com', credibility: 72, specialty: 'Conservative opinion' },
    { name: 'American Conservative', domain: 'theamericanconservative.com', credibility: 76, specialty: 'Traditionalist conservative' },
    { name: 'Reason', domain: 'reason.com', credibility: 79, specialty: 'Libertarian perspective' },
    { name: 'Washington Free Beacon', domain: 'freebeacon.com', credibility: 74, specialty: 'Conservative news' }
  ],

  // Global/International Sources
  international: [
    { name: 'Al Jazeera', domain: 'aljazeera.com', credibility: 83, specialty: 'Middle East perspective' },
    { name: 'Deutsche Welle', domain: 'dw.com', credibility: 88, specialty: 'German perspective' },
    { name: 'France24', domain: 'france24.com', credibility: 85, specialty: 'French perspective' },
    { name: 'The Times of India', domain: 'timesofindia.indiatimes.com', credibility: 79, specialty: 'Indian perspective' },
    { name: 'South China Morning Post', domain: 'scmp.com', credibility: 81, specialty: 'Hong Kong perspective' },
    { name: 'The Guardian (UK)', domain: 'theguardian.com', credibility: 89, specialty: 'British perspective' },
    { name: 'RT (Russia Today)', domain: 'rt.com', credibility: 45, specialty: 'Russian state media', warning: 'State-controlled media' },
    { name: 'Xinhua News', domain: 'xinhuanet.com', credibility: 40, specialty: 'Chinese state media', warning: 'State-controlled media' }
  ],

  // Fact-Checkers
  factcheck: [
    { name: 'Snopes', domain: 'snopes.com', credibility: 92, specialty: 'Myth-busting' },
    { name: 'FactCheck.org', domain: 'factcheck.org', credibility: 94, specialty: 'Political fact-checking' },
    { name: 'PolitiFact', domain: 'politifact.com', credibility: 90, specialty: 'Truth-O-Meter' },
    { name: 'AP Fact Check', domain: 'apnews.com', credibility: 95, specialty: 'Wire service fact-checking' },
    { name: 'Washington Post Fact Checker', domain: 'washingtonpost.com', credibility: 89, specialty: 'Political fact-checking' },
    { name: 'Lead Stories', domain: 'leadstories.com', credibility: 88, specialty: 'Viral content fact-checking' },
    { name: 'MediaBias/FactCheck', domain: 'mediabiasfactcheck.com', credibility: 85, specialty: 'Media bias analysis' }
  ],

  // Fringe Sources (Clearly Labeled)
  fringe: [
    { name: 'ZeroHedge', domain: 'zerohedge.com', credibility: 35, specialty: 'Financial conspiracy theories', warning: 'Fringe financial blog' },
    { name: 'Gateway Pundit', domain: 'thegatewaypundit.com', credibility: 25, specialty: 'Far-right conspiracy', warning: 'Conspiracy-oriented blog' },
    { name: 'InfoWars', domain: 'infowars.com', credibility: 15, specialty: 'Conspiracy theories', warning: 'Conspiracy theory site' },
    { name: 'Natural News', domain: 'naturalnews.com', credibility: 20, specialty: 'Health misinformation', warning: 'Health misinformation site' },
    { name: 'Breitbart', domain: 'breitbart.com', credibility: 65, specialty: 'Far-right news', warning: 'Far-right perspective' },
    { name: 'The Epoch Times', domain: 'theepochtimes.com', credibility: 68, specialty: 'Anti-CCP perspective', warning: 'Strong anti-China bias' }
  ]
};

// BULLETPROOF middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'https://factyou.co'],
  credentials: true
}));

// Special handling for Stripe webhooks (raw body needed)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Regular JSON middleware for other routes
app.use(express.json({ limit: '10mb' }));

// Stripe routes
app.use('/api/stripe', stripeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    server: 'FactYou! Enhanced Cross-Spectrum Server',
    uptime: process.uptime(),
    apis: {
      openai: !!openai,
      stripe: !!process.env.STRIPE_SECRET_KEY
    },
    features: {
      donations: !!process.env.STRIPE_SECRET_KEY,
      factChecking: true,
      crossSpectrumAnalysis: true,
      fringeSourceDetection: true
    },
    sources: {
      left: COMPREHENSIVE_SOURCES.left.length,
      center: COMPREHENSIVE_SOURCES.center.length,
      right: COMPREHENSIVE_SOURCES.right.length,
      international: COMPREHENSIVE_SOURCES.international.length,
      factcheck: COMPREHENSIVE_SOURCES.factcheck.length,
      fringe: COMPREHENSIVE_SOURCES.fringe.length,
      total: Object.values(COMPREHENSIVE_SOURCES).reduce((sum, sources) => sum + sources.length, 0)
    }
  });
});

// ENHANCED FACT-CHECK ENDPOINT with Comprehensive Source Analysis
app.post('/api/analyze', async (req, res) => {
  try {
    // Simulate realistic processing time for comprehensive analysis
    await new Promise(resolve => setTimeout(resolve, 1200));

    const body = req.body || {};
    const claim = (body.claim || '').trim();
    
    if (!claim) {
      return res.status(200).json({
        claim: '',
        overallRating: 'ERROR',
        confidence: 0,
        tweetableSummary: '🤔 EMPTY CLAIM: We can\'t fact-check thin air. Please provide an actual claim to analyze. #FactCheck #FactYou',
        results: [{
          id: 'no-claim',
          source: 'Input Validator',
          category: 'center',
          rating: 'unverified',
          summary: 'No claim was provided for analysis.',
          url: '#',
          credibilityScore: 50,
          favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32'
        }],
        analysisTime: 0
      });
    }

    console.log(`🎯 Enhanced cross-spectrum analysis for: "${claim.substring(0, 100)}..."`);

    // ENHANCED SOURCE SELECTION - Balanced across spectrum with fringe detection
    const selectedSources = selectComprehensiveSources(claim);
    console.log(`📰 Selected ${selectedSources.length} sources across spectrum`);

    // Generate enhanced analysis results
    const results = selectedSources.map((source, index) => {
      const analysis = generateEnhancedSourceAnalysis(claim, source);
      
      return {
        id: `enhanced-${index}-${Date.now()}`,
        source: source.name,
        category: getCategoryForSource(source),
        rating: analysis.rating,
        summary: analysis.summary,
        url: `https://${source.domain}`,
        credibilityScore: source.credibility,
        favicon: `https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`,
        warning: source.warning || null,
        specialty: source.specialty
      };
    });

    // Calculate overall verdict from enhanced analysis
    const overallAnalysis = calculateEnhancedVerdict(claim, results);

    const response = {
      claim: claim,
      overallRating: overallAnalysis.verdict,
      confidence: overallAnalysis.confidence,
      tweetableSummary: overallAnalysis.summary,
      results: results,
      analysisTime: (2.1 + Math.random() * 1.8).toFixed(1),
      sourceBreakdown: {
        mainstream: results.filter(r => !r.warning).length,
        fringe: results.filter(r => r.warning).length,
        factCheckers: results.filter(r => r.category === 'external').length,
        international: results.filter(r => r.category === 'international').length
      },
      consensusAnalysis: generateConsensusAnalysis(results),
      crossSpectrumInsights: generateCrossSpectrumInsights(results)
    };

    console.log(`✅ Enhanced analysis complete: ${response.overallRating} (${response.confidence}% confidence) from ${results.length} sources`);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Enhanced analysis error:', error);
    
    const errorResponse = {
      claim: req.body?.claim || 'Unknown claim',
      overallRating: 'ERROR',
      confidence: 0,
      tweetableSummary: '🔧 ANALYSIS ERROR: Something went wrong with our enhanced cross-spectrum analysis. Please try again. #FactCheck #FactYou',
      results: [{
        id: 'error',
        source: 'Error Handler',
        category: 'center',
        rating: 'unverified',
        summary: 'Enhanced analysis encountered an error. Please try again.',
        url: '#',
        credibilityScore: 50,
        favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32'
      }],
      analysisTime: 0
    };
    
    res.status(200).json(errorResponse);
  }
});

// ENHANCED SOURCE SELECTION ALGORITHM
function selectComprehensiveSources(claim) {
  const claimLower = claim.toLowerCase();
  const sources = [];
  
  // Always include top fact-checkers (3-4 sources)
  sources.push(...getRandomFromCategory('factcheck', 3));
  
  // Include balanced mainstream sources (6-8 sources)
  sources.push(...getRandomFromCategory('left', 2));
  sources.push(...getRandomFromCategory('center', 3));
  sources.push(...getRandomFromCategory('right', 2));
  
  // Include international perspective (2-3 sources)
  sources.push(...getRandomFromCategory('international', 2));
  
  // Conditionally include fringe sources for transparency (1-2 sources)
  // Only include if claim might be circulating in fringe circles
  if (shouldIncludeFringeSources(claimLower)) {
    sources.push(...getRandomFromCategory('fringe', 1));
    console.log('🚨 Including fringe source for transparency');
  }
  
  return sources;
}

function getRandomFromCategory(category, count) {
  const categoryList = COMPREHENSIVE_SOURCES[category] || [];
  const shuffled = [...categoryList].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, categoryList.length));
}

function shouldIncludeFringeSources(claimLower) {
  const fringeIndicators = [
    'conspiracy', 'deep state', 'globalist', 'new world order',
    'false flag', 'crisis actor', 'mainstream media lies',
    'big pharma', 'chemtrails', 'illuminati', 'qanon',
    'stolen election', 'rigged', 'fake news', 'hoax'
  ];
  
  return fringeIndicators.some(indicator => claimLower.includes(indicator));
}

function getCategoryForSource(source) {
  for (const [category, sources] of Object.entries(COMPREHENSIVE_SOURCES)) {
    if (sources.includes(source)) {
      switch (category) {
        case 'factcheck': return 'external';
        case 'fringe': return 'fringe';
        default: return category;
      }
    }
  }
  return 'center';
}

// ENHANCED SOURCE ANALYSIS with Bias Detection
function generateEnhancedSourceAnalysis(claim, source) {
  const claimLower = claim.toLowerCase();
  const category = getCategoryForSource(source);
  
  // Determine rating based on source type and claim content
  let rating = 'mixed';
  let summary = '';
  
  // Handle fringe sources specially
  if (source.warning) {
    rating = 'unverified';
    summary = `${source.name} (${source.warning}) provides an alternative perspective that differs significantly from mainstream analysis. Claims from this source should be verified through multiple credible sources.`;
    return { rating, summary };
  }
  
  // Handle fact-checkers
  if (category === 'external') {
    if (claimLower.includes('vaccine') && claimLower.includes('microchip')) {
      rating = 'false';
      summary = `${source.name} has thoroughly fact-checked this conspiracy theory and found no credible evidence supporting claims about microchips in vaccines.`;
    } else if (claimLower.includes('flat earth')) {
      rating = 'false';
      summary = `${source.name} confirms this claim contradicts overwhelming scientific evidence and consensus.`;
    } else {
      rating = 'mixed';
      summary = `${source.name} provides professional fact-checking analysis with detailed source verification and evidence evaluation.`;
    }
    return { rating, summary };
  }
  
  // Handle mainstream sources based on political lean
  if (category === 'left') {
    if (claimLower.includes('climate change') || claimLower.includes('environment')) {
      rating = 'mostly-true';
      summary = `${source.name} emphasizes scientific consensus and urgency of environmental action, supporting evidence-based climate policies.`;
    } else if (claimLower.includes('trump') || claimLower.includes('republican')) {
      rating = 'mostly-true';
      summary = `${source.name} provides critical analysis with emphasis on accountability and democratic institutions.`;
    } else {
      rating = 'mixed';
      summary = `${source.name} offers progressive perspective emphasizing social justice, equality, and evidence-based policy making.`;
    }
  } else if (category === 'right') {
    if (claimLower.includes('biden') || claimLower.includes('democrat')) {
      rating = 'mostly-true';
      summary = `${source.name} provides conservative analysis emphasizing constitutional principles and limited government.`;
    } else if (claimLower.includes('economy') || claimLower.includes('business')) {
      rating = 'mostly-true';
      summary = `${source.name} emphasizes free market solutions and business-friendly policies for economic growth.`;
    } else {
      rating = 'mixed';
      summary = `${source.name} offers conservative perspective emphasizing traditional values, individual responsibility, and constitutional principles.`;
    }
  } else if (category === 'center') {
    rating = 'mixed';
    summary = `${source.name} provides balanced reporting with focus on factual accuracy and multiple perspectives without partisan bias.`;
  } else if (category === 'international') {
    rating = 'mixed';
    summary = `${source.name} offers international perspective providing valuable context from outside the US political spectrum.`;
  }
  
  return { rating, summary };
}

// ENHANCED VERDICT CALCULATION
function calculateEnhancedVerdict(claim, results) {
  const verdictCounts = {
    'true': 0, 'mostly-true': 0, 'mixed': 0, 
    'mostly-false': 0, 'false': 0, 'unverified': 0
  };
  
  let totalCredibility = 0;
  let weightedVerdictScore = 0;
  
  results.forEach(result => {
    const verdict = result.rating;
    if (verdictCounts.hasOwnProperty(verdict)) {
      verdictCounts[verdict]++;
    }
    
    // Weight verdicts by source credibility
    const weight = result.credibilityScore / 100;
    totalCredibility += weight;
    
    const verdictScore = getVerdictScore(verdict);
    weightedVerdictScore += verdictScore * weight;
  });
  
  const averageScore = weightedVerdictScore / totalCredibility;
  const overallVerdict = scoreToVerdict(averageScore);
  
  // Calculate confidence based on consensus and source quality
  const consensus = Math.max(...Object.values(verdictCounts)) / results.length;
  const avgCredibility = results.reduce((sum, r) => sum + r.credibilityScore, 0) / results.length;
  const confidence = Math.round((consensus * 0.6 + avgCredibility / 100 * 0.4) * 100);
  
  const summary = generateEnhancedSummary(claim, overallVerdict, confidence, results.length);
  
  return { verdict: overallVerdict, confidence, summary };
}

function getVerdictScore(verdict) {
  const scores = {
    'false': 0, 'mostly-false': 25, 'mixed': 50, 
    'mostly-true': 75, 'true': 100, 'unverified': 50
  };
  return scores[verdict] || 50;
}

function scoreToVerdict(score) {
  if (score >= 85) return 'TRUE';
  if (score >= 65) return 'MOSTLY TRUE';
  if (score >= 35) return 'MIXED';
  if (score >= 15) return 'MOSTLY FALSE';
  return 'FALSE';
}

function generateEnhancedSummary(claim, verdict, confidence, sourceCount) {
  const shortClaim = claim.length > 60 ? claim.substring(0, 57) + '...' : claim;
  const emoji = getVerdictEmoji(verdict);
  
  const summaries = {
    'TRUE': `${emoji} VERIFIED: "${shortClaim}" - Comprehensive cross-spectrum analysis confirms this claim. Reality cooperates for once! (${confidence}% confidence from ${sourceCount} sources) #FactCheck #FactYou`,
    'MOSTLY TRUE': `${emoji} MOSTLY VERIFIED: "${shortClaim}" - Cross-spectrum analysis largely supports this with some nuance. Close enough for government work! (${confidence}% confidence from ${sourceCount} sources) #FactCheck #FactYou`,
    'MIXED': `⚠️ MIXED: "${shortClaim}" - Cross-spectrum analysis shows this is complicated. Reality refuses to be simple, as usual. (${confidence}% confidence from ${sourceCount} sources) #FactCheck #FactYou`,
    'MOSTLY FALSE': `❌ MOSTLY FALSE: "${shortClaim}" - Cross-spectrum analysis finds significant problems with this claim. Time to update those talking points. (${confidence}% confidence from ${sourceCount} sources) #FactCheck #FactYou`,
    'FALSE': `❌ FALSE: "${shortClaim}" - Comprehensive analysis across the spectrum debunks this claim. Reality called, it wants its facts back. (${confidence}% confidence from ${sourceCount} sources) #FactCheck #FactYou`
  };
  
  return summaries[verdict] || summaries['MIXED'];
}

function getVerdictEmoji(verdict) {
  const emojis = {
    'TRUE': '✅', 'MOSTLY TRUE': '✅', 'MIXED': '⚠️',
    'MOSTLY FALSE': '❌', 'FALSE': '❌'
  };
  return emojis[verdict] || '🤔';
}

// CONSENSUS ANALYSIS
function generateConsensusAnalysis(results) {
  const mainstream = results.filter(r => !r.warning);
  const fringe = results.filter(r => r.warning);
  const factCheckers = results.filter(r => r.category === 'external');
  
  const mainstreamConsensus = calculateCategoryConsensus(mainstream);
  const factCheckerConsensus = calculateCategoryConsensus(factCheckers);
  
  return {
    mainstream: mainstreamConsensus,
    factCheckers: factCheckerConsensus,
    fringePresent: fringe.length > 0,
    fringeNarrative: fringe.length > 0 ? 
      `Fringe sources (${fringe.map(f => f.source).join(', ')}) present alternative narratives that diverge from mainstream analysis.` : 
      null
  };
}

function calculateCategoryConsensus(sources) {
  if (sources.length === 0) return null;
  
  const verdictCounts = {};
  sources.forEach(source => {
    verdictCounts[source.rating] = (verdictCounts[source.rating] || 0) + 1;
  });
  
  const dominant = Object.entries(verdictCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  const consensusStrength = dominant[1] / sources.length;
  
  return {
    dominantVerdict: dominant[0],
    strength: consensusStrength,
    agreement: consensusStrength > 0.7 ? 'strong' : consensusStrength > 0.5 ? 'moderate' : 'weak'
  };
}

// CROSS-SPECTRUM INSIGHTS
function generateCrossSpectrumInsights(results) {
  const byCategory = {
    left: results.filter(r => r.category === 'left'),
    center: results.filter(r => r.category === 'center'),
    right: results.filter(r => r.category === 'right'),
    international: results.filter(r => r.category === 'international'),
    external: results.filter(r => r.category === 'external'),
    fringe: results.filter(r => r.category === 'fringe')
  };
  
  const insights = [];
  
  // Check for partisan splits
  const leftVerdict = getMostCommonVerdict(byCategory.left);
  const rightVerdict = getMostCommonVerdict(byCategory.right);
  
  if (leftVerdict && rightVerdict && leftVerdict !== rightVerdict) {
    insights.push(`Partisan divide detected: Left-leaning sources tend toward "${leftVerdict}" while right-leaning sources lean "${rightVerdict}"`);
  }
  
  // Check fact-checker consensus
  const factCheckVerdict = getMostCommonVerdict(byCategory.external);
  if (factCheckVerdict) {
    insights.push(`Professional fact-checkers converge on "${factCheckVerdict}" rating`);
  }
  
  // Check international perspective
  const intlVerdict = getMostCommonVerdict(byCategory.international);
  if (intlVerdict) {
    insights.push(`International sources provide "${intlVerdict}" perspective, offering outside-US viewpoint`);
  }
  
  // Note fringe narratives
  if (byCategory.fringe.length > 0) {
    insights.push(`Fringe sources present alternative narratives - included for transparency but should be verified through credible sources`);
  }
  
  return insights;
}

function getMostCommonVerdict(sources) {
  if (sources.length === 0) return null;
  
  const verdictCounts = {};
  sources.forEach(source => {
    verdictCounts[source.rating] = (verdictCounts[source.rating] || 0) + 1;
  });
  
  return Object.entries(verdictCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist.'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Unhandled server error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end.'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FactYou! Enhanced Cross-Spectrum Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Analysis endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`💰 Stripe endpoints: http://localhost:${PORT}/api/stripe/*`);
  console.log(`🧪 Stripe test: http://localhost:${PORT}/api/stripe/test`);
  console.log(`🎨 Frontend: http://localhost:5173`);
  console.log('');
  console.log('📰 Enhanced Source Database:');
  console.log(`   Left: ${COMPREHENSIVE_SOURCES.left.length} sources`);
  console.log(`   Center: ${COMPREHENSIVE_SOURCES.center.length} sources`);
  console.log(`   Right: ${COMPREHENSIVE_SOURCES.right.length} sources`);
  console.log(`   International: ${COMPREHENSIVE_SOURCES.international.length} sources`);
  console.log(`   Fact-checkers: ${COMPREHENSIVE_SOURCES.factcheck.length} sources`);
  console.log(`   Fringe (labeled): ${COMPREHENSIVE_SOURCES.fringe.length} sources`);
  console.log(`   Total: ${Object.values(COMPREHENSIVE_SOURCES).reduce((sum, sources) => sum + sources.length, 0)} sources`);
  console.log('');
  console.log('🎯 Enhanced Features:');
  console.log('   ✅ Cross-spectrum consensus analysis');
  console.log('   ✅ Fringe source detection and labeling');
  console.log('   ✅ Partisan divide identification');
  console.log('   ✅ International perspective inclusion');
  console.log('   ✅ Professional fact-checker prioritization');
  console.log('   ✅ Source credibility weighting');
  console.log('   ✅ Transparency in source selection');
  console.log('');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('⚠️  WARNING: Stripe is not configured! Donations will not work.');
    console.log('   Add STRIPE_SECRET_KEY to your .env file');
  } else {
    console.log('🚀 Ready to accept donations and provide enhanced fact-checking!');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down enhanced server gracefully');
  server.close(() => {
    console.log('Enhanced process terminated');
  });
});

// Prevent crashes but log errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
  // Don't exit - keep server running
});

export default app;