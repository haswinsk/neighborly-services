export const seedUsers = [
  { id: "c1", name: "John Doe", email: "john@example.com", role: "customer", phone: "555-0101", location: "New York", approved: true },
  { id: "c2", name: "Jane Smith", email: "jane@example.com", role: "customer", phone: "555-0102", location: "Brooklyn", approved: true },
  { id: "p1", name: "Mike Wilson", email: "mike@example.com", role: "provider", phone: "555-0201", location: "Manhattan", approved: true },
  { id: "p2", name: "Sarah Johnson", email: "sarah@example.com", role: "provider", phone: "555-0202", location: "Queens", approved: true },
  { id: "p3", name: "Tom Brown", email: "tom@example.com", role: "provider", phone: "555-0203", location: "Bronx", approved: false },
  { id: "a1", name: "Admin User", email: "admin@example.com", role: "admin", phone: "555-0001", location: "HQ", approved: true },
];

export const seedServices = [
  { id: "s1", serviceName: "Emergency Plumbing", description: "24/7 emergency plumbing services including leak repair, pipe replacement, and drain cleaning.", price: 750, providerId: "p1", providerName: "Mike Wilson", providerLocation: "Manhattan, New York", category: "Plumbing", rating: 4.8, reviewCount: 124 },
  { id: "s2", serviceName: "Electrical Wiring", description: "Complete electrical wiring services for homes and offices. Licensed and insured electrician.", price: 900, providerId: "p1", providerName: "Mike Wilson", providerLocation: "Manhattan, New York", category: "Electrical", rating: 4.7, reviewCount: 98 },
  { id: "s3", serviceName: "AC Installation & Repair", description: "Professional AC installation, repair, and maintenance services for all brands.", price: 1200, providerId: "p2", providerName: "Sarah Johnson", providerLocation: "Queens, New York", category: "AC Repair", rating: 4.9, reviewCount: 156 },
  { id: "s4", serviceName: "Deep House Cleaning", description: "Thorough deep cleaning service including kitchen, bathroom, and all living areas.", price: 1500, providerId: "p2", providerName: "Sarah Johnson", providerLocation: "Queens, New York", category: "Cleaning", rating: 4.6, reviewCount: 87 },
  { id: "s5", serviceName: "Custom Carpentry", description: "Custom furniture, shelving, and woodwork. Quality craftsmanship guaranteed.", price: 2000, providerId: "p1", providerName: "Mike Wilson", providerLocation: "Manhattan, New York", category: "Carpentry", rating: 4.5, reviewCount: 63 },
  { id: "s6", serviceName: "Math Tutoring", description: "Expert math tutoring for students of all levels. SAT/ACT prep available.", price: 450, providerId: "p2", providerName: "Sarah Johnson", providerLocation: "Queens, New York", category: "Tutoring", rating: 4.9, reviewCount: 210 },
  { id: "s7", serviceName: "Interior Painting", description: "Professional interior painting with premium paints. Free color consultation.", price: 1800, providerId: "p1", providerName: "Mike Wilson", providerLocation: "Manhattan, New York", category: "Painting", rating: 4.4, reviewCount: 45 },
  { id: "s8", serviceName: "Pest Control", description: "Safe and effective pest control for homes. Eco-friendly treatment options.", price: 950, providerId: "p2", providerName: "Sarah Johnson", providerLocation: "Queens, New York", category: "Pest Control", rating: 4.7, reviewCount: 72 },
];

export const seedBookings = [
  { id: "b1", customerId: "c1", customerName: "John Doe", providerId: "p1", providerName: "Mike Wilson", serviceId: "s1", serviceName: "Emergency Plumbing", bookingDate: "2026-03-15", status: "Completed", paymentStatus: "Completed", price: 75 },
  { id: "b2", customerId: "c1", customerName: "John Doe", providerId: "p2", providerName: "Sarah Johnson", serviceId: "s3", serviceName: "AC Installation & Repair", bookingDate: "2026-03-18", status: "In Progress", paymentStatus: "Pending", price: 120 },
  { id: "b3", customerId: "c2", customerName: "Jane Smith", providerId: "p1", providerName: "Mike Wilson", serviceId: "s5", serviceName: "Custom Carpentry", bookingDate: "2026-03-20", status: "Accepted", paymentStatus: "Pending", price: 200 },
  { id: "b4", customerId: "c1", customerName: "John Doe", providerId: "p2", providerName: "Sarah Johnson", serviceId: "s4", serviceName: "Deep House Cleaning", bookingDate: "2026-03-22", status: "Requested", paymentStatus: "Pending", price: 150 },
  { id: "b5", customerId: "c2", customerName: "Jane Smith", providerId: "p2", providerName: "Sarah Johnson", serviceId: "s6", serviceName: "Math Tutoring", bookingDate: "2026-03-10", status: "Completed", paymentStatus: "Completed", price: 45 },
];

export const seedReviews = [
  { id: "r1", customerId: "c1", customerName: "John Doe", providerId: "p1", rating: 5, comment: "Excellent plumbing work! Fixed the leak quickly and professionally.", date: "2026-03-16" },
  { id: "r2", customerId: "c2", customerName: "Jane Smith", providerId: "p2", rating: 5, comment: "Amazing tutor! My son's math grades improved significantly.", date: "2026-03-11" },
  { id: "r3", customerId: "c1", customerName: "John Doe", providerId: "p2", rating: 4, comment: "Good AC repair service. A bit pricey but quality work.", date: "2026-03-05" },
];
