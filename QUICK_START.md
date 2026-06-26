# 🚀 Quick Start - MongoDB to PostgreSQL Migration

## TL;DR

**Neighborly Services backend has been migrated from MongoDB to AWS Aurora PostgreSQL.**

## What Changed for Developers?

| Item | Before | After |
|------|--------|-------|
| Database | MongoDB | PostgreSQL |
| Connection Lib | Mongoose | Prisma |
| Env Var | `MONGODB_URI` | `DATABASE_URL` |
| Models | `/src/models/*` | `prisma/schema.prisma` |
| Queries | `Model.find()` | `prisma.model.findMany()` |

## Getting Started (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create `.env.local`
```bash
DATABASE_URL="postgresql://localhost:5432/neighborly_services"
JWT_SECRET="dev_secret_for_testing_only"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
PORT=8081
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Start Server
```bash
npm run dev
```

✅ Done! Server running at `http://localhost:8081`

## Common Commands

```bash
# Start development server with auto-reload
npm run dev

# Create new database migration
npx prisma migrate dev --name description_of_change

# View database schema in UI
npx prisma studio

# Seed test data
npm run seed

# Generate Prisma client types
npm run prisma:generate

# Deploy migrations (production)
npm run migrate:prod
```

## Query Examples

### Mongoose → Prisma

**Find user by email:**
```javascript
// OLD
const user = await User.findOne({ email: 'test@example.com' });

// NEW
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
});
```

**Find multiple records:**
```javascript
// OLD
const bookings = await Booking.find({ status: 'Completed' });

// NEW
const bookings = await prisma.booking.findMany({
  where: { status: 'Completed' }
});
```

**Create record:**
```javascript
// OLD
const service = await Service.create({ serviceName: 'Plumbing', price: 100 });

// NEW
const service = await prisma.service.create({
  data: { serviceName: 'Plumbing', price: 100 }
});
```

**Update record:**
```javascript
// OLD
user.approved = true;
await user.save();

// NEW
await prisma.user.update({
  where: { id: user.id },
  data: { approved: true }
});
```

**Delete record:**
```javascript
// OLD
await User.deleteOne({ id: user.id });

// NEW
await prisma.user.delete({ where: { id: user.id } });
```

## API Endpoints (Unchanged!)

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Services
```
GET    /api/services
GET    /api/services/:id
POST   /api/services              (provider)
PATCH  /api/services/:id          (provider)
DELETE /api/services/:id          (provider)
```

### Bookings
```
GET    /api/bookings
POST   /api/bookings              (customer)
PATCH  /api/bookings/:id/status
GET    /api/bookings/earnings/summary (provider)
```

### Reviews
```
GET    /api/reviews/service/:serviceId
POST   /api/reviews               (customer)
```

### Providers
```
GET    /api/providers             (with geolocation)
```

### Admin
```
GET    /api/admin/stats
PATCH  /api/admin/users/:id/approve
DELETE /api/admin/users/:id
```

## Database Schema Quick Reference

### User
```
- id (UUID)
- name, email, password
- phone, location
- latitude, longitude (for geolocation)
- role (CUSTOMER, PROVIDER, ADMIN)
- approved (for provider approval)
- createdAt, updatedAt
```

### Service
```
- id, serviceName, description, price, category
- providerId (Foreign Key → User)
- providerName, providerLocation, providerLatitude, providerLongitude
- rating, reviewCount (auto-aggregated)
- createdAt, updatedAt
```

### Booking
```
- id, status, price, bookingDate, description
- customerId (FK → User), customerName
- serviceId (FK → Service), serviceName
- providerId
- createdAt, updatedAt
- Unique: (customerId, serviceId, bookingDate)
```

### Review
```
- id, rating, comment
- customerId (FK → User)
- serviceId (FK → Service)
- createdAt, updatedAt
```

## Environment Variables

### Development
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neighborly_services"
NODE_ENV="development"
PORT=8081
JWT_SECRET="dev_secret_key"
CLIENT_URL="http://localhost:5173"
```

### Production
```env
DATABASE_URL="postgresql://user:pass@aurora-endpoint.rds.amazonaws.com:5432/neighborly_services"
NODE_ENV="production"
PORT=8081
JWT_SECRET="your-secure-32-char-secret"
CLIENT_URL="https://your-frontend.com"
```

## Frontend Developers

**No changes needed!** This is a backend-only migration.

- Same API endpoints
- Same request/response formats
- Same authentication mechanism
- Frontend code works as-is

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running
- Check port 5432 is accessible

### "Type errors after install"
- Run: `npx prisma generate`
- Restart dev server: `npm run dev`

### "Migration failed"
- Check migration file: `prisma/migrations/`
- Run: `npx prisma migrate resolve --rolled-back`
- Try again: `npm run migrate`

### "Models not found"
- Mongoose models are gone, use Prisma
- Check imports: should import from `@prisma/client`
- See query examples above

## File Structure Changes

```
backend/
├── prisma/
│   ├── schema.prisma           ← Database schema (replaces models/)
│   └── migrations/             ← Auto-generated migrations
├── src/
│   ├── config/
│   │   ├── env.js              (updated)
│   │   ├── prisma.js           (new)
│   │   └── db.js               (deleted)
│   ├── routes/                 (all updated for Prisma)
│   ├── middleware/auth.js      (updated)
│   ├── models/                 (old - not used anymore)
│   └── ...
└── ...
```

## Helpful Links

- **Full Migration Guide**: See `MIGRATION_GUIDE.md`
- **Detailed Technical Notes**: See `MONGODB_TO_POSTGRES_MIGRATION.md`
- **Backend Documentation**: See `backend/README.md`
- **Prisma Docs**: https://www.prisma.io/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## Need Help?

1. Check error messages in console
2. Review `MIGRATION_GUIDE.md` for detailed info
3. Run `npx prisma studio` to view database
4. Check Prisma docs: https://www.prisma.io/docs/

---

**Migration Status:** ✅ Complete  
**API Compatibility:** ✅ 100%  
**Frontend Changes:** ❌ None needed  
**Ready to Deploy:** ✅ Yes
