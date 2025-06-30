import Tesseract from 'tesseract.js';
import { InputDetectionResult, OCRResult } from '../types';

export class InputProcessor {
  
  /**
   * Main entry point for processing any type of input
   */
  static async processInput(input: string | File): Promise<InputDetectionResult> {
    if (input instanceof File) {
      return this.processImageInput(input);
    }
    
    const trimmedInput = input.trim();
    
    // Detect input type
    if (this.isURL(trimmedInput)) {
      return this.processLinkInput(trimmedInput);
    }
    
    return this.processTextInput(trimmedInput);
  }
  
  /**
   * Process text input (claims, statements)
   */
  private static processTextInput(text: string): InputDetectionResult {
    return {
      type: 'text',
      content: text,
      originalInput: text
    };
  }
  
  /**
   * Process link input (URLs to articles, social media posts)
   */
  private static async processLinkInput(url: string): Promise<InputDetectionResult> {
    try {
      const domain = this.extractDomain(url);
      
      // For now, we'll extract the URL and let the scraping system handle it
      // In a full implementation, we could fetch the page title/meta here
      
      return {
        type: 'link',
        content: url,
        originalInput: url,
        metadata: {
          domain
        }
      };
    } catch (error) {
      console.error('Error processing link:', error);
      // Fallback to treating as text
      return {
        type: 'text',
        content: url,
        originalInput: url
      };
    }
  }
  
  /**
   * Process image input with OCR
   */
  private static async processImageInput(file: File): Promise<InputDetectionResult> {
    try {
      console.log('🖼️ Starting OCR processing for:', file.name);
      const ocrResult = await this.performOCR(file);
      
      if (!ocrResult.success || !ocrResult.text.trim()) {
        throw new Error(ocrResult.error || 'No text found in image');
      }
      
      // Clean up OCR text
      const cleanedText = this.cleanOCRText(ocrResult.text);
      
      if (cleanedText.length < 10) {
        throw new Error('Extracted text too short to be meaningful');
      }
      
      console.log('✅ OCR completed successfully');
      
      return {
        type: 'image',
        content: cleanedText,
        originalInput: file.name,
        metadata: {
          imageSize: file.size,
          ocrConfidence: ocrResult.confidence
        }
      };
    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Perform OCR on image file using Tesseract.js
   */
  private static async performOCR(file: File): Promise<OCRResult> {
    try {
      console.log('🔍 Performing OCR analysis...');
      
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      const confidence = data.confidence;
      const text = data.text;
      
      console.log(`✅ OCR completed with ${confidence}% confidence`);
      
      return {
        text,
        confidence,
        success: true
      };
    } catch (error) {
      console.error('❌ OCR failed:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error instanceof Error ? error.message : 'OCR processing failed'
      };
    }
  }
  
  /**
   * Clean up OCR text output
   */
  private static cleanOCRText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove common OCR artifacts
      .replace(/[|\\]/g, '')
      // Remove isolated single characters (common OCR errors)
      .replace(/\b[a-zA-Z]\b/g, '')
      // Clean up punctuation
      .replace(/[.,;:!?]+/g, (match) => match[0])
      // Trim and normalize
      .trim();
  }
  
  /**
   * Check if input is a URL
   */
  private static isURL(input: string): boolean {
    try {
      new URL(input);
      return true;
    } catch {
      // Check for common URL patterns without protocol
      const urlPattern = /^(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
      return urlPattern.test(input) || input.startsWith('www.');
    }
  }
  
  /**
   * Extract domain from URL
   */
  private static extractDomain(url: string): string {
    try {
      // Add protocol if missing
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(fullUrl);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Validate if extracted text is meaningful for fact-checking
   */
  static validateExtractedText(text: string): { valid: boolean; reason?: string } {
    if (!text || text.trim().length === 0) {
      return { valid: false, reason: 'No text found' };
    }
    
    if (text.trim().length < 10) {
      return { valid: false, reason: 'Text too short to be meaningful' };
    }
    
    // Check if text is mostly gibberish (high ratio of non-alphabetic characters)
    const alphaRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
    if (alphaRatio < 0.5) {
      return { valid: false, reason: 'Text appears to be mostly symbols or numbers' };
    }
    
    // Check for common OCR failure patterns
    const gibberishPatterns = [
      /^[^a-zA-Z]*$/, // Only non-letters
      /(.)\1{5,}/, // Repeated characters
      /^[A-Z\s]{50,}$/ // All caps (often OCR errors)
    ];
    
    for (const pattern of gibberishPatterns) {
      if (pattern.test(text)) {
        return { valid: false, reason: 'Text appears to contain OCR errors' };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Get user-friendly description of input type
   */
  static getInputTypeDescription(result: InputDetectionResult): string {
    switch (result.type) {
      case 'text':
        return '📝 Text claim detected';
      case 'link':
        return `🔗 Link detected: ${result.metadata?.domain || 'unknown domain'}`;
      case 'image':
        return `🖼️ Image processed - OCR confidence: ${result.metadata?.ocrConfidence || 0}%`;
      default:
        return '🔍 Input processed';
    }
  }
}