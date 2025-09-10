"use client";
// Purpose: Fixed expenses management for monthly recurring expenses

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
import { formatCurrency } from "@/lib/storage";
import { useAppData } from "@/hooks/use-app-data";

const fixedExpenseCategories = [
  "Software & Subscriptions",
  "Office & Workspace",
  "Internet & Phone",
  "Insurance",
  "Banking & Fees",
  "Marketing & Advertising",
  "Professional Services",
  "Equipment & Hardware",
  "Other",
];

export default function FixedExpensesPage() {
  const {
    data,
    loading,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
  } = useAppData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
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

  const fixedExpenses = data?.fixedExpenses || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExpense) {
      updateFixedExpense(editingExpense.id, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
      });
    } else {
      addFixedExpense({
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      category: "",
    });
    setEditingExpense(null);
  };

  const startEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this fixed expense?")) {
      deleteFixedExpense(id);
    }
  };

  const totalFixedExpenses = fixedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fixed Expenses</h1>
          <p className="text-muted-foreground">
            Manage your monthly recurring expenses
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fixed Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Edit Fixed Expense" : "Add Fixed Expense"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g., OpenAI Subscription, Cursor Pro"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Monthly Amount</Label>
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
                    {fixedExpenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Total Fixed Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Fixed Expenses Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(totalFixedExpenses)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total monthly recurring expenses
          </p>
        </CardContent>
      </Card>

      {fixedExpenses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">
                No fixed expenses recorded
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your monthly recurring expenses like subscriptions, rent,
                and utilities.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    Add Your First Fixed Expense
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {fixedExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold">{expense.description}</h3>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground space-y-1 sm:space-y-0">
                      <span className="break-words">
                        Category: {expense.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                    <div className="text-lg sm:text-xl font-semibold text-red-600">
                      {formatCurrency(expense.amount)}/month
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
    </div>
  );
}
