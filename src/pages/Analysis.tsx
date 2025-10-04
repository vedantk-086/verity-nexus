import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AnalysisCard } from "@/components/AnalysisCard";
import { analyzeArticle, type AnalysisResult } from "@/lib/api";

type Verdict = "real" | "fake" | "uncertain" | null;

const Analysis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const query = searchParams.get("query");

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performAnalysis = async () => {
      try {
        // Get input data from sessionStorage
        const storedInput = sessionStorage.getItem('analysisInput');
        if (!storedInput) {
          throw new Error('No input data found');
        }

        const input = JSON.parse(storedInput);
        console.log('Starting analysis with input:', input);

        // Call the analysis API
        const result = await analyzeArticle(input);
        console.log('Analysis complete:', result);

        setAnalysisResult(result);
        setVerdict(result.verdictClass);
        setIsAnalyzing(false);
        
        // Clear the stored input
        sessionStorage.removeItem('analysisInput');
      } catch (err) {
        console.error('Analysis error:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setIsAnalyzing(false);
        toast.error('Analysis failed. Please try again.');
      }
    };

    performAnalysis();
  }, []);

  const getVerdictConfig = () => {
    switch (verdict) {
      case "real":
        return {
          icon: CheckCircle2,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/50",
          label: "REAL NEWS",
          message: "This content appears to be authentic and verified.",
        };
      case "fake":
        return {
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/50",
          label: "FAKE NEWS",
          message: "This content shows signs of misinformation or fabrication.",
        };
      case "uncertain":
        return {
          icon: AlertCircle,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/50",
          label: "UNCERTAIN",
          message: "Unable to verify with high confidence. Exercise caution.",
        };
      default:
        return null;
    }
  };

  const verdictConfig = getVerdictConfig();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/landing")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2" />
              Back to Landing
            </Button>
            <h1 className="text-xl font-bold text-gradient">Analysis Results</h1>
            <div className="w-24"></div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Analysis Mode Info */}
            <Card className="glassmorphism p-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Analysis Mode</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{mode || "text"}</p>
                </div>
                {query && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Query</p>
                    <p className="text-sm text-foreground max-w-md truncate">{query}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Analyzing State */}
            {isAnalyzing && (
              <Card className="glassmorphism p-12 text-center animate-fade-in">
                <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Content...</h2>
                <p className="text-muted-foreground mb-4">Our AI agents are verifying the information</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Checking source credibility...</p>
                  <p>✓ Analyzing language patterns...</p>
                  <p>✓ Cross-referencing with fact-checkers...</p>
                  <p>✓ Searching for supporting evidence...</p>
                </div>
              </Card>
            )}

            {/* Error State */}
            {error && !isAnalyzing && (
              <Card className="glassmorphism p-12 text-center animate-fade-in border-2 border-destructive/50">
                <XCircle className="w-16 h-16 mx-auto mb-6 text-destructive" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Analysis Failed</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button variant="neon" onClick={() => navigate("/landing")}>
                  Try Again
                </Button>
              </Card>
            )}

            {/* Analysis Results */}
            {!isAnalyzing && !error && analysisResult && (
              <div className="animate-fade-in">
                <AnalysisCard result={analysisResult} />
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button variant="neon" size="lg" onClick={() => navigate("/landing")}>
                    Analyze Another
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
