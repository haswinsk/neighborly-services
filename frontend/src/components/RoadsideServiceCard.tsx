import { Button } from "@/components/ui/button";
import { LucideIcon, ArrowRight, Clock } from "lucide-react";

interface RoadsideServiceCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  estimatedTime?: string;
  startingPrice?: number;
  hasProvider: boolean;
  onClick: () => void;
}

export const RoadsideServiceCard = ({
  name,
  description,
  icon: Icon,
  estimatedTime,
  startingPrice,
  hasProvider,
  onClick,
}: RoadsideServiceCardProps) => {
  return (
    <div className="group bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:border-orange-200 transition-all duration-300">
      <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
        <Icon className="w-7 h-7 text-orange-600" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {name}
      </h3>
      
      <p className="text-muted-foreground mb-4 min-h-[3rem]">
        {description}
      </p>

      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        {estimatedTime && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            {estimatedTime}
          </div>
        )}
        {startingPrice && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-semibold text-foreground">From ₹{startingPrice}</span>
          </div>
        )}
      </div>

      <Button 
        className="w-full gap-2"
        variant={hasProvider ? "default" : "outline"}
        onClick={onClick}
      >
        {hasProvider ? "Get Help" : "Book Now"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
