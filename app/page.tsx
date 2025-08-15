"use client";
// Purpose: Dashboard with financial overview using simple storage

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/storage";
import { DollarSign, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";

export default function DashboardPage() {
  const { data, loading } = useAppData();

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

  const expenses = data?.expenses || [];
  const income = data?.income || [];
  const invoices = data?.invoices || [];

  // Calculate current month totals
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthToDate = {
    income: income
      .filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === currentMonth &&
          itemDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, item) => sum + item.amount, 0),
    expenses: expenses
      .filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === currentMonth &&
          itemDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, item) => sum + item.amount, 0),
    invoices: invoices.filter((item) => {
      const itemDate = new Date(item.created_at);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    }).length,
  };

  // Calculate year to date totals
  const yearToDate = {
    income: income
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + item.amount, 0),
    expenses: expenses
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + item.amount, 0),
    invoices: invoices.filter((item) => {
      const itemDate = new Date(item.created_at);
      return itemDate.getFullYear() === currentYear;
    }).length,
  };

  const netMTD = monthToDate.income - monthToDate.expenses;
  const netYTD = yearToDate.income - yearToDate.expenses;

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
                {formatCurrency(monthToDate.income)}
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
                {formatCurrency(monthToDate.expenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  netMTD >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
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
                {monthToDate.invoices}
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
                {formatCurrency(yearToDate.income)}
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
                {formatCurrency(yearToDate.expenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  netYTD >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
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
                {yearToDate.invoices}
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
