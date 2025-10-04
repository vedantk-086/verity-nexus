import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export const StatsWidget = () => {
  const pieData = [
    { name: "Fake", value: 3245, color: "#ef4444" },
    { name: "Real", value: 8912, color: "#22c55e" },
    { name: "Uncertain", value: 690, color: "#eab308" },
  ];

  const totalAnalyzed = pieData.reduce((acc, item) => acc + item.value, 0);

  const trends = [
    { label: "Fake Detected", value: "+12%", trend: "up", icon: TrendingUp, color: "text-destructive" },
    { label: "Real Verified", value: "+8%", trend: "down", icon: TrendingDown, color: "text-green-500" },
    { label: "Analysis Speed", value: "2.3s", icon: Activity, color: "text-primary" },
  ];

  return (
    <div className="space-y-6 sticky top-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      {/* Main Stats Card */}
      <Card className="glassmorphism p-6 border-2 border-primary/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Live Dashboard</h3>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        {/* Total Count */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">Total Analyzed</p>
          <p className="text-5xl font-bold text-gradient">{totalAnalyzed.toLocaleString()}</p>
        </div>

        {/* Pie Chart */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{item.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {((item.value / totalAnalyzed) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trends Card */}
      <Card className="glassmorphism p-6 border-2 border-secondary/30">
        <h4 className="text-lg font-bold text-foreground mb-4">Recent Trends</h4>
        <div className="space-y-4">
          {trends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <trend.icon className={`w-4 h-4 ${trend.color}`} />
                <span className="text-sm text-foreground">{trend.label}</span>
              </div>
              <span className={`text-sm font-bold ${trend.color}`}>{trend.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="glassmorphism p-4 border border-accent/30">
        <p className="text-xs text-muted-foreground text-center">
          Data updates in real-time from our multi-agent verification system
        </p>
      </Card>
    </div>
  );
};
