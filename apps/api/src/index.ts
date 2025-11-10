import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";

// ✅ Fix BigInt serialization for JSON responses
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};


const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors({
  origin: "*", // Allow all origins in development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


app.get("/stats", async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentYearStart = new Date(now.getFullYear(), 0, 1);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);

    // Check if user wants all-time or YTD (default to all-time if YTD is 0)
    const useAllTime = req.query.allTime === "true";

    // YTD Total Spend (invoices from current year)
    const ytdSpend = await prisma.invoice.aggregate({
      where: { invoiceDate: { gte: currentYearStart } },
      _sum: { invoiceTotal: true },
    });

    // Also get ALL total spend (for fallback or comparison)
    const allTimeSpend = await prisma.invoice.aggregate({
      _sum: { invoiceTotal: true },
    });

    // Use all-time if requested, or if YTD is 0, otherwise use YTD
    const totalSpendValue = useAllTime || (ytdSpend._sum.invoiceTotal ?? 0) === 0
      ? allTimeSpend._sum.invoiceTotal ?? 0 
      : ytdSpend._sum.invoiceTotal ?? 0;

    console.log("💰 Spend calculation:", {
      ytdSpend: ytdSpend._sum.invoiceTotal,
      allTimeSpend: allTimeSpend._sum.invoiceTotal,
      using: totalSpendValue,
      useAllTime,
    });

    // Last year YTD for comparison
    const lastYearYtdSpend = await prisma.invoice.aggregate({
      where: {
        invoiceDate: {
          gte: lastYearStart,
          lte: lastYearEnd,
        },
      },
      _sum: { invoiceTotal: true },
    });

    // Current month spend
    const currentMonthSpend = await prisma.invoice.aggregate({
      where: { invoiceDate: { gte: currentMonthStart } },
      _sum: { invoiceTotal: true },
    });

    // Last month spend
    const lastMonthSpend = await prisma.invoice.aggregate({
      where: {
        invoiceDate: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      _sum: { invoiceTotal: true },
    });

    // Total Invoices (YTD or all-time)
    const ytdInvoices = await prisma.invoice.count({
      where: { invoiceDate: { gte: currentYearStart } },
    });
    const allTimeInvoices = await prisma.invoice.count();
    const totalInvoices = ytdInvoices > 0 ? ytdInvoices : allTimeInvoices;

    // Last month invoices
    const lastMonthInvoices = await prisma.invoice.count({
      where: {
        invoiceDate: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    // Current month invoices
    const currentMonthInvoices = await prisma.invoice.count({
      where: { invoiceDate: { gte: currentMonthStart } },
    });

    // Documents this month
    const documentsThisMonth = await prisma.document.count({
      where: { processedAt: { gte: currentMonthStart } },
    });

    // Documents last month
    const documentsLastMonth = await prisma.document.count({
      where: {
        processedAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    // Average Invoice Value
    const avgInvoice = await prisma.invoice.aggregate({
      where: { invoiceDate: { gte: currentYearStart } },
      _avg: { invoiceTotal: true },
    });

    // Last month avg
    const lastMonthAvg = await prisma.invoice.aggregate({
      where: {
        invoiceDate: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      _avg: { invoiceTotal: true },
    });

    // Calculate percentage changes
    const spendChange =
      lastMonthSpend._sum.invoiceTotal && lastMonthSpend._sum.invoiceTotal > 0
        ? ((currentMonthSpend._sum.invoiceTotal ?? 0) - (lastMonthSpend._sum.invoiceTotal ?? 0)) /
          lastMonthSpend._sum.invoiceTotal *
          100
        : 0;

    const invoiceChange =
      lastMonthInvoices > 0
        ? ((currentMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100
        : 0;

    const documentsChange = documentsLastMonth - documentsThisMonth;

    const avgInvoiceChange =
      lastMonthAvg._avg.invoiceTotal && lastMonthAvg._avg.invoiceTotal > 0
        ? ((avgInvoice._avg.invoiceTotal ?? 0) - (lastMonthAvg._avg.invoiceTotal ?? 0)) /
          lastMonthAvg._avg.invoiceTotal *
          100
        : 0;

    // Calculate average invoice value (use all-time if YTD is 0)
    const avgInvoiceValue = (ytdSpend._sum.invoiceTotal ?? 0) > 0
      ? (avgInvoice._avg.invoiceTotal ?? 0)
      : (allTimeSpend._sum.invoiceTotal ?? 0) / (allTimeInvoices > 0 ? allTimeInvoices : 1);

    const response = {
      totalSpend: totalSpendValue,
      totalInvoices,
      documentsThisMonth,
      avgInvoiceValue: avgInvoiceValue,
      spendChange: spendChange,
      invoiceChange: invoiceChange,
      documentsChange: documentsChange,
      avgInvoiceChange: avgInvoiceChange,
    };

    console.log("📊 Stats response:", response);
    res.json(response);
  } catch (err) {
    console.error("Error fetching stats:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ 
      error: "Failed to fetch stats",
      message: errorMessage,
      details: process.env.NODE_ENV === "development" ? String(err) : undefined
    });
  }
});


app.get("/invoice-trends", async (req, res) => {
  try {
    const data = await prisma.$queryRaw<
      { month: string; totalamount: number; invoicecount: number }[]
    >(Prisma.sql`
      SELECT
        TO_CHAR("invoiceDate", 'Mon YYYY') AS month,
        COALESCE(SUM("invoiceTotal"), 0) AS totalamount,
        COUNT("id") AS invoicecount
      FROM "Invoice"
      WHERE "invoiceDate" IS NOT NULL
      GROUP BY month
      ORDER BY MIN("invoiceDate");
    `);

    res.json(data || []);
  } catch (err) {
    console.error("Error fetching trends:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ 
      error: "Failed to fetch trends",
      message: errorMessage
    });
  }
});

// ✅ 3. /vendors/top10 — top 10 vendors by spend
app.get("/vendors/top10", async (req: Request, res: Response)=> {
  try {
    const vendors = await prisma.$queryRawUnsafe(`
      SELECT v.name AS vendor_name, SUM(i."invoiceTotal") AS total_spend
      FROM "Invoice" i
      JOIN "Vendor" v ON v.id = i."vendorId"
      GROUP BY v.name
      ORDER BY total_spend DESC
      LIMIT 10;
    `);
    res.json(vendors || []);
  } catch (err) {
    console.error("Error fetching vendors:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ 
      error: "Failed to fetch vendors",
      message: errorMessage
    });
  }
});

// ✅ 4. /category-spend — spend by line item category
app.get("/category-spend", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.$queryRawUnsafe(`
      SELECT COALESCE(li."sachkonto", 'Unknown') AS category,
             SUM(li."totalPrice") AS total_spend
      FROM "LineItem" li
      GROUP BY category
      ORDER BY total_spend DESC;
    `);
    res.json(categories || []);
  } catch (err) {
    console.error("Error fetching category spend:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ 
      error: "Failed to fetch category spend",
      message: errorMessage
    });
  }
});

// ✅ 5. /invoices — searchable, sortable table
app.get("/invoices", async (req: Request, res: Response) => {
  try {
    const q = req.query.q ? String(req.query.q) : "";
    const status = req.query.status ? String(req.query.status) : undefined;

    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          status ? { documentType: { contains: status, mode: "insensitive" } } : {},
          q
            ? {
                OR: [
                  { invoiceNumber: { contains: q, mode: "insensitive" } },
                  { vendor: { name: { contains: q, mode: "insensitive" } } },
                ],
              }
            : {},
        ],
      },
      include: { vendor: true },
      orderBy: { invoiceDate: "desc" },
      take: 50,
    });

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// ✅ 6. /cash-outflow — cash outflow forecast by due date ranges
app.get("/cash-outflow", async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const day7 = new Date(now);
    day7.setDate(now.getDate() + 7);
    const day30 = new Date(now);
    day30.setDate(now.getDate() + 30);
    const day60 = new Date(now);
    day60.setDate(now.getDate() + 60);

    // Get all unpaid invoices (with future due dates or no payments)
    const invoices = await prisma.invoice.findMany({
      include: {
        payments: true,
      },
    });

    // Calculate due dates: use payment.dueDate if available, otherwise calculate from invoiceDate + netDays
    const outflowData: { range: string; total: number }[] = [];
    const ranges = ["0-7 days", "8-30 days", "31-60 days", "60+ days"];

    for (const invoice of invoices) {
      let dueDate: Date | null = null;

      // Try to get dueDate from payment
      if (invoice.payments && invoice.payments.length > 0) {
        const payment = invoice.payments[0];
        dueDate = payment.dueDate;
        
        // If no dueDate but we have netDays and invoiceDate, calculate it
        if (!dueDate && payment.netDays && invoice.invoiceDate) {
          dueDate = new Date(invoice.invoiceDate);
          dueDate.setDate(dueDate.getDate() + payment.netDays);
        }
      }

      // Fallback: use invoiceDate if no payment info
      if (!dueDate && invoice.invoiceDate) {
        dueDate = new Date(invoice.invoiceDate);
        // Add 30 days as default payment terms
        dueDate.setDate(dueDate.getDate() + 30);
      }

      // Only include future due dates
      if (dueDate && dueDate >= now) {
        const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let range = "60+ days";
        
        if (daysDiff <= 7) range = "0-7 days";
        else if (daysDiff <= 30) range = "8-30 days";
        else if (daysDiff <= 60) range = "31-60 days";

        const existing = outflowData.find((d) => d.range === range);
        if (existing) {
          existing.total += invoice.invoiceTotal || 0;
        } else {
          outflowData.push({
            range,
            total: invoice.invoiceTotal || 0,
          });
        }
      }
    }

    // Ensure all ranges are present (even if 0)
    const result = ranges.map((range) => {
      const found = outflowData.find((d) => d.range === range);
      return found || { range, total: 0 };
    });

    res.json(result || []);
  } catch (err) {
    console.error("Error fetching cash outflow:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ 
      error: "Failed to fetch cash outflow",
      message: errorMessage
    });
  }
});

