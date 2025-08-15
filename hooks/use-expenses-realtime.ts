// Purpose: Real-time expenses data hook using Supabase
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

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
  const [isMounted, setIsMounted] = useState(false);

  // Track if component is mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const supabase = createClient();

    const fetchExpenses = async () => {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching expenses:', error);
          return;
        }

        setExpenses(data || []);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();

    // Set up real-time subscription
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
  }, [isMounted]);

  return { expenses, loading };
}