// Purpose: Simple data management hook without authentication

import { useState, useEffect, useRef } from 'react';
import { loadData, saveData, generateId, type AppData, type Expense, type Income, type Invoice, type Profile, type FixedExpense } from '@/lib/storage';
import { supabase, SYNC_KEY } from '@/lib/supabase-client';

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const isUpdatingRef = useRef(false);

  // Load data on mount
  useEffect(() => {
    loadData().then((loadedData) => {
      setData(loadedData);
      setLoading(false);
    });
  }, []);

  // Set up real-time sync
  useEffect(() => {
    const channel = supabase
      .channel('app_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_data',
          filter: `sync_key=eq.${SYNC_KEY}`,
        },
        async (payload) => {
          // Don't sync our own changes
          if (isUpdatingRef.current) {
            return;
          }
          
          console.log('Received real-time update:', payload);
          
          // Reload data when changes are detected
          try {
            const freshData = await loadData();
            setData(freshData);
            console.log('Data synced from other device');
          } catch (error) {
            console.error('Error syncing data:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (data) {
      isUpdatingRef.current = true;
      saveData(data).finally(() => {
        // Allow sync after a delay to avoid race conditions
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 1000);
      });
    }
  }, [data]);

  // Helper functions
  const addExpense = (expense: Omit<Expense, 'id' | 'created_at'>) => {
    if (!data) return;
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setData({
      ...data,
      expenses: [...data.expenses, newExpense],
    });
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    if (!data) return;
    setData({
      ...data,
      expenses: data.expenses.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      ),
    });
  };

  const deleteExpense = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      expenses: data.expenses.filter(expense => expense.id !== id),
    });
  };

  const addIncome = (income: Omit<Income, 'id' | 'created_at'>) => {
    if (!data) return;
    const newIncome: Income = {
      ...income,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setData({
      ...data,
      income: [...data.income, newIncome],
    });
  };

  const updateIncome = (id: string, updates: Partial<Income>) => {
    if (!data) return;
    setData({
      ...data,
      income: data.income.map(income =>
        income.id === id ? { ...income, ...updates } : income
      ),
    });
  };

  const deleteIncome = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      income: data.income.filter(income => income.id !== id),
    });
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'created_at'>) => {
    if (!data) return;
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setData({
      ...data,
      invoices: [...data.invoices, newInvoice],
    });
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    if (!data) return;
    setData({
      ...data,
      invoices: data.invoices.map(invoice =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      ),
    });
  };

  const deleteInvoice = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      invoices: data.invoices.filter(invoice => invoice.id !== id),
    });
  };

  const updateProfile = (updates: Partial<Profile>) => {
    console.log("updateProfile called with:", updates);
    if (!data) {
      console.log("No data available, returning early");
      return;
    }
    console.log("Current profile:", data.profile);
    const newProfile = { ...data.profile, ...updates };
    console.log("New profile:", newProfile);
    setData({
      ...data,
      profile: newProfile,
    });
    console.log("Profile updated in state");
  };

  const addFixedExpense = (fixedExpense: Omit<FixedExpense, 'id' | 'created_at'>) => {
    if (!data) return;
    const newFixedExpense: FixedExpense = {
      ...fixedExpense,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setData({
      ...data,
      fixedExpenses: [...data.fixedExpenses, newFixedExpense],
    });
  };

  const updateFixedExpense = (id: string, updates: Partial<FixedExpense>) => {
    if (!data) return;
    setData({
      ...data,
      fixedExpenses: data.fixedExpenses.map(fixedExpense =>
        fixedExpense.id === id ? { ...fixedExpense, ...updates } : fixedExpense
      ),
    });
  };

  const deleteFixedExpense = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      fixedExpenses: data.fixedExpenses.filter(fixedExpense => fixedExpense.id !== id),
    });
  };

  return {
    data,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateProfile,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
  };
}
