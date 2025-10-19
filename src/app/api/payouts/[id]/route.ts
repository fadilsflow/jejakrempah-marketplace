import { NextRequest } from "next/server";
import { db } from "@/db";
import { payout, store } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  withAuth,
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
} from "@/lib/api-utils";
import { z } from "zod";

const updatePayoutSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed", "rejected"]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    const { id } = await params;

    try {
      const payoutData = await db
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
        .where(eq(payout.id, id))
        .limit(1);

      if (payoutData.length === 0) {
        return createErrorResponse("Payout not found", 404);
      }

      if (
        user.role !== "admin" &&
        payoutData[0].store?.ownerId !== user.id
      ) {
        return createErrorResponse("Unauthorized", 403);
      }

      return createSuccessResponse({ payout: payoutData[0] });
    } catch (error) {
      console.error("Error fetching payout:", error);
      return createErrorResponse("Failed to fetch payout", 500);
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    const { id } = await params;

    if (user.role !== "admin") {
      return createErrorResponse("Unauthorized", 403);
    }

    const validationResult = await validateRequestBody(req, updatePayoutSchema);
    if (validationResult.error) {
      return createErrorResponse(validationResult.error);
    }

    const { status, transactionId, notes } = validationResult.data!;

    try {
      const existingPayout = await db
        .select({ id: payout.id, status: payout.status })
        .from(payout)
        .where(eq(payout.id, id))
        .limit(1);

      if (existingPayout.length === 0) {
        return createErrorResponse("Payout not found", 404);
      }

      const updateData: Record<string, unknown> = {
        status,
        updatedAt: new Date(),
      };

      if (transactionId) {
        updateData.transactionId = transactionId;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (status === "completed" || status === "failed" || status === "rejected") {
        updateData.processedAt = new Date();
      }

      const updatedPayout = await db
        .update(payout)
        .set(updateData)
        .where(eq(payout.id, id))
        .returning();

      return createSuccessResponse({ payout: updatedPayout[0] });
    } catch (error) {
      console.error("Error updating payout:", error);
      return createErrorResponse("Failed to update payout", 500);
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    const { id } = await params;

    try {
      const payoutData = await db
        .select({
          id: payout.id,
          status: payout.status,
          storeId: payout.storeId,
        })
        .from(payout)
        .where(eq(payout.id, id))
        .limit(1);

      if (payoutData.length === 0) {
        return createErrorResponse("Payout not found", 404);
      }

      const storeData = await db
        .select({ ownerId: store.ownerId })
        .from(store)
        .where(eq(store.id, payoutData[0].storeId))
        .limit(1);

      if (
        user.role !== "admin" &&
        storeData[0]?.ownerId !== user.id
      ) {
        return createErrorResponse("Unauthorized", 403);
      }

      if (payoutData[0].status !== "pending") {
        return createErrorResponse(
          "Only pending payouts can be cancelled",
          400
        );
      }

      await db.delete(payout).where(eq(payout.id, id));

      return createSuccessResponse({ message: "Payout cancelled" });
    } catch (error) {
      console.error("Error deleting payout:", error);
      return createErrorResponse("Failed to delete payout", 500);
    }
  });
}
