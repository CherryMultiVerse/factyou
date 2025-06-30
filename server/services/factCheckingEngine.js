import { SourceManager } from './sourceManager.js';
import { ClaimAnalyzer } from './claimAnalyzer.js';
import { VerdictGenerator } from './verdictGenerator.js';
import { EnhancedFactCheckAPI } from './enhancedFactCheckAPI.js';
import { RobustContentScraper } from './robustContentScraper.js';

export class FactCheckingEngine {
  constructor(contentScraper, aiAnalyzer) {
    this.contentScraper = new RobustContentScraper();
    this.aiAnalyzer = aiAnalyzer;
    this.sourceManager = new SourceManager();
    this.claimAnalyzer = new ClaimAnalyzer();
    this.verdictGenerator = new VerdictGenerator();
    this.externalFactCheckAPI = new EnhancedFactCheckAPI();
  }

  async analyzeClaim(claim) {
    console.log('🎯 Starting comprehensive fact-check analysis...');
    
    try {
      // Step 1: Analyze the claim structure and extract key elements
      const claimAnalysis = await this.claimAnalyzer.analyzeClaim(claim);
      console.log('📊 Claim analysis complete');
      
      // Step 2: Check external fact-checking APIs first (parallel)
      const externalFactChecksPromise = this.externalFactCheckAPI.checkClaim(claim);
      
      // Step 3: Generate search queries for different source types
      const searchQueries = this.generateSearchQueries(claim, claimAnalysis);
      console.log('🔍 Generated search queries:', Object.keys(searchQueries));
      
      // Step 4: Get balanced source selection
      const selectedSources = this.sourceManager.getBalancedSources(3); // 3 per category
      console.log(`📰 Selected ${selectedSources.length} balanced sources`);
      
      // Step 5: Scrape content from multiple sources (parallel)
      const scrapingPromise = this.scrapeMultipleSources(searchQueries, selectedSources);
      
      // Wait for both external fact-checks and scraping to complete
      const [externalFactChecks, scrapingResults] = await Promise.all([
        externalFactChecksPromise,
        scrapingPromise
      ]);
      
      console.log(`🔍 Found ${externalFactChecks.length} external fact-checks`);
      console.log(`📰 Scraped ${scrapingResults.length} sources successfully`);
      
      // Step 6: Analyze scraped content with AI
      const contentAnalyses = await this.analyzeScrapedContent(claim, scrapingResults);
      console.log('🧠 AI analysis complete for all sources');
      
      // Step 7: Combine external fact-checks with scraped content
      const combinedAnalyses = [...contentAnalyses, ...externalFactChecks];
      console.log(`📊 Total analyses: ${combinedAnalyses.length}`);
      
      // Step 8: Generate overall verdict and summary
      const verdict = await this.verdictGenerator.generateVerdict(
        claim, 
        claimAnalysis, 
        combinedAnalyses
      );
      
      // Step 9: Format results for frontend
      const formattedResults = this.formatResults(claim, verdict, combinedAnalyses);
      
      return formattedResults;
      
    } catch (error) {
      console.error('💥 Fact-checking engine error:', error);
      return this.getFallbackResponse(claim, error);
    }
  }

  generateSearchQueries(claim, claimAnalysis) {
    const baseKeywords = claimAnalysis.keywords.slice(0, 4);
    const entities = claimAnalysis.entities.map(e => e.value).slice(0, 2);
    
    const queries = {
      primary: baseKeywords.join(' '),
      factCheck: `"${baseKeywords.slice(0, 2).join(' ')}" fact check`,
      news: `${baseKeywords.join(' ')} news`,
      recent: `${baseKeywords.join(' ')} 2024 2023`
    };

    // Add entity-based queries if available
    if (entities.length > 0) {
      queries.entity1 = `"${entities[0]}" ${baseKeywords[0]}`;
      if (entities.length > 1) {
        queries.entity2 = `"${entities[1]}" ${baseKeywords[0]}`;
      }
    }

    // Add claim-type specific queries
    switch (claimAnalysis.claimType) {
      case 'statistical':
        queries.statistics = `${baseKeywords.join(' ')} statistics data`;
        break;
      case 'scientific':
        queries.research = `${baseKeywords.join(' ')} study research`;
        break;
      case 'political':
        queries.political = `${baseKeywords.join(' ')} politics government`;
        break;
    }

    return queries;
  }

