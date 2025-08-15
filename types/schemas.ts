// Purpose: Shared TypeScript types and Zod schemas
import { z } from 'zod';

export const profileSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  ein: z.string().nullish().transform(val => val || null),
  tax_number: z.string().nullish().transform(val => val || null),
  bank_name: z.string().nullish().transform(val => val || null),
  account_number: z.string().nullish().transform(val => val || null),
  routing_number: z.string().nullish().transform(val => val || null),
  address_line_1: z.string().nullish().transform(val => val || null),
  address_line_2: z.string().nullish().transform(val => val || null),
  city: z.string().nullish().transform(val => val || null),
  state: z.string().nullish().transform(val => val || null),
  zip_code: z.string().nullish().transform(val => val || null),
  logo_url: z.string().nullish().transform(val => val || null),
});

export const incomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
});

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  merchant: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().positive('Rate must be positive'),
  tax_rate: z.number().min(0).max(100),
  discount: z.number().min(0).max(100),
});

export const invoiceSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Valid email required'),
  client_address: z.string().optional(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.enum(['draft', 'sent', 'paid']),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export type Profile = z.infer<typeof profileSchema>;
export type Income = z.infer<typeof incomeSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;