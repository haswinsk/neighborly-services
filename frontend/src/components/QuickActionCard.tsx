import { LucideIcon, ArrowRight } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "default" | "emergency";
}

export const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  variant = "default",
}: QuickActionCardProps) => {
  const isEmergency = variant === "emergency";
  
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg ${
        isEmergency
          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
          : "bg-card border border-border hover:border-primary/50"
      }`}
    >
      <div className="relative z-10">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
            isEmergency ? "bg-white/20" : "bg-primary/10"
          }`}
        >
          <Icon
            className={`w-6 h-6 ${isEmergency ? "text-white" : "text-primary"}`}
          />
        </div>
        
        <h3 className={`font-bold mb-1 ${isEmergency ? "text-white" : "text-foreground"}`}>
          {title}
        </h3>
        
        <p
          className={`text-sm mb-3 ${
            isEmergency ? "text-orange-50" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
        
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            isEmergency ? "text-white" : "text-primary"
          }`}
        >
          {isEmergency ? "Get Help" : "View"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
      
      {isEmergency && (
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
      )}
    </button>
  );
};
