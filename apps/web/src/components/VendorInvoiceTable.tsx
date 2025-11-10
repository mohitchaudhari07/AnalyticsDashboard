"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VendorInvoiceTableProps {
  data: { vendor_name: string; invoice_count: number; net_value: number }[];
}

export function VendorInvoiceTable({ data }: VendorInvoiceTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-600 text-sm font-medium">
          Top vendors by invoice count and net value.
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead># Invoices</TableHead>
              <TableHead className="text-right">Net Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data || []).length > 0 ? (
              data.slice(0, 10).map((vendor, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{vendor.vendor_name || "Unknown"}</TableCell>
                  <TableCell>{vendor.invoice_count || 0}</TableCell>
                  <TableCell className="text-right">
                    € {Number(vendor.net_value || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

