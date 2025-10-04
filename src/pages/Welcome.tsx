import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Shield, TrendingUp, Activity, ArrowRight } from "lucide-react";
import platformPreview from "@/assets/platform-preview.png";

const Welcome = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Analyzed", value: "12,847", icon: Activity, color: "text-primary" },
    { label: "Fake Detected", value: "3,245", icon: Shield, color: "text-destructive" },
    { label: "Real Verified", value: "8,912", icon: TrendingUp, color: "text-green-500" },
    { label: "Uncertain", value: "690", icon: BarChart3, color: "text-yellow-500" },
  ];

  const domainStats = [
    { domain: "Politics", fake: 45, real: 55 },
    { domain: "Disasters", fake: 30, real: 70 },
    { domain: "Government", fake: 35, real: 65 },
    { domain: "Health", fake: 50, real: 50 },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">Multi-Agent</span>
            <br />
            <span className="text-foreground">Fake-News Detection</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powered by advanced AI to verify news authenticity in real-time
          </p>
        </div>

        {/* Platform Preview */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Card className="glassmorphism p-2 border-2 border-primary/30">
            <img
              src={platformPreview}
              alt="Platform Dashboard"
              className="w-full h-auto rounded-lg"
            />
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          {stats.map((stat, index) => (
            <Card key={index} className="glassmorphism p-6 hover:scale-105 transition-transform duration-300">
              <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Domain Statistics */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-gradient-secondary">Detection by Domain</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {domainStats.map((domain, index) => (
              <Card key={index} className="glassmorphism p-6 hover:border-primary/50 transition-all duration-300">
                <h3 className="text-xl font-bold mb-4 text-foreground">{domain.domain}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-destructive">Fake</span>
                      <span className="text-foreground font-semibold">{domain.fake}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-destructive to-destructive/70 rounded-full"
                        style={{ width: `${domain.fake}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-500">Real</span>
                      <span className="text-foreground font-semibold">{domain.real}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                        style={{ width: `${domain.real}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <Button
            variant="neon"
            size="xl"
            onClick={() => navigate("/landing")}
            className="group"
          >
            Enter Platform
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
