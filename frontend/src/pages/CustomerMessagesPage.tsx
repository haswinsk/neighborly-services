import { useEffect, useMemo, useState } from "react";
import { Calendar, Inbox, MessageSquare, Search, Send, User } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { Booking } from "@/types";
import { EmptyState, ErrorState, LoadingState } from "@/components/customer/CustomerUI";

const CustomerMessagesPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ bookings: Booking[] }>("/bookings");
      setBookings(response.bookings);
      setActiveBookingId((current) => current || response.bookings[0]?.id || null);
    } catch {
      setError("Unable to load conversations.");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((booking) =>
      `${booking.providerName} ${booking.serviceName} ${booking.status}`.toLowerCase().includes(q),
    );
  }, [bookings, query]);

  const activeBooking = bookings.find((booking) => booking.id === activeBookingId) || filteredBookings[0];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="mt-1 text-muted-foreground">Conversation-ready UI for provider communication.</p>
        </div>

        {isLoading ? (
          <LoadingState label="Loading message threads..." />
        ) : error ? (
          <ErrorState description={error} onRetry={loadBookings} />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No conversations yet"
            description="Provider conversations will appear after you create a booking. The backend does not currently expose a messaging API."
          />
        ) : (
          <div className="grid min-h-[620px] overflow-hidden rounded-lg border bg-white dark:bg-card shadow-sm lg:grid-cols-[340px_1fr]">
            <aside className="border-b lg:border-b-0 lg:border-r">
              <div className="border-b p-4">
                <label className="relative block">
                  <span className="sr-only">Search conversations</span>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search provider or service"
                    className="pl-9"
                  />
                </label>
              </div>
              <div className="max-h-[520px] overflow-y-auto">
                {filteredBookings.map((booking) => (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => setActiveBookingId(booking.id)}
                    className={`flex w-full items-start gap-3 border-b p-4 text-left transition hover:bg-muted/60 ${
                      activeBooking?.id === booking.id ? "bg-blue-50 dark:bg-blue-950/30" : ""
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">{booking.providerName}</span>
                      <span className="block truncate text-sm text-muted-foreground">{booking.serviceName}</span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {booking.bookingDate}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="flex min-h-[520px] flex-col">
              {activeBooking ? (
                <>
                  <div className="border-b p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="font-semibold text-foreground">{activeBooking.providerName}</h2>
                        <p className="text-sm text-muted-foreground">{activeBooking.serviceName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4">
                    <div className="max-w-lg rounded-lg border bg-white dark:bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Messaging backend not connected
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This interface is ready for conversation data, but the current backend has no message endpoints or real-time channel. No fake messages are shown.
                      </p>
                    </div>
                  </div>

                  <div className="border-t p-4">
                    <div className="flex gap-3">
                      <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Message provider when messaging API is available"
                        disabled
                        className="min-h-11 resize-none"
                      />
                      <Button disabled className="gap-2">
                        <Send className="h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState title="Select a conversation" description="Choose a booking thread to view message details." />
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerMessagesPage;
