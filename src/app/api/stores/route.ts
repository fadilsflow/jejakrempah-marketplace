import { NextRequest } from "next/server";
import { db } from "@/db";
import { store } from "@/db/schema";
import {
  createStoreSchema,
  paginationSchema,
} from "@/lib/validations/marketplace";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-middleware";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const offset = (page - 1) * limit;

    const stores = await db
      .select()
      .from(store)
      .orderBy(desc(store.createdAt))
      .limit(limit)
      .offset(offset);

    const total = await db.select({ count: store.id }).from(store);

    return successResponse({
      stores,
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
    const validatedData = createStoreSchema.parse(body);

    // Check if store slug already exists
    const existingStore = await db
      .select()
      .from(store)
      .where(eq(store.slug, validatedData.slug))
      .limit(1);

    if (existingStore.length > 0) {
      return errorResponse("Store slug already exists", 409);
    }

    const newStore = await db
      .insert(store)
      .values({
        id: crypto.randomUUID(),
        ownerId: user.id,
        ...validatedData,
      })
      .returning();

    return successResponse(newStore[0], "Store created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
