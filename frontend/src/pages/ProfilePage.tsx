import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      <p className="mt-1 text-muted-foreground">Manage your account settings</p>

      <div className="mt-6 max-w-lg space-y-4 rounded-lg border bg-card p-6">
        <div>
          <Label>Name</Label>
          <Input className="mt-1" defaultValue={user?.name} />
        </div>
        <div>
          <Label>Email</Label>
          <Input className="mt-1" defaultValue={user?.email} disabled />
        </div>
        <div>
          <Label>Phone</Label>
          <Input className="mt-1" defaultValue={user?.phone} />
        </div>
        <div>
          <Label>Location</Label>
          <Input className="mt-1" defaultValue={user?.location} />
        </div>
        <Button onClick={() => toast({ title: "Profile updated!" })}>Save Changes</Button>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
