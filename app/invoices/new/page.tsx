// Purpose: Invoice creation form with line items
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { invoiceSchema, type Invoice } from '@/types/schemas';
import { formatCurrency } from '@/lib/money';
import { generateInvoiceNumber } from '@/lib/invoice-number';

export default function NewInvoicePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: generateInvoiceNumber(),
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      items: [
        {
          description: '',
          quantity: 1,
          rate: 0,
          tax_rate: 0,
          discount: 0,
        }
      ]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');
  
  const calculateSubtotal = () => {
    return watchedItems.reduce((sum, item) => {
      const lineTotal = (item.quantity || 0) * (item.rate || 0);
      const afterDiscount = lineTotal * (1 - (item.discount || 0) / 100);
      return sum + afterDiscount;
    }, 0);
  };

  const calculateTax = () => {
    return watchedItems.reduce((sum, item) => {
      const lineTotal = (item.quantity || 0) * (item.rate || 0);
      const afterDiscount = lineTotal * (1 - (item.discount || 0) / 100);
      const tax = afterDiscount * ((item.tax_rate || 0) / 100);
      return sum + tax;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = subtotal + tax;

  const onSubmit = async (data: Invoice) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement server action to create invoice
      console.log('Creating invoice:', data);
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground">
          Fill out the details below to create a new invoice
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  {...form.register('invoice_number')}
                />
                {form.formState.errors.invoice_number && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.invoice_number.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value: any) => form.setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  {...form.register('issue_date')}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  {...form.register('due_date')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  {...form.register('client_name')}
                />
                {form.formState.errors.client_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.client_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="client_email">Client Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  {...form.register('client_email')}
                />
                {form.formState.errors.client_email && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.client_email.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="client_address">Client Address</Label>
              <Textarea
                id="client_address"
                {...form.register('client_address')}
              />
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
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Input
                        {...form.register(`items.${index}.description`)}
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label>Tax %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        {...form.register(`items.${index}.tax_rate`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">
                      Line Total: {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0))}
                    </span>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => append({
                  description: '',
                  quantity: 1,
                  rate: 0,
                  tax_rate: 0,
                  discount: 0,
                })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Additional notes or terms..."
              {...form.register('notes')}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}