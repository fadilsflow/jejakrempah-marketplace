import { NextRequest } from "next/server";
import { db } from "@/db";
import { store } from "@/db/schema";
import { updateStoreSchema } from "@/lib/validations/marketplace";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
} from "@/lib/api-utils";
import { requireStoreOwner } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeData = await db
      .select()
      .from(store)
      .where(eq(store.id, params.id))
      .limit(1);

    if (storeData.length === 0) {
      return notFoundResponse();
    }

    return successResponse(storeData[0]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireStoreOwner(request, params.id);
    if (authResult instanceof Response) return authResult;

    const body = await request.json();
    const validatedData = updateStoreSchema.parse(body);

    // Check if new slug conflicts with existing stores
    if (validatedData.slug) {
      const existingStore = await db
        .select()
        .from(store)
        .where(eq(store.slug, validatedData.slug))
        .limit(1);

      if (existingStore.length > 0 && existingStore[0].id !== params.id) {
        return successResponse(null, "Store slug already exists");
      }
    }

    const updatedStore = await db
      .update(store)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(store.id, params.id))
      .returning();

    return successResponse(updatedStore[0], "Store updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireStoreOwner(request, params.id);
    if (authResult instanceof Response) return authResult;

    await db.delete(store).where(eq(store.id, params.id));

    return successResponse(null, "Store deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
