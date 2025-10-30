import type { NextRequest } from "next/server"
import { db } from "@/db"
import { product, store, orderItem } from "@/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import {
  withAuth,
  createErrorResponse,
  createSuccessResponse,
  calculateOffset,
  createPaginationMeta,
} from "@/lib/api-utils"

/**
 * GET /api/products/me - Get current user's store products
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const { searchParams } = new URL(req.url)

    // Get pagination params with defaults
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    try {
      // Get user's store
      const userStore = await db.select({ id: store.id }).from(store).where(eq(store.ownerId, user.id)).limit(1)

      if (userStore.length === 0) {
        return createErrorResponse("Store not found", 404)
      }

      // Get total count
      const totalResult = await db
        .select({ count: product.id })
        .from(product)
        .where(eq(product.storeId, userStore[0].id))
      const total = totalResult.length

      // Get products with pagination and sales count
      const products = await db
        .select({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          stock: product.stock,
          image: product.image,
          status: product.status,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          salesCount: sql<number>`COALESCE(SUM(${orderItem.quantity}), 0)`,
        })
        .from(product)
        .leftJoin(orderItem, eq(product.id, orderItem.productId))
        .where(eq(product.storeId, userStore[0].id))
        .groupBy(product.id)
        .orderBy(desc(product.createdAt))
        .limit(limit)
        .offset(calculateOffset(page, limit))

      const pagination = createPaginationMeta(total, page, limit)

      return createSuccessResponse({
        products,
        pagination,
        store: userStore[0],
      })
    } catch (error) {
      console.error("Error fetching user products:", error)
      return createErrorResponse("Failed to fetch products", 500)
    }
  })
}
