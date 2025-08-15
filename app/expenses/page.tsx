"use client";
// Purpose: Expense tracking with simple storage

import { useState } from "react";
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
import { formatCurrency } from "@/lib/storage";
import { useAppData } from "@/hooks/use-app-data";

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
  const { data, loading, addExpense, updateExpense, deleteExpense } =
    useAppData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    merchant: "",
    date: new Date().toISOString().split("T")[0],
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        merchant: formData.merchant || "",
        date: formData.date,
      });
    } else {
      addExpense({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        merchant: formData.merchant || "",
        date: formData.date,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      category: "",
      merchant: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingExpense(null);
  };

  const startEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      merchant: expense.merchant || "",
      date: expense.date,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id);
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
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
    (sum, expense) => sum + expense.amount,
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

  const handleExport = () => {
    const csvContent = [
      ["Date", "Description", "Category", "Merchant", "Amount"],
      ...expenses.map((expense) => [
        expense.date,
        expense.description,
        expense.category,
        expense.merchant || "",
        expense.amount.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track your business expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Edit Expense" : "Add Expense"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
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
              </div>
              <div>
                <Label htmlFor="merchant">Merchant (Optional)</Label>
                <Input
                  id="merchant"
                  value={formData.merchant}
                  onChange={(e) =>
                    setFormData({ ...formData, merchant: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingExpense ? "Update Expense" : "Add Expense"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
            </div>
          </CardContent>
        </Card>
      </div>

      {expenses.length === 0 ? (
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
                  <Button onClick={() => resetForm()}>
                    Add Your First Expense
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold">{expense.description}</h3>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground space-y-1 sm:space-y-0">
                      <span className="break-words">
                        Category: {expense.category}
                      </span>
                      {expense.merchant && (
                        <span className="break-words">
                          Merchant: {expense.merchant}
                        </span>
                      )}
                      <span className="break-words">
                        Date: {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                    <div className="text-lg sm:text-xl font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
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
                        <DropdownMenuItem onClick={() => startEdit(expense)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(expense.id)}
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
          <Button onClick={handleExport} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Export your expenses as a CSV file. Perfect for monthly tracking and
            tax preparation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
