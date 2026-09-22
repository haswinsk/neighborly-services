import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Bell, Mail, Shield, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [commissionRate, setCommissionRate] = useState(12);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been applied successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-600" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure platform-wide settings, commission rates, and notifications.
          </p>
        </div>

        {/* Commission */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold">Commission & Revenue</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Standard Commission Rate (%)</Label>
              <Input
                id="commission"
                type="number"
                min={0}
                max={30}
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Platform takes {commissionRate}% from each completed booking. Providers receive {100 - commissionRate}%.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-sm">Admin Email Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified for new verification requests</p>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-sm">Provider Notifications</p>
                <p className="text-xs text-muted-foreground">Send demand alerts to providers</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">Customer Review Reminders</p>
                <p className="text-xs text-muted-foreground">Prompt customers to review after job completion</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold">Provider Verification</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-sm">Auto-Approve Low Risk Applications</p>
                <p className="text-xs text-muted-foreground">
                  AI Consistency Score &gt;85 and Low Risk → skip manual review
                </p>
              </div>
              <Switch checked={autoApproveEnabled} onCheckedChange={setAutoApproveEnabled} />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>⚠️ Recommendation:</strong> Keep auto-approve disabled initially. Manual review ensures quality control during pilot phase.
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold">Email Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.example.com" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input id="smtp-user" placeholder="noreply@neighbourly.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-pass">SMTP Password</Label>
                <Input id="smtp-pass" type="password" placeholder="••••••••" />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
