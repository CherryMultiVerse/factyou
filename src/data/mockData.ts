// This file is now deprecated in favor of the lightweight scraping system
// Keeping for reference and potential fallback scenarios

import { AnalysisResult } from '../types';

export const deprecatedMockResults: AnalysisResult[] = [
  // Mock data kept for emergency fallback only
];

export const getRandomLoadingMessage = (): string => {
  const messages = [
    "Scraping trusted sources...",
    "Extracting page content...",
    "Analyzing article headlines...",
    "Cross-referencing evidence...",
    "Generating verdict...",
    "Calculating confidence scores...",
    "Synthesizing clever summary...",
    "Fact-checking in progress...",
    "Consulting the oracle of truth...",
    "Reading between the lines..."
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};