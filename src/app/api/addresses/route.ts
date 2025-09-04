import { NextRequest } from "next/server";
import { db } from "@/db";
import { address } from "@/db/schema";
import { createAddressSchema } from "@/lib/validations/marketplace";
import { successResponse, handleApiError } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const addresses = await db
      .select()
      .from(address)
      .where(eq(address.userId, user.id))
      .orderBy(address.isDefault ? "desc" : "asc");

    return successResponse(addresses);
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
    const validatedData = createAddressSchema.parse(body);

    // If this is the first address or marked as default, set it as default
    if (validatedData.isDefault) {
      // Remove default from other addresses
      await db
        .update(address)
        .set({ isDefault: false })
        .where(eq(address.userId, user.id));
    }

    const newAddress = await db
      .insert(address)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        ...validatedData,
      })
      .returning();

    return successResponse(newAddress[0], "Address added successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
