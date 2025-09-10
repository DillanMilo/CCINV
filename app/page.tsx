"use client";
// Purpose: Dashboard with financial overview using simple storage

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { formatCurrency } from "@/lib/storage";
import {
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";

export default function DashboardPage() {
  const { data, loading } = useAppData();
  const [showTotalHistory, setShowTotalHistory] = useState(false);

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
  const fixedExpenses = data?.fixedExpenses || [];

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

  // Calculate total fixed expenses
  const totalFixedExpenses = fixedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculate totals for display (either current month or total history)
  const displayData = showTotalHistory
    ? {
        income: yearToDate.income,
        expenses: yearToDate.expenses,
        net: yearToDate.income - yearToDate.expenses,
        invoices: yearToDate.invoices,
        label: "Year to Date",
      }
    : {
        income: monthToDate.income,
        expenses: monthToDate.expenses,
        net: monthToDate.income - monthToDate.expenses,
        invoices: monthToDate.invoices,
        label: "Month to Date",
      };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business finances
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="history-toggle" className="text-sm font-medium">
            Show Total History
          </Label>
          <Switch
            id="history-toggle"
            checked={showTotalHistory}
            onCheckedChange={setShowTotalHistory}
          />
        </div>
      </div>

      {/* Main Financial Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {displayData.label}
        </h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(displayData.income)}
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
                {formatCurrency(displayData.expenses)}
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
                  displayData.net >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(displayData.net)}
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
                {displayData.invoices}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Expenses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Monthly Fixed Expenses</h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Fixed Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {formatCurrency(totalFixedExpenses)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {fixedExpenses.length} recurring expense
                {fixedExpenses.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Net After Fixed
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  displayData.net - totalFixedExpenses >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(displayData.net - totalFixedExpenses)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                After fixed expenses
              </p>
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
          <Button variant="outline" asChild>
            <Link href="/fixed-expenses">Manage Fixed Expenses</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
