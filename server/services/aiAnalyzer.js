import OpenAI from 'openai';

export class AIAnalyzer {
  constructor(apiKey) {
    if (!apiKey) {
      console.warn('⚠️ OpenAI API key not provided - using enhanced fallback analysis');
      this.openai = null;
    } else {
      console.log('✅ OpenAI API key configured - real AI analysis enabled');
      this.openai = new OpenAI({ apiKey });
    }
  }

  async analyzeContentForClaim(claim, content, source) {
    if (!this.openai) {
      console.log(`🔄 Using enhanced fallback analysis for ${source.name}`);
      return this.getEnhancedFallbackAnalysis(claim, content, source);
    }

    try {
      console.log(`🧠 AI analyzing content from ${source.name}...`);
      
      const prompt = this.buildAnalysisPrompt(claim, content, source);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert fact-checker with a sharp wit and no patience for BS. Analyze content objectively but with personality. Be sarcastic when appropriate, but always accurate. Focus on factual accuracy over political bias."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const analysis = this.parseAIResponse(response.choices[0].message.content);
      
      console.log(`✅ AI analysis complete for ${source.name}: ${analysis.verdict} (${analysis.confidence}% confidence)`);
      return analysis;
      
    } catch (error) {
      console.error(`❌ AI analysis failed for ${source.name}:`, error.message);
      return this.getEnhancedFallbackAnalysis(claim, content, source);
    }
  }

  buildAnalysisPrompt(claim, content, source) {
    return `
FACT-CHECK ANALYSIS TASK:

CLAIM TO VERIFY: "${claim}"

SOURCE: ${source.name} (${source.category}-leaning, credibility: ${source.credibilityScore}%)

CONTENT TO ANALYZE:
${content.content.substring(0, 2000)}...

INSTRUCTIONS:
1. Determine if this content supports, contradicts, or is neutral toward the claim
2. Assess the quality and relevance of the evidence presented
3. Consider the source's political lean and credibility in your analysis
4. Provide a confidence score (0-100) for your assessment
5. Be witty but factual in your summary

RESPOND IN THIS EXACT JSON FORMAT:
{
  "verdict": "true|mostly-true|mixed|mostly-false|false|unverified",
  "confidence": 85,
  "reasoning": "Brief explanation of your analysis",
  "summary": "One sarcastic but accurate sentence summarizing this source's take",
  "evidence_quality": "strong|moderate|weak|none",
  "relevance": "high|medium|low"
}

Be witty but factual. Call out BS when you see it, but give credit where it's due.
    `;
  }

  parseAIResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          verdict: parsed.verdict || 'unverified',
          confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
          reasoning: parsed.reasoning || 'AI analysis completed',
          summary: parsed.summary || 'Analysis provided by AI system',
          evidenceQuality: parsed.evidence_quality || 'moderate',
          relevance: parsed.relevance || 'medium'
        };
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error.message);
    }

    // Fallback parsing for non-JSON responses
    return this.parseNonJSONResponse(response);
  }

  parseNonJSONResponse(response) {
    const responseLower = response.toLowerCase();
    
    // Determine verdict from keywords
    let verdict = 'unverified';
    if (responseLower.includes('true') && !responseLower.includes('false')) {
      verdict = responseLower.includes('mostly') ? 'mostly-true' : 'true';
    } else if (responseLower.includes('false') && !responseLower.includes('true')) {
      verdict = responseLower.includes('mostly') ? 'mostly-false' : 'false';
    } else if (responseLower.includes('mixed') || responseLower.includes('partial')) {
      verdict = 'mixed';
    }

    // Extract confidence if mentioned
    const confidenceMatch = response.match(/(\d+)%/);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 60;

    return {
      verdict,
      confidence: Math.min(100, Math.max(0, confidence)),
      reasoning: 'AI provided analysis in text format',
      summary: response.substring(0, 150) + '...',
      evidenceQuality: 'moderate',
      relevance: 'medium'
    };
  }

  getEnhancedFallbackAnalysis(claim, content, source) {
    // Enhanced fallback analysis without AI
    const analysis = this.performAdvancedKeywordAnalysis(claim, content, source);
    
    return {
      verdict: analysis.verdict,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      summary: analysis.summary,
      evidenceQuality: analysis.evidenceQuality,
      relevance: analysis.relevance
    };
  }

  performAdvancedKeywordAnalysis(claim, content, source) {
    const claimLower = claim.toLowerCase();
    const contentLower = content.content.toLowerCase();
    
    // Extract key terms from claim
    const claimTerms = claimLower
      .split(/\s+/)
      .filter(term => term.length > 3 && !this.isStopWord(term))
      .slice(0, 8);
    
    // Check for term matches in content
    const termMatches = claimTerms.filter(term => 
      contentLower.includes(term)
    ).length;
    
    const relevance = termMatches / claimTerms.length;
    
    // Enhanced verdict indicators
    const supportIndicators = [
      'confirms', 'verified', 'proven', 'evidence shows', 'study finds',
      'research indicates', 'data suggests', 'experts agree', 'documented',
      'established', 'substantiated', 'corroborated'
    ];
    
    const contradictIndicators = [
      'false', 'incorrect', 'debunked', 'no evidence', 'contradicts',
      'disproven', 'misleading', 'inaccurate', 'unfounded', 'refuted',
      'disputed', 'challenged', 'questioned'
    ];
    
    const mixedIndicators = [
      'partially', 'some truth', 'complicated', 'nuanced', 'context',
      'depends', 'mixed evidence', 'unclear', 'disputed', 'controversial'
    ];
    
    let verdict = 'unverified';
    let confidence = 50;
    let reasoning = 'Enhanced keyword analysis performed';
    let evidenceQuality = 'moderate';
    
    const supportCount = supportIndicators.filter(indicator => 
      contentLower.includes(indicator)
    ).length;
    
    const contradictCount = contradictIndicators.filter(indicator => 
      contentLower.includes(indicator)
    ).length;
    
    const mixedCount = mixedIndicators.filter(indicator => 
      contentLower.includes(indicator)
    ).length;
    
    // Determine verdict based on indicator counts and relevance
    if (supportCount > contradictCount && supportCount > mixedCount && relevance > 0.3) {
      verdict = supportCount > 2 ? 'true' : 'mostly-true';
      confidence = Math.min(85, 60 + supportCount * 8);
      reasoning = 'Content contains strong supportive language and evidence';
      evidenceQuality = supportCount > 2 ? 'strong' : 'moderate';
    } else if (contradictCount > supportCount && contradictCount > mixedCount && relevance > 0.3) {
      verdict = contradictCount > 2 ? 'false' : 'mostly-false';
      confidence = Math.min(85, 60 + contradictCount * 8);
      reasoning = 'Content contradicts or debunks the claim';
      evidenceQuality = contradictCount > 2 ? 'strong' : 'moderate';
    } else if (mixedCount > 0 && relevance > 0.2) {
      verdict = 'mixed';
      confidence = Math.min(75, 50 + mixedCount * 6);
      reasoning = 'Content presents nuanced or mixed evidence';
      evidenceQuality = 'moderate';
    } else if (relevance < 0.2) {
      confidence = 30;
      reasoning = 'Low relevance between claim and content';
      evidenceQuality = 'weak';
    }
    
    // Adjust confidence based on relevance and source credibility
    confidence = Math.round(confidence * (0.4 + relevance * 0.6));
    confidence = Math.round(confidence * (0.8 + (source.credibilityScore / 100) * 0.2));
    
    const summary = this.generateEnhancedFallbackSummary(source.name, verdict, relevance, confidence);
    
    return {
      verdict,
      confidence: Math.max(20, Math.min(90, confidence)),
      reasoning,
      summary,
      evidenceQuality,
      relevance: relevance > 0.6 ? 'high' : relevance > 0.3 ? 'medium' : 'low'
    };
  }

  isStopWord(word) {
    const stopWords = new Set([
      'the', 'is', 'are', 'was', 'were', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'that', 'this', 'they', 'them', 'their', 'there', 'then', 'than', 'when', 'where', 'why', 'how', 'what', 'who',
      'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall', 'do', 'does', 'did', 'have', 'has', 'had'
    ]);
    return stopWords.has(word);
  }

  generateEnhancedFallbackSummary(sourceName, verdict, relevance, confidence) {
    const summaries = {
      'true': [
        `${sourceName} backs this up with solid reporting and evidence.`,
        `According to ${sourceName}, this checks out with strong documentation.`,
        `${sourceName} confirms this claim with credible sources.`
      ],
      'mostly-true': [
        `${sourceName} largely supports this, with some important caveats.`,
        `${sourceName} says this is mostly accurate with minor exceptions.`,
        `According to ${sourceName}, this is generally true but nuanced.`
      ],
      'mixed': [
        `${sourceName} presents a complex view with evidence on multiple sides.`,
        `${sourceName} shows this is more complicated than it initially appears.`,
        `According to ${sourceName}, the truth involves multiple perspectives.`
      ],
      'mostly-false': [
        `${sourceName} finds significant problems with this claim.`,
        `According to ${sourceName}, this is largely inaccurate or misleading.`,
        `${sourceName} reports serious issues with the evidence behind this.`
      ],
      'false': [
        `${sourceName} thoroughly debunks this claim with counter-evidence.`,
        `According to ${sourceName}, this is demonstrably false.`,
        `${sourceName} fact-checkers say this doesn't hold up to scrutiny.`
      ],
      'unverified': [
        `${sourceName} doesn't provide clear evidence either way on this.`,
        `According to ${sourceName}, this remains unclear or unsubstantiated.`,
        `${sourceName} coverage doesn't settle this question definitively.`
      ]
    };
    
    const options = summaries[verdict] || summaries['unverified'];
    let summary = options[Math.floor(Math.random() * options.length)];
    
    // Add relevance and confidence context
    if (relevance < 0.3) {
      summary += ` (Limited relevance to the specific claim)`;
    }
    
    if (confidence < 40) {
      summary += ` Analysis confidence is low due to limited evidence.`;
    }
    
    return summary;
  }
}