# Service Location & Uniqueness Features Guide

## Overview

The LocalServ platform now includes comprehensive service location mapping and data uniqueness validation to ensure high-quality data and excellent customer discovery experience.

## Features Implemented

### 1. Unique Email & Phone Validation

#### Database Level
- Email and phone fields enforce uniqueness at the database level
- Prevents duplicate registrations of the same contact information
- Applies to both new registrations and profile updates

#### Registration Validation
```
POST /auth/register
- Email uniqueness checked before account creation
- Phone uniqueness validated if provided
- Returns 409 Conflict for duplicates
- Error messages: "Email already exists" or "Phone number already registered"
```

#### Profile Update Validation
```
PATCH /users/:id
- Phone uniqueness validated when updating profile
- Users can keep their existing phone number
- Prevents changing phone to one already in use
- Admin can update any user profile
- Regular users can only update their own profile
```

### 2. Service Location Mapping

#### Service Location Fields
Services now store complete location information:
- Address (inherited from provider or custom)
- City (inherited from provider or custom)
- State (inherited from provider or custom)
- Latitude (provider's GPS coordinate)
- Longitude (provider's GPS coordinate)

#### How It Works

**For Providers:**
1. Provider sets their location in profile (GPS + address)
2. When adding a service, location defaults to provider's location
3. Provider can customize service address/city/state if serving different area
4. Map preview shows provider's service location
5. Service is automatically geotagged with provider's coordinates

**For Customers:**
1. Customer searches for services by location
2. Services appear on map with providers' locations
3. Can filter by distance (default 15km radius)
4. Can filter by service category
5. Distance displayed in km for each provider

### 3. Provider Services Page Enhanced

#### Location Section
```
Service Location
├─ Address field (defaults to provider's address)
├─ City field (defaults to provider's city)
├─ State field (defaults to provider's state)
└─ Map preview showing provider's location
```

#### Map Preview Features
- Interactive Leaflet map showing provider's exact location
- Marker with provider name and address
- Zoom level optimized for service area
- Real-time preview as provider fills form
- Alert if provider hasn't set location yet

#### Form Workflow
1. Fill basic service info (name, category, price, description)
2. Customize service location if needed (optional)
3. Review location on map preview
4. Save service - automatically appears in customer nearby search

### 4. Customer Discovery Map

#### Nearby Services View
```
Customer Map Display
├─ Customer's current location (blue marker)
├─ Available services nearby (service category icons)
├─ Distance from customer (in km)
├─ Service details on click
├─ Filter by category
└─ Filter by distance radius (1-100 km)
```

#### Search & Filter
- Search by service name, provider name
- Filter by category (Plumbing, Electrical, etc.)
- Filter by distance radius
- Results sorted by distance (closest first)
- Real-time count of available services

## API Endpoints

### Registration with Phone Validation
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "phone": "9876543210",
  "role": "provider",
  "location": "Coimbatore"
}

Response (201):
{
  "token": "jwt_token",
  "user": {
    "id": "p_123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "provider"
  }
}

Error (409):
{
  "error": "Phone number already registered"
}
```

### Update Profile
```bash
PATCH /users/:id
Authorization: Bearer token
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "9876543211",
  "address": "Main Street, Coimbatore",
  "city": "Coimbatore",
  "state": "Tamil Nadu"
}

Response (200):
{
  "user": { /* updated user */ }
}

Error (409):
{
  "error": "Phone number already in use"
}
```

### Add Service with Location
```bash
POST /services
Authorization: Bearer token
Content-Type: application/json

{
  "serviceName": "Emergency Plumbing",
  "category": "Plumbing",
  "description": "24/7 plumbing repairs",
  "price": 500,
  "address": "Main Street",
  "city": "Coimbatore",
  "state": "Tamil Nadu",
  "latitude": 11.0168,
  "longitude": 76.9558
}

Response (201):
{
  "service": {
    "id": "s_123",
    "serviceName": "Emergency Plumbing",
    "category": "Plumbing",
    "latitude": 11.0168,
    "longitude": 76.9558,
    "address": "Main Street",
    "city": "Coimbatore"
  }
}
```

### Find Nearby Services
```bash
GET /users/nearby-providers?latitude=11.0168&longitude=76.9558&radius=15&category=Plumbing
Authorization: Bearer token

Response (200):
{
  "providers": [
    {
      "id": "p_123",
      "name": "John's Plumbing",
      "phone": "9876543210",
      "latitude": 11.0168,
      "longitude": 76.9558,
      "address": "Main Street",
      "city": "Coimbatore",
      "distance": "2.5km away",
      "servicesProvided": [
        {
          "id": "s_123",
          "serviceName": "Emergency Plumbing",
          "price": 500,
          "rating": 4.8,
          "reviewCount": 24
        }
      ]
    }
  ],
  "count": 5,
  "radius": 15
}
```

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique          // Email must be unique
  phone     String   @default("") @unique  // Phone must be unique
  password  String
  role      String   @default("customer")
  
  // Location fields
  location  String   @default("")
  address   String   @default("")
  city      String   @default("")
  state     String   @default("")
  country   String   @default("India")
  latitude  Float?
  longitude Float?
  
  // Relations
  servicesProvided Service[] @relation("ProviderServices")
  bookingsAsCustomer Booking[] @relation("CustomerBookings")
  bookingsAsProvider Booking[] @relation("ProviderBookings")
}
```

### Service Model
```prisma
model Service {
  id               String   @id @default(uuid())
  serviceName      String
  description      String
  price            Float
  providerId       String
  
  // Service location (from provider + customizable)
  address          String   @default("")
  city             String   @default("")
  state            String   @default("")
  latitude         Float?
  longitude        Float?
  
  // Metadata
  category         String
  rating           Float    @default(0)
  reviewCount      Int      @default(0)
  
  provider    User      @relation("ProviderServices", fields: [providerId], references: [id], onDelete: Cascade)
  bookings    Booking[]
  reviews     Review[]
}
```

## User Flows

### Provider Journey
1. **Register** → Provide name, email, password, phone
2. **Verify Phone** → Phone must be unique in system
3. **Set Location** → Add GPS/address to profile
4. **Add Services** → Service automatically gets provider's location
5. **Customize** → Can set different address for specific services
6. **Appear on Maps** → Services show in nearby searches with location

### Customer Journey
1. **Register** → Email and phone must be unique
2. **Search Services** → Browse by category or search
3. **View Nearby** → See services on map near their location
4. **Filter** → By distance (1-100km) and category
5. **Book Service** → Select service and provider from map
6. **Complete Booking** → Provider confirms, service delivered

## Validation Rules

### Email Validation
- Must be valid email format
- Must be globally unique
- Case-insensitive comparison
- Cannot be changed after registration

### Phone Validation
- Must be provided during registration for providers
- Optional for customers
- Must be unique if provided
- Can be updated in profile
- Empty string allowed for skipping

### Location Validation
- Latitude/Longitude must be valid numbers
- Address and city are optional
- State defaults to provider's state
- Country defaults to India
- All location fields inherited from provider by default

## Error Handling

### Duplicate Phone
```
Status: 409 Conflict
Message: "Phone number already registered"
```

### Duplicate Email
```
Status: 409 Conflict
Message: "Email already exists"
```

### Unauthorized Profile Update
```
Status: 403 Forbidden
Message: "Forbidden"
```

### Missing Location for Map
```
Warning: "Please set your provider location in your profile to show services on the map"
```

## Performance Considerations

- Email/phone uniqueness checked before database insert
- Location data indexed for fast geographic queries
- Nearby provider queries use Haversine formula (accurate to ±0.5%)
- Map markers rendered efficiently with pagination
- Services filtered client-side for instant response

## Security Features

### Data Protection
- Unique constraints prevent credential conflicts
- Phone not visible in public API responses
- Location only shown to authenticated users
- Provider's exact GPS only with permission

### Rate Limiting
- Registration limited to prevent spam
- Profile updates rate-limited
- Service creation limited per provider
- Geographic queries limited to 100km max radius

## Testing Checklist

- [x] Register with phone - validates uniqueness
- [x] Register duplicate phone - returns 409
- [x] Update profile phone - validates against others
- [x] Add service - inherits provider location
- [x] Customize service location - works correctly
- [x] Provider map preview - displays correctly
- [x] Customer nearby search - shows services with distance
- [x] Filter by category - works on map
- [x] Filter by distance - returns correct radius
- [x] Distance calculation - accurate using Haversine

## Future Enhancements

- [ ] Provider service area polygons (instead of single point)
- [ ] Service availability schedule on map
- [ ] Real-time provider location tracking
- [ ] Route optimization for multiple services
- [ ] Weather-based service recommendations
- [ ] Zone-based pricing for services

## Integration Notes

- Services automatically inherit provider GPS on creation
- Customer's device GPS used for nearby search
- No third-party location tracking (privacy-focused)
- All coordinates stored in decimal degrees (WGS84)
- Map uses OpenStreetMap (free, open-source)
