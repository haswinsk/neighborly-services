import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import {
  Brain,
  TrendingUp,
  Zap,
  AlertCircle,
  Lightbulb,
  Clock,
  MapPin,
  DollarSign,
  Target,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDemandForecasts, getDemandAlerts } from "@/lib/aiService";

const hourlyDemand = [
  { hour: "6am", requests: 2 }, { hour: "8am", requests: 12 }, { hour: "10am", requests: 18 },
  { hour: "12pm", requests: 24 }, { hour: "2pm", requests: 28 }, { hour: "4pm", requests: 22 },
  { hour: "6pm", requests: 15 }, { hour: "8pm", requests: 8 }, { hour: "10pm", requests: 3 },
];

const ProviderAIInsightsPage = () => {
  const forecasts = getDemandForecasts();
  const alerts = getDemandAlerts();
  const myCategories = ["AC Repair", "Electrical"]; // Mock: provider's registered categories

  const relevantForecasts = forecasts.filter(f => myCategories.includes(f.category));
  const relevantAlerts = alerts.filter(a => myCategories.includes(a.category));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Copilot
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time demand intelligence and earning opportunities powered by AI forecasting.
            </p>
          </div>
          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Updated 5 min ago
          </Badge>
        </div>

        {/* Alerts */}
        {relevantAlerts.length > 0 && (
          <div className="space-y-3">
            {relevantAlerts.map(alert => {
              const colorMap = {
                opportunity: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30",
                warning: "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30",
                info: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30",
              };
              const iconMap = {
                opportunity: <Zap className="w-5 h-5 text-green-600" />,
                warning: <AlertCircle className="w-5 h-5 text-orange-600" />,
                info: <Lightbulb className="w-5 h-5 text-blue-600" />,
              };

              return (
                <div key={alert.id} className={`rounded-xl border p-4 ${colorMap[alert.type]}`}>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">{iconMap[alert.type]}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{alert.category}</span>
                        <span className="text-xs text-muted-foreground">• {alert.area}</span>
                      </div>
                      <p className="text-sm text-foreground">{alert.message}</p>
                    </div>
                    {alert.type === "opportunity" && (
                      <Button size="sm" variant="outline" className="shrink-0">
                        Go Online Now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Demand Forecast Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {relevantForecasts.map(forecast => {
            const growth = forecast.growthRate;
            const isHot = growth > 30;

            return (
              <div key={forecast.category} className={`rounded-xl border bg-card p-5 shadow-sm ${isHot ? "border-orange-200 ring-1 ring-orange-100" : ""}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{forecast.category}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Next 7 days forecast</p>
                  </div>
                  {isHot && (
                    <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-xs font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Hot
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">This Week</span>
                    <span className="text-2xl font-bold text-foreground">{forecast.currentDemand}</span>
                    <span className="text-sm text-muted-foreground ml-1">requests</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Next Week (AI)</span>
                    <span className="text-2xl font-bold text-green-600">{forecast.forecastedDemand}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      <span className="text-green-600 font-semibold">+{growth.toFixed(0)}%</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Peak hours:</span>
                    <span className="font-medium">{forecast.peakHours.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Hot zones:</span>
                    <span className="font-medium">{forecast.hotZones.join(", ")}</span>
                  </div>
                </div>

                {isHot && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-2 text-sm">
                      <Target className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Opportunity:</span> Being online during {forecast.peakHours[0]} in {forecast.hotZones[0]} could net you ~8-12 extra bookings this week.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hourly Demand Pattern */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Today's Demand Pattern</h2>
              <p className="text-xs text-muted-foreground mt-1">Live requests across your service categories</p>
            </div>
            <select className="text-sm border rounded-lg px-3 py-1.5 bg-background">
              <option>Today</option>
              <option>Yesterday</option>
              <option>This Week Avg</option>
            </select>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyDemand} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="requests" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">AI Insight:</span> Peak demand typically occurs 10am–2pm and 6–8pm. Staying online during these hours increases booking rate by 35% on average.
          </div>
        </div>

        {/* Earning Potential Calculator */}
        <div className="rounded-xl border bg-card p-6 shadow-sm bg-gradient-to-br from-purple-50/50 dark:from-purple-950/20 to-white dark:to-card border-purple-100 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-200">Weekly Earning Potential</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            AI projects what you could earn if you stay online during peak demand hours based on current market rates and your Trust Score.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-card rounded-lg border p-4">
              <span className="text-xs text-muted-foreground block mb-1">Conservative</span>
              <span className="text-2xl font-bold text-foreground">₹12,500</span>
              <p className="text-xs text-muted-foreground mt-1">~18 jobs, 3-4 hrs/day</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-950 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
              <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold block mb-1">Likely</span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹22,000</span>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">~32 jobs, 6-7 hrs/day</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <span className="text-xs text-muted-foreground block mb-1">Optimistic</span>
              <span className="text-2xl font-bold text-foreground">₹35,000</span>
              <p className="text-xs text-muted-foreground mt-1">~52 jobs, full availability</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="w-3.5 h-3.5" />
            Calculations factor in: your response time, Trust Score, category demand, and competitor availability.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderAIInsightsPage;
