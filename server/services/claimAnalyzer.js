import natural from 'natural';
import compromise from 'compromise';

export class ClaimAnalyzer {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  async analyzeClaim(claim) {
    console.log('🔬 Analyzing claim structure and content...');
    
    try {
      // Use compromise for NLP analysis
      const doc = compromise(claim);
      
      // Extract key components
      const analysis = {
        originalClaim: claim,
        keywords: this.extractKeywords(claim),
        entities: this.extractEntities(doc),
        claimType: this.classifyClaimType(claim),
        sentiment: this.analyzeSentimentSimple(claim),
        complexity: this.assessComplexity(claim),
        factualIndicators: this.findFactualIndicators(claim),
        temporalContext: this.extractTemporalContext(doc),
        confidence: this.calculateAnalysisConfidence(claim)
      };
      
      console.log('📊 Claim analysis complete:', {
        type: analysis.claimType,
        keywords: analysis.keywords.slice(0, 3),
        entities: analysis.entities.slice(0, 2),
        complexity: analysis.complexity
      });
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Claim analysis failed:', error);
      return this.getFallbackAnalysis(claim);
    }
  }

  extractKeywords(claim) {
    const tokens = this.tokenizer.tokenize(claim.toLowerCase());
    
    const stopWords = new Set([
      'the', 'is', 'are', 'was', 'were', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'that', 'this', 'they', 'them', 'their', 'there', 'then', 'than', 'when', 'where', 'why', 'how', 'what', 'who',
      'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall', 'do', 'does', 'did', 'have', 'has', 'had',
      'said', 'says', 'say', 'according', 'reports', 'claims', 'states', 'news', 'article'
    ]);
    
    const keywords = tokens
      .filter(token => 
        token.length > 2 && 
        !stopWords.has(token) && 
        !/^\d+$/.test(token) &&
        /^[a-zA-Z]+$/.test(token)
      )
      .map(token => this.stemmer.stem(token))
      .filter((token, index, arr) => arr.indexOf(token) === index)
      .slice(0, 8);
    
    return keywords;
  }

  extractEntities(doc) {
    const entities = [];
    
    try {
      const people = doc.people().out('array');
      entities.push(...people.map(person => ({ type: 'person', value: person })));
      
      const places = doc.places().out('array');
      entities.push(...places.map(place => ({ type: 'place', value: place })));
      
      const orgs = doc.organizations().out('array');
      entities.push(...orgs.map(org => ({ type: 'organization', value: org })));
      
      const dates = doc.dates().out('array');
      entities.push(...dates.map(date => ({ type: 'date', value: date })));
    } catch (error) {
      console.warn('Entity extraction failed:', error.message);
    }
    
    return entities.slice(0, 5);
  }

  classifyClaimType(claim) {
    const claimLower = claim.toLowerCase();
    
    if (/\d+%|\d+\s*(percent|million|billion|thousand)/.test(claimLower)) {
      return 'statistical';
    }
    
    if (/causes?|leads? to|results? in|because|due to/.test(claimLower)) {
      return 'causal';
    }
    
    if (/(more|less|better|worse|higher|lower|increased|decreased)\s+than/.test(claimLower)) {
      return 'comparative';
    }
    
    if (/(will|going to|predict|forecast|expect)/.test(claimLower)) {
      return 'predictive';
    }
    
    if (/(happened|occurred|was|were|did|in \d{4}|last year|yesterday)/.test(claimLower)) {
      return 'historical';
    }
    
    if (/(hoax|conspiracy|false flag|cover.?up|they don't want|hidden|secret)/.test(claimLower)) {
      return 'conspiracy';
    }
    
    if (/(study|research|scientists?|evidence|data|proves?)/.test(claimLower)) {
      return 'scientific';
    }
    
    return 'general';
  }

  analyzeSentimentSimple(claim) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'beneficial', 'helpful', 'successful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'harmful', 'dangerous', 'failed', 'wrong', 'false'];
    
    const words = claim.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    let sentiment = 'neutral';
    if (score > 0) sentiment = 'positive';
    else if (score < 0) sentiment = 'negative';
    
    return { score, sentiment };
  }

  assessComplexity(claim) {
    const wordCount = claim.split(/\s+/).length;
    const sentenceCount = claim.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    const complexWords = claim.split(/\s+/).filter(word => 
      this.countSyllables(word) >= 3
    ).length;
    
    const complexityScore = (avgWordsPerSentence * 0.4) + (complexWords * 0.6);
    
    let complexity = 'simple';
    if (complexityScore > 15) complexity = 'complex';
    else if (complexityScore > 8) complexity = 'moderate';
    
    return {
      score: complexityScore,
      level: complexity,
      wordCount,
      sentenceCount,
      complexWords
    };
  }

  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  findFactualIndicators(claim) {
    const indicators = {
      certainty: [],
      uncertainty: [],
      sources: [],
      timeframes: []
    };
    
    const claimLower = claim.toLowerCase();
    
    const certaintyPatterns = [
      /\b(definitely|certainly|absolutely|proven|confirmed|verified)\b/g,
      /\b(always|never|all|none|every|no one)\b/g
    ];
    
    certaintyPatterns.forEach(pattern => {
      const matches = claimLower.match(pattern);
      if (matches) indicators.certainty.push(...matches);
    });
    
    const uncertaintyPatterns = [
      /\b(allegedly|reportedly|supposedly|claims?|suggests?)\b/g,
      /\b(might|may|could|possibly|probably|likely)\b/g
    ];
    
    uncertaintyPatterns.forEach(pattern => {
      const matches = claimLower.match(pattern);
      if (matches) indicators.uncertainty.push(...matches);
    });
    
    const sourcePatterns = [
      /\b(according to|study|research|report|survey|poll)\b/g,
      /\b(expert|scientist|doctor|professor|official)\b/g
    ];
    
    sourcePatterns.forEach(pattern => {
      const matches = claimLower.match(pattern);
      if (matches) indicators.sources.push(...matches);
    });
    
    return indicators;
  }

  extractTemporalContext(doc) {
    try {
      const dates = doc.dates().out('array');
      const times = doc.match('#Date').out('array');
      
      return {
        explicitDates: dates,
        timeReferences: times,
        hasTemporalContext: dates.length > 0 || times.length > 0
      };
    } catch (error) {
      return {
        explicitDates: [],
        timeReferences: [],
        hasTemporalContext: false
      };
    }
  }

  calculateAnalysisConfidence(claim) {
    let confidence = 50;
    
    const wordCount = claim.split(/\s+/).length;
    if (wordCount > 20) confidence += 15;
    else if (wordCount > 10) confidence += 10;
    
    if (/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(claim)) confidence += 10;
    if (/\d{4}|\d+%|\$\d+/.test(claim)) confidence += 10;
    
    if (/(some|many|most|often|usually|generally)/.test(claim.toLowerCase())) confidence -= 10;
    
    return Math.min(95, Math.max(20, confidence));
  }

  getFallbackAnalysis(claim) {
    return {
      originalClaim: claim,
      keywords: claim.split(/\s+/).slice(0, 5),
      entities: [],
      claimType: 'general',
      sentiment: { score: 0, sentiment: 'neutral' },
      complexity: { level: 'moderate', score: 10 },
      factualIndicators: { certainty: [], uncertainty: [], sources: [], timeframes: [] },
      temporalContext: { hasTemporalContext: false },
      confidence: 50
    };
  }
}