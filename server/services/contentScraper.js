import axios from 'axios';
import * as cheerio from 'cheerio';

export class ContentScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.timeout = 15000;
    this.maxRetries = 2;
  }

  async scrapeSearchResults(query, source) {
    try {
      console.log(`🔍 Searching ${source.name} for: ${query}`);
      
      // Try multiple search strategies to find actual articles
      const strategies = [
        () => this.searchViaGoogle(query, source),
        () => this.searchDirectSite(query, source),
        () => this.searchViaAlternativeEngines(query, source)
      ];

      for (const strategy of strategies) {
        try {
          const result = await strategy();
          if (result && result.articles && result.articles.length > 0) {
            // Filter and validate articles to ensure they're actual content, not search pages
            const validArticles = await this.validateAndFilterArticles(result.articles, source);
            if (validArticles.length > 0) {
              console.log(`📄 Found ${validArticles.length} valid articles from ${source.name}`);
              return { articles: validArticles, source: source.name };
            }
          }
        } catch (error) {
          console.warn(`Search strategy failed for ${source.name}:`, error.message);
          continue;
        }
      }

      // If no valid articles found, return empty result
      console.warn(`⚠️ No valid articles found for ${source.name}`);
      return { articles: [], source: source.name };
      
    } catch (error) {
      console.error(`❌ Search failed for ${source.name}:`, error.message);
      return { articles: [], source: source.name };
    }
  }

  async searchViaGoogle(query, source) {
    // Use Google search with site-specific queries and recent date filters
    const searchUrl = `https://www.google.com/search?q=site:${source.domain} ${encodeURIComponent(query)}&tbs=qdr:y&num=10`;
    
    const response = await this.makeRequest(searchUrl);
    const $ = cheerio.load(response.data);
    const articles = [];

    $('.g').each((index, element) => {
      if (index >= 8) return false; // Get more results to filter from
      
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
          source: source.name,
          publishDate: this.extractDateFromSnippet(snippet)
        });
      }
    });

    return { articles, source: source.name };
  }

  async searchDirectSite(query, source) {
    if (!source.searchUrl) {
      throw new Error('No direct search URL available');
    }

    console.log(`🔄 Trying direct site search for ${source.name}`);
    const searchUrl = source.searchUrl + encodeURIComponent(query);
    const response = await this.makeRequest(searchUrl);
    const $ = cheerio.load(response.data);
    
    const selectors = this.getSearchSelectors(source.domain);
    const articles = [];
    
    $(selectors.container).each((index, element) => {
      if (index >= 5) return false;
      
      const $element = $(element);
      const title = $element.find(selectors.title).text().trim();
      const url = this.extractUrl($element, selectors.url, source.domain);
      const snippet = $element.find(selectors.snippet).text().trim();
      
      if (title && url && this.isValidArticleUrl(url, source.domain)) {
        articles.push({
          title,
          url,
          snippet,
          source: source.name,
          publishDate: this.extractDateFromElement($element)
        });
      }
    });
    
    return { articles, source: source.name };
  }

  async searchViaAlternativeEngines(query, source) {
    // Try Bing as alternative
    const searchQuery = `site:${source.domain} ${query}`;
    const url = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}&count=10`;
    
    const response = await this.makeRequest(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    $('.b_algo').each((index, element) => {
      if (index >= 5) return false;
      
      const $element = $(element);
      const titleElement = $element.find('h2 a').first();
      const snippetElement = $element.find('.b_caption p').first();
      
      const title = titleElement.text().trim();
      const href = titleElement.attr('href');
      const snippet = snippetElement.text().trim();
      
      if (title && href && this.isValidArticleUrl(href, source.domain)) {
        articles.push({
          title,
          url: href,
          snippet,
          source: source.name,
          publishDate: this.extractDateFromSnippet(snippet)
        });
      }
    });

    return { articles, source: source.name };
  }

  async validateAndFilterArticles(articles, source) {
    const validArticles = [];
    
    for (const article of articles) {
      // Skip if URL looks like a search page
      if (this.isSearchPageUrl(article.url)) {
        console.log(`⚠️ Skipping search page URL: ${article.url}`);
        continue;
      }

      // Try to validate the article by checking if it has substantial content
      try {
        const isValid = await this.validateArticleContent(article.url);
        if (isValid) {
          validArticles.push(article);
        } else {
          console.log(`⚠️ Article validation failed for: ${article.url}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not validate article ${article.url}:`, error.message);
        // Include it anyway if URL looks valid
        if (this.isValidArticleUrl(article.url, source.domain)) {
          validArticles.push(article);
        }
      }

      // Limit to top 3 valid articles per source
      if (validArticles.length >= 3) break;
    }

    return validArticles;
  }

  async validateArticleContent(url) {
    try {
      // Quick HEAD request to check if URL is accessible
      const response = await axios.head(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 5000,
        maxRedirects: 3
      });

      // Check content type
      const contentType = response.headers['content-type'] || '';
      return contentType.includes('text/html');
    } catch (error) {
      // If HEAD fails, assume it might still be valid
      return true;
    }
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

  async scrapeArticle(url) {
    try {
      console.log(`📖 Scraping article: ${url}`);
      
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      
      // Extract article content using multiple strategies
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
        scrapedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Article scraping failed for ${url}:`, error.message);
      
      // Return minimal content for failed scrapes
      return {
        url,
        title: 'Content unavailable',
        content: `Unable to access content from ${url}. This may be due to paywall, geo-restrictions, or technical issues.`,
        wordCount: 0,
        publishDate: '',
        author: '',
        description: '',
        scrapedAt: new Date().toISOString()
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
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: this.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 500 // Accept 4xx errors but retry 5xx
      });

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
        console.log(`🔄 Retrying request to ${url} (attempt ${retryCount + 1})`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.makeRequest(url, retryCount + 1);
      }
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSearchSelectors(domain) {
    const selectors = {
      'reuters.com': {
        container: '[data-testid="MediaStoryCard"], .search-result-indiv, .story-collection article',
        title: '[data-testid="Heading"], .search-result-title, .story-title',
        url: 'a',
        snippet: '[data-testid="Body"], .search-result-content, .story-summary'
      },
      'apnews.com': {
        container: '.SearchResultsModule-results .PagePromo, .Component-root, .CardHeadline',
        title: '.PagePromoContentIcons-text .Link, h1, h2, .CardHeadline-headline',
        url: 'a',
        snippet: '.PagePromo-description, .Component-root p'
      },
      'bbc.com': {
        container: '.ssrcss-1v7bkdm-PromoLink, .gs-c-promo, .media__content',
        title: '.ssrcss-fasbqe-PromoHeadline, .gs-c-promo-heading__title, .media__title',
        url: 'a',
        snippet: '.ssrcss-1f3bvyz-Summary, .gs-c-promo-summary, .media__summary'
      },
      'npr.org': {
        container: '.item, .story-wrap, '.story-text'',
        title: '.title, .story-title, h3',
        url: 'a',
        snippet: '.teaser, .story-text p'
      },
      'theguardian.com': {
        container: '.u-faux-block-link, .fc-item, .content__article-body',
        title: '.u-faux-block-link__overlay-link, .fc-item__title, h1',
        url: 'a',
        snippet: '.fc-item__standfirst, .trail-text'
      },
      'foxnews.com': {
        container: '.collection-article-list article, .article, '.content'',
        title: '.title, h2, h3, .headline',
        url: 'a',
        snippet: '.dek, .excerpt, .summary'
      },
      'cnn.com': {
        container: '.container__item, .cd__content, .zn-body__paragraph',
        title: '.container__headline, .cd__headline, h1',
        url: 'a',
        snippet: '.container__description, .cd__description'
      },
      'wsj.com': {
        container: '.WSJTheme--headline, .headline, article',
        title: '.WSJTheme--headlineText, .headline-text, h1, h2',
        url: 'a',
        snippet: '.WSJTheme--summary, .summary, .deck'
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

  extractUrl($element, selector, domain) {
    const $link = $element.find(selector).first();
    let href = $link.attr('href');
    
    if (!href) return null;
    
    // Handle relative URLs
    if (href.startsWith('/')) {
      href = `https://${domain}${href}`;
    } else if (href.startsWith('http')) {
      return href;
    } else if (!href.includes('://')) {
      href = `https://${domain}/${href}`;
    }
    
    return href;
  }

  isValidArticleUrl(url, domain) {
    if (!url) return false;
    
    // Filter out non-article URLs more strictly
    const invalidPatterns = [
      '/search',
      '?q=',
      '?query=',
      '?s=',
      '/tag/',
      '/category/',
      '/author/',
      '/page/',
      '/archive/',
      '/results',
      '/find',
      'javascript:',
      'mailto:',
      '#',
      '/video/',
      '/gallery/',
      '/photos/',
      'google.com',
      'bing.com',
      '/live/',
      '/live-',
      '/newsletter',
      '/subscribe',
      '/login',
      '/register'
    ];
    
    // Must contain the domain and be a proper article URL
    const containsDomain = url.includes(domain) || url.includes('http');
    const isNotInvalid = !invalidPatterns.some(pattern => url.toLowerCase().includes(pattern));
    
    // Additional check: URL should look like an article (has path segments)
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
      const hasSubstantialPath = pathSegments.length >= 1 && pathSegments.some(segment => segment.length > 3);
      
      return containsDomain && isNotInvalid && hasSubstantialPath;
    } catch (error) {
      return containsDomain && isNotInvalid;
    }
  }

  extractArticleContent($) {
    // Try multiple content selectors in order of preference
    const contentSelectors = [
      'article .content',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.story-body',
      '.article-body',
      'main article',
      '[data-module="ArticleBody"]',
      '.ssrcss-11r1m41-RichTextComponentWrapper', // BBC
      '.storytext', // NPR
      '.Article', // Reuters
      '.story-body__inner', // BBC
      '.entry-content-asset', // CNN
      '.article-wrap', // Fox News
      '.zn-body__paragraph', // CNN
      '.WSJTheme--article-body', // WSJ
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
      // Fallback: get all paragraphs
      $contentContainer = $('p');
    }

    // Extract text content
    $contentContainer.each((index, element) => {
      const $element = $(element);
      
      // Skip navigation, ads, and other non-content elements
      if (this.isContentElement($element)) {
        const text = $element.text().trim();
        if (text.length > 20) { // Only include substantial text
          content += text + '\n\n';
        }
      }
    });

    // Clean up the content
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
      'social', 'share', 'tags', 'metadata', 'widget', 'newsletter',
      'subscribe', 'signup', 'login', 'register'
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

  async scrapeUrl(url) {
    // Direct URL scraping for testing
    return this.scrapeArticle(url);
  }
}