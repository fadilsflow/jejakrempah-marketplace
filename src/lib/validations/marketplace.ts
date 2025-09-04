import { z } from "zod";

// Store validations
export const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100),
  slug: z
    .string()
    .min(1, "Store slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  logo: z.string().url().optional(),
});

export const updateStoreSchema = createStoreSchema.partial();

// Product validations
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z
    .string()
    .min(1, "Product slug is required")
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  price: z
    .number()
    .positive("Price must be positive")
    .max(999999.99, "Price too high"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  image: z.string().url().optional(),
  status: z.enum(["draft", "published", "inactive"]).default("draft"),
});

export const updateProductSchema = createProductSchema.partial();

// Address validations
export const createAddressSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required").max(100),
  phone: z.string().optional(),
  street: z.string().min(1, "Street address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  province: z.string().min(1, "Province is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(10),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

// Cart validations
export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

// Order validations
export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address ID is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
});

// Payment validations
export const createPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentType: z.string().min(1, "Payment type is required"),
});

// Query validations
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  status: z.string().optional(),
});

// Response schemas
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    error: z.string().optional(),
  });