// ✅ 7. /vendors/invoice-stats — vendor invoice counts and net values
app.get("/vendors/invoice-stats", async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.$queryRawUnsafe(`
      SELECT 
        v.name AS vendor_name,
        COUNT(i.id) AS invoice_count,
        COALESCE(SUM(i."invoiceTotal"), 0) AS net_value
      FROM "Vendor" v
      LEFT JOIN "Invoice" i ON i."vendorId" = v.id
      GROUP BY v.name
      HAVING COUNT(i.id) > 0
      ORDER BY net_value DESC
      LIMIT 10;
    `);
    res.json(vendors || []);
  } catch (err) {
    console.error("Error fetching vendor stats:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ 
      error: "Failed to fetch vendor stats",
      message: errorMessage
    });
  }
});

// ✅ 8. /chat-with-data — forward to Vanna AI
app.post("/chat-with-data", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const VANNA_API_URL = process.env.VANNA_API_BASE_URL;

    if (!VANNA_API_URL) {
      return res.status(500).json({ error: "Vanna API not configured" });
    }

    const response = await fetch(`${VANNA_API_URL}/generate-sql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat request failed" });
  }
});

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (err) {
    res.status(500).json({ 
      status: "error", 
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Stats endpoint: http://localhost:${PORT}/stats`);
});
