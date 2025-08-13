"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Send, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address?: string;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid";
  notes?: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    tax_rate: number;
    discount: number;
  }>;
}

const mockInvoice: InvoiceDetail = {
  id: "1",
  invoice_number: "INV-2501-ABC1",
  client_name: "Acme Corp",
  client_email: "billing@acmecorp.com",
  client_address: "123 Business St\nSuite 100\nNew York, NY 10001",
  issue_date: "2024-12-15",
  due_date: "2025-01-14",
  status: "paid",
  notes: "Thank you for your business!",
  items: [
    {
      description: "Website Development",
      quantity: 1,
      rate: 2000.0,
      tax_rate: 8.25,
      discount: 0,
    },
    {
      description: "Logo Design",
      quantity: 1,
      rate: 500.0,
      tax_rate: 8.25,
      discount: 0,
    },
  ],
};

const statusColors = {
  draft: "secondary",
  sent: "default",
  paid: "default",
} as const;

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  useRequireAuth();
  const invoiceId = params.id;

  // TODO: Replace with actual Supabase query
  const invoice = mockInvoice;

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.rate;
      const afterDiscount = lineTotal * (1 - item.discount / 100);
      return sum + afterDiscount;
    }, 0);
  };

  const calculateTax = () => {
    return invoice.items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.rate;
      const afterDiscount = lineTotal * (1 - item.discount / 100);
      const tax = afterDiscount * (item.tax_rate / 100);
      return sum + tax;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = subtotal + tax;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Invoices</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                {invoice.invoice_number}
              </h1>
              <Badge variant={statusColors[invoice.status]}>
                {invoice.status}
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              Invoice for {invoice.client_name}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
          <Button variant="outline" asChild>
            <Link href={`/invoices/${invoiceId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          </Button>
          <Button variant="outline">
            <a
              href={`/api/invoices/${invoiceId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">View PDF</span>
            </a>
          </Button>
          {invoice.status !== "paid" && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Invoice Number:</span>
              <span className="font-medium text-right break-all">
                {invoice.invoice_number}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Issue Date:</span>
              <span className="text-right">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Due Date:</span>
              <span className="text-right">
                {new Date(invoice.due_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Status:</span>
              <div className="text-right">
                <Badge variant={statusColors[invoice.status]}>
                  {invoice.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div>
              <div className="font-medium">{invoice.client_name}</div>
              <div className="text-sm text-muted-foreground break-words">
                {invoice.client_email}
              </div>
              {invoice.client_address && (
                <div className="text-sm text-muted-foreground mt-2 whitespace-pre-line break-words">
                  {invoice.client_address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoice.items.map((item, index) => {
              const lineTotal = item.quantity * item.rate;
              const afterDiscount = lineTotal * (1 - item.discount / 100);
              const itemTax = afterDiscount * (item.tax_rate / 100);
              const itemTotal = afterDiscount + itemTax;

              return (
                <div
                  key={index}
                  className="border-b pb-3 sm:pb-4 last:border-b-0"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{item.description}</h4>
                      <div className="text-xs sm:text-sm text-muted-foreground break-words">
                        {item.quantity} × {formatCurrency(item.rate)}
                        {item.discount > 0 && ` (${item.discount}% discount)`}
                        {item.tax_rate > 0 && ` + ${item.tax_rate}% tax`}
                      </div>
                    </div>
                    <div className="text-right sm:text-right flex-shrink-0">
                      <div className="font-medium text-lg sm:text-base">
                        {formatCurrency(itemTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tax:</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg sm:text-xl border-t pt-2 mt-3">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line break-words">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
