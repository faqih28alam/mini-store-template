// app/[customer]/layout.tsx

import { CartAuthSync } from '@/components/cart-auth-sync'
// import { Toaster } from "@/components/ui/sonner"
import { ThemeSwitcher } from "@/components/theme-switcher";
import Navbar from "@/components/navbar";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">

        {/* NAVBAR */}
        <Navbar />

        {/* CONTENT */}
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Suspense fallback={<p>Loading your cart...</p>}>
            <CartAuthSync />
            {children}
          </Suspense>
        </div>

        {/* FOOTER  */}
        <footer className="w-full border-t bg-background">
          <div className="max-w-5xl mx-auto px-5 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-2 items-center md:items-start">
              <span className="font-bold text-lg tracking-tight">OrganicStore</span>
              <p className="text-muted-foreground text-sm">
                © 2026 OrganicStore. All rights reserved.
              </p>
            </div>

            <nav className="flex gap-6 text-sm font-medium text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Shop</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </nav>

            <div className="flex items-center gap-4">
              <ThemeSwitcher />
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
