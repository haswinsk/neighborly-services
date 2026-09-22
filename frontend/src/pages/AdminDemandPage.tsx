import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { TrendingUp, MapPin, Zap, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDemandForecasts, getDemandAlerts } from "@/lib/aiService";

const weeklyTrend = [
  { week: "Week 1", AC: 42, Plumbing: 28, Electrical: 22, Cleaning: 15 },
  { week: "Week 2", AC: 48, Plumbing: 32, Electrical: 26, Cleaning: 18 },
  { week: "Week 3", AC: 56, Plumbing: 35, Electrical: 24, Cleaning: 21 },
  { week: "Week 4", AC: 71, Plumbing: 38, Electrical: 29, Cleaning: 24 },
];

const AdminDemandPage = () => {
  const forecasts = getDemandForecasts();
  const alerts = getDemandAlerts();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Demand Prediction & Forecasting
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered demand insights to optimize provider allocation and pricing.
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
            <Zap className="w-3 h-3 mr-1" />
            AI Forecasts
          </Badge>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Active Demand Alerts
            </h2>
            {alerts.map(alert => {
              const bgMap = {
                opportunity: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
                warning: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
                info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
              };
              return (
                <div key={alert.id} className={`rounded-lg border p-4 ${bgMap[alert.type]}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{alert.category}</span>
                        <Badge variant="secondary" className="text-xs">{alert.area}</Badge>
                      </div>
                      <p className="text-sm text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Weekly Trend */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">4-Week Demand Trend</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="AC" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Plumbing" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Electrical" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Cleaning" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {[
              { label: "AC Repair", color: "#ef4444" },
              { label: "Plumbing", color: "#3b82f6" },
              { label: "Electrical", color: "#f59e0b" },
              { label: "Cleaning", color: "#22c55e" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Forecasts Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Category Forecasts (Next 7 Days)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forecasts.map(forecast => {
              const growth = forecast.growthRate;
              const isHot = growth > 30;
              return (
                <div
                  key={forecast.category}
                  className={`rounded-xl border bg-card p-5 shadow-sm ${isHot ? "border-orange-200 ring-1 ring-orange-100" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{forecast.category}</h3>
                    {isHot && (
                      <Badge variant="outline" className="bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Current</span>
                      <span className="text-2xl font-bold">{forecast.currentDemand}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Forecast</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{forecast.forecastedDemand}</span>
                    </div>
                  </div>

                  <div className="text-sm space-y-1.5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Peak: {forecast.peakDays.slice(0, 2).join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{forecast.hotZones[0]}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <span className={`text-sm font-semibold ${growth > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {growth > 0 ? "↗" : "↘"} {Math.abs(growth).toFixed(1)}% growth
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Provider Coverage */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Provider Coverage vs Demand</h2>
          <div className="space-y-4">
            {forecasts.map(f => {
              const providers = Math.floor(Math.random() * 8) + 2; // mock
              const ratio = providers / (f.forecastedDemand / 10);
              const status = ratio >= 1 ? "adequate" : ratio >= 0.6 ? "tight" : "shortage";
              const statusColor = status === "adequate" ? "text-green-600 dark:text-green-400" : status === "tight" ? "text-orange-600 dark:text-orange-400" : "text-red-600 dark:text-red-400";

              return (
                <div key={f.category} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex-1">
                    <span className="font-medium text-sm">{f.category}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {providers} providers / {f.forecastedDemand} requests
                  </div>
                  <span className={`text-sm font-semibold ${statusColor}`}>
                    {status === "adequate" ? "✓ Adequate" : status === "tight" ? "⚠ Tight" : "✗ Shortage"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDemandPage;
