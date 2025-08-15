// Purpose: User login/signup page using Supabase Auth UI
"use client";

import { useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Only create the client on the client side
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/");
    });
  }, [router, supabase]);

  if (!supabase) return null; // Don't render on the server

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Sign In / Sign Up
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="default"
          view="sign_up"
          showLinks={true}
          redirectTo={
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : ""
          }
        />
      </div>
    </div>
  );
}
