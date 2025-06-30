import axios from 'axios';

export class RealTimeSearchAPI {
  constructor() {
    this.timeout = 12000;
    this.maxRetries = 3;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  async searchMultipleSources(query, sources) {
    console.log(`🔍 Starting real-time search for: "${query}"`);
    
    const searchPromises = sources.map(source => 
      this.searchSource(query, source)
        .catch(error => {
          console.warn(`⚠️ Search failed for ${source.name}:`, error.message);
          return this.getFallbackResult(query, source);
        })
    );

    const results = await Promise.allSettled(searchPromises);
    
    return results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)
      .filter(result => result.articles && result.articles.length > 0);
  }

  async searchSource(query, source) {
    // Try multiple search strategies in order
    const strategies = [
      () => this.searchViaGoogle(query, source),
      () => this.searchViaBing(query, source),
      () => this.searchViaDuckDuckGo(query, source),
      () => this.searchViaDirectSite(query, source)
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result && result.articles && result.articles.length > 0) {
          console.log(`✅ Found ${result.articles.length} articles from ${source.name}`);
          return result;
        }
      } catch (error) {
        console.warn(`Strategy failed for ${source.name}:`, error.message);
        continue;
      }
    }

    throw new Error(`All search strategies failed for ${source.name}`);
  }

  async searchViaGoogle(query, source) {
    const searchQuery = `site:${source.domain} ${query}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10`;
    
    const response = await this.makeRequest(url);
    return this.parseGoogleResults(response.data, source);
  }

  async searchViaBing(query, source) {
    const searchQuery = `site:${source.domain} ${query}`;
    const url = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}&count=10`;
    
    const response = await this.makeRequest(url);
    return this.parseBingResults(response.data, source);
  }

  async searchViaDuckDuckGo(query, source) {
    // DuckDuckGo instant answer API (free, no key required)
    const searchQuery = `site:${source.domain} ${query}`;
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await this.makeRequest(url);
    return this.parseDuckDuckGoResults(response.data, source);
  }

  async searchViaDirectSite(query, source) {
    if (!source.searchUrl) {
      throw new Error('No direct search URL available');
    }

    const url = source.searchUrl + encodeURIComponent(query);
    const response = await this.makeRequest(url);
    return this.parseDirectSiteResults(response.data, source);
  }

  parseGoogleResults(html, source) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const articles = [];

    $('.g').each((index, element) => {
      if (index >= 5) return false;
      
      const $element = $(element);
      const titleElement = $element.find('h3').first();
      const linkElement = $element.find('a[href]').first();
      const snippetElement = $element.find('.VwiC3b, .s3v9rd, .st').first();
      
      const title = titleElement.text().trim();
      const href = linkElement.attr('href');
      const snippet = snippetElement.text().trim();
      
      if (title && href && this.isValidUrl(href, source.domain)) {
        articles.push({
          title,
          url: href,
          snippet,
          source: source.name,
          publishDate: this.extractDateFromSnippet(snippet)
        });
      }
    });

    return { articles, source: source.name, searchEngine: 'Google' };
  }

  parseBingResults(html, source) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const articles = [];

    $('.b_algo').each((index, element) => {
      if (index >= 5) return false;
      
      const $element = $(element);
      const titleElement = $element.find('h2 a').first();
      const snippetElement = $element.find('.b_caption p').first();
      
      const title = titleElement.text().trim();
      const href = titleElement.attr('href');
      const snippet = snippetElement.text().trim();
      
      if (title && href && this.isValidUrl(href, source.domain)) {
        articles.push({
          title,
          url: href,
          snippet,
          source: source.name,
          publishDate: this.extractDateFromSnippet(snippet)
        });
      }
    });

    return { articles, source: source.name, searchEngine: 'Bing' };
  }

  parseDuckDuckGoResults(data, source) {
    const articles = [];
    
    // DuckDuckGo instant answers
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 3).forEach((topic, index) => {
        if (topic.FirstURL && topic.Text) {
          articles.push({
            title: topic.Text.substring(0, 100),
            url: topic.FirstURL,
            snippet: topic.Text,
            source: source.name,
            publishDate: ''
          });
        }
      });
    }

    return { articles, source: source.name, searchEngine: 'DuckDuckGo' };
  }

  parseDirectSiteResults(html, source) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const articles = [];

    // Use source-specific selectors
    const selectors = this.getSourceSelectors(source.domain);
    
    $(selectors.container).each((index, element) => {
      if (index >= 5) return false;
      
      const $element = $(element);
      const title = $element.find(selectors.title).text().trim();
      const url = this.extractUrl($element, selectors.url, source.domain);
      const snippet = $element.find(selectors.snippet).text().trim();
      
      if (title && url) {
        articles.push({
          title,
          url,
          snippet,
          source: source.name,
          publishDate: this.extractDateFromElement($element)
        });
      }
    });

    return { articles, source: source.name, searchEngine: 'Direct' };
  }

  getSourceSelectors(domain) {
    const selectors = {
      'reuters.com': {
        container: '[data-testid="MediaStoryCard"], .search-result-indiv',
        title: '[data-testid="Heading"], .search-result-title',
        url: 'a',
        snippet: '[data-testid="Body"], .search-result-content'
      },
      'apnews.com': {
        container: '.SearchResultsModule-results .PagePromo, .Component-root',
        title: '.PagePromoContentIcons-text .Link, h1, h2',
        url: 'a',
        snippet: '.PagePromo-description, .Component-root p'
      },
      'bbc.com': {
        container: '.ssrcss-1v7bkdm-PromoLink, .gs-c-promo',
        title: '.ssrcss-fasbqe-PromoHeadline, .gs-c-promo-heading__title',
        url: 'a',
        snippet: '.ssrcss-1f3bvyz-Summary, .gs-c-promo-summary'
      },
      'npr.org': {
        container: '.item, .story-wrap',
        title: '.title, .story-title',
        url: 'a',
        snippet: '.teaser, .story-text'
      },
      'cnn.com': {
        container: '.container__item, .cd__content',
        title: '.container__headline, .cd__headline',
        url: 'a',
        snippet: '.container__description, .cd__description'
      },
      'foxnews.com': {
        container: '.collection-article-list article, .article',
        title: '.title, h2, h3',
        url: 'a',
        snippet: '.dek, .excerpt'
      },
      'default': {
        container: 'article, .article, .post, .story, .news-item, .result',
        title: 'h1, h2, h3, .title, .headline',
        url: 'a',
        snippet: 'p, .excerpt, .summary, .description'
      }
    };

    return selectors[domain] || selectors.default;
  }

  async makeRequest(url, retryCount = 0) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        },
        timeout: this.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        console.log(`🔄 Retrying request to ${url} (attempt ${retryCount + 1})`);
        await this.delay(1000 * Math.pow(2, retryCount)); // Exponential backoff
        return this.makeRequest(url, retryCount + 1);
      }
      throw error;
    }
  }

  isRetryableError(error) {
    return error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' || 
           error.code === 'ECONNREFUSED' ||
           (error.response && error.response.status >= 500);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isValidUrl(url, domain) {
    if (!url) return false;
    
    const invalidPatterns = [
      '/search', '/tag/', '/category/', '/author/', '/page/',
      'javascript:', 'mailto:', '#', '/video/', '/gallery/',
      '/photos/', 'google.com', 'bing.com', 'duckduckgo.com'
    ];
    
    return !invalidPatterns.some(pattern => url.includes(pattern)) && 
           (url.includes(domain) || url.startsWith('http'));
  }

  extractUrl($element, selector, domain) {
    const $link = $element.find(selector).first();
    let href = $link.attr('href');
    
    if (!href) return null;
    
    if (href.startsWith('/')) {
      href = `https://${domain}${href}`;
    } else if (!href.startsWith('http')) {
      href = `https://${domain}/${href}`;
    }
    
    return href;
  }

  extractDateFromSnippet(snippet) {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{4}-\d{2}-\d{2})/,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i,
      /(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i
    ];

    for (const pattern of datePatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return '';
  }

  extractDateFromElement($element) {
    const dateSelectors = ['time', '.date', '.publish-date', '.timestamp', '[datetime]'];
    
    for (const selector of dateSelectors) {
      const $dateElement = $element.find(selector).first();
      if ($dateElement.length > 0) {
        return $dateElement.attr('datetime') || $dateElement.text().trim();
      }
    }

    return '';
  }

  getFallbackResult(query, source) {
    console.log(`🔄 Generating fallback result for ${source.name}`);
    
    return {
      articles: [{
        title: `${source.name} coverage of "${query.substring(0, 50)}..."`,
        url: `https://${source.domain}/search?q=${encodeURIComponent(query)}`,
        snippet: `Search results from ${source.name} may be available on their website. This is a fallback result due to search limitations.`,
        source: source.name,
        publishDate: new Date().toISOString().split('T')[0]
      }],
      source: source.name,
      searchEngine: 'Fallback'
    };
  }
}