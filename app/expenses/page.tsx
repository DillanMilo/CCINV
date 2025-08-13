"use client";
// Purpose: Expense tracking with receipt upload and add dialog

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Download, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { expenseSchema, type Expense } from "@/types/schemas";
import { formatCurrency } from "@/lib/money";
import { useExpensesRealtime } from "@/hooks/use-expenses-realtime";
import { deleteExpense } from "@/lib/actions";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface ExpenseRecord extends Expense {
  id: string;
  created_at: string;
}

const expenseCategories = [
  "Software",
  "Subscriptions",
  "Hardware",
  "Office Supplies",
  "Stock/Inventory",
  "Meals & Entertainment",
  "Business Meetings",
  "Travel",
  "Gas & Fuel",
  "Vehicle Expenses",
  "Marketing",
  "Advertising",
  "Education",
  "Training & Courses",
  "Insurance",
  "Legal & Professional",
  "Utilities",
  "Internet & Phone",
  "Rent & Facilities",
  "Equipment Rental",
  "Maintenance & Repairs",
  "Banking & Fees",
  "Taxes & Licenses",
  "Other",
];

export default function ExpensesPage() {
  useRequireAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(
    null
  );
  const [exportFromDate, setExportFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [exportToDate, setExportToDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isExporting, setIsExporting] = useState(false);

  // Monthly breakdown state
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const form = useForm<Expense>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      category: "",
      merchant: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const startEdit = (record: ExpenseRecord) => {
    setEditingRecord(record);
    form.reset({
      amount: record.amount,
      description: record.description,
      category: record.category,
      merchant: record.merchant || "",
      date: record.date,
    });
    setIsDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    form.reset({
      amount: 0,
      description: "",
      category: "",
      merchant: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(false);
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      try {
        await deleteExpense(id);
      } catch (error) {
        alert("Failed to delete expense.");
      }
    }
  };

  const onSubmit = async (data: Expense) => {
    setIsSubmitting(true);
    try {
      if (editingRecord) {
        // TODO: Implement server action to update expense record
        console.log("Updating expense record:", editingRecord.id, data);
      } else {
        // TODO: Implement server action to create expense record
        console.log("Creating expense record:", data);
      }
      cancelEdit();
    } catch (error) {
      console.error("Error saving expense record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { expenses, loading } = useExpensesRealtime();

  const totalExpenses = expenses.reduce(
    (sum, record) => sum + record.amount,
    0
  );

  // Calculate monthly expenses
  const getMonthlyExpenses = (month: Date) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
  };

  const monthlyExpenses = getMonthlyExpenses(selectedMonth);
  const monthlyTotal = monthlyExpenses.reduce(
    (sum, record) => sum + record.amount,
    0
  );

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/export/expenses?from=${exportFromDate}&to=${exportToDate}`
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses-${exportFromDate}-to-${exportToDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export expenses. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track your business expenses</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingRecord(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? "Edit Expense Record" : "Add Expense Record"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register("amount", { valueAsNumber: true })}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" {...form.register("description")} />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(value) => form.setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="merchant">Merchant (Optional)</Label>
                  <Input id="merchant" {...form.register("merchant")} />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" {...form.register("date")} />
                  {form.formState.errors.date && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.date.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? editingRecord
                        ? "Updating..."
                        : "Adding..."
                      : editingRecord
                      ? "Update Expense"
                      : "Add Expense"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Monthly Expenses</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {selectedMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(monthlyTotal)}
              </div>
              <div className="text-sm text-muted-foreground">
                {monthlyExpenses.length} expense
                {monthlyExpenses.length !== 1 ? "s" : ""} this month
              </div>
              {monthlyExpenses.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    Top Categories:
                  </div>
                  {Object.entries(
                    monthlyExpenses.reduce((acc, expense) => {
                      acc[expense.category] =
                        (acc[expense.category] || 0) + expense.amount;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([category, amount]) => (
                      <div
                        key={category}
                        className="flex justify-between text-xs"
                      >
                        <span className="truncate">{category}</span>
                        <span className="font-medium">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">
                Loading expenses...
              </h3>
              <p className="text-muted-foreground mb-4">
                Please wait while we fetch your expense data.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">
                No expenses recorded
              </h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your business expenses to better manage your
                finances.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingRecord(null)}>
                    Add Your First Expense
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {expenses.map((record) => (
            <Card key={record.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold">{record.description}</h3>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground space-y-1 sm:space-y-0">
                      <span className="break-words">
                        Category: {record.category}
                      </span>
                      {record.merchant && (
                        <span className="break-words">
                          Merchant: {record.merchant}
                        </span>
                      )}
                      <span className="break-words">
                        Date: {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                    <div className="text-lg sm:text-xl font-semibold text-red-600">
                      -{formatCurrency(record.amount)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(record)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteRecord(record.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 min-w-0">
              <Label htmlFor="export-from">From Date</Label>
              <Input
                id="export-from"
                type="date"
                value={exportFromDate}
                onChange={(e) => setExportFromDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <Label htmlFor="export-to">To Date</Label>
              <Input
                id="export-to"
                type="date"
                value={exportToDate}
                onChange={(e) => setExportToDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting || !exportFromDate || !exportToDate}
              className="w-full sm:w-auto"
            >
              {isExporting ? (
                <>
                  <Calendar className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Export your expenses as a CSV file for the selected date range.
            Perfect for monthly tracking and tax preparation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
