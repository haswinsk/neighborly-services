import { useState, useEffect } from "react";
import { AlertTriangle, Bell, Briefcase, CheckCheck, Info, Settings, Trash2, User, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/customer/CustomerUI";
import { apiRequest } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  createdAt: string;
}

const getNotificationIcon = (notification: Notification) => {
  const text = `${notification.title} ${notification.message || ""}`.toLowerCase();
  if (text.includes("emergency") || text.includes("road")) return AlertTriangle;
  if (text.includes("provider")) return User;
  if (text.includes("booking")) return Briefcase;
  if (notification.type === "error" || notification.type === "warning") return AlertTriangle;
  if (notification.type === "success") return CheckCheck;
  return Info;
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const CustomerNotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiRequest<{ notifications: Notification[] }>("/notifications");
        setNotifications(res.notifications || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiRequest<{ notification: Notification }>(`/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // Silent fail
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest<{ message: string }>("/notifications/read-all", {
        method: "PATCH",
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // Silent fail
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      // Silent fail
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading notifications…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <EmptyState
          icon={AlertTriangle}
          title="Could not load notifications"
          description={error}
          action={{
            label: "Retry",
            onClick: () => window.location.reload(),
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="mt-1 text-muted-foreground">
              Booking, emergency, provider, and system updates.
              {unreadCount > 0 && <span className="ml-2 font-medium text-primary">{unreadCount} unread</span>}
            </p>
          </div>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You'll see notifications about bookings, provider updates, and verification status here."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white dark:bg-card shadow-sm">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification);
              return (
                <article
                  key={notification.id}
                  className={`flex items-start gap-4 border-b p-4 last:border-b-0 ${!notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      notification.type === "success"
                        ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                        : notification.type === "warning"
                        ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                        : notification.type === "error"
                        ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                        : "bg-blue-50 dark:bg-blue-950/30 text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-foreground">{notification.title}</h2>
                      {!notification.read && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                          Unread
                        </span>
                      )}
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                        {notification.type}
                      </span>
                    </div>
                    {notification.message && (
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Mark as read"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete notification"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerNotificationsPage;
