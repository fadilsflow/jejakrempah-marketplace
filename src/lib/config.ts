/**
 * Application configuration constants
 * Centralized place for configurable values
 */

import { getServiceFeePercentage } from "./system-settings";

/**
 * Service fee configuration
 * Percentage of order total that sellers pay as service fee
 * Default: 5% (sellers receive 95% of order total)
 * This value is now stored in the database and can be changed by admin
 */
export const SERVICE_FEE_PERCENTAGE = 5; // Fallback value

/**
 * Calculate service fee amount from order total
 * @param orderTotal - The total order amount
 * @param percentage - Optional custom percentage, defaults to database value
 * @returns The service fee amount
 */
export async function calculateServiceFee(orderTotal: number, percentage?: number): Promise<number> {
  const feePercentage = percentage ?? await getServiceFeePercentage();
  return (orderTotal * feePercentage) / 100;
}

/**
 * Calculate seller earnings after service fee deduction
 * @param orderTotal - The total order amount
 * @param percentage - Optional custom percentage, defaults to database value
 * @returns The amount seller will receive
 */
export async function calculateSellerEarnings(orderTotal: number, percentage?: number): Promise<number> {
  const serviceFee = await calculateServiceFee(orderTotal, percentage);
  return orderTotal - serviceFee;
}

/**
 * Synchronous version for client-side calculations (uses fallback percentage)
 * @param orderTotal - The total order amount
 * @returns The service fee amount
 */
export function calculateServiceFeeSync(orderTotal: number): number {
  return (orderTotal * SERVICE_FEE_PERCENTAGE) / 100;
}

/**
 * Synchronous version for client-side calculations (uses fallback percentage)
 * @param orderTotal - The total order amount
 * @returns The amount seller will receive
 */
export function calculateSellerEarningsSync(orderTotal: number): number {
  return orderTotal - calculateServiceFeeSync(orderTotal);
}
