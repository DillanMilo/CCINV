// Purpose: Invoice list with simple storage
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/storage";
import { useAppData } from "@/hooks/use-app-data";

const statusColors = {
  draft: "secondary",
  sent: "default",
  paid: "default",
} as const;

export default function InvoicesPage() {
  const { data, loading, deleteInvoice } = useAppData();
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const filteredInvoices = invoices.filter(
    (invoice) => statusFilter === "all" || invoice.status === statusFilter
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice(id);
    }
  };

  const calculateTotal = (invoice: any) => {
    return invoice.items.reduce((sum: number, item: any) => {
      const lineTotal = item.quantity * item.rate;
      const afterDiscount = lineTotal * (1 - item.discount / 100);
      const itemTax = afterDiscount * (item.tax_rate / 100);
      return sum + afterDiscount + itemTax;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track your invoices
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">Create Invoice</Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === "all"
                  ? "You haven't created any invoices yet."
                  : `No ${statusFilter} invoices found.`}
              </p>
              <Button asChild>
                <Link href="/invoices/new">Create Your First Invoice</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">
                        {invoice.invoice_number}
                      </h3>
                      <Badge variant={statusColors[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatCurrency(calculateTotal(invoice))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/invoices/${invoice.id}`}>View</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
