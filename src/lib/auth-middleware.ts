import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { unauthorizedResponse } from "./api-utils";
import { db, authSchema } from "@/db";
import { eq } from "drizzle-orm";

export async function requireAuth(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    return { session, user: session.user };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return unauthorizedResponse();
  }
}

export async function requireStoreOwner(request: NextRequest, storeId: string) {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Check if user owns the store
  const store = await db
    .select()
    .from(authSchema.store)
    .where(eq(authSchema.store.id, storeId))
    .limit(1);

  if (!store || store[0]?.ownerId !== user.id) {
    return NextResponse.json(
      { success: false, error: "Store not found or access denied" },
      { status: 404 }
    );
  }

  return { session: authResult.session, user, store: store[0] };
}
