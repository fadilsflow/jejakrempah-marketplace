import { NextRequest } from "next/server";
import { db } from "@/db";
import { cartItem, cart, product } from "@/db/schema";
import { updateCartItemSchema } from "@/lib/validations/marketplace";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
} from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-middleware";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const body = await request.json();
    const validatedData = updateCartItemSchema.parse(body);

    // Get cart item and verify ownership
    const itemData = await db
      .select({
        cartItem: cartItem,
        product: product,
      })
      .from(cartItem)
      .innerJoin(cart, eq(cartItem.cartId, cart.id))
      .innerJoin(product, eq(cartItem.productId, product.id))
      .where(and(eq(cartItem.id, params.id), eq(cart.userId, user.id)))
      .limit(1);

    if (itemData.length === 0) {
      return notFoundResponse();
    }

    // Check stock availability
    if (validatedData.quantity > itemData[0].product.stock) {
      return successResponse(null, "Insufficient stock");
    }

    const updatedItem = await db
      .update(cartItem)
      .set({ quantity: validatedData.quantity })
      .where(eq(cartItem.id, params.id))
      .returning();

    return successResponse(updatedItem[0], "Cart item updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Get cart item and verify ownership
    const itemData = await db
      .select()
      .from(cartItem)
      .innerJoin(cart, eq(cartItem.cartId, cart.id))
      .where(and(eq(cartItem.id, params.id), eq(cart.userId, user.id)))
      .limit(1);

    if (itemData.length === 0) {
      return notFoundResponse();
    }

    await db.delete(cartItem).where(eq(cartItem.id, params.id));

    return successResponse(null, "Cart item removed successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
