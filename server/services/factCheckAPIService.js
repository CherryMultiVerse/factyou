import axios from 'axios';

export class FactCheckAPIService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_FACT_CHECK_API_KEY;
    this.timeout = 10000;
  }

  async searchFactChecks(claim) {
    const results = [];
    
    // Try Google Fact Check Tools API
    if (this.googleApiKey) {
      try {
        const googleResults = await this.searchGoogleFactCheck(claim);
        results.push(...googleResults);
      } catch (error) {
        console.warn('⚠️ Google Fact Check API failed:', error.message);
      }
    }
    
    // Try free fact-checking sources via web scraping
    try {
      const scrapedResults = await this.scrapeFactCheckSites(claim);
      results.push(...scrapedResults);
    } catch (error) {
      console.warn('⚠️ Fact-check scraping failed:', error.message);
    }
    
    return results;
  }

  async searchGoogleFactCheck(claim) {
    try {
      console.log(`🔍 Searching Google Fact Check API for: ${claim.substring(0, 50)}...`);
      
      const response = await axios.get('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
        params: {
          query: claim,
          key: this.googleApiKey,
          languageCode: 'en'
        },
        timeout: this.timeout
      });

      const claims = response.data.claims || [];
      
      return claims.slice(0, 5).map(claim => ({
        title: `Fact Check: ${claim.text}`,
        description: claim.claimReview?.[0]?.textualRating || 'Fact-checked',
        url: claim.claimReview?.[0]?.url || '#',
        source: claim.claimReview?.[0]?.publisher?.name || 'Google Fact Check',
        publishedAt: claim.claimReview?.[0]?.reviewDate || new Date().toISOString(),
        content: `Claim: ${claim.text}\nRating: ${claim.claimReview?.[0]?.textualRating || 'No rating'}`,
        credibilityScore: 90
      }));
      
    } catch (error) {
      console.error('❌ Google Fact Check API failed:', error.message);
      return [];
    }
  }

  async scrapeFactCheckSites(claim) {
    // This would scrape sites like Snopes, PolitiFact, FactCheck.org
    // For now, return empty array to avoid complexity
    console.log('🕷️ Fact-check site scraping not yet implemented');
    return [];
  }
}