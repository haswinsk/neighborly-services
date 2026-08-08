import { BookingStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<BookingStatus, { className: string; label: string }> = {
  Requested: { className: "bg-warning/10 text-warning border-warning/20", label: "Requested" },
  Accepted: { className: "bg-primary/10 text-primary border-primary/20", label: "Accepted" },
  "In Progress": { className: "bg-blue-100 text-blue-800 border-blue-200", label: "In Progress" },
  CompletionRequested: { className: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending Completion" },
  Completed: { className: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
  Rejected: { className: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" },
};

export const StatusBadge = ({ status }: { status: BookingStatus | string }) => {
  const config = statusConfig[status as BookingStatus] || {
    className: "bg-gray-100 text-gray-800 border-gray-200",
    label: status || "Unknown",
  };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
