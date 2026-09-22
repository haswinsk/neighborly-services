import { CheckCircle2, Circle, Clock } from "lucide-react";

interface BookingStatusTimelineProps {
  currentStatus: string;
}

const STATUS_ORDER = [
  "Requested",
  "Accepted",
  "On The Way",
  "Arrived",
  "In Progress",
  "CompletionRequested",
  "Completed",
];

const STATUS_LABELS: Record<string, string> = {
  Requested: "Requested",
  Accepted: "Accepted",
  "On The Way": "Provider On The Way",
  Arrived: "Arrived",
  "In Progress": "Service Started",
  CompletionRequested: "Completion Requested",
  Completed: "Service Completed",
};

export const BookingStatusTimeline = ({ currentStatus }: BookingStatusTimelineProps) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Status Timeline
      </h3>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {STATUS_ORDER.map((status, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            
            const Icon = isCompleted ? CheckCircle2 : isCurrent ? Clock : Circle;
            
            return (
              <div key={status} className="relative flex items-start gap-4">
                <div className="relative z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex-1 pt-0.5">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {STATUS_LABELS[status] || status}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-primary mt-1">In Progress</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
