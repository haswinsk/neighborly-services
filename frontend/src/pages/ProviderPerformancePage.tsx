import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from "recharts";
import {
  Brain,
  TrendingUp,
  Award,
  Star,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockPerformanceData = [
  { month: "Mar", jobs: 12, rating: 4.5, earnings: 12000 },
  { month: "Apr", jobs: 18, rating: 4.6, earnings: 15500 },
  { month: "May", jobs: 24, rating: 4.7, earnings: 22000 },
  { month: "Jun", jobs: 35, rating: 4.8, earnings: 32000 },
  { month: "Jul", jobs: 42, rating: 4.8, earnings: 41000 },
  { month: "Aug", jobs: 38, rating: 4.9, earnings: 38000 },
];

const ProviderPerformancePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance & AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            Track your Trust Score growth and get AI-powered recommendations to earn more.
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground">Trust Score</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">88</span>
              <span className="text-sm text-green-600 font-medium mb-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +12
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Top 15% in Coimbatore</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground">Avg Rating</span>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">4.8</span>
              <span className="text-sm text-green-600 font-medium mb-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +0.2
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">From 312 reviews</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground">Response Time</span>
              <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">18m</span>
              <span className="text-sm text-green-600 font-medium mb-1 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" /> -5m
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Faster than 80% of providers</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-primary">Verification Status</span>
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">
                Performance Verified
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Next tier: <span className="font-medium text-foreground">Expert</span> (needs 500 jobs)
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chart */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  Performance Growth
                </h2>
                <select className="text-sm border-none bg-transparent font-medium focus:ring-0">
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="jobs" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorJobs)" activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trust Score Breakdown */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Trust Score Breakdown</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Identity Verification", value: 18, max: 20 },
                  { label: "Skill Verification", value: 18, max: 20 },
                  { label: "Service Performance", value: 20, max: 20 },
                  { label: "Customer Feedback", value: 18, max: 20 },
                  { label: "Reliability", value: 14, max: 20 },
                ].map(item => {
                  const pct = (item.value / item.max) * 100;
                  const isLow = pct < 75;
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{item.value}/{item.max}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isLow ? "bg-amber-400" : "bg-green-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {isLow && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Area for improvement
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            {/* AI Review Summary */}
            <div className="rounded-xl border bg-card p-6 shadow-sm border-purple-100 dark:border-purple-800 bg-gradient-to-b from-purple-50/50 dark:from-purple-950/20 to-white dark:to-card">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-200">Review Intelligence</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI summary of your last 50 customer reviews:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2">What you do best</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full border border-green-200">Arriving on time (92%)</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full border border-green-200">Clean work area (88%)</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full border border-green-200">Polite behavior (85%)</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">AI Suggestion</h3>
                  <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-sm p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    4 recent reviews mentioned confusion about spare part pricing. <strong>Suggestion:</strong> Explain part costs clearly before starting the repair.
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunity Alerts */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Growth Opportunities
                </h2>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md shrink-0 mt-0.5">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">Add "Inverter AC" skill</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        Demand for Inverter AC repair is up 47% in RS Puram. Adding this verified skill could increase your bookings by ~12/month.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border hover:border-slate-300 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 group-hover:text-slate-900 transition-colors">Improve cancellation rate</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        You rejected 4 requests last week. Keeping rejection rate under 5% adds +3 points to reliability score.
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-xs h-8 mt-2">
                  View All Insights
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderPerformancePage;
