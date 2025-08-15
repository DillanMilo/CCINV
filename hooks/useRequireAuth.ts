"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export function useRequireAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Track if component is mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run after component is mounted on client
    if (!isMounted) return;
    
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          router.replace("/login");
          return;
        }
        
        if (!user) {
          router.replace("/login");
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace("/login");
      }
    };
    
    checkAuth();
  }, [router, isMounted]);

  // Always show loading until mounted and auth is resolved
  if (!isMounted) {
    return { isLoading: true };
  }

  return { isLoading };
}
