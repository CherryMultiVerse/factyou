import OpenAI from 'openai';

export class OpenAIAnalyzer {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
      console.log('✅ OpenAI API configured for real analysis');
    } else {
      console.warn('⚠️ OpenAI API key not configured - using fallback analysis');
      this.openai = null;
    }
  }

  async analyzeContentForClaim(claim, content, article) {
    if (!this.openai) {
      return this.getFallbackAnalysis(claim, content, article);
    }

    try {
      console.log(`🧠 AI analyzing: ${article.source} - ${article.title?.substring(0, 50)}...`);
      
      const prompt = this.buildAnalysisPrompt(claim, content, article);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert fact-checker. Analyze content objectively and provide witty but accurate summaries. Focus on factual accuracy over political bias."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      });

      const analysis = this.parseAIResponse(response.choices[0].message.content);
      console.log(`✅ AI analysis complete: ${analysis.verdict} (${analysis.confidence}%)`);
      
      return analysis;
      
    } catch (error) {
      console.error(`❌ OpenAI analysis failed:`, error.message);
      return this.getFallbackAnalysis(claim, content, article);
    }
  }

  buildAnalysisPrompt(claim, content, article) {
    return `
FACT-CHECK ANALYSIS:

CLAIM: "${claim}"

SOURCE: ${article.source} (Credibility: ${article.credibilityScore}%)
ARTICLE: ${article.title}
URL: ${article.url}

CONTENT:
${content.substring(0, 1500)}

TASK:
Analyze if this content supports, contradicts, or is neutral toward the claim.

RESPOND IN JSON FORMAT:
{
  "verdict": "true|mostly-true|mixed|mostly-false|false|unverified",
  "confidence": 85,
  "summary": "One witty but accurate sentence about this source's take on the claim"
}

Be factual but engaging. Call out BS when you see it, give credit where due.
    `;
  }

  parseAIResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          verdict: parsed.verdict || 'unverified',
          confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
          summary: parsed.summary || 'AI analysis completed'
        };
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON');
    }

    // Fallback parsing
    return this.parseTextResponse(response);
  }

  parseTextResponse(response) {
    const responseLower = response.toLowerCase();
    
    let verdict = 'unverified';
    if (responseLower.includes('true') && !responseLower.includes('false')) {
      verdict = responseLower.includes('mostly') ? 'mostly-true' : 'true';
    } else if (responseLower.includes('false') && !responseLower.includes('true')) {
      verdict = responseLower.includes('mostly') ? 'mostly-false' : 'false';
    } else if (responseLower.includes('mixed')) {
      verdict = 'mixed';
    }

    const confidenceMatch = response.match(/(\d+)%/);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 60;

    return {
      verdict,
      confidence: Math.min(100, Math.max(0, confidence)),
      summary: response.substring(0, 150) + '...'
    };
  }

  getFallbackAnalysis(claim, content, article) {
    console.log(`🔄 Using fallback analysis for ${article.source}`);
    
    const claimWords = claim.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    // Simple keyword matching
    const matchCount = claimWords.filter(word => 
      word.length > 3 && contentLower.includes(word)
    ).length;
    
    const relevance = matchCount / claimWords.length;
    
    // Look for verdict indicators
    let verdict = 'unverified';
    let confidence = 50;
    
    if (contentLower.includes('false') || contentLower.includes('debunk')) {
      verdict = 'false';
      confidence = 70;
    } else if (contentLower.includes('true') || contentLower.includes('confirm')) {
      verdict = 'true';
      confidence = 70;
    } else if (contentLower.includes('mixed') || contentLower.includes('partial')) {
      verdict = 'mixed';
      confidence = 60;
    }
    
    confidence = Math.round(confidence * (0.5 + relevance * 0.5));
    
    return {
      verdict,
      confidence: Math.max(30, Math.min(85, confidence)),
      summary: `${article.source} provides coverage with ${Math.round(relevance * 100)}% relevance to the claim.`
    };
  }
}