import axios from 'axios';
import * as cheerio from 'cheerio';

export class RealContentScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.timeout = 15000;
  }

  async searchMultipleSources(query) {
    console.log(`🕷️ Scraping multiple sources for: ${query}`);
    
    const sources = [
      { name: 'Reuters', domain: 'reuters.com', credibility: 96 },
      { name: 'Associated Press', domain: 'apnews.com', credibility: 95 },
      { name: 'BBC News', domain: 'bbc.com', credibility: 94 },
      { name: 'NPR', domain: 'npr.org', credibility: 92 },
      { name: 'Politico', domain: 'politico.com', credibility: 86 }
    ];
    
    const results = [];
    
    for (const source of sources) {
      try {
        const articles = await this.searchSourceViaGoogle(query, source);
        results.push(...articles);
      } catch (error) {
        console.warn(`⚠️ Failed to scrape ${source.name}:`, error.message);
      }
    }
    
    return results.slice(0, 10); // Limit results
  }

  async searchSourceViaGoogle(query, source) {
    try {
      const searchQuery = `site:${source.domain} ${query}`;
      const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=5`;
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout
      });
      
      const $ = cheerio.load(response.data);
      const articles = [];
      
      $('.g').each((index, element) => {
        if (index >= 3) return false; // Limit to top 3 per source
        
        const $element = $(element);
        const titleElement = $element.find('h3').first();
        const linkElement = $element.find('a[href]').first();
        const snippetElement = $element.find('.VwiC3b, .s3v9rd, .st').first();
        
        const title = titleElement.text().trim();
        const href = linkElement.attr('href');
        const snippet = snippetElement.text().trim();
        
        if (title && href && href.includes(source.domain)) {
          articles.push({
            title,
            description: snippet,
            url: href,
            source: source.name,
            publishedAt: new Date().toISOString(),
            content: snippet,
            credibilityScore: source.credibility
          });
        }
      });
      
      return articles;
      
    } catch (error) {
      console.error(`❌ Google search failed for ${source.name}:`, error.message);
      return [];
    }
  }

  async scrapeArticleContent(url) {
    try {
      console.log(`📖 Scraping full content from: ${url}`);
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout
      });
      
      const $ = cheerio.load(response.data);
      
      // Try multiple content selectors
      const contentSelectors = [
        'article',
        '.article-content',
        '.story-body',
        '.post-content',
        '.entry-content',
        'main',
        '.content'
      ];
      
      let content = '';
      
      for (const selector of contentSelectors) {
        const $content = $(selector);
        if ($content.length > 0) {
          content = $content.text().trim();
          if (content.length > 200) break;
        }
      }
      
      // Fallback to all paragraphs
      if (content.length < 200) {
        content = $('p').map((i, el) => $(el).text()).get().join(' ');
      }
      
      return content.substring(0, 2000); // Limit content length
      
    } catch (error) {
      console.error(`❌ Content scraping failed for ${url}:`, error.message);
      return '';
    }
  }
}