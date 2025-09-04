import { NextRequest } from "next/server";
import { db } from "@/db";
import { product, store } from "@/db/schema";
import { updateProductSchema } from "@/lib/validations/marketplace";
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
    const productData = await db
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
      .where(eq(product.id, params.id))
      .limit(1);

    if (productData.length === 0) {
      return notFoundResponse();
    }

    return successResponse(productData[0]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First get the product to check store ownership
    const productData = await db
      .select()
      .from(product)
      .where(eq(product.id, params.id))
      .limit(1);

    if (productData.length === 0) {
      return notFoundResponse();
    }

    const authResult = await requireStoreOwner(request, productData[0].storeId);
    if (authResult instanceof Response) return authResult;

    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    // Check if new slug conflicts with existing products
    if (validatedData.slug) {
      const existingProduct = await db
        .select()
        .from(product)
        .where(eq(product.slug, validatedData.slug))
        .limit(1);

      if (existingProduct.length > 0 && existingProduct[0].id !== params.id) {
        return successResponse(null, "Product slug already exists");
      }
    }

    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // Convert price to string if it exists
    if (validatedData.price !== undefined) {
      updateData.price = validatedData.price.toString();
    }

    const updatedProduct = await db
      .update(product)
      .set(updateData)
      .where(eq(product.id, params.id))
      .returning();

    return successResponse(updatedProduct[0], "Product updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First get the product to check store ownership
    const productData = await db
      .select()
      .from(product)
      .where(eq(product.id, params.id))
      .limit(1);

    if (productData.length === 0) {
      return notFoundResponse();
    }

    const authResult = await requireStoreOwner(request, productData[0].storeId);
    if (authResult instanceof Response) return authResult;

    await db.delete(product).where(eq(product.id, params.id));

    return successResponse(null, "Product deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
