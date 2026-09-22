import { DashboardLayout } from "@/components/DashboardLayout";
import { MessageSquare } from "lucide-react";

const ProviderMessagesPage = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Messages</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Messaging feature coming soon. You'll be able to communicate with customers here.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default ProviderMessagesPage;
