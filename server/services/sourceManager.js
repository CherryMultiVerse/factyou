export class SourceManager {
  constructor() {
    this.sources = [
      // Left-leaning sources
      {
        name: 'NPR',
        domain: 'npr.org',
        category: 'left',
        credibilityScore: 92,
        searchUrl: 'https://www.npr.org/search?query=',
        favicon: 'https://www.google.com/s2/favicons?domain=npr.org&sz=32'
      },
      {
        name: 'The Guardian',
        domain: 'theguardian.com',
        category: 'left',
        credibilityScore: 89,
        searchUrl: 'https://www.theguardian.com/us/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=theguardian.com&sz=32'
      },
      {
        name: 'Vox',
        domain: 'vox.com',
        category: 'left',
        credibilityScore: 85,
        searchUrl: 'https://www.vox.com/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=vox.com&sz=32'
      },
      {
        name: 'CNN',
        domain: 'cnn.com',
        category: 'left',
        credibilityScore: 83,
        searchUrl: 'https://www.cnn.com/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=cnn.com&sz=32'
      },
      {
        name: 'MSNBC',
        domain: 'msnbc.com',
        category: 'left',
        credibilityScore: 80,
        searchUrl: 'https://www.msnbc.com/search/?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=msnbc.com&sz=32'
      },
      
      // Center sources
      {
        name: 'Reuters',
        domain: 'reuters.com',
        category: 'center',
        credibilityScore: 96,
        searchUrl: 'https://www.reuters.com/site-search/?query=',
        favicon: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=32'
      },
      {
        name: 'Associated Press',
        domain: 'apnews.com',
        category: 'center',
        credibilityScore: 95,
        searchUrl: 'https://apnews.com/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=apnews.com&sz=32'
      },
      {
        name: 'BBC News',
        domain: 'bbc.com',
        category: 'center',
        credibilityScore: 94,
        searchUrl: 'https://www.bbc.com/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=bbc.com&sz=32'
      },
      {
        name: 'PBS NewsHour',
        domain: 'pbs.org',
        category: 'center',
        credibilityScore: 90,
        searchUrl: 'https://www.pbs.org/search/?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=pbs.org&sz=32'
      },
      {
        name: 'Axios',
        domain: 'axios.com',
        category: 'center',
        credibilityScore: 88,
        searchUrl: 'https://www.axios.com/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=axios.com&sz=32'
      },
      {
        name: 'Politico',
        domain: 'politico.com',
        category: 'center',
        credibilityScore: 86,
        searchUrl: 'https://www.politico.com/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=politico.com&sz=32'
      },
      {
        name: 'The Hill',
        domain: 'thehill.com',
        category: 'center',
        credibilityScore: 84,
        searchUrl: 'https://thehill.com/search/?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=thehill.com&sz=32'
      },
      
      // Right-leaning sources
      {
        name: 'Wall Street Journal',
        domain: 'wsj.com',
        category: 'right',
        credibilityScore: 87,
        searchUrl: 'https://www.wsj.com/search?query=',
        favicon: 'https://www.google.com/s2/favicons?domain=wsj.com&sz=32'
      },
      {
        name: 'Fox News',
        domain: 'foxnews.com',
        category: 'right',
        credibilityScore: 78,
        searchUrl: 'https://www.foxnews.com/search-results/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=foxnews.com&sz=32'
      },
      {
        name: 'New York Post',
        domain: 'nypost.com',
        category: 'right',
        credibilityScore: 75,
        searchUrl: 'https://nypost.com/search/',
        favicon: 'https://www.google.com/s2/favicons?domain=nypost.com&sz=32'
      },
      {
        name: 'Washington Examiner',
        domain: 'washingtonexaminer.com',
        category: 'right',
        credibilityScore: 73,
        searchUrl: 'https://www.washingtonexaminer.com/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=washingtonexaminer.com&sz=32'
      },
      {
        name: 'The American Conservative',
        domain: 'theamericanconservative.com',
        category: 'right',
        credibilityScore: 76,
        searchUrl: 'https://www.theamericanconservative.com/search/?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=theamericanconservative.com&sz=32'
      },
      {
        name: 'Daily Wire',
        domain: 'dailywire.com',
        category: 'right',
        credibilityScore: 70,
        searchUrl: 'https://www.dailywire.com/search?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=dailywire.com&sz=32'
      },
      
      // International sources
      {
        name: 'Al Jazeera',
        domain: 'aljazeera.com',
        category: 'international',
        credibilityScore: 83,
        searchUrl: 'https://www.aljazeera.com/search/',
        favicon: 'https://www.google.com/s2/favicons?domain=aljazeera.com&sz=32'
      },
      {
        name: 'Deutsche Welle',
        domain: 'dw.com',
        category: 'international',
        credibilityScore: 88,
        searchUrl: 'https://www.dw.com/search/?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=dw.com&sz=32'
      },
      {
        name: 'France24',
        domain: 'france24.com',
        category: 'international',
        credibilityScore: 85,
        searchUrl: 'https://www.france24.com/en/search/?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=france24.com&sz=32'
      },
      
      // Fact-checking sources
      {
        name: 'FactCheck.org',
        domain: 'factcheck.org',
        category: 'external',
        credibilityScore: 94,
        searchUrl: 'https://www.factcheck.org/search/?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=factcheck.org&sz=32'
      },
      {
        name: 'Snopes',
        domain: 'snopes.com',
        category: 'external',
        credibilityScore: 92,
        searchUrl: 'https://www.snopes.com/search/?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=snopes.com&sz=32'
      },
      {
        name: 'PolitiFact',
        domain: 'politifact.com',
        category: 'external',
        credibilityScore: 90,
        searchUrl: 'https://www.politifact.com/search/?q=',
        favicon: 'https://www.google.com/s2/favicons?domain=politifact.com&sz=32'
      }
    ];

    // Add free fact-checking APIs
    this.factCheckAPIs = [
      {
        name: 'Google Fact Check Tools API',
        endpoint: 'https://factchecktools.googleapis.com/v1alpha1/claims:search',
        apiKey: process.env.GOOGLE_FACT_CHECK_API_KEY,
        enabled: !!process.env.GOOGLE_FACT_CHECK_API_KEY
      },
      {
        name: 'ClaimBuster API',
        endpoint: 'https://idir.uta.edu/claimbuster/api/v2/score/text/',
        apiKey: process.env.CLAIMBUSTER_API_KEY,
        enabled: !!process.env.CLAIMBUSTER_API_KEY
      }
    ];
  }

  getAllSources() {
    return this.sources;
  }

  getSourcesByCategory(category) {
    return this.sources.filter(source => source.category === category);
  }

  getSourceByDomain(domain) {
    return this.sources.find(source => source.domain === domain);
  }

  getHighCredibilitySources(minScore = 85) {
    return this.sources.filter(source => source.credibilityScore >= minScore);
  }

  getFactCheckAPIs() {
    return this.factCheckAPIs.filter(api => api.enabled);
  }

  // Get balanced source selection across spectrum with more sources
  getBalancedSources(maxPerCategory = 4) {
    const categories = ['left', 'center', 'right', 'international', 'external'];
    const balancedSources = [];

    categories.forEach(category => {
      const categorySources = this.getSourcesByCategory(category)
        .sort((a, b) => b.credibilityScore - a.credibilityScore)
        .slice(0, maxPerCategory);
      balancedSources.push(...categorySources);
    });

    return balancedSources;
  }

  // Get sources for intensive fact-checking
  getIntensiveFactCheckSources() {
    // Get top sources from each category for comprehensive analysis
    const leftSources = this.getSourcesByCategory('left').slice(0, 3);
    const centerSources = this.getSourcesByCategory('center').slice(0, 4);
    const rightSources = this.getSourcesByCategory('right').slice(0, 3);
    const internationalSources = this.getSourcesByCategory('international').slice(0, 2);
    const factCheckSources = this.getSourcesByCategory('external').slice(0, 3);

    return [
      ...leftSources,
      ...centerSources,
      ...rightSources,
      ...internationalSources,
      ...factCheckSources
    ];
  }
}