"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { LogoIcon } from "../logo";
import { UserButton } from "./user-button";
import { authClient } from "@/lib/auth-client";
import { Search, ShoppingCart, Store } from "lucide-react";
import { Input } from "../ui/input";
import { useQuery } from "@tanstack/react-query";
import { CartSheet } from "../cart-sheet";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session?.user && !isPending;
  const { itemCount, fetchCart } = useCart();

  // Fetch cart data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Check if user has a store
  const { data: storeData } = useQuery({
    queryKey: ["user-store"],
    queryFn: async () => {
      const response = await fetch("/api/stores/me");
      if (!response.ok) {
        throw new Error("Failed to fetch store");
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const hasStore = storeData?.hasStore || false;
  const storeHref = hasStore ? "/seller/dashboard" : "/seller/new";

  const router = useRouter();
  const [globalQuery, setGlobalQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (globalQuery.trim()) params.set("q", globalQuery.trim());
    router.push(`/search?${params.toString()}`);
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-background ">
      <div className="mx-auto container px-6 py-4">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon className="w-6 h-6 " />
              <span className="font-bold text-primary text-2xl">JRM</span>
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md sm:max-w-lg md:max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <Input
                placeholder="Cari produk atau toko"
                className="w-full pr-10 bg-background"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-0 top-0 h-full"
                variant="ghost"
              >
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Action */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {isAuthenticated ? (
              <CartSheet>
                <Button size="icon" variant="outline" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {itemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {itemCount > 99 ? "99+" : itemCount}
                    </Badge>
                  )}
                </Button>
              </CartSheet>
            ) : (
              <Button size="icon" variant="outline" disabled>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
            {isAuthenticated ? (
              <>
                <Link href={storeHref}>
                  <Button variant="outline">
                    <Store className="h-4 w-4 mr-2" />
                    Toko
                  </Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
