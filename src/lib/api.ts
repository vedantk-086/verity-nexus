/**
 * API Service for Fake News Detector Frontend
 * Handles all backend communication via Supabase Edge Functions
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ArticleInput {
  text?: string;
  title?: string;
  url?: string;
  imageUrl?: string;
}

export interface AgentSignal {
  name: string;
  score: number;
  confidence: 'low' | 'medium' | 'high';
  details: string;
}

export interface FactCheck {
  claim: string;
  rating: string;
  publisher: string;
  url: string;
  date?: string;
}

export interface Evidence {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  description: string;
  sentiment: 'supporting' | 'contradicting' | 'neutral';
}

export interface SocialDiscussion {
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  url: string;
  createdAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Highlight {
  text: string;
  type: string;
  position: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  verdict: 'Likely Real' | 'Uncertain' | 'Likely Fake';
  verdictClass: 'real' | 'uncertain' | 'fake';
  confidenceScore: number;
  overallConfidence: 'low' | 'medium' | 'high';
  recommendation: string;
  breakdown: {
    source: AgentSignal & { weight: number };
    language: AgentSignal & { weight: number };
    keywords: AgentSignal & { weight: number };
    factCheck: AgentSignal & { weight: number };
    crossReference: AgentSignal & { weight: number };
    socialMedia: AgentSignal & { weight: number };
  };
  suspiciousTerms: string[];
  evidence: Evidence[];
  factChecks: FactCheck[];
  socialDiscussions: SocialDiscussion[];
  keySignals: AgentSignal[];
  metadata: {
    domain: string;
    title: string;
    ingestedFrom: 'text' | 'url' | 'image';
  };
}

export interface BatchResult {
  id: string;
  success: boolean;
  error?: string;
  verdict?: string;
  confidenceScore?: number;
  breakdown?: AnalysisResult['breakdown'];
  metadata?: AnalysisResult['metadata'];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Analyze a single article (text, URL, or image)
 */
export async function analyzeArticle(input: ArticleInput): Promise<AnalysisResult> {
  try {
    console.log('Analyzing article:', input);
    
    // Call the analyze-article edge function
    const { data, error } = await supabase.functions.invoke('analyze-article', {
      body: input,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Analysis failed');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    console.log('Analysis result:', data);

    // Fetch supporting evidence
    try {
      const evidenceResult = await searchEvidence(input.text || input.title || '', input.title);
      if (evidenceResult) {
        data.evidence = evidenceResult.evidence || [];
        data.factChecks = evidenceResult.factChecks || [];
        data.socialDiscussions = evidenceResult.socialDiscussions || [];
      }
    } catch (evidenceError) {
      console.error('Evidence search failed:', evidenceError);
      // Continue with analysis even if evidence search fails
    }

    return data as AnalysisResult;
  } catch (error) {
    console.error('Error in analyzeArticle:', error);
    throw error;
  }
}

/**
 * Search for supporting evidence
 */
async function searchEvidence(query: string, title?: string) {
  try {
    const { data, error } = await supabase.functions.invoke('search-evidence', {
      body: { query, title },
    });

    if (error) {
      console.error('Evidence search error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error searching evidence:', error);
    return null;
  }
}

/**
 * Analyze multiple articles in batch mode (max 5)
 */
export async function analyzeBatch(articles: ArticleInput[]): Promise<{ results: BatchResult[] }> {
  if (articles.length > 5) {
    throw new Error('Maximum 5 articles per batch');
  }

  try {
    const results = await Promise.all(
      articles.map(async (article, index) => {
        try {
          const result = await analyzeArticle(article);
          return {
            id: `article-${index}`,
            success: true,
            verdict: result.verdict,
            verdictClass: result.verdictClass,
            confidenceScore: result.confidenceScore,
            overallConfidence: result.overallConfidence,
            recommendation: result.recommendation,
            breakdown: result.breakdown,
            metadata: result.metadata,
          };
        } catch (error) {
          return {
            id: `article-${index}`,
            success: false,
            error: error instanceof Error ? error.message : 'Analysis failed',
          };
        }
      })
    );

    return { results };
  } catch (error) {
    console.error('Batch analysis error:', error);
    throw error;
  }
}

/**
 * Get text highlights for suspicious phrases
 */
export async function getTextHighlights(text: string): Promise<{ highlights: Highlight[] }> {
  // Simple client-side implementation
  const highlights: Highlight[] = [];
  const suspiciousPatterns = [
    { pattern: /shocking|breaking|urgent/gi, type: 'sensational' as const, severity: 'medium' as const },
    { pattern: /must see|you won't believe|doctors hate/gi, type: 'clickbait' as const, severity: 'high' as const },
    { pattern: /never|always|everyone|no one/gi, type: 'absolutist' as const, severity: 'low' as const },
  ];

  suspiciousPatterns.forEach(({ pattern, type, severity }) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      highlights.push({
        text: match[0],
        type,
        position: match.index,
        reason: `Potentially ${type} language detected`,
        severity,
      });
    }
  });

  return { highlights };
}

/**
 * Health check
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color class based on verdict
 */
export function getVerdictColor(verdictClass: string): string {
  switch (verdictClass) {
    case 'real':
      return 'text-green-500';
    case 'fake':
      return 'text-red-500';
    case 'uncertain':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Get color class based on confidence score
 */
export function getConfidenceColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get emoji for verdict
 */
export function getVerdictEmoji(verdictClass: string): string {
  switch (verdictClass) {
    case 'real':
      return '✅';
    case 'fake':
      return '❌';
    case 'uncertain':
      return '⚠️';
    default:
      return '❓';
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get severity color for highlights
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'bg-red-500/20 border-red-500';
    case 'medium':
      return 'bg-yellow-500/20 border-yellow-500';
    case 'low':
      return 'bg-blue-500/20 border-blue-500';
    default:
      return 'bg-gray-500/20 border-gray-500';
  }
}
