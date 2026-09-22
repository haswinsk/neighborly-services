import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Star, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const reviewSentimentData = [
  { name: "Positive", value: 782, color: "#22c55e" },
  { name: "Neutral", value: 124, color: "#94a3b8" },
  { name: "Negative", value: 58, color: "#ef4444" },
  { name: "Mixed", value: 36, color: "#f59e0b" },
];

const topIssues = [
  { issue: "Late arrival", count: 28, trend: "down" },
  { issue: "Pricing confusion", count: 19, trend: "up" },
  { issue: "Incomplete work", count: 14, trend: "stable" },
  { issue: "Poor communication", count: 9, trend: "down" },
];

const categoryPerformance = [
  { category: "AC Repair", avgRating: 4.7, reviewCount: 342, sentiment: 89 },
  { category: "Plumbing", avgRating: 4.6, reviewCount: 289, sentiment: 86 },
  { category: "Electrical", avgRating: 4.5, reviewCount: 213, sentiment: 82 },
  { category: "Carpentry", avgRating: 4.4, reviewCount: 156, sentiment: 80 },
  { category: "Cleaning", avgRating: 4.3, reviewCount: 128, sentiment: 78 },
];

const AdminAIPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              AI Intelligence Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              System-wide AI analytics: review intelligence, trust trends, and match quality.
            </p>
          </div>
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
            Live Data
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-muted-foreground">Reviews Analyzed</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">1,000</span>
              <span className="text-sm text-green-600 font-medium mb-1">+142 this week</span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
              <span className="text-sm font-medium text-muted-foreground">Platform Avg Rating</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">4.6</span>
              <span className="text-sm text-green-600 font-medium mb-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +0.2
              </span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span className="text-sm font-medium text-muted-foreground">Positive Sentiment</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">81%</span>
              <span className="text-sm text-muted-foreground mb-1">782/964 reviews</span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-500 dark:text-orange-400" />
              <span className="text-sm font-medium text-muted-foreground">Flagged Reviews</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">18</span>
              <span className="text-sm text-orange-600 dark:text-orange-400 mb-1">Needs attention</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sentiment Distribution */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Review Sentiment Distribution</h2>
            <div className="h-[260px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewSentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {reviewSentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-4 space-y-3">
                {reviewSentimentData.map(d => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <div className="text-sm">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-muted-foreground ml-2">({d.value})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Issues */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">AI-Detected Issues (Last 30 Days)</h2>
            <div className="space-y-4">
              {topIssues.map((item, idx) => {
                const trendIcon = item.trend === "up" ? "↗" : item.trend === "down" ? "↘" : "→";
                const trendColor = item.trend === "up" ? "text-red-600" : item.trend === "down" ? "text-green-600" : "text-muted-foreground";
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-700 dark:text-orange-300 font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.issue}</p>
                        <p className="text-xs text-muted-foreground">{item.count} mentions</p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${trendColor}`}>{trendIcon}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg text-sm text-blue-800 dark:text-blue-200">
              <strong>AI Recommendation:</strong> "Pricing confusion" mentions are increasing. Consider adding pricing transparency guidelines to provider onboarding.
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Category Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Category</th>
                  <th className="text-left py-3 px-2 font-semibold">Avg Rating</th>
                  <th className="text-left py-3 px-2 font-semibold">Reviews</th>
                  <th className="text-left py-3 px-2 font-semibold">Positive Sentiment</th>
                  <th className="text-left py-3 px-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerformance.map(cat => (
                  <tr key={cat.category} className="border-b hover:bg-accent">
                    <td className="py-3 px-2 font-medium">{cat.category}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 dark:fill-yellow-500 text-yellow-400 dark:text-yellow-500" />
                        {cat.avgRating}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{cat.reviewCount}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[100px]">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${cat.sentiment}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{cat.sentiment}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {cat.sentiment >= 85 ? (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Healthy
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Watch
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Match Quality */}
        <div className="rounded-xl border bg-card p-6 shadow-sm bg-gradient-to-br from-purple-50/50 dark:from-purple-950/20 to-white dark:to-card border-purple-100 dark:border-purple-900">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            AI Match Quality
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Avg Match Score</span>
              <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">84</span>
              <p className="text-xs text-muted-foreground mt-1">Across all recommendations</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Customer Acceptance Rate</span>
              <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">76%</span>
              <p className="text-xs text-muted-foreground mt-1">Users book top 3 matches</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Match → Completion</span>
              <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">92%</span>
              <p className="text-xs text-muted-foreground mt-1">AI-matched jobs completed</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg text-sm text-purple-900 dark:text-purple-100">
            <strong>Insight:</strong> The AI matching algorithm is performing well. 92% of AI-recommended bookings complete successfully, 8% higher than manual selection.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAIPage;
