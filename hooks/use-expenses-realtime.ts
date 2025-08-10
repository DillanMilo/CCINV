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

    // Initial fetch
    const fetchExpenses = async () => {
      // TODO: Replace with actual Supabase query when expenses table exists
      // const { data, error } = await supabase
      //   .from('expenses')
      //   .select('*')
      //   .order('created_at', { ascending: false });

      // Mock data for now
      const mockData: Expense[] = [
        {
          id: '1',
          amount: 89.99,
          description: 'Adobe Creative Cloud Subscription',
          category: 'Software',
          merchant: 'Adobe',
          date: '2024-12-01',
          created_at: '2024-12-01T10:00:00Z',
        },
      ];

      setExpenses(mockData);
      setLoading(false);
    };

    fetchExpenses();

    // Set up realtime subscription
    // TODO: Enable when expenses table exists
    // const channel = supabase
    //   .channel('expenses-changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'expenses',
    //     },
    //     () => {
    //       // Refetch data when changes occur
    //       fetchExpenses();
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, []);

  return { expenses, loading };
}