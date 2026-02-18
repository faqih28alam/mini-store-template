// components/auth-button.tsx

"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { ChevronDown, Loader2, ShoppingCart, Package, Settings, Crown } from "lucide-react";
import { useUser } from "@/app/hooks/use-user";
import { useCart } from "@/lib/store/cart";

export function AuthButton() {
  const supabase = createClient();
  const { user, loading } = useUser();
  const router = useRouter();
  const { getTotalItems } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const cartItemCount = getTotalItems();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(data?.role === 'admin');
      setCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [user, supabase]);

  // Handle Logout
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/products");
    router.refresh();
  };

  if (loading) {
    return <Loader2 className="animate-spin size-5 text-[#8DAA91]" />;
  }

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 px-2 relative">
          <Avatar className="size-6 rounded-lg">
            <AvatarImage
              src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
              alt={user.user_metadata?.full_name || "User"}
            />
            <AvatarFallback className="bg-[#8DAA91] text-white rounded-lg">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="truncate flex items-center gap-1">
            {user.user_metadata?.name || user.email}
            {!checkingAdmin && isAdmin && (
              <Crown className="size-3 text-yellow-500" />
            )}
          </div>
          <ChevronDown className="size-4" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#E07A5F]">
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-[#F5F5DC] dark:bg-[#242823] border-[#8DAA91]/20" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none text-[#2D4635] dark:text-[#DCE5D8]">
                Account
              </p>
              {!checkingAdmin && isAdmin && (
                <Badge className="bg-yellow-500 text-xs px-1.5 py-0">Admin</Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Shopping Section */}
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
          Shopping
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/products" className="flex items-center gap-2">
            <span className="text-base">🔎</span>
            <span>Browse Products</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${user.id}/cart`} className="flex items-center gap-2">
            <ShoppingCart className="size-4" />
            <span>My Cart</span>
            {cartItemCount > 0 && (
              <Badge className="ml-auto bg-[#E07A5F] text-xs">
                {cartItemCount}
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${user.id}/checkout`} className="flex items-center gap-2">
            <span className="text-base">💳</span>
            <span>Checkout</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${user.id}/orders`} className="flex items-center gap-2">
            <Package className="size-4" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>

        {/* Admin Section */}
        {!checkingAdmin && isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 flex items-center gap-1">
              <Crown className="size-3 text-yellow-500" />
              Admin Panel
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <Settings className="size-4" />
                <span>Product Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/orders" className="flex items-center gap-2">
                <Package className="size-4" />
                <span>Order Management</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <form action={signOut} className="w-full">
            <button className="w-full text-left text-[#E07A5F] font-semibold">
              Log out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline" className="border-[#8DAA91] text-[#8DAA91]">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" className="bg-[#8DAA91] hover:bg-[#2D4635] text-white">
        <Link href="/auth/login?screen=signup">Sign up</Link>
      </Button>
    </div>
  );
}