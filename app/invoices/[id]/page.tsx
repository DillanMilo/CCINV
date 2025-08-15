"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Send,
  Edit,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/storage";
import { useAppData } from "@/hooks/use-app-data";

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
  const { data, loading, updateInvoice } = useAppData();
  const invoiceId = params.id;
  const profile = data?.profile;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Loading...</h3>
          <p className="text-muted-foreground">
            Please wait while we load your data.
          </p>
        </div>
      </div>
    );
  }

  const invoices = data?.invoices || [];
  const invoice = invoices.find((inv) => inv.id === invoiceId);

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Invoice not found</h3>
          <p className="text-muted-foreground">
            The invoice you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

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

  const handleStatusChange = async (newStatus: "draft" | "sent" | "paid") => {
    try {
      await updateInvoice(invoice.id, { status: newStatus });
    } catch (error) {
      console.error("Error updating invoice status:", error);
      alert("Failed to update invoice status. Please try again.");
    }
  };

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
            <Button
              onClick={() => {
                const pdfUrl = `/api/invoices/${invoiceId}/pdf`;
                const subject = encodeURIComponent(
                  `Invoice ${invoice.invoice_number} from ${
                    profile?.company_name || "Creative Currents"
                  }`
                );
                const body = encodeURIComponent(
                  `Dear ${
                    invoice.client_name
                  },\n\nPlease find attached invoice ${
                    invoice.invoice_number
                  } for ${formatCurrency(
                    total
                  )}.\n\nThank you for your business!\n\nBest regards,\n${
                    profile?.company_name || "Creative Currents"
                  }`
                );

                // Create mailto link with PDF attachment
                const mailtoLink = `mailto:${invoice.client_email}?subject=${subject}&body=${body}`;

                // Open email client
                window.open(mailtoLink, "_blank");

                // Also trigger PDF download
                const link = document.createElement("a");
                link.href = pdfUrl;
                link.download = `invoice-${invoice.invoice_number}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
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
            {profile?.logo_url && (
              <div className="mb-4">
                <img
                  src={profile.logo_url}
                  alt="Company Logo"
                  className="max-w-[200px] h-auto rounded border"
                />
              </div>
            )}
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

      {/* Quick Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={invoice.status === "draft" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("draft")}
              disabled={invoice.status === "draft"}
            >
              <Clock className="h-4 w-4 mr-2" />
              Mark as Draft
            </Button>
            <Button
              variant={invoice.status === "sent" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("sent")}
              disabled={invoice.status === "sent"}
            >
              <Send className="h-4 w-4 mr-2" />
              Mark as Sent
            </Button>
            <Button
              variant={invoice.status === "paid" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("paid")}
              disabled={invoice.status === "paid"}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          </div>
        </CardContent>
      </Card>

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
