// Purpose: Real-time income data hook using Supabase
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Income {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export function useIncomeRealtime() {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Track if component is mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const supabase = createClient();

    const fetchIncome = async () => {
      try {
        const { data, error } = await supabase
          .from('income')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching income:', error);
          return;
        }

        setIncome(data || []);
      } catch (error) {
        console.error('Error fetching income:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();

    // Set up real-time subscription
    const channel = supabase
      .channel('income-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'income',
        },
        () => {
          fetchIncome();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMounted]);

  return { income, loading };
}
