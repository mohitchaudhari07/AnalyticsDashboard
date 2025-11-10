# Debugging Guide - Data Not Showing from Backend

## Quick Checks

### 1. Check if API is Running

```bash
# Terminal 1 - Start API
cd apps/api
npm run build
npm run dev
```

You should see:

```
🚀 API running on port 5000
📡 Health check: http://localhost:5000/health
📊 Stats endpoint: http://localhost:5000/stats
```

### 2. Test API Health Endpoint

Open browser and visit: `http://localhost:5000/health`

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "database": "connected"
}
```

If you see `"database": "disconnected"`, check your DATABASE_URL environment variable.

### 3. Test Stats Endpoint

Visit: `http://localhost:5000/stats`

Expected response:

```json
{
  "totalSpend": 0,
  "totalInvoices": 0,
  "documentsThisMonth": 0,
  "avgInvoiceValue": 0,
  "spendChange": 0,
  "invoiceChange": 0,
  "documentsChange": 0,
  "avgInvoiceChange": 0
}
```

### 4. Check Database Connection

Make sure you have:

1. PostgreSQL running
2. DATABASE_URL environment variable set
3. Database migrated: `npx prisma migrate dev`
4. Data seeded (if needed): Run the seed script

### 5. Check Frontend Console

Open browser DevTools (F12) and check:

- Console for error messages
- Network tab to see API requests
- Check if requests are being made to the correct URL

### 6. Environment Variables

Create `.env` file in `apps/api`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
PORT=5000
```

Create `.env.local` file in `apps/web`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Common Issues

### Issue 1: CORS Errors

- The API now allows all origins in development
- Check browser console for CORS errors

### Issue 2: Database Not Connected

- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Run `npx prisma migrate dev` to create tables

### Issue 3: No Data in Database

- Run the seed script to populate data
- Check if data exists in the database

### Issue 4: API Not Responding

- Check if port 5000 is available
- Check if API process is running
- Check API console for errors

## Testing Endpoints

### Test all endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Stats
curl http://localhost:5000/stats

# Trends
curl http://localhost:5000/invoice-trends

# Vendors
curl http://localhost:5000/vendors/top10

# Categories
curl http://localhost:5000/category-spend

# Cash Outflow
curl http://localhost:5000/cash-outflow

# Vendor Stats
curl http://localhost:5000/vendors/invoice-stats
```

## Next Steps

1. Start API server: `cd apps/api && npm run dev`
2. Start Web server: `cd apps/web && npm run dev`
3. Open browser: `http://localhost:3000`
4. Check browser console for detailed error messages
5. Check API console for request logs



