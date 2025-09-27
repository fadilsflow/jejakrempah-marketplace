import { NextRequest } from "next/server";
import { db } from "@/db";
import { payment, order } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  withAuth,
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
  generateId,
} from "@/lib/api-utils";
import { createPaymentSchema } from "@/lib/validations";

/**
 * POST /api/payments - Create a payment for an order
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const validationResult = await validateRequestBody(
      req,
      createPaymentSchema
    );
    if (validationResult.error) {
      return createErrorResponse(validationResult.error);
    }

    const { orderId, paymentType } = validationResult.data!;

    try {
      // Verify order exists and belongs to user
      const orderData = await db
        .select({
          id: order.id,
          buyerId: order.buyerId,
          status: order.status,
          total: order.total,
        })
        .from(order)
        .where(and(eq(order.id, orderId), eq(order.buyerId, user.id)))
        .limit(1);

      if (orderData.length === 0) {
        return createErrorResponse("Order not found", 404);
      }

      if (orderData[0].status !== "pending") {
        return createErrorResponse("Order is not pending payment", 400);
      }

      // Check if payment already exists
      const existingPayment = await db
        .select({ id: payment.id })
        .from(payment)
        .where(eq(payment.orderId, orderId))
        .limit(1);

      if (existingPayment.length > 0) {
        return createErrorResponse(
          "Payment already exists for this order",
          400
        );
      }

      // Call Midtrans Snap API
      const snapResponse = await fetch(
        "https://app.sandbox.midtrans.com/snap/v1/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              process.env.MIDTRANS_SERVER_KEY + ":"
            ).toString("base64")}`,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: orderId,
              gross_amount: orderData[0].total,
            },
            customer_details: {
              first_name: user.name,
              email: user.email,
            },
          }),
        }
      );

      const snapData = await snapResponse.json();

      if (!snapResponse.ok) {
        console.error("Midtrans error:", snapData);
        return createErrorResponse(
          "Failed to create midtrans transaction",
          500
        );
      }

      // Create payment record
      const newPayment = await db
        .insert(payment)
        .values({
          id: generateId(),
          orderId,
          transactionId: snapData.token, 
          status: "pending",
          grossAmount: orderData[0].total,
          paymentType,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return createSuccessResponse(
        {
          payment: newPayment[0],
          redirect_url: snapData.redirect_url, // used in frontend
          token: snapData.token, 
        },
        201
      );
    } catch (error) {
      console.error("Error creating payment:", error);
      return createErrorResponse("Failed to create payment", 500);
    }
  });
}

/**
 * GET /api/payments - Get user's payments
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const payments = await db
        .select({
          id: payment.id,
          transactionId: payment.transactionId,
          status: payment.status,
          grossAmount: payment.grossAmount,
          paymentType: payment.paymentType,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          order: {
            id: order.id,
            status: order.status,
            total: order.total,
          },
        })
        .from(payment)
        .leftJoin(order, eq(payment.orderId, order.id))
        .where(eq(order.buyerId, user.id))
        .orderBy(payment.createdAt);

      return createSuccessResponse({ payments });
    } catch (error) {
      console.error("Error fetching payments:", error);
      return createErrorResponse("Failed to fetch payments", 500);
    }
  });
}
