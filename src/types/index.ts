export interface FactCheckResult {
  id: string;
  source: string;
  category: 'left' | 'center' | 'right' | 'international' | 'external' | 'fringe';
  rating: 'true' | 'mostly-true' | 'mixed' | 'mostly-false' | 'false' | 'unverified' | 'satirical';
  summary: string;
  url: string;
  credibilityScore: number;
  favicon?: string;
  fallback?: boolean;
  warning?: string; // For fringe sources
  specialty?: string; // Source specialty/focus area
}

export interface AnalysisResult {
  claim: string;
  overallRating: string;
  confidence: number;
  tweetableSummary: string;
  results: FactCheckResult[];
  analysisTime: number;
  dataQuality?: string;
  hasRealData?: boolean;
  sourceBreakdown?: {
    mainstream: number;
    fringe: number;
    factCheckers: number;
    international: number;
  };
  consensusAnalysis?: {
    mainstream: {
      dominantVerdict: string;
      strength: number;
      agreement: string;
    } | null;
    factCheckers: {
      dominantVerdict: string;
      strength: number;
      agreement: string;
    } | null;
    fringePresent: boolean;
    fringeNarrative: string | null;
  };
  crossSpectrumInsights?: string[];
}

export interface FeedbackData {
  rating: number;
  comment: string;
  helpful: boolean;
}

export interface InputDetectionResult {
  type: 'text' | 'link' | 'image';
  content: string;
  originalInput?: string;
  metadata?: {
    domain?: string;
    title?: string;
    imageSize?: number;
    ocrConfidence?: number;
  };
}

export interface OCRResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
}