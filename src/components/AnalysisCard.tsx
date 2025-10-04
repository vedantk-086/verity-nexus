/**
 * Example Component: Analysis Result Card
 * Shows how to display analysis results from the backend
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { analyzeArticle } from '@/lib/api';
import type { AnalysisResult, ArticleInput } from '@/types/analysis';

interface AnalysisCardProps {
  result: AnalysisResult;
}

export function AnalysisCard({ result }: AnalysisCardProps) {
  // Determine verdict styling
  const verdictConfig = {
    real: {
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      icon: <CheckCircle className="w-6 h-6" />,
    },
    fake: {
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      icon: <AlertCircle className="w-6 h-6" />,
    },
    uncertain: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      icon: <HelpCircle className="w-6 h-6" />,
    },
  };

  const config = verdictConfig[result.verdictClass];

  return (
    <div className="space-y-6">
      {/* Main Verdict Card */}
      <Card className="glassmorphism border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={config.color}>{config.icon}</div>
              <div>
                <CardTitle className={`text-2xl ${config.color}`}>
                  {result.verdict}
                </CardTitle>
                <CardDescription>
                  {result.metadata.title}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={config.bgColor}>
              {result.overallConfidence.toUpperCase()} CONFIDENCE
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confidence Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Confidence Score</span>
              <span className="text-sm font-bold">{result.confidenceScore}%</span>
            </div>
            <Progress 
              value={result.confidenceScore} 
              className="h-2"
            />
          </div>

          {/* Recommendation */}
          <div className={`p-4 rounded-lg ${config.bgColor}`}>
            <p className="text-sm">{result.recommendation}</p>
          </div>

          {/* Source Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Source: {result.metadata.domain}</span>
            <span>•</span>
            <span>Input: {result.metadata.ingestedFrom}</span>
          </div>
        </CardContent>
      </Card>

      {/* Agent Signals Breakdown */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Analysis Breakdown</CardTitle>
          <CardDescription>
            Detailed signals from each detection agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(result.breakdown).map(([key, signal]) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{signal.label || key}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className={
                          signal.score >= 0.7 ? 'bg-green-500/20' :
                          signal.score >= 0.4 ? 'bg-yellow-500/20' :
                          'bg-red-500/20'
                        }
                      >
                        {(signal.score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <p className="text-sm text-muted-foreground">
                      {signal.details || 'No additional details'}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Confidence: {signal.confidence}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Weight: {((signal.weight || 0) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Evidence & External Sources */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>External Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="articles">
                Articles ({result.evidence.length})
              </TabsTrigger>
              <TabsTrigger value="factchecks">
                Fact-Checks ({result.factChecks.length})
              </TabsTrigger>
              <TabsTrigger value="social">
                Social ({result.socialDiscussions.length})
              </TabsTrigger>
            </TabsList>

            {/* Cross-Referenced Articles */}
            <TabsContent value="articles" className="space-y-3">
              {result.evidence.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No related articles found
                </p>
              ) : (
                result.evidence.map((article, idx) => (
                  <div key={idx} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start justify-between gap-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm hover:text-primary transition-colors">
                          {article.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    </a>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Fact-Checks */}
            <TabsContent value="factchecks" className="space-y-3">
              {result.factChecks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No fact-checks available
                </p>
              ) : (
                result.factChecks.map((check, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{check.claim}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={
                              check.rating.toLowerCase().includes('false') ? 'destructive' :
                              check.rating.toLowerCase().includes('true') ? 'default' :
                              'secondary'
                            }
                          >
                            {check.rating}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            by {check.publisher}
                          </span>
                        </div>
                      </div>
                      <a 
                        href={check.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Social Media Discussions */}
            <TabsContent value="social" className="space-y-3">
              {result.socialDiscussions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No social discussions found
                </p>
              ) : (
                result.socialDiscussions.map((discussion, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <a 
                      href={discussion.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <p className="text-sm font-medium hover:text-primary transition-colors">
                        {discussion.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>r/{discussion.subreddit}</span>
                        <span>•</span>
                        <span>↑ {discussion.score}</span>
                        <span>•</span>
                        <span>💬 {discussion.numComments}</span>
                      </div>
                    </a>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Suspicious Terms */}
      {result.suspiciousTerms.length > 0 && (
        <Card className="glassmorphism border-yellow-500/50">
          <CardHeader>
            <CardTitle className="text-yellow-500">Suspicious Language Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.suspiciousTerms.map((term, idx) => (
                <Badge key={idx} variant="outline" className="bg-yellow-500/10">
                  {term}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Example Usage in Your Page
// ============================================================================

export function ExampleUsage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (input: ArticleInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const analysisResult = await analyzeArticle(input);
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Your input form here */}
      
      {loading && <div>Analyzing...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {result && <AnalysisCard result={result} />}
    </div>
  );
}
