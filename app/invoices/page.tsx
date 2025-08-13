// Purpose: Invoice list with status filters
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
import { formatCurrency } from "@/lib/money";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  status: "draft" | "sent" | "paid";
  issue_date: string;
  due_date: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoice_number: "INV-2501-ABC1",
    client_name: "Acme Corp",
    total: 2500.0,
    status: "paid",
    issue_date: "2024-12-15",
    due_date: "2025-01-14",
  },
  {
    id: "2",
    invoice_number: "INV-2501-DEF2",
    client_name: "Tech Solutions LLC",
    total: 1850.0,
    status: "sent",
    issue_date: "2024-12-20",
    due_date: "2025-01-19",
  },
];

const statusColors = {
  draft: "secondary",
  sent: "default",
  paid: "default",
} as const;

export default function InvoicesPage() {
  useRequireAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = mockInvoices.filter(
    (invoice) => statusFilter === "all" || invoice.status === statusFilter
  );

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
                      {formatCurrency(invoice.total)}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/invoices/${invoice.id}`}>View</Link>
                    </Button>
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
