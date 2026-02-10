import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "./auth-button";
import { EnvVarWarning } from "./env-var-warning";
import { hasEnvVars } from "@/lib/utils";

export default function Navbar() {
    return (
        /* NAVBAR */
        <nav className="sticky top-0 z-50 w-full flex justify-center border-b border-[#8DAA91]/20 h-20 bg-[#F5F5DC]/80 dark:bg-[#1A1C19]/80 backdrop-blur-none">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">

                {/* LEFT SIDE: Logo & Main Nav */}
                <div className="flex gap-8 items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-[#8DAA91] rounded-full flex items-center justify-center text-white font-bold group-hover:bg-[#E07A5F] transition-colors">
                            O
                        </div>
                        <span className="font-bold text-lg tracking-tight text-[#2D4635] dark:text-[#DCE5D8]">
                            OrganicStore
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/products"
                            className="text-[#8DAA91] hover:text-[#E07A5F] font-medium transition-colors"
                        >
                            Products
                        </Link>
                    </div>
                </div>

                {/* RIGHT SIDE: Auth */}
                <div className="flex items-center gap-4">
                    {!hasEnvVars ? (
                        <EnvVarWarning />
                    ) : (
                        <Suspense fallback={<div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />}>
                            <AuthButton />
                        </Suspense>
                    )}
                </div>

            </div>
        </nav>
    );
}