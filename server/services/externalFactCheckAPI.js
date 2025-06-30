import axios from 'axios';

export class ExternalFactCheckAPI {
  constructor() {
    this.timeout = 10000;
    this.apis = [
      {
        name: 'Google Fact Check Tools',
        enabled: !!process.env.GOOGLE_FACT_CHECK_API_KEY,
        check: this.checkGoogleFactCheck.bind(this)
      },
      {
        name: 'ClaimBuster',
        enabled: !!process.env.CLAIMBUSTER_API_KEY,
        check: this.checkClaimBuster.bind(this)
      }
    ];
  }

  async checkClaim(claim) {
    const results = [];
    
    for (const api of this.apis) {
      if (api.enabled) {
        try {
          console.log(`🔍 Checking ${api.name} for: ${claim.substring(0, 50)}...`);
          const apiResults = await api.check(claim);
          results.push(...apiResults);
        } catch (error) {
          console.warn(`⚠️ ${api.name} API failed:`, error.message);
        }
      }
    }
    
    return results;
  }

  async checkGoogleFactCheck(claim) {
    try {
      const response = await axios.get('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
        params: {
          query: claim,
          key: process.env.GOOGLE_FACT_CHECK_API_KEY,
          languageCode: 'en'
        },
        timeout: this.timeout
      });

      const claims = response.data.claims || [];
      
      return claims.slice(0, 3).map((claim, index) => ({
        source: {
          name: 'Google Fact Check',
          category: 'external',
          credibilityScore: 90
        },
        aiAnalysis: {
          verdict: this.mapGoogleRating(claim.claimReview?.[0]?.textualRating),
          confidence: 85,
          summary: `Google Fact Check: ${claim.claimReview?.[0]?.textualRating || 'No rating'} - ${claim.text}`,
          reasoning: 'External fact-checking database result'
        },
        article: {
          url: claim.claimReview?.[0]?.url || '#'
        },
        content: {
          content: claim.text || '',
          wordCount: (claim.text || '').split(' ').length
        },
        sourceName: claim.claimReview?.[0]?.publisher?.name || 'Google Fact Check',
        category: 'external',
        verdict: this.mapGoogleRating(claim.claimReview?.[0]?.textualRating),
        summary: `${claim.claimReview?.[0]?.publisher?.name || 'Fact-checker'}: ${claim.claimReview?.[0]?.textualRating || 'No rating'}`,
        url: claim.claimReview?.[0]?.url || '#',
        favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=32'
      }));
    } catch (error) {
      console.error('Google Fact Check API error:', error.message);
      return [];
    }
  }

  async checkClaimBuster(claim) {
    try {
      const response = await axios.post('https://idir.uta.edu/claimbuster/api/v2/score/text/', 
        { input_text: claim },
        {
          headers: {
            'x-api-key': process.env.CLAIMBUSTER_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      const score = response.data.results?.[0]?.score || 0;
      
      if (score > 0.5) {
        return [{
          source: {
            name: 'ClaimBuster',
            category: 'external',
            credibilityScore: 85
          },
          aiAnalysis: {
            verdict: score > 0.8 ? 'mixed' : 'unverified',
            confidence: Math.round(score * 100),
            summary: `ClaimBuster checkworthiness score: ${(score * 100).toFixed(1)}% - This claim may warrant fact-checking`,
            reasoning: 'Automated claim detection analysis'
          },
          article: {
            url: 'https://claimbuster.org'
          },
          content: {
            content: claim,
            wordCount: claim.split(' ').length
          },
          sourceName: 'ClaimBuster',
          category: 'external',
          verdict: score > 0.8 ? 'mixed' : 'unverified',
          summary: `ClaimBuster analysis suggests this claim has a ${(score * 100).toFixed(1)}% likelihood of being fact-checkable`,
          url: 'https://claimbuster.org',
          favicon: 'https://www.google.com/s2/favicons?domain=claimbuster.org&sz=32'
        }];
      }
      
      return [];
    } catch (error) {
      console.error('ClaimBuster API error:', error.message);
      return [];
    }
  }

  mapGoogleRating(rating) {
    if (!rating) return 'unverified';
    
    const ratingLower = rating.toLowerCase();
    
    if (ratingLower.includes('true') && !ratingLower.includes('false')) {
      return ratingLower.includes('mostly') ? 'mostly-true' : 'true';
    } else if (ratingLower.includes('false') && !ratingLower.includes('true')) {
      return ratingLower.includes('mostly') ? 'mostly-false' : 'false';
    } else if (ratingLower.includes('mixed') || ratingLower.includes('misleading')) {
      return 'mixed';
    }
    
    return 'unverified';
  }
}