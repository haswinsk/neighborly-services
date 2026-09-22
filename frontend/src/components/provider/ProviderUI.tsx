import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Briefcase, Calendar, IndianRupee, MapPin, Power, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/StatusBadge";
import { Booking, BookingStatus } from "@/types";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingState, formatPrice, isRoadsideCategory } from "@/components/customer/CustomerUI";

export { EmptyState, ErrorState, LoadingState, formatPrice, isRoadsideCategory };

export const isActiveProviderJob = (booking: Booking) =>
  ["Accepted", "On The Way", "Arrived", "In Progress"].includes(booking.status);

export const nextProviderAction = (status: BookingStatus): { label: string; nextStatus: BookingStatus; tone?: "primary" | "emergency" } | null => {
  if (status === "Requested") return { label: "Accept", nextStatus: "Accepted" };
  if (status === "Accepted") return { label: "Mark On The Way", nextStatus: "On The Way" };
  if (status === "On The Way") return { label: "Mark Arrived", nextStatus: "Arrived" };
  if (status === "Arrived") return { label: "Start Service", nextStatus: "In Progress" };
  if (status === "In Progress") return { label: "Complete Service", nextStatus: "Completed" };
  return null;
};

export function AvailabilityToggle({
  isAvailable,
  isSaving,
  onChange,
}: {
  isAvailable: boolean;
  isSaving?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", isAvailable ? "border-green-200 dark:border-green-800 bg-green-50/70 dark:bg-green-950/20" : "border-red-100 dark:border-red-800 bg-red-50/60 dark:bg-red-950/20")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", isAvailable ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300")}>
            <Power className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">{isAvailable ? "Available" : "Offline"}</p>
            <p className="text-sm text-muted-foreground">
              {isAvailable ? "You're currently available for new service requests." : "You're offline and won't receive new requests."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-bold uppercase", isAvailable ? "text-green-700" : "text-red-700")}>
            {isAvailable ? "Online" : "Offline"}
          </span>
          <Switch checked={isAvailable} disabled={isSaving} onCheckedChange={onChange} aria-label="Toggle provider availability" />
        </div>
      </div>
    </div>
  );
}

export function ProviderRequestCard({
  booking,
  onAccept,
  onReject,
  isUpdating,
  detailsHref,
}: {
  booking: Booking;
  onAccept?: () => void;
  onReject?: () => void;
  isUpdating?: boolean;
  detailsHref: string;
}) {
  const emergency = isRoadsideCategory(booking.serviceName);

  return (
    <article className={cn("rounded-lg border bg-card p-5 shadow-sm transition hover:shadow-md", emergency && "border-orange-200 bg-orange-50/60")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {emergency && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-2 py-1 text-xs font-bold uppercase text-white">
                <AlertTriangle className="h-3.5 w-3.5" />
                On-Road Emergency
              </span>
            )}
            <StatusBadge status={booking.status} />
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">{booking.serviceName}</h2>
          <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {booking.customerName}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {booking.bookingDate}
            </span>
            <span className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              {formatPrice(booking.price)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {booking.customerCity || "Customer location pending"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
          {booking.status === "Requested" && (
            <>
              <Button size="sm" disabled={isUpdating} onClick={onAccept} className={emergency ? "bg-orange-600 hover:bg-orange-700" : ""}>
                {emergency ? "Accept Emergency" : "Accept"}
              </Button>
              <Button size="sm" variant="outline" disabled={isUpdating} onClick={onReject}>
                Reject
              </Button>
            </>
          )}
          <Link to={detailsHref}>
            <Button size="sm" variant="ghost" className="gap-2">
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function JobSummaryCard({ booking, href }: { booking: Booking; href: string }) {
  return (
    <Link to={href} className="block rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Briefcase className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{booking.serviceName}</p>
              <p className="truncate text-sm text-muted-foreground">{booking.customerName}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{formatPrice(booking.price)}</p>
        </div>
      </div>
    </Link>
  );
}
