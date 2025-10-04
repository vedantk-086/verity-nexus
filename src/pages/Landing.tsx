import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Link2, Image, Search, Save, GitCompare, TrendingUp, Clock, ArrowLeft } from "lucide-react";
import newspaperHero from "@/assets/newspaper-hero.png";
import { StatsWidget } from "@/components/StatsWidget";

const Landing = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  const handleAnalysis = (mode: string) => {
    navigate(`/analysis?mode=${mode}${searchInput ? `&query=${encodeURIComponent(searchInput)}` : ''}`);
  };

  const quickActions = [
    { icon: Save, label: "Saved Reports", action: () => {} },
    { icon: GitCompare, label: "Compare Sources", action: () => {} },
    { icon: TrendingUp, label: "Weekly Report", action: () => {} },
    { icon: Clock, label: "Recent Analysis", action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gradient">Fake-News Detection</h1>
            <div className="w-20"></div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title Section */}
              <div className="text-center space-y-4 animate-fade-in">
                <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                  Multi-Agent Fake-News
                  <br />
                  <span className="text-gradient">Detection Platform</span>
                </h2>
                <p className="text-2xl text-muted-foreground italic">
                  "Don't Believe If It Looks Fake — Verify First."
                </p>
              </div>

              {/* Hero Image */}
              <div className="flex justify-center animate-float">
                <img
                  src={newspaperHero}
                  alt="Futuristic Newspaper"
                  className="w-full max-w-2xl h-auto rounded-2xl glow-cyan"
                />
              </div>

              {/* Search Area */}
              <Card className="glassmorphism p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Paste news content, URL, or upload an image..."
                      className="pl-12 h-14 text-lg bg-muted/50 border-2 border-primary/30 focus:border-primary transition-all"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="glass"
                      size="lg"
                      className="h-auto py-6 flex-col gap-3"
                      onClick={() => handleAnalysis("text")}
                    >
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="space-y-1">
                        <p className="font-bold text-foreground">Title & Body Text</p>
                        <p className="text-xs text-muted-foreground">Paste news content</p>
                      </div>
                    </Button>

                    <Button
                      variant="glass"
                      size="lg"
                      className="h-auto py-6 flex-col gap-3"
                      onClick={() => handleAnalysis("url")}
                    >
                      <Link2 className="w-8 h-8 text-secondary" />
                      <div className="space-y-1">
                        <p className="font-bold text-foreground">Article URLs</p>
                        <p className="text-xs text-muted-foreground">Paste article link</p>
                      </div>
                    </Button>

                    <Button
                      variant="glass"
                      size="lg"
                      className="h-auto py-6 flex-col gap-3"
                      onClick={() => handleAnalysis("image")}
                    >
                      <Image className="w-8 h-8 text-accent" />
                      <div className="space-y-1">
                        <p className="font-bold text-foreground">Images with OCR</p>
                        <p className="text-xs text-muted-foreground">Upload an image</p>
                      </div>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="h-auto py-4 flex-col gap-2 glassmorphism hover:border-primary/50"
                    onClick={action.action}
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Stats Widget Sidebar */}
            <div className="lg:col-span-1">
              <StatsWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
