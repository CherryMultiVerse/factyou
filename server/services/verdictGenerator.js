export class VerdictGenerator {
  constructor() {
    this.sarcasticTemplates = {
      'VERIFIED': [
        'Well, well, well... looks like someone actually told the truth for once. {claim} - VERIFIED by {sourceCount} sources. Mark your calendars, folks.',
        'Plot twist: this claim is actually accurate. {claim} - VERIFIED across {sourceCount} sources. Reality has entered the chat.',
        'Breaking: Facts still exist! {claim} - VERIFIED by {sourceCount} sources. Sometimes the truth cooperates.'
      ],
      'MOSTLY VERIFIED': [
        '{claim} - MOSTLY VERIFIED by {sourceCount} sources. Close enough for government work, as they say.',
        'This claim is largely accurate, with some fine print. {claim} - MOSTLY VERIFIED across {sourceCount} sources.',
        '{claim} - MOSTLY VERIFIED by {sourceCount} sources. The devil\'s in the details, but the angels are in the facts.'
      ],
      'MIXED': [
        '{claim} - MIXED verdict from {sourceCount} sources. Reality refuses to be simple, as usual.',
        'It\'s complicated (shocking, I know). {claim} - MIXED evidence across {sourceCount} sources.',
        '{claim} - MIXED results from {sourceCount} sources. Nuance: it\'s what\'s for dinner.'
      ],
      'MOSTLY FALSE': [
        '{claim} - MOSTLY FALSE according to {sourceCount} sources. Time to update those talking points.',
        'This claim has more holes than Swiss cheese. {claim} - MOSTLY FALSE per {sourceCount} sources.',
        '{claim} - MOSTLY FALSE say {sourceCount} sources. Facts don\'t care about your feelings.'
      ],
      'FALSE': [
        '{claim} - FALSE according to {sourceCount} sources. Reality called, it wants its facts back.',
        'Nope, nope, and more nope. {claim} - FALSE per {sourceCount} sources. The truth has spoken.',
        '{claim} - FALSE say {sourceCount} sources. Sometimes the internet lies. Shocking, I know.'
      ],
      'SATIRICAL': [
        '{claim} - SATIRICAL content detected by {sourceCount} sources. It\'s a joke, folks. Literally.',
        'This appears to be satire masquerading as news. {claim} - SATIRICAL per {sourceCount} sources.',
        '{claim} - SATIRICAL according to {sourceCount} sources. The Onion strikes again.'
      ],
      'UNVERIFIED': [
        '{claim} - UNVERIFIED across {sourceCount} sources. Some mysteries remain unsolved.',
        'The evidence is playing hard to get. {claim} - UNVERIFIED per {sourceCount} sources.',
        '{claim} - UNVERIFIED say {sourceCount} sources. Even experts need more coffee sometimes.'
      ]
    };
  }

  async generateVerdict(claim, claimAnalysis, contentAnalyses) {
    console.log('⚖️ Generating overall verdict from all sources...');
    
    try {
      // Analyze all the content analyses to determine overall verdict
      const verdictCounts = this.countVerdicts(contentAnalyses);
      const avgConfidence = this.calculateAverageConfidence(contentAnalyses);
      const sourceBalance = this.analyzeSourceBalance(contentAnalyses);
      
      // Determine overall verdict using sophisticated logic
      const overallVerdict = this.determineOverallVerdict(
        verdictCounts, 
        sourceBalance, 
        claimAnalysis
      );
      
      // Calculate final confidence score
      const confidence = this.calculateFinalConfidence(
        overallVerdict,
        avgConfidence,
        contentAnalyses.length,
        sourceBalance
      );
      
      // Generate sarcastic, shareable summary
      const sarcasticSummary = this.generateSarcasticSummary(
        claim,
        overallVerdict,
        contentAnalyses.length,
        confidence
      );
      
      console.log(`📊 Final verdict: ${overallVerdict} (${confidence}% confidence)`);
      
      return {
        overallVerdict,
        confidence,
        sarcasticSummary,
        verdictBreakdown: verdictCounts,
        sourceBalance,
        analysisMetadata: {
          totalSources: contentAnalyses.length,
          avgConfidence,
          claimType: claimAnalysis.claimType,
          complexity: claimAnalysis.complexity.level
        }
      };
      
    } catch (error) {
      console.error('❌ Verdict generation failed:', error);
      return this.getFallbackVerdict(claim, contentAnalyses.length);
    }
  }

  countVerdicts(contentAnalyses) {
    const counts = {
      'true': 0,
      'mostly-true': 0,
      'mixed': 0,
      'mostly-false': 0,
      'false': 0,
      'unverified': 0,
      'satirical': 0
    };

    contentAnalyses.forEach(analysis => {
      const verdict = analysis.aiAnalysis.verdict;
      if (counts.hasOwnProperty(verdict)) {
        counts[verdict]++;
      } else {
        counts['unverified']++;
      }
    });

    return counts;
  }

  calculateAverageConfidence(contentAnalyses) {
    if (contentAnalyses.length === 0) return 50;
    
    const totalConfidence = contentAnalyses.reduce((sum, analysis) => 
      sum + (analysis.aiAnalysis.confidence || 50), 0
    );
    
    return Math.round(totalConfidence / contentAnalyses.length);
  }

  analyzeSourceBalance(contentAnalyses) {
    const balance = {
      left: 0,
      center: 0,
      right: 0,
      international: 0
    };

    contentAnalyses.forEach(analysis => {
      const category = analysis.source.category;
      if (balance.hasOwnProperty(category)) {
        balance[category]++;
      }
    });

    const total = contentAnalyses.length;
    return {
      counts: balance,
      percentages: {
        left: Math.round((balance.left / total) * 100),
        center: Math.round((balance.center / total) * 100),
        right: Math.round((balance.right / total) * 100),
        international: Math.round((balance.international / total) * 100)
      }
    };
  }

  determineOverallVerdict(verdictCounts, sourceBalance, claimAnalysis) {
    const total = Object.values(verdictCounts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return 'UNVERIFIED';
    
    // Special case: satirical content
    if (verdictCounts.satirical >= 1) {
      return 'SATIRICAL';
    }
    
    // Calculate weighted scores based on verdict strength
    const scores = {
      true: verdictCounts.true * 4 + verdictCounts['mostly-true'] * 3,
      false: verdictCounts.false * 4 + verdictCounts['mostly-false'] * 3,
      mixed: verdictCounts.mixed * 2,
      unverified: verdictCounts.unverified * 1
    };
    
    const maxScore = Math.max(...Object.values(scores));
    const threshold = total * 0.4; // 40% threshold for strong verdict
    
    // Determine verdict based on scores and thresholds
    if (scores.true >= threshold && scores.true === maxScore) {
      return verdictCounts.true >= verdictCounts['mostly-true'] ? 'VERIFIED' : 'MOSTLY VERIFIED';
    } else if (scores.false >= threshold && scores.false === maxScore) {
      return verdictCounts.false >= verdictCounts['mostly-false'] ? 'FALSE' : 'MOSTLY FALSE';
    } else if (scores.mixed === maxScore || (scores.true > 0 && scores.false > 0)) {
      return 'MIXED';
    } else if (scores.unverified === maxScore) {
      return 'UNVERIFIED';
    }
    
    // Fallback based on plurality
    const sortedVerdicts = Object.entries(verdictCounts)
      .sort(([,a], [,b]) => b - a);
    
    const topVerdict = sortedVerdicts[0][0];
    
    switch (topVerdict) {
      case 'true': return 'VERIFIED';
      case 'mostly-true': return 'MOSTLY VERIFIED';
      case 'false': return 'FALSE';
      case 'mostly-false': return 'MOSTLY FALSE';
      case 'mixed': return 'MIXED';
      default: return 'UNVERIFIED';
    }
  }

  calculateFinalConfidence(verdict, avgConfidence, sourceCount, sourceBalance) {
    let confidence = avgConfidence;
    
    // Boost confidence for more sources
    if (sourceCount >= 8) confidence += 10;
    else if (sourceCount >= 5) confidence += 5;
    
    // Boost confidence for balanced source coverage
    const categories = Object.values(sourceBalance.counts).filter(count => count > 0).length;
    if (categories >= 3) confidence += 8;
    else if (categories >= 2) confidence += 4;
    
    // Adjust based on verdict type
    switch (verdict) {
      case 'VERIFIED':
      case 'FALSE':
        confidence += 5; // Strong verdicts get confidence boost
        break;
      case 'SATIRICAL':
        confidence += 10; // Satirical content is usually obvious
        break;
      case 'MIXED':
        confidence -= 5; // Mixed verdicts are inherently less confident
        break;
      case 'UNVERIFIED':
        confidence -= 10; // Unverified claims have lower confidence
        break;
    }
    
    return Math.min(95, Math.max(25, Math.round(confidence)));
  }

  generateSarcasticSummary(claim, verdict, sourceCount, confidence) {
    const shortClaim = claim.length > 60 ? claim.substring(0, 57) + '...' : claim;
    
    const templates = this.sarcasticTemplates[verdict] || this.sarcasticTemplates['UNVERIFIED'];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template
      .replace('{claim}', `"${shortClaim}"`)
      .replace('{sourceCount}', sourceCount.toString())
      .replace('{confidence}', confidence.toString()) + 
      ` (${confidence}% confidence) #FactCheck`;
  }

  getFallbackVerdict(claim, sourceCount) {
    return {
      overallVerdict: 'UNVERIFIED',
      confidence: 50,
      sarcasticSummary: `"${claim.substring(0, 60)}..." - UNVERIFIED across ${sourceCount} sources. Sometimes the internet doesn't cooperate. (50% confidence) #FactCheck`,
      verdictBreakdown: { unverified: sourceCount },
      sourceBalance: { counts: {}, percentages: {} },
      analysisMetadata: {
        totalSources: sourceCount,
        avgConfidence: 50,
        claimType: 'general',
        complexity: 'unknown'
      }
    };
  }
}