export interface NewsSource {
  name: string;
  domain: string;
  category: 'left' | 'center' | 'right' | 'international';
  credibilityScore: number;
  searchUrl?: string;
  favicon: string;
}

const sources: NewsSource[] = [
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
  
  // International sources
  {
    name: 'Al Jazeera',
    domain: 'aljazeera.com',
    category: 'international',
    credibilityScore: 83,
    searchUrl: 'https://www.aljazeera.com/search/',
    favicon: 'https://www.google.com/s2/favicons?domain=aljazeera.com&sz=32'
  }
];

export default sources;