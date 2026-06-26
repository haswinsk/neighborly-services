# Neighborly Services API - Backend

Modern REST API for a service marketplace platform built with Express.js, Prisma ORM, and AWS Aurora PostgreSQL.

## Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.21
- **Database**: AWS Aurora PostgreSQL (Prisma ORM)
- **Authentication**: JWT (7-day expiration)
- **Password Hashing**: bcryptjs
- **Rate Limiting**: express-rate-limit
- **Security**: helmet, CORS
- **Development**: nodemon

## Features

✅ User authentication (register, login, profile)  
✅ Service management (CRUD by providers)  
✅ Service bookings (create, status updates)  
✅ Reviews and ratings (aggregate ratings)  
✅ Provider geolocation-based search  
✅ Role-based access control (Customer, Provider, Admin)  
✅ Admin dashboard with statistics  
✅ Rate limiting and security headers  
✅ Database migrations with Prisma  

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   └── migrations/                # Database migrations
├── src/
│   ├── config/
│   │   ├── env.js                 # Environment configuration
│   │   └── prisma.js              # Prisma client initialization
│   ├── routes/
│   │   ├── auth.routes.js         # Authentication endpoints
│   │   ├── services.routes.js     # Service CRUD
│   │   ├── bookings.routes.js     # Booking management
│   │   ├── reviews.routes.js      # Reviews and ratings
│   │   ├── users.routes.js        # User profiles
│   │   ├── providers.routes.js    # Provider search
│   │   └── admin.routes.js        # Admin dashboard
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── asyncHandler.js        # Async wrapper
│   │   └── validation.js          # Input validation
│   ├── utils/
│   │   ├── apiError.js            # Custom error class
│   │   ├── id.js                  # ID generation
│   │   ├── sanitize.js            # Data sanitization
│   │   └── ...
│   ├── scripts/
│   │   └── seed.js                # Database seeding
│   └── server.js                  # Express app & startup
├── .env.local                     # Local environment (git-ignored)
├── .env.example                   # Environment template
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Aurora PostgreSQL cluster (or PostgreSQL instance)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local`:**
```bash
cp .env.example .env.local
```

3. **Configure database connection:**
Edit `.env.local` and add your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://user:password@host:5432/neighborly_services"
NODE_ENV="development"
PORT=8081
JWT_SECRET="your-secret-key-min-32-chars"
CLIENT_URL="http://localhost:5173"
```

4. **Generate Prisma client:**
```bash
npx prisma generate
```

5. **Run database migrations:**
```bash
npm run migrate
```

6. **Seed test data (optional):**
```bash
npm run seed
```

### Development

```bash
npm run dev
```

Server runs at `http://localhost:8081`

### Production Build

```bash
npm run migrate:prod
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (provider)
- `PATCH /api/services/:id` - Update service (provider)
- `DELETE /api/services/:id` - Delete service (provider)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking (customer)
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/earnings/summary` - Provider earnings (provider)

### Reviews
- `GET /api/reviews/service/:serviceId` - Get service reviews
- `POST /api/reviews` - Create review (customer)

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update user profile

### Providers
- `GET /api/providers` - List providers (with geolocation filtering)

### Admin
- `GET /api/admin/stats` - Dashboard statistics (admin)
- `PATCH /api/admin/users/:id/approve` - Approve provider (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)

## Database Schema

### User
- Roles: CUSTOMER, PROVIDER, ADMIN
- Geolocation: latitude, longitude
- Approval: `approved` flag for providers

### Service
- Linked to provider (User)
- Categories and descriptions
- Rating aggregation from reviews
- Provider geolocation for distance calculation

### Booking
- Links customer and service
- Status: Pending, Accepted, Completed, etc.
- Unique constraint on (customerId, serviceId, bookingDate)

### Review
- Customer rating (1-5)
- Comments/feedback
- Auto-aggregates service ratings

## Environment Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| DATABASE_URL | string | Yes | PostgreSQL connection string |
| NODE_ENV | string | No | `development` or `production` |
| PORT | number | No | Server port (default: 8081) |
| JWT_SECRET | string | Yes | Secret key for signing JWTs (min 32 chars in prod) |
| CLIENT_URL | string | No | Frontend URL for CORS (default: http://localhost:5173) |
| ADMIN_COMMISSION_RATE | number | No | Commission % (default: 10) |
| RATE_LIMIT_WINDOW_MS | number | No | Rate limit window in ms (default: 900000) |
| RATE_LIMIT_MAX | number | No | Max requests per window (default: 200) |
| AUTH_RATE_LIMIT_MAX | number | No | Max auth attempts (default: 30) |

## Error Handling

All errors follow a consistent format:

```json
{
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2024-06-26T12:00:00Z"
}
```

Common status codes:
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate email, etc.)
- `500` - Server error

## Authentication

JWT tokens are returned on login/register with 7-day expiration.

**Include token in requests:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Token payload:**
```json
{
  "userId": "user-id",
  "role": "CUSTOMER|PROVIDER|ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Rate Limiting

- General API: 200 requests per 15 minutes
- Authentication: 30 requests per 15 minutes
- Returns `429 Too Many Requests` when exceeded

## Database Migrations

### Create migration:
```bash
npx prisma migrate dev --name add_new_table
```

### View migrations:
```bash
ls prisma/migrations
```

### Reset database (dev only):
```bash
npx prisma migrate reset
```

### Deploy migrations (prod):
```bash
npx prisma migrate deploy
```

## Deployment

### AWS Aurora Setup

1. Create Aurora PostgreSQL cluster in RDS
2. Get cluster endpoint
3. Create database: `CREATE DATABASE neighborly_services;`
4. Set `DATABASE_URL` env var to cluster endpoint
5. Run migrations: `npm run migrate:prod`
6. Deploy application

### Vercel Deployment

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in project settings
4. Vercel will run `npm run migrate:prod` automatically

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Aurora security group allows port 5432
- Ensure cluster is available and running

### Migration Errors
- Run `npx prisma migrate resolve --rolled-back` if stuck
- Check migrations folder for history
- Verify PostgreSQL version (12+)

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration (7 days)
- Ensure role matches endpoint requirements

### Performance
- Use Prisma query optimization
- Add database indexes (already in schema)
- Monitor slow queries with CloudWatch

## Development Tips

- Use `npm run dev` for auto-reload with nodemon
- Check `console.log("[v0] ...")` debug statements
- Use Prisma Studio: `npx prisma studio`
- Test endpoints with Postman or curl

## Security Considerations

✅ Password hashing with bcryptjs  
✅ JWT token authentication  
✅ Role-based access control  
✅ Input validation  
✅ SQL injection prevention (Prisma)  
✅ CORS configuration  
✅ Security headers (helmet)  
✅ Rate limiting  

## Testing

Run seed for test data:
```bash
npm run seed
```

Test accounts created:
- Customer: customer@test.com / password123
- Provider: provider@test.com / password123
- Admin: admin@test.com / password123

## Monitoring & Logging

- Morgan middleware logs all requests
- Error handler provides consistent error responses
- Use AWS CloudWatch for production monitoring
- Enable Prisma query logging in development: set `DEBUG=prisma*`

## Documentation

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [AWS Aurora PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Aurora.html)
- [JWT Introduction](https://jwt.io/introduction)

## License

MIT

## Support

For issues or questions:
1. Check error logs
2. Review migration guide: `../MIGRATION_GUIDE.md`
3. Open GitHub issue with error details and reproduction steps

---

Built with ❤️ for the Neighborly Services community
