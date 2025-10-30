import { getSystemSetting } from "@/lib/system-settings";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-utils";

/**
 * GET /api/shipping-cost - Get shipping cost amount
 */
export async function GET() {
  try {
    const shippingCostValue = await getSystemSetting("shipping_cost");

    // If no value found, return default
    const amount = shippingCostValue ? parseFloat(shippingCostValue) : 10000;

    return createSuccessResponse({
      shippingCost: amount,
    });
  } catch (error) {
    console.error("Error fetching shipping cost:", error);
    return createErrorResponse("Failed to fetch shipping cost", 500);
  }
}
