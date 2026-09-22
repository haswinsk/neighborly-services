import { DashboardLayout } from "@/components/DashboardLayout";
import { DollarSign, TrendingUp, Users, Award, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminRevenuePage = () => {
  const commissionRate = 12; // 12%
  const totalGrossRevenue = 2450000; // ₹24.5L
  const platformRevenue = totalGrossRevenue * (commissionRate / 100);
  const providerRevenue = totalGrossRevenue - platformRevenue;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            Revenue Model & Business
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform commission structure, revenue breakdown, and business model overview.
          </p>
        </div>

        {/* Revenue Split */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total GMV</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">₹{(totalGrossRevenue / 100000).toFixed(1)}L</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Gross Merchandise Value (6 months)</p>
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-green-50 dark:from-green-950/20 to-white dark:to-card border-green-200 dark:border-green-900 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Platform Revenue</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">₹{(platformRevenue / 100000).toFixed(1)}L</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">{commissionRate}% commission on completed bookings</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-muted-foreground">Provider Earnings</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{(providerRevenue / 100000).toFixed(1)}L</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{100 - commissionRate}% paid to providers</p>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Commission Structure</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Standard Commission: 12%</h3>
                <p className="text-sm text-muted-foreground">
                  Applied to all completed bookings. Charged only when the job is marked "Completed" by both parties.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1 text-blue-800 dark:text-blue-200">Tiered Commission (Future)</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  High-performing providers (Trust Score &gt;85, 200+ jobs) will qualify for reduced 10% commission to incentivize retention.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">No upfront fees</h3>
                <p className="text-sm text-muted-foreground">
                  Providers pay zero subscription or listing fees. Commission is deducted from completed job payment automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Model Canvas */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Business Model Overview</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Value Proposition</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                  <li>AI-powered provider matching (not just search)</li>
                  <li>Progressive verification (no certificate gatekeeping)</li>
                  <li>Trust Score transparency</li>
                  <li>Hyperlocal focus (15 km radius)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Customer Segments</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                  <li><strong>Primary:</strong> Urban households (Tier 2/3 cities)</li>
                  <li><strong>Secondary:</strong> Small businesses needing recurring services</li>
                  <li><strong>Emergency:</strong> On-road breakdown assistance users</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Revenue Streams</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                  <li>Commission on completed bookings (12%)</li>
                  <li>Future: Premium provider subscriptions</li>
                  <li>Future: Advertising for service brands</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Key Activities</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                  <li>AI training for NL search & matching</li>
                  <li>Provider verification & Trust Score maintenance</li>
                  <li>Customer support & dispute resolution</li>
                  <li>Demand forecasting & allocation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Competitive Advantage</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                  <li><strong>AI-first:</strong> Match quality, not just discovery</li>
                  <li><strong>Inclusive:</strong> Verifies skills, not just certificates</li>
                  <li><strong>Trust Intelligence:</strong> 5-dimension scoring system</li>
                  <li><strong>Language:</strong> Tamil/Tanglish NL support</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Growth Strategy</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                  <li>Launch: Coimbatore pilot (proven in mock data)</li>
                  <li>Q3 2026: Expand to Madurai, Salem, Trichy</li>
                  <li>Q4 2026: 10 Tier-2 cities across Tamil Nadu</li>
                  <li>2027: Pan-India expansion with localized AI</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Funding & Roadmap */}
        <div className="rounded-xl border bg-gradient-to-br from-purple-50 dark:from-purple-950/20 to-white dark:to-card border-purple-200 dark:border-purple-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-100 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-200">
              Future Roadmap
            </Badge>
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Seed Round Target (2026 Q4)</h3>
              <p className="text-sm text-muted-foreground">
                ₹2.5 Cr seed round to fund:<br/>
                • Engineering team expansion (AI/ML engineers)<br/>
                • 10-city expansion ops team<br/>
                • Provider acquisition (₹500 bonus for first 100 verified providers per city)<br/>
                • Marketing: Hyper-local digital ads + auto rickshaw branding
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">2027 Goals</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                <li>50,000 active providers across 50 cities</li>
                <li>2 million completed bookings</li>
                <li>₹200 Cr GMV</li>
                <li>Break-even in top 5 cities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminRevenuePage;
