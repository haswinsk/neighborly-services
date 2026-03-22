export type UserRole = "customer" | "provider" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  location: string;
  avatar?: string;
  approved?: boolean;
}

export interface Service {
  id: string;
  serviceName: string;
  description: string;
  price: number;
  providerId: string;
  providerName: string;
  providerLocation: string;
  category: string;
  rating: number;
  reviewCount: number;
  image?: string;
}

export type BookingStatus = "Requested" | "Accepted" | "In Progress" | "Completed" | "Rejected";

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  bookingDate: string;
  status: BookingStatus;
  price: number;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  providerId: string;
  rating: number;
  comment: string;
  date: string;
}

export const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "AC Repair",
  "Cleaning",
  "Tutoring",
  "Painting",
  "Pest Control",
] as const;
