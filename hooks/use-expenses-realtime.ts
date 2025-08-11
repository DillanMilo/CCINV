// Purpose: Realtime hook example for expenses table updates
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  merchant?: string;
  date: string;
  created_at: string;
}

export function useExpensesRealtime() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchExpenses = async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setExpenses(data);
      }
      setLoading(false);
    };

    fetchExpenses();

    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        () => {
          fetchExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { expenses, loading };
}