
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type RawDoc = any;

function safeDate(val: any): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  
  const dataPath = "C:/Users/chaud/Desktop/task/analytics-dashboard/data/Analytics_Test_Data.json";
  const raw = fs.readFileSync(dataPath, "utf8");
  const docs: RawDoc[] = JSON.parse(raw);

  console.log(`Found ${docs.length} records`);

  for (const doc of docs) {
    try {
      // ===== Vendor =====
      const vendorName =
        doc?.extractedData?.llmData?.vendor?.value?.vendorName?.value ??
        doc?.extractedData?.llmData?.vendor?.value?.vendorName;
      const vendorTax =
        doc?.extractedData?.llmData?.vendor?.value?.vendorTaxId?.value;
      const vendorAddr =
        doc?.extractedData?.llmData?.vendor?.value?.vendorAddress?.value;

      const vendor = vendorName
        ? await prisma.vendor.upsert({
            where: { name: vendorName },
            update: { taxId: vendorTax ?? undefined, address: vendorAddr ?? undefined },
            create: { name: vendorName, taxId: vendorTax ?? undefined, address: vendorAddr ?? undefined },
          })
        : null;

      // ===== Document =====
      const document = await prisma.document.create({
        data: {
          id: String(doc._id ?? crypto.randomUUID()),
          name: doc.name ?? null,
          filePath: doc.filePath ?? null,
          fileType: doc.fileType ?? null,
          status: doc.status ?? null,
          organizationId: doc.organizationId ?? null,
          departmentId: doc.departmentId ?? null,
          processedAt: doc.processedAt ? new Date(doc.processedAt.$date || doc.processedAt) : null,
          analyticsId: doc.analyticsId ?? null,
          metadataJson: doc.metadata ?? null,
        },
      });

      // ===== Invoice =====
      const invoiceNode = doc?.extractedData?.llmData?.invoice?.value;
      const summary = doc?.extractedData?.llmData?.summary?.value;
      const paymentNode = doc?.extractedData?.llmData?.payment?.value;
      const lineItems =
        doc?.extractedData?.llmData?.lineItems?.value?.items?.value ?? [];

      const invoice = await prisma.invoice.create({
        data: {
          vendorId: vendor?.id,
          documentId: document.id,
          invoiceNumber:
            invoiceNode?.invoiceId?.value ?? invoiceNode?.invoiceId ?? null,
          invoiceDate: safeDate(invoiceNode?.invoiceDate?.value),
          deliveryDate: safeDate(invoiceNode?.deliveryDate?.value),
          documentType: summary?.documentType ?? null,
          subTotal: Number(summary?.subTotal ?? 0),
          totalTax: Number(summary?.totalTax ?? 0),
          invoiceTotal: Number(summary?.invoiceTotal ?? 0),
          currencySymbol: summary?.currencySymbol ?? "€",
        },
      });

      // ===== Payments =====
      if (paymentNode) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            bankAccount: paymentNode.bankAccountNumber?.value ?? null,
            bic: paymentNode.BIC?.value ?? null,
            accountName: paymentNode.accountName?.value ?? null,
            dueDate: safeDate(paymentNode.dueDate?.value),
            netDays: Number(paymentNode.netDays?.value ?? 0),
            discountedTotal: Number(paymentNode.discountedTotal?.value ?? 0),
          },
        });
      }

      // ===== Line Items =====
      for (const item of lineItems) {
        await prisma.lineItem.create({
          data: {
            invoiceId: invoice.id,
            srNo: Number(item.srNo?.value ?? 0),
            description: item.description?.value ?? null,
            quantity: Number(item.quantity?.value ?? 0),
            unitPrice: Number(item.unitPrice?.value ?? 0),
            totalPrice: Number(item.totalPrice?.value ?? 0),
            vatAmount: Number(item.vatAmount?.value ?? 0),
            vatRate: Number(item.vatRate?.value ?? 0),
            sachkonto: item.Sachkonto?.value ?? null,
            busKey: item.BUSchluessel?.value ?? null,
          },
        });
      }

      console.log(`✔ Inserted document ${document.id} → vendor: ${vendor?.name ?? "N/A"}`);
    } catch (err) {
      console.error("❌ Error processing record", err);
    }
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
