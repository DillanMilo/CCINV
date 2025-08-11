// Purpose: Server actions for database operations
'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { profileSchema, incomeSchema, expenseSchema, invoiceSchema } from '@/types/schemas';

export async function createExpense(formData: FormData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const expense = {
    amount: parseFloat(formData.get('amount') as string),
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    merchant: formData.get('merchant') as string || null,
    date: formData.get('date') as string,
  };

  const validated = expenseSchema.parse(expense);

  // TODO: Insert into Supabase expenses table when it exists
  // const { error } = await supabase
  //   .from('expenses')
  //   .insert({
  //     ...validated,
  //     user_id: user.id,
  //   });

  // if (error) {
  //   throw new Error('Failed to create expense');
  // }

  revalidatePath('/expenses');
}

export async function createIncome(formData: FormData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const income = {
    amount: parseFloat(formData.get('amount') as string),
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    date: formData.get('date') as string,
  };

  const validated = incomeSchema.parse(income);

  // TODO: Insert into Supabase income table when it exists
  // const { error } = await supabase
  //   .from('income')
  //   .insert({
  //     ...validated,
  //     user_id: user.id,
  //   });

  // if (error) {
  //   throw new Error('Failed to create income');
  // }

  revalidatePath('/income');
}

export async function upsertProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  const profile = {
    company_name: formData.get('company_name') as string,
    ein: formData.get('ein') as string || null,
    tax_number: formData.get('tax_number') as string || null,
    bank_name: formData.get('bank_name') as string || null,
    account_number: formData.get('account_number') as string || null,
    routing_number: formData.get('routing_number') as string || null,
    address_line_1: formData.get('address_line_1') as string || null,
    address_line_2: formData.get('address_line_2') as string || null,
    city: formData.get('city') as string || null,
    state: formData.get('state') as string || null,
    zip_code: formData.get('zip_code') as string || null,
    logo_url: formData.get('logo_url') as string || null,
  };
  const validated = profileSchema.parse(profile);
  // Upsert into Supabase profiles table
  // const { error } = await supabase
  //   .from('profiles')
  //   .upsert({
  //     ...validated,
  //     user_id: user.id,
  //   });
  // if (error) {
  //   throw new Error('Failed to update profile');
  // }
  revalidatePath('/profile');
}

export async function createInvoice(formData: FormData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // TODO: Parse complex invoice data from FormData
  // This is a simplified version - real implementation would need to handle items array
  const invoice = {
    client_name: formData.get('client_name') as string,
    client_email: formData.get('client_email') as string,
    client_address: formData.get('client_address') as string || null,
    invoice_number: formData.get('invoice_number') as string,
    issue_date: formData.get('issue_date') as string,
    due_date: formData.get('due_date') as string,
    status: (formData.get('status') as 'draft' | 'sent' | 'paid') || 'draft',
    notes: formData.get('notes') as string || null,
    items: [], // TODO: Parse items from FormData
  };

  // const validated = invoiceSchema.parse(invoice);

  // TODO: Insert into Supabase invoices and invoice_items tables when they exist
  // const { error } = await supabase
  //   .from('invoices')
  //   .insert({
  //     ...validated,
  //     user_id: user.id,
  //   });

  // if (error) {
  //   throw new Error('Failed to create invoice');
  // }

  revalidatePath('/invoices');
}