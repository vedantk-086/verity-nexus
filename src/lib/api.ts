/**
 * API Service for Fake News Detector Frontend
 * Handles all backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  sentiment: string;
}

export interface SocialDiscussion {
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  url: string;
  createdAt: string;
  sentiment: string;
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
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Analyze multiple articles in batch mode (max 5)
 */
export async function analyzeBatch(articles: ArticleInput[]): Promise<{ results: BatchResult[] }> {
  if (articles.length > 5) {
    throw new Error('Maximum 5 articles per batch');
  }

  const response = await fetch(`${API_BASE_URL}/analyze/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ articles }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get text highlights for suspicious phrases
 */
export async function getTextHighlights(text: string): Promise<{ highlights: Highlight[] }> {
  const response = await fetch(`${API_BASE_URL}/analyze/highlights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Health check
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error('Backend is not responding');
  }

  return response.json();
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
