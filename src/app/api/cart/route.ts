import { NextRequest } from "next/server";
import { db } from "@/db";
import { cart, cartItem, product, store } from "@/db/schema";
import { addToCartSchema } from "@/lib/validations/marketplace";
import { successResponse, handleApiError } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-middleware";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Get or create cart for user
    let userCart = await db
      .select()
      .from(cart)
      .where(eq(cart.userId, user.id))
      .limit(1);

    if (userCart.length === 0) {
      userCart = await db
        .insert(cart)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
        })
        .returning();
    }

    // Get cart items with product details
    const cartItems = await db
      .select({
        id: cartItem.id,
        quantity: cartItem.quantity,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image,
          stock: product.stock,
        },
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
        },
      })
      .from(cartItem)
      .innerJoin(product, eq(cartItem.productId, product.id))
      .innerJoin(store, eq(product.storeId, store.id))
      .where(eq(cartItem.cartId, userCart[0].id));

    return successResponse({
      cart: userCart[0],
      items: cartItems,
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
    const validatedData = addToCartSchema.parse(body);

    // Get or create cart for user
    let userCart = await db
      .select()
      .from(cart)
      .where(eq(cart.userId, user.id))
      .limit(1);

    if (userCart.length === 0) {
      userCart = await db
        .insert(cart)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
        })
        .returning();
    }

    // Check if product exists and has enough stock
    const productData = await db
      .select()
      .from(product)
      .where(eq(product.id, validatedData.productId))
      .limit(1);

    if (productData.length === 0) {
      return successResponse(null, "Product not found");
    }

    if (productData[0].stock < validatedData.quantity) {
      return successResponse(null, "Insufficient stock");
    }

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItem)
      .where(
        and(
          eq(cartItem.cartId, userCart[0].id),
          eq(cartItem.productId, validatedData.productId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      // Update quantity
      const newQuantity = existingItem[0].quantity + validatedData.quantity;
      if (newQuantity > productData[0].stock) {
        return successResponse(
          null,
          "Insufficient stock for requested quantity"
        );
      }

      const updatedItem = await db
        .update(cartItem)
        .set({ quantity: newQuantity })
        .where(eq(cartItem.id, existingItem[0].id))
        .returning();

      return successResponse(updatedItem[0], "Cart item updated successfully");
    } else {
      // Add new item
      const newItem = await db
        .insert(cartItem)
        .values({
          id: crypto.randomUUID(),
          cartId: userCart[0].id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
        })
        .returning();

      return successResponse(newItem[0], "Item added to cart successfully");
    }
  } catch (error) {
    return handleApiError(error);
  }
}
