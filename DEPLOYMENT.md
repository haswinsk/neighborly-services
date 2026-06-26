# LocalServ - Deployment Guide

## Quick Start (Local Development)

```bash
# Backend
cd backend
npm install
npm run dev  # Runs on http://localhost:5000

# Frontend (in new terminal)
cd frontend
npm install
npm run dev  # Runs on http://localhost:8081, proxies /api to backend
```

## Production Deployment

### Option 1: Vercel (Recommended)

#### Frontend
1. Push code to GitHub
2. Connect repo to Vercel
3. Set Root Directory: `frontend`
4. Environment Variables:
   - `VITE_API_URL=https://your-backend.vercel.app` (or other backend URL)
5. Deploy

#### Backend
1. Create separate Vercel project
2. Set Root Directory: `backend`
3. Environment Variables:
   - `DATABASE_URL=postgresql://user:pass@host:port/db`
   - `JWT_SECRET=your-secret-key`
   - `ADMIN_COMMISSION_RATE=10`
4. Deploy

### Option 2: Docker

```dockerfile
# Backend Dockerfile
FROM node:18
WORKDIR /app
COPY backend .
RUN npm install
CMD ["npm", "run", "prod"]
EXPOSE 5000

# Frontend Dockerfile
FROM node:18 as build
WORKDIR /app
COPY frontend .
RUN npm install
RUN VITE_API_URL=https://api.example.com npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## Database Setup

### Neon (PostgreSQL)

1. Create account at neon.tech
2. Get connection string: `postgresql://user:password@host:port/db`
3. Set `DATABASE_URL` environment variable
4. Run migrations:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

### Local PostgreSQL

```bash
# Create database
createdb neighborly_services

# Set connection string
export DATABASE_URL="postgresql://user:password@localhost:5432/neighborly_services"

# Run migrations
npx prisma migrate dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-random-secret-key-here
PORT=5000
NODE_ENV=production
ADMIN_COMMISSION_RATE=10
```

### Frontend (.env.local)
```
VITE_API_URL=https://api.example.com
```

## Database Seeding

Seed test data (services, providers, customers):

```bash
cd backend
node src/data/seedData.js
```

This creates:
- 2 test providers (Mike Wilson, Sarah Johnson)
- 6 services (Plumbing, Electrical, Cleaning, Carpentry, Painting, Pest Control)
- Test customers with sample bookings

## SSL/HTTPS Setup

### With Vercel
- Automatic SSL certificate via Vercel

### With Custom Domain
- Use Cloudflare (free) or Let's Encrypt
- Point domain to Vercel or your server

## Monitoring & Logs

### Vercel
- Go to project → Deployments → click deployment → View Function Logs

### Docker
```bash
docker logs container-id
docker exec -it container-id bash
```

## Performance Tuning

### Frontend
- Build size: ~1,066 kB (normal)
- Gzip: ~304 kB
- Code splitting: Not required (single page app)
- Lazy routes: Can be added for dashboard sections

### Backend
- Database indexes on: providerId, customerId, status
- Connection pooling: Built-in with Prisma
- Rate limiting: Can be added with express-rate-limit

## Security Checklist

- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS/SSL
- [ ] Set CORS headers properly
- [ ] Validate all user inputs
- [ ] Use parameterized queries (Prisma handles this)
- [ ] Set database backups
- [ ] Monitor error logs
- [ ] Use environment variables for secrets

## Troubleshooting

### API Connection Failed
- Check VITE_API_URL environment variable
- Ensure backend is running and accessible
- Check CORS headers in backend

### Database Connection Error
- Verify DATABASE_URL is correct
- Check database is running
- Verify network access (firewall, IP whitelist)

### Geolocation Not Working
- Check browser permission in settings
- Test with HTTPS (geolocation requires secure context)
- Fallback to default location works

### Build Size Too Large
- Remove unused dependencies
- Enable code splitting for routes
- Use dynamic imports for heavy libraries

## Maintenance

### Regular Tasks
- [ ] Monitor error logs daily
- [ ] Check database size monthly
- [ ] Review user feedback
- [ ] Update dependencies monthly
- [ ] Backup database weekly
- [ ] Monitor API response times

### Update Dependencies
```bash
npm outdated
npm update
npm audit fix
```

---

**Deployment Ready**: Yes ✓
**Database**: PostgreSQL (Neon recommended)
**Hosting**: Vercel (recommended) or Docker/AWS/GCP
**Estimated Uptime**: 99.9% with Vercel
