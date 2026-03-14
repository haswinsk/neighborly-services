import { BookingStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<BookingStatus, { className: string }> = {
  Requested: { className: "bg-warning/10 text-warning border-warning/20" },
  Accepted: { className: "bg-primary/10 text-primary border-primary/20" },
  "In Progress": { className: "bg-primary/10 text-primary border-primary/20" },
  Completed: { className: "bg-success/10 text-success border-success/20" },
  Rejected: { className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export const StatusBadge = ({ status }: { status: BookingStatus }) => (
  <Badge variant="outline" className={statusConfig[status].className}>
    {status}
  </Badge>
);
