import { NextRequest } from "next/server";
import { db } from "@/db";
import { payment, order } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  withoutAuth,
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
} from "@/lib/api-utils";
import { paymentWebhookSchema } from "@/lib/validations";
import crypto from "crypto";

/**
 * POST /api/payments/webhook - Handle Midtrans payment notifications
 */
export async function POST(request: NextRequest) {
  return withoutAuth(request, async (req) => {
    const validationResult = await validateRequestBody(
      req,
      paymentWebhookSchema
    );
    if (validationResult.error) {
      return createErrorResponse(validationResult.error);
    }

    const {
      order_id,
      transaction_status,
      transaction_id,
      gross_amount,
      signature_key,
    } = validationResult.data!;

    try {
      // Verify signature (in production, use your actual server key)
      const serverKey = process.env.MIDTRANS_SERVER_KEY || "your-server-key";
      const expectedSignature = crypto
        .createHash("sha512")
        .update(`${order_id}${transaction_status}${gross_amount}${serverKey}`)
        .digest("hex");

      if (signature_key !== expectedSignature) {
        console.error("Invalid signature");
        return createErrorResponse("Invalid signature", 401);
      }

      // Find payment record
      const paymentData = await db
        .select({
          id: payment.id,
          orderId: payment.orderId,
          status: payment.status,
        })
        .from(payment)
        .where(eq(payment.transactionId, transaction_id))
        .limit(1);

      if (paymentData.length === 0) {
        return createErrorResponse("Payment not found", 404);
      }

      // Map Midtrans status to our payment status
      let paymentStatus: string;
      let orderStatus: string | null = null;

      switch (transaction_status) {
        case "capture":
        case "settlement":
          paymentStatus = "settlement";
          orderStatus = "paid";
          break;
        case "pending":
          paymentStatus = "pending";
          break;
        case "deny":
          paymentStatus = "deny";
          orderStatus = "cancelled";
          break;
        case "cancel":
        case "expire":
          paymentStatus = transaction_status;
          orderStatus = "cancelled";
          break;
        default:
          paymentStatus = transaction_status;
      }

      // Update payment status
      await db
        .update(payment)
        .set({
          status: paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(payment.id, paymentData[0].id));

      // Update order status if needed
      if (orderStatus) {
        await db
          .update(order)
          .set({
            status: orderStatus,
            updatedAt: new Date(),
          })
          .where(eq(order.id, paymentData[0].orderId));
      }

      console.log(`Payment ${transaction_id} updated to ${paymentStatus}`);

      return createSuccessResponse({
        message: "Webhook processed successfully",
        paymentStatus,
        orderStatus,
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return createErrorResponse("Failed to process webhook", 500);
    }
  });
}
