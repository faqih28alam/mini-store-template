import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";

export async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Server Action for Logout
  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/auth/login");
  };

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-[#8DAA91]/20">
          <Avatar className="h-9 w-9">
            {/* Supabase user metadata usually has the avatar_url if using Google/Github */}
            <AvatarImage src={user.user_metadata?.avatar_url} alt="User" />
            <AvatarFallback className="bg-[#8DAA91] text-white">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
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
          <Link href={`/${user.id}/cart`}>My Orders</Link>
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