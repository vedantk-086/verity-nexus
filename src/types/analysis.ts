/**
 * TypeScript Type Definitions for Fake News Detector
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface ArticleInput {
  text?: string;
  title?: string;
  url?: string;
  imageUrl?: string;
}

export type InputMode = 'text' | 'url' | 'image';

// ============================================================================
// ANALYSIS RESULT TYPES
// ============================================================================

export type VerdictType = 'Likely Real' | 'Uncertain' | 'Likely Fake';
export type VerdictClass = 'real' | 'uncertain' | 'fake';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type SeverityLevel = 'low' | 'medium' | 'high';

export interface AgentSignal {
  name: string;
  score: number;
  confidence: ConfidenceLevel;
  details: string;
  weight?: number;
}

export interface SignalBreakdown {
  source: AgentSignal & { weight: number; sourceType?: string };
  language: AgentSignal & { weight: number; metrics?: LanguageMetrics };
  keywords: AgentSignal & { weight: number };
  factCheck: AgentSignal & { weight: number };
  crossReference: AgentSignal & { weight: number };
  socialMedia: AgentSignal & { weight: number };
}

export interface LanguageMetrics {
  sentimentScore: string;
  sensationalWords: number;
  capsUsage: number;
  exclamations: number;
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
  type: 'sensational' | 'absolutist' | 'urgency' | 'conspiracy';
  position: number;
  reason: string;
  severity: SeverityLevel;
}

export interface AnalysisMetadata {
  domain: string;
  title: string;
  ingestedFrom: 'text' | 'url' | 'image';
}

export interface AnalysisResult {
  verdict: VerdictType;
  verdictClass: VerdictClass;
  confidenceScore: number;
  overallConfidence: ConfidenceLevel;
  recommendation: string;
  breakdown: SignalBreakdown;
  suspiciousTerms: string[];
  evidence: Evidence[];
  factChecks: FactCheck[];
  socialDiscussions: SocialDiscussion[];
  keySignals: AgentSignal[];
  metadata: AnalysisMetadata;
}

// ============================================================================
// BATCH ANALYSIS TYPES
// ============================================================================

export interface BatchResult {
  id: string;
  success: boolean;
  error?: string;
  verdict?: VerdictType;
  verdictClass?: VerdictClass;
  confidenceScore?: number;
  overallConfidence?: ConfidenceLevel;
  recommendation?: string;
  breakdown?: SignalBreakdown;
  metadata?: AnalysisMetadata;
}

export interface BatchResponse {
  results: BatchResult[];
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}

export interface BatchAnalysisState {
  isLoading: boolean;
  error: string | null;
  results: BatchResult[];
}

export interface HighlightsState {
  isLoading: boolean;
  error: string | null;
  highlights: Highlight[];
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface TextInputForm {
  text: string;
  title: string;
}

export interface UrlInputForm {
  url: string;
}

export interface ImageInputForm {
  imageUrl: string;
}

export interface MultiArticleForm {
  articles: ArticleInput[];
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface ChartDataPoint {
  name: string;
  score: number;
  confidence: ConfidenceLevel;
  color: string;
}

export interface ConfidenceBreakdownData {
  agent: string;
  score: number;
  weight: number;
  weightedScore: number;
}
