"use client"
import Link from "next/link"
import { Button } from "../ui/button"
import { LogoIcon } from "../logo"
import { UserButton } from "./user-button"
import { authClient } from "@/lib/auth-client";
import { Search, ShoppingCart, Store } from "lucide-react"
import { Input } from "../ui/input"


export function Header() {
    const { data: session, isPending } = authClient.useSession();
    const isAuthenticated = !!session?.user && !isPending;

    const handleSearch = undefined // TODO: implement search
    return (
        <header className="sticky top-0 z-50 w-full bg-background ">
            <div className="mx-auto max-w-6xl px-6 py-4">
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
                                placeholder="Cari produk"
                                className="w-full pr-10 bg-background"
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
                        <Button
                            size={"icon"}
                            variant={"outline"}>
                            <ShoppingCart />
                        </Button>
                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/seller/dashboard"
                                >
                                    <Button
                                        variant="outline"
                                    >
                                        <Store />
                                        Toko
                                    </Button>
                                </Link>
                                <UserButton />
                            </>

                        ) : (
                            <Link
                                href="/login"
                            >
                                <Button
                                    variant="outline"
                                >
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header >
    )
}

