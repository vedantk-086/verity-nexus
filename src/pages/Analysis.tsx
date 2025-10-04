import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Save, Share2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Verdict = "real" | "fake" | "uncertain" | null;

const Analysis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const query = searchParams.get("query");

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    // Simulate analysis
    setTimeout(() => {
      const verdicts: Verdict[] = ["real", "fake", "uncertain"];
      const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
      setVerdict(randomVerdict);
      setConfidence(Math.floor(Math.random() * 30) + 70); // 70-100%
      setIsAnalyzing(false);
    }, 3000);
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

  const supportingResources = [
    { title: "Reuters Fact Check", url: "https://reuters.com", reliability: 95 },
    { title: "Snopes Verification", url: "https://snopes.com", reliability: 90 },
    { title: "AP News Reference", url: "https://apnews.com", reliability: 92 },
  ];

  const handleSave = () => {
    toast.success("Report saved successfully!");
  };

  const handleShare = () => {
    toast.success("Share link copied to clipboard!");
  };

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
              Back to Search
            </Button>
            <h1 className="text-xl font-bold text-gradient">Analysis Results</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleSave}>
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
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
                <p className="text-muted-foreground">Our AI agents are verifying the information</p>
              </Card>
            )}

            {/* Verdict Display */}
            {!isAnalyzing && verdictConfig && (
              <>
                <Card
                  className={`glassmorphism p-12 text-center border-4 ${verdictConfig.borderColor} ${verdictConfig.bgColor} animate-fade-in`}
                >
                  <verdictConfig.icon className={`w-24 h-24 mx-auto mb-6 ${verdictConfig.color} animate-float`} />
                  <h2 className={`text-5xl font-bold mb-4 ${verdictConfig.color}`}>
                    {verdictConfig.label}
                  </h2>
                  <p className="text-xl text-muted-foreground">{verdictConfig.message}</p>
                </Card>

                {/* Confidence Level */}
                <Card className="glassmorphism p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-foreground">Confidence Level</h3>
                      <span className="text-3xl font-bold text-gradient">{confidence}%</span>
                    </div>
                    <Progress value={confidence} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      Based on multi-agent analysis and cross-reference verification
                    </p>
                  </div>
                </Card>

                {/* Supporting Resources */}
                <Card className="glassmorphism p-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                  <h3 className="text-xl font-bold text-foreground mb-6">Supporting Evidence</h3>
                  <div className="space-y-4">
                    {supportingResources.map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{resource.title}</p>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {resource.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Reliability</p>
                          <p className="text-lg font-bold text-green-500">{resource.reliability}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
                  <Button variant="neon" size="lg" onClick={() => navigate("/landing")}>
                    Analyze Another
                  </Button>
                  <Button variant="glass" size="lg" onClick={handleSave}>
                    <Save className="mr-2" />
                    Save Report
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
