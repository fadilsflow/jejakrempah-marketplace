"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  BarChart3,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/client-utils";

type Product = {
  id: string;
  name: string;
  status: string;
  stock: number;
  [key: string]: unknown;
};

type Order = {
  id: string;
  status: string;
  createdAt: string;
  sellerTotal?: string;
  total?: string;
  [key: string]: unknown;
};

type SellerStats = {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrdersCount: number;
  lowStockProducts: number;
};

export default function SellerDashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Fetch store data
  const { data: storeData, isLoading: isLoadingStore } = useQuery({
    queryKey: ["user-store"],
    queryFn: async () => {
      const response = await fetch("/api/stores/me");
      if (!response.ok) {
        throw new Error("Failed to fetch store");
      }
      return response.json();
    },
    enabled: !!session?.user,
  });

  // Fetch dashboard stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery<SellerStats>({
    queryKey: ["seller-stats"],
    queryFn: async (): Promise<SellerStats> => {
      // For now, we'll create mock stats since the API endpoints might not exist yet
      // In a real implementation, you'd have dedicated endpoints for these stats
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products/me?limit=1000"), // Get all products to count
        fetch("/api/orders/seller?limit=1000"), // Get all orders to count
      ]);

      const productsData = productsRes.ok
        ? await productsRes.json()
        : { products: [] };
      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };

      const products: Product[] = productsData.products || [];
      const orders: Order[] = ordersData.orders || [];

      // Calculate stats
      const totalProducts = products.length;
      const activeProducts = products.filter(
        (p: Product) => p.status === "active"
      ).length;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(
        (o: Order) => o.status === "pending"
      ).length;

      // Calculate total revenue (sum of seller's share from orders)
      const totalRevenue = orders.reduce((sum: number, order: Order) => {
        return sum + parseFloat(order.sellerTotal || order.total || "0");
      }, 0);

      // Recent orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentOrders = orders.filter(
        (o: Order) => new Date(o.createdAt) >= thirtyDaysAgo
      );

      return {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        recentOrdersCount: recentOrders.length,
        lowStockProducts: products.filter((p: Product) => p.stock < 10).length,
      };
    },
    enabled: !!session?.user && !!storeData?.store,
  });

  // Handle authentication redirect using useEffect
  React.useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Show loading state while session is loading
  if (isPending) {
    return (
      <div className="container mx-auto py-8 container px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!session?.user) {
    return (
      <div className="container mx-auto py-8 container px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isLoadingStore) {
    return (
      <div className="container mx-auto py-8 px-6 ">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // If user doesn't have a store, redirect to create store
  if (!isLoadingStore && !storeData?.store) {
    router.push("/seller/new");
    return (
      <div className="container mx-auto py-8 px-6 ">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Redirecting to store setup...</p>
        </div>
      </div>
    );
  }

  const store = storeData?.store;
  const stats: SellerStats = statsData || {
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentOrdersCount: 0,
    lowStockProducts: 0,
  };

  return (
    <div className="container mx-auto py-8 px-6 ">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening with your store.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <Link href="/seller/products/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
            <Link href={`/stores/${store?.slug}`} target="_blank">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Store
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats.totalProducts || 0
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {isLoadingStats ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                `${stats.activeProducts || 0} active`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats.totalOrders || 0
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {isLoadingStats ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                `${stats.pendingOrders || 0} pending`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                formatCurrency(stats.totalRevenue || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats.recentOrdersCount || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Store Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/seller/products">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/seller/orders">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  View Orders
                </Button>
              </Link>
              <Link href="/seller/products/new">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </Link>
              <Link href={`/stores/${store?.slug}`} target="_blank">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Store
                </Button>
              </Link>
            </div>

            {/* Alerts */}
            <div className="space-y-2">
              {stats.lowStockProducts > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      {stats.lowStockProducts} products low in stock
                    </span>
                  </div>
                  <Link href="/seller/products?filter=low-stock">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </div>
              )}

              {stats.pendingOrders > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      {stats.pendingOrders} orders need attention
                    </span>
                  </div>
                  <Link href="/seller/orders?status=pending">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Store Name
                </label>
                <p className="text-lg font-semibold">{store?.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Store URL
                </label>
                <p className="text-sm text-blue-600">
                  <Link
                    href={`/stores/${store?.slug}`}
                    className="hover:underline"
                  >
                    /stores/{store?.slug}
                  </Link>
                </p>
              </div>

              {store?.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm">{store.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {new Date(store?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Link href="/seller/settings">
                <Button variant="outline" className="w-full">
                  <Store className="mr-2 h-4 w-4" />
                  Edit Store Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
