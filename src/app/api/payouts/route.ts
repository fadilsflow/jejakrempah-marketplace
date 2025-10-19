import { NextRequest } from "next/server";
import { db } from "@/db";
import { payout, store, orderItem, order } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  withAuth,
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
  validateQueryParams,
  generateId,
  calculateOffset,
  createPaginationMeta,
} from "@/lib/api-utils";
import { z } from "zod";
import { paginationSchema } from "@/lib/validations";

const createPayoutSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  amount: z.number().positive("Amount must be positive"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountHolderName: z.string().min(1, "Account holder name is required"),
});

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const { searchParams } = new URL(req.url);

    const paginationResult = validateQueryParams(
      searchParams,
      paginationSchema
    );
    if (paginationResult.error) {
      return createErrorResponse(paginationResult.error);
    }
    const { page, limit } = paginationResult.data!;

    try {
      let query;
      let countQuery;

      if (user.role === "admin") {
        countQuery = db.select({ count: payout.id }).from(payout);

        query = db
          .select({
            id: payout.id,
            amount: payout.amount,
            status: payout.status,
            transactionId: payout.transactionId,
            bankName: payout.bankName,
            accountNumber: payout.accountNumber,
            accountHolderName: payout.accountHolderName,
            notes: payout.notes,
            processedAt: payout.processedAt,
            createdAt: payout.createdAt,
            updatedAt: payout.updatedAt,
            store: {
              id: store.id,
              name: store.name,
              slug: store.slug,
              ownerId: store.ownerId,
            },
          })
          .from(payout)
          .leftJoin(store, eq(payout.storeId, store.id))
          .orderBy(desc(payout.createdAt))
          .limit(limit)
          .offset(calculateOffset(page, limit));
      } else {
        const userStores = await db
          .select({ id: store.id })
          .from(store)
          .where(eq(store.ownerId, user.id));

        if (userStores.length === 0) {
          return createSuccessResponse({
            payouts: [],
            pagination: createPaginationMeta(0, page, limit),
          });
        }

        const storeIds = userStores.map((s) => s.id);

        countQuery = db
          .select({ count: payout.id })
          .from(payout)
          .where(
            sql`${payout.storeId} IN (${sql.join(
              storeIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          );

        query = db
          .select({
            id: payout.id,
            amount: payout.amount,
            status: payout.status,
            transactionId: payout.transactionId,
            bankName: payout.bankName,
            accountNumber: payout.accountNumber,
            accountHolderName: payout.accountHolderName,
            notes: payout.notes,
            processedAt: payout.processedAt,
            createdAt: payout.createdAt,
            updatedAt: payout.updatedAt,
            store: {
              id: store.id,
              name: store.name,
              slug: store.slug,
              ownerId: store.ownerId,
            },
          })
          .from(payout)
          .leftJoin(store, eq(payout.storeId, store.id))
          .where(
            sql`${payout.storeId} IN (${sql.join(
              storeIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
          .orderBy(desc(payout.createdAt))
          .limit(limit)
          .offset(calculateOffset(page, limit));
      }

      const totalResult = await countQuery;
      const total = totalResult.length;

      const payouts = await query;

      console.log("Payouts query result:", {
        total,
        payouts: payouts.length,
        userRole: user.role,
      });

      const pagination = createPaginationMeta(total, page, limit);

      return createSuccessResponse({
        payouts,
        pagination,
      });
    } catch (error) {
      console.error("Error fetching payouts:", error);
      return createErrorResponse("Failed to fetch payouts", 500);
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const validationResult = await validateRequestBody(req, createPayoutSchema);
    if (validationResult.error) {
      return createErrorResponse(validationResult.error);
    }

    const { storeId, amount, bankName, accountNumber, accountHolderName } =
      validationResult.data!;

    try {
      const storeData = await db
        .select({
          id: store.id,
          ownerId: store.ownerId,
          name: store.name,
        })
        .from(store)
        .where(eq(store.id, storeId))
        .limit(1);

      if (storeData.length === 0) {
        return createErrorResponse("Store not found", 404);
      }

      if (storeData[0].ownerId !== user.id) {
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

      const availableBalance = totalEarnings - serviceFees - paidAmount;

      if (amount > availableBalance) {
        return createErrorResponse(
          `Insufficient balance. Available: ${availableBalance.toFixed(2)}`,
          400
        );
      }

      const newPayout = await db
        .insert(payout)
        .values({
          id: generateId(),
          storeId,
          amount: amount.toFixed(2),
          status: "pending",
          bankName,
          accountNumber,
          accountHolderName,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return createSuccessResponse(
        {
          payout: newPayout[0],
        },
        201
      );
    } catch (error) {
      console.error("Error creating payout:", error);
      return createErrorResponse("Failed to create payout", 500);
    }
  });
}
