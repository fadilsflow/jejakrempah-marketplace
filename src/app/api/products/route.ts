import { NextRequest } from "next/server";
import { db } from "@/db";
import { product, store } from "@/db/schema";
import {
  createProductSchema,
  paginationSchema,
  searchSchema,
} from "@/lib/validations/marketplace";
import { successResponse, handleApiError } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-middleware";
import { eq, desc, and, like, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const searchParams_ = searchSchema.parse({
      q: searchParams.get("q"),
      category: searchParams.get("category"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      status: searchParams.get("status"),
    });

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (searchParams_.q) {
      whereConditions.push(like(product.name, `%${searchParams_.q}%`));
    }

    if (searchParams_.status) {
      whereConditions.push(eq(product.status, searchParams_.status));
    }

    if (searchParams_.minPrice !== undefined) {
      whereConditions.push(
        gte(product.price, searchParams_.minPrice.toString())
      );
    }

    if (searchParams_.maxPrice !== undefined) {
      whereConditions.push(
        lte(product.price, searchParams_.maxPrice.toString())
      );
    }

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
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
        },
      })
      .from(product)
      .innerJoin(store, eq(product.storeId, store.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(product.createdAt))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: product.id })
      .from(product)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return successResponse({
      products,
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
    const validatedData = createProductSchema.parse(body);

    // Check if user owns a store
    const userStore = await db
      .select()
      .from(store)
      .where(eq(store.ownerId, user.id))
      .limit(1);

    if (userStore.length === 0) {
      return successResponse(null, "You need to create a store first");
    }

    // Check if product slug already exists
    const existingProduct = await db
      .select()
      .from(product)
      .where(eq(product.slug, validatedData.slug))
      .limit(1);

    if (existingProduct.length > 0) {
      return successResponse(null, "Product slug already exists");
    }

    const newProduct = await db
      .insert(product)
      .values({
        id: crypto.randomUUID(),
        storeId: userStore[0].id,
        ...validatedData,
        price: validatedData.price.toString(),
      })
      .returning();

    return successResponse(newProduct[0], "Product created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
