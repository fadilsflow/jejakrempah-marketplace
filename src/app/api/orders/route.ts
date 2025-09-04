import { NextRequest } from "next/server";
import { db } from "@/db";
import {
  order,
  orderItem,
  product,
  store,
  address,
  cart,
  cartItem,
} from "@/db/schema";
import {
  createOrderSchema,
  paginationSchema,
} from "@/lib/validations/marketplace";
import { successResponse, handleApiError } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-middleware";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const offset = (page - 1) * limit;

    const orders = await db
      .select({
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        address: {
          id: address.id,
          recipientName: address.recipientName,
          street: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
        },
      })
      .from(order)
      .innerJoin(address, eq(order.addressId, address.id))
      .where(eq(order.buyerId, user.id))
      .orderBy(desc(order.createdAt))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: order.id })
      .from(order)
      .where(eq(order.buyerId, user.id));

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        total: total.length,
        totalPages: Math.ceil(total.length / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Verify address ownership
    const userAddress = await db
      .select()
      .from(address)
      .where(
        and(
          eq(address.id, validatedData.addressId),
          eq(address.userId, user.id)
        )
      )
      .limit(1);

    if (userAddress.length === 0) {
      return successResponse(null, "Address not found or access denied");
    }

    // Calculate total and verify stock
    let total = 0;
    const orderItems = [];

    for (const item of validatedData.items) {
      const productData = await db
        .select()
        .from(product)
        .where(eq(product.id, item.productId))
        .limit(1);

      if (productData.length === 0) {
        return successResponse(null, `Product ${item.productId} not found`);
      }

      if (productData[0].stock < item.quantity) {
        return successResponse(
          null,
          `Insufficient stock for ${productData[0].name}`
        );
      }

      const itemTotal = parseFloat(productData[0].price) * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        storeId: productData[0].storeId,
        quantity: item.quantity,
        price: productData[0].price,
      });
    }

    // Create order
    const newOrder = await db
      .insert(order)
      .values({
        id: crypto.randomUUID(),
        buyerId: user.id,
        addressId: validatedData.addressId,
        total: total.toString(),
        status: "pending",
      })
      .returning();

    // Create order items
    const newOrderItems = await db
      .insert(orderItem)
      .values(
        orderItems.map((item) => ({
          id: crypto.randomUUID(),
          orderId: newOrder[0].id,
          ...item,
        }))
      )
      .returning();

    // Update product stock
    for (const item of validatedData.items) {
      const currentProduct = await db
        .select()
        .from(product)
        .where(eq(product.id, item.productId))
        .limit(1);

      if (currentProduct.length > 0) {
        await db
          .update(product)
          .set({
            stock: currentProduct[0].stock - item.quantity,
          })
          .where(eq(product.id, item.productId));
      }
    }

    // Clear user's cart
    const userCart = await db
      .select()
      .from(cart)
      .where(eq(cart.userId, user.id))
      .limit(1);

    if (userCart.length > 0) {
      await db.delete(cartItem).where(eq(cartItem.cartId, userCart[0].id));
    }

    return successResponse(
      {
        order: newOrder[0],
        items: newOrderItems,
      },
      "Order created successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
