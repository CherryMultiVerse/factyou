import axios from 'axios';
import * as cheerio from 'cheerio';

export class RobustContentScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.timeout = 15000;
    this.maxRetries = 2;
  }

  async scrapeSearchResults(query, source) {
    try {
      console.log(`🔍 Robust search for ${source.name}: ${query}`);
      
      // Use Google search with site-specific queries
      const searchUrl = `https://www.google.com/search?q=site:${source.domain} ${encodeURIComponent(query)}`;
      
      const response = await this.makeRequest(searchUrl);
      const $ = cheerio.load(response.data);
      const articles = [];

      // Extract Google search results
      $('.g').each((index, element) => {
        if (index >= 3) return false; // Limit to top 3 results
        
        const $element = $(element);
        const titleElement = $element.find('h3').first();
        const linkElement = $element.find('a[href]').first();
        const snippetElement = $element.find('.VwiC3b, .s3v9rd, .st').first();
        
        const title = titleElement.text().trim();
        const href = linkElement.attr('href');
        const snippet = snippetElement.text().trim();
        
        if (title && href && this.isValidArticleUrl(href, source.domain)) {
          articles.push({
            title,
            url: href,
            snippet,
            source: source.name
          });
        }
      });

      console.log(`📄 Found ${articles.length} articles from ${source.name}`);
      return { articles, source: source.name };
      
    } catch (error) {
      console.error(`❌ Search failed for ${source.name}:`, error.message);
      
      // Return fallback result instead of throwing
      return {
        articles: [{
          title: `${source.name} may have coverage of this topic`,
          url: `https://${source.domain}/search?q=${encodeURIComponent(query)}`,
          snippet: `Direct search on ${source.name} may yield additional results.`,
          source: source.name
        }],
        source: source.name
      };
    }
  }

  async scrapeArticle(url) {
    try {
      console.log(`📖 Scraping article: ${url}`);
      
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      
      // Extract article content
      const content = this.extractArticleContent($);
      const metadata = this.extractMetadata($);
      
      return {
        url,
        title: metadata.title,
        content: content.text,
        wordCount: content.wordCount,
        publishDate: metadata.publishDate,
        author: metadata.author,
        description: metadata.description,
        scrapedAt: new Date().toISOString(),
        method: 'cheerio'
      };
      
    } catch (error) {
      console.error(`❌ Article scraping failed for ${url}:`, error.message);
      
      // Return minimal content instead of throwing
      return {
        url,
        title: 'Content unavailable',
        content: `Unable to access content from ${url}. This may be due to paywall, geo-restrictions, or technical issues.`,
        wordCount: 0,
        publishDate: '',
        author: '',
        description: '',
        scrapedAt: new Date().toISOString(),
        method: 'fallback'
      };
    }
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
        },
        timeout: this.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        console.log(`🔄 Retrying request to ${url} (attempt ${retryCount + 1})`);
        await this.delay(1000 * (retryCount + 1));
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

  isValidArticleUrl(url, domain) {
    if (!url) return false;
    
    const invalidPatterns = [
      '/search', '/tag/', '/category/', '/author/', '/page/',
      'javascript:', 'mailto:', '#', '/video/', '/gallery/',
      '/photos/', 'google.com'
    ];
    
    return !invalidPatterns.some(pattern => url.includes(pattern)) && 
           (url.includes(domain) || url.startsWith('http'));
  }

  extractArticleContent($) {
    const contentSelectors = [
      'article .content',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.story-body',
      '.article-body',
      'main article',
      '.storytext', // NPR
      '.Article', // Reuters
      'main',
      '.content'
    ];

    let content = '';
    let $contentContainer = null;

    for (const selector of contentSelectors) {
      $contentContainer = $(selector);
      if ($contentContainer.length > 0) {
        break;
      }
    }

    if (!$contentContainer || $contentContainer.length === 0) {
      $contentContainer = $('p');
    }

    $contentContainer.each((index, element) => {
      const $element = $(element);
      
      if (this.isContentElement($element)) {
        const text = $element.text().trim();
        if (text.length > 20) {
          content += text + '\n\n';
        }
      }
    });

    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return {
      text: content || 'Content could not be extracted from this source.',
      wordCount: content.split(/\s+/).length
    };
  }

  isContentElement($element) {
    const excludeClasses = [
      'nav', 'navigation', 'menu', 'sidebar', 'footer', 'header',
      'ad', 'advertisement', 'promo', 'related', 'comments',
      'social', 'share', 'tags', 'metadata', 'widget'
    ];

    const className = $element.attr('class') || '';
    const id = $element.attr('id') || '';
    
    return !excludeClasses.some(exclude => 
      className.toLowerCase().includes(exclude) || 
      id.toLowerCase().includes(exclude)
    );
  }

  extractMetadata($) {
    return {
      title: $('title').text() || 
             $('meta[property="og:title"]').attr('content') || 
             $('h1').first().text() || '',
      
      description: $('meta[name="description"]').attr('content') || 
                  $('meta[property="og:description"]').attr('content') || '',
      
      author: $('meta[name="author"]').attr('content') || 
             $('[rel="author"]').text() || 
             $('.author').text() || '',
      
      publishDate: $('meta[property="article:published_time"]').attr('content') || 
                  $('meta[name="publish-date"]').attr('content') || 
                  $('time').attr('datetime') || ''
    };
  }

  async scrapeUrl(url) {
    return this.scrapeArticle(url);
  }
}