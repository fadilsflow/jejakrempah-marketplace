import { NextRequest } from "next/server";
import { db } from "@/db";
import { payout, store, orderItem, order } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  withAuth,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return createErrorResponse("Store ID is required", 400);
    }

    try {
      const storeData = await db
        .select({ id: store.id, ownerId: store.ownerId })
        .from(store)
        .where(eq(store.id, storeId))
        .limit(1);

      if (storeData.length === 0) {
        return createErrorResponse("Store not found", 404);
      }

      if (storeData[0].ownerId !== user.id && user.role !== "admin") {
        return createErrorResponse("Unauthorized", 403);
      }

      const completedOrders = await db
        .select({
          totalEarnings: sql<string>`SUM(CAST(${orderItem.price} AS NUMERIC) * ${orderItem.quantity})`,
        })
        .from(orderItem)
        .leftJoin(order, eq(orderItem.orderId, order.id))
        .where(
          and(
            eq(orderItem.storeId, storeId),
            sql`${order.status} IN ('paid', 'shipped', 'completed')`
          )
        );

      const totalEarnings = parseFloat(
        completedOrders[0]?.totalEarnings || "0"
      );

      const totalServiceFees = await db
        .select({
          totalFees: sql<string>`SUM(CAST(${order.serviceFee} AS NUMERIC))`,
        })
        .from(order)
        .leftJoin(orderItem, eq(order.id, orderItem.orderId))
        .where(
          and(
            eq(orderItem.storeId, storeId),
            sql`${order.status} IN ('paid', 'shipped', 'completed')`
          )
        );

      const serviceFees = parseFloat(totalServiceFees[0]?.totalFees || "0");

      const totalPayouts = await db
        .select({
          totalPaid: sql<string>`SUM(CAST(${payout.amount} AS NUMERIC))`,
        })
        .from(payout)
        .where(
          and(
            eq(payout.storeId, storeId),
            sql`${payout.status} IN ('completed', 'processing', 'pending')`
          )
        );

      const paidAmount = parseFloat(totalPayouts[0]?.totalPaid || "0");

      const pendingPayouts = await db
        .select({
          totalPending: sql<string>`SUM(CAST(${payout.amount} AS NUMERIC))`,
        })
        .from(payout)
        .where(
          and(
            eq(payout.storeId, storeId),
            sql`${payout.status} IN ('pending', 'processing')`
          )
        );

      const pendingAmount = parseFloat(pendingPayouts[0]?.totalPending || "0");

      const availableBalance = totalEarnings - serviceFees - paidAmount;

      return createSuccessResponse({
        totalEarnings: totalEarnings.toFixed(2),
        serviceFees: serviceFees.toFixed(2),
        totalPaid: paidAmount.toFixed(2),
        pendingPayouts: pendingAmount.toFixed(2),
        availableBalance: availableBalance.toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      return createErrorResponse("Failed to fetch balance", 500);
    }
  });
}
