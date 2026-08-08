import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export const StatCard = ({ title, value, icon: Icon, description }: StatCardProps) => (
  <div className="stat-card animate-slide-up">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="rounded-lg bg-primary/10 p-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);
