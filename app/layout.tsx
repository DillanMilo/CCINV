// Purpose: Root layout with navigation - no authentication required
"use client";

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

const navigationItems = [
  { name: "Dashboard", href: "/" },
  { name: "Invoices", href: "/invoices" },
  { name: "Income", href: "/income" },
  { name: "Expenses", href: "/expenses" },
  { name: "Fixed Expenses", href: "/fixed-expenses" },
  { name: "Profile", href: "/profile" },
];

function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-screen-xl px-3 sm:px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-lg sm:text-xl font-bold text-primary"
              >
                Creative Currents
              </Link>
              <div className="hidden sm:flex gap-4 lg:gap-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-xs sm:text-sm font-medium transition-colors ${
                      isActiveRoute(item.href)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-muted-foreground hover:text-primary"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t bg-white">
            <div className="px-3 py-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      <main className="mx-auto max-w-screen-xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
