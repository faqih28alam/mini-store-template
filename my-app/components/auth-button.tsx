"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation"; import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import { useUser } from "@/app/hooks/use-user";

export function AuthButton() {
  const supabase = createClient();
  const { user, loading } = useUser();
  const router = useRouter();

  // Handle Logout
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/products");
    router.refresh();
  };

  if (loading) {
    return <Loader2 className="animate-spin size-5 text-[#8DAA91]" />;
  }
  // console.log("User Metadata:", user?.user_metadata);

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 px-2">
          <Avatar className="size-6 rounded-lg">
            {/* Supabase user metadata usually has the avatar_url if using Google/Github */}
            <AvatarImage
              src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
              alt={user.user_metadata?.full_name || "User"} />
            <AvatarFallback className="bg-[#8DAA91] text-white rounded-lg">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="truncate">{user.user_metadata?.name || user.email}</div>
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-[#F5F5DC] dark:bg-[#242823] border-[#8DAA91]/20" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-[#2D4635] dark:text-[#DCE5D8]">Account</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/products">Search Items 🔎︎</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${user.id}/cart`}>My Cart</Link>
        </DropdownMenuItem>
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