import { NextRequest } from "next/server";
import { db } from "@/db";
import { payout } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  withAuth,
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
} from "@/lib/api-utils";
import { z } from "zod";
import { createMidtransPayout } from "@/lib/midtrans-payout";

const processPayoutSchema = z.object({
  payoutId: z.string().min(1, "Payout ID is required"),
});

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    if (user.role !== "admin") {
      return createErrorResponse("Unauthorized", 403);
    }

    const validationResult = await validateRequestBody(
      req,
      processPayoutSchema
    );
    if (validationResult.error) {
      return createErrorResponse(validationResult.error);
    }

    const { payoutId } = validationResult.data!;

    try {
      const payoutData = await db
        .select()
        .from(payout)
        .where(eq(payout.id, payoutId))
        .limit(1);

      if (payoutData.length === 0) {
        return createErrorResponse("Payout not found", 404);
      }

      const payoutRecord = payoutData[0];

      console.log("Payout status check:", {
        payoutId,
        currentStatus: payoutRecord.status,
        expectedStatus: "pending",
      });

      // Allow retry for failed payouts
      if (
        payoutRecord.status !== "pending" &&
        payoutRecord.status !== "failed"
      ) {
        return createErrorResponse(
          `Payout is already ${payoutRecord.status}`,
          400
        );
      }

      await db
        .update(payout)
        .set({
          status: "processing",
          updatedAt: new Date(),
        })
        .where(eq(payout.id, payoutId));

      const midtransResult = await createMidtransPayout({
        payoutId: payoutRecord.id,
        amount: parseFloat(payoutRecord.amount),
        bankName: payoutRecord.bankName,
        accountNumber: payoutRecord.accountNumber,
        accountHolderName: payoutRecord.accountHolderName,
        description: payoutRecord.notes || undefined,
      });

      console.log("Midtrans payout result:", midtransResult);

      if (midtransResult.success) {
        const updatedPayout = await db
          .update(payout)
          .set({
            status: "completed",
            transactionId: midtransResult.transactionId,
            processedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(payout.id, payoutId))
          .returning();

        return createSuccessResponse({
          payout: updatedPayout[0],
          message: "Payout processed successfully",
        });
      } else {
        await db
          .update(payout)
          .set({
            status: "failed",
            notes: midtransResult.message || "Payout failed",
            updatedAt: new Date(),
          })
          .where(eq(payout.id, payoutId));

        return createErrorResponse(
          midtransResult.message || "Failed to process payout",
          400
        );
      }
    } catch (error) {
      console.error("Error processing payout:", error);

      await db
        .update(payout)
        .set({
          status: "failed",
          notes: "Internal error during processing",
          updatedAt: new Date(),
        })
        .where(eq(payout.id, payoutId));

      return createErrorResponse("Failed to process payout", 500);
    }
  });
}