  async scrapeMultipleSources(searchQueries, sources) {
    const scrapingPromises = [];
    
    // Distribute queries across sources for better coverage
    const queryEntries = Object.entries(searchQueries);
    
    sources.forEach((source, sourceIndex) => {
      // Each source gets 2-3 different queries
      const sourceQueries = queryEntries.slice(
        sourceIndex * 2, 
        (sourceIndex * 2) + 3
      );
      
      sourceQueries.forEach(([queryType, query]) => {
        if (query && scrapingPromises.length < 20) { // Limit total requests
          scrapingPromises.push(
            this.scrapeSourceWithQuery(source, query, queryType)
              .catch(error => {
                console.warn(`⚠️ Scraping failed for ${source.name} (${queryType}):`, error.message);
                return null;
              })
          );
        }
      });
    });
    
    console.log(`🚀 Starting ${scrapingPromises.length} scraping operations...`);
    
    const results = await Promise.allSettled(scrapingPromises);
    const successfulResults = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)
      .filter(result => result && result.content && result.content.content);
    
    console.log(`✅ ${successfulResults.length} successful scraping operations`);
    return successfulResults.slice(0, 12); // Limit to top 12 results
  }

  async scrapeSourceWithQuery(source, query, queryType) {
    try {
      // Use robust content scraper to find actual articles
      const searchResults = await this.contentScraper.scrapeSearchResults(query, source);
      
      if (!searchResults.articles || searchResults.articles.length === 0) {
        console.warn(`No articles found for ${source.name} with query: ${query}`);
        return null;
      }
      
      // Get the most relevant article that's actually an article, not a search page
      const topArticle = searchResults.articles[0];
      console.log(`📖 Found article for ${source.name}: ${topArticle.title}`);
      console.log(`🔗 Article URL: ${topArticle.url}`);
      
      // Try to scrape the article content with fallbacks
      let articleContent;
      try {
        articleContent = await this.contentScraper.scrapeArticle(topArticle.url);
        console.log(`✅ Successfully scraped ${articleContent.wordCount} words from ${source.name}`);
      } catch (scrapeError) {
        console.warn(`Article scraping failed for ${topArticle.url}, using snippet`);
        // Use the snippet from search results as fallback
        articleContent = {
          url: topArticle.url,
          title: topArticle.title,
          content: topArticle.snippet || 'Content preview not available',
          wordCount: (topArticle.snippet || '').split(' ').length,
          publishDate: topArticle.publishDate || '',
          author: '',
          description: topArticle.snippet || '',
          scrapedAt: new Date().toISOString(),
          method: 'snippet-fallback'
        };
      }
      
      return {
        source: source,
        query: query,
        queryType: queryType,
        article: topArticle,
        content: articleContent,
        scrapedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`Complete scraping failed for ${source.name}:`, error.message);
      return null;
    }
  }

  async analyzeScrapedContent(claim, scrapingResults) {
    console.log(`🧠 Analyzing ${scrapingResults.length} scraped contents...`);
    
    const analysisPromises = scrapingResults.map(async (result, index) => {
      try {
        const analysis = await this.aiAnalyzer.analyzeContentForClaim(
          claim,
          result.content,
          result.source
        );
        
        console.log(`✅ Analysis ${index + 1}/${scrapingResults.length} complete: ${result.source.name}`);
        
        return {
          ...result,
          aiAnalysis: analysis
        };
      } catch (error) {
        console.warn(`AI analysis failed for ${result.source.name}:`, error.message);
        
        // Generate fallback analysis based on content
        const fallbackAnalysis = this.generateFallbackAnalysis(claim, result);
        
        return {
          ...result,
          aiAnalysis: fallbackAnalysis
        };
      }
    });
    
    const results = await Promise.all(analysisPromises);
    console.log(`🎯 Completed analysis for ${results.length} sources`);
    
    return results;
  }

  generateFallbackAnalysis(claim, result) {
    const content = result.content.content.toLowerCase();
    const claimLower = claim.toLowerCase();
    
    // Simple keyword matching for fallback
    const claimWords = claimLower.split(' ').filter(word => word.length > 3);
    const matchCount = claimWords.filter(word => content.includes(word)).length;
    const relevance = matchCount / claimWords.length;
    
    // Look for verdict indicators
    let verdict = 'unverified';
    let confidence = 50;
    
    if (content.includes('false') || content.includes('incorrect') || content.includes('debunk')) {
      verdict = 'false';
      confidence = 70;
    } else if (content.includes('true') || content.includes('confirm') || content.includes('verify')) {
      verdict = 'true';
      confidence = 70;
    } else if (content.includes('mixed') || content.includes('partial') || content.includes('complex')) {
      verdict = 'mixed';
      confidence = 60;
    }
    
    // Adjust confidence based on relevance
    confidence = Math.round(confidence * (0.5 + relevance * 0.5));
    
    return {
      verdict,
      confidence,
      reasoning: 'Fallback analysis based on keyword matching',
      summary: `${result.source.name} coverage found with ${Math.round(relevance * 100)}% relevance to the claim`,
      evidenceQuality: relevance > 0.5 ? 'moderate' : 'weak',
      relevance: relevance > 0.6 ? 'high' : relevance > 0.3 ? 'medium' : 'low'
    };
  }

  formatResults(claim, verdict, contentAnalyses) {
    const factCheckResults = contentAnalyses.map((analysis, index) => {
      // Ensure we have a valid article URL, not a search page
      let articleUrl = analysis.article?.url || analysis.url || '#';
      
      // Double-check that the URL is not a search page
      if (this.isSearchPageUrl(articleUrl)) {
        // Try to construct a better URL or use the source's homepage
        const domain = analysis.source?.domain;
        if (domain) {
          articleUrl = `https://${domain}`;
        }
      }

      return {
        id: `analysis-${index}-${Date.now()}`,
        source: analysis.source?.name || analysis.sourceName || 'External Source',
        category: analysis.source?.category || analysis.category || 'external',
        rating: analysis.aiAnalysis?.verdict || analysis.verdict || 'unverified',
        summary: analysis.aiAnalysis?.summary || analysis.summary || 'Analysis unavailable',
        url: articleUrl,
        credibilityScore: this.calculateCredibilityScore(analysis),
        favicon: analysis.source?.favicon || analysis.favicon || `https://www.google.com/s2/favicons?domain=example.com&sz=32`
      };
    });

    return {
      claim,
      overallRating: verdict.overallVerdict,
      confidence: verdict.confidence,
      tweetableSummary: verdict.sarcasticSummary,
      results: factCheckResults,
      analysisTime: 0 // Will be set by the main endpoint
    };
  }

  isSearchPageUrl(url) {
    const searchIndicators = [
      '/search',
      '?q=',
      '?query=',
      '?s=',
      '/results',
      '/find',
      'search?',
      'search/',
      '/tag/',
      '/category/',
      '/archive/',
      '/page/',
      '/author/'
    ];

    return searchIndicators.some(indicator => url.toLowerCase().includes(indicator));
  }

  calculateCredibilityScore(analysis) {
    const baseScore = analysis.source?.credibilityScore || 75;
    const aiConfidence = analysis.aiAnalysis?.confidence || 0;
    const contentQuality = (analysis.content?.wordCount || 0) > 200 ? 10 : 0;
    const methodBonus = analysis.content?.method === 'cheerio' ? 5 : 0;
    
    return Math.min(100, Math.max(0, baseScore + (aiConfidence - 50) * 0.3 + contentQuality + methodBonus));
  }

  getFallbackResponse(claim, error) {
    console.log('🔄 Generating enhanced fallback response due to error:', error.message);
    
    return {
      claim,
      overallRating: 'UNVERIFIED',
      confidence: 35,
      tweetableSummary: `"${claim.substring(0, 80)}..." - UNVERIFIED due to technical issues. Our enhanced fact-checking system encountered problems but is working to resolve them. (35% confidence) #FactCheck`,
      results: [
        {
          id: 'fallback-1',
          source: 'System Notice',
          category: 'center',
          rating: 'unverified',
          summary: `Enhanced analysis temporarily unavailable due to: ${error.message}. This could be due to network issues, source availability, or high demand. Our system includes multiple fallback mechanisms and external fact-checking APIs.`,
          url: '#',
          credibilityScore: 50,
          favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32'
        },
        {
          id: 'fallback-2',
          source: 'Recommendation',
          category: 'center',
          rating: 'unverified',
          summary: 'For immediate fact-checking, try searching reputable sources like Reuters, AP News, BBC, or dedicated fact-checkers like Snopes, PolitiFact, and FactCheck.org directly.',
          url: '#',
          credibilityScore: 75,
          favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32'
        }
      ],
      analysisTime: 0
    };
  }
}