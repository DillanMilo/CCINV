// Purpose: Dashboard with financial overview and quick stats
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatCurrency } from '@/lib/money';
import { DollarSign, FileText, TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  // Mock data - replace with actual Supabase queries
  const stats = {
    monthToDate: {
      income: 4250.00,
      expenses: 1235.19,
      invoices: 3,
    },
    yearToDate: {
      income: 48750.00,
      expenses: 12890.45,
      invoices: 28,
    },
  };

  const netMTD = stats.monthToDate.income - stats.monthToDate.expenses;
  const netYTD = stats.yearToDate.income - stats.yearToDate.expenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business finances
        </p>
      </div>

      {/* Month to Date */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Month to Date</h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(stats.monthToDate.income)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {formatCurrency(stats.monthToDate.expenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${netMTD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netMTD)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {stats.monthToDate.invoices}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Year to Date */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Year to Date</h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(stats.yearToDate.income)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {formatCurrency(stats.yearToDate.expenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${netYTD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netYTD)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {stats.yearToDate.invoices}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button asChild>
            <Link href="/invoices/new">Create Invoice</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/income">Add Income</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/expenses">Add Expense</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}