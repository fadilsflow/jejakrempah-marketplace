import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export function successResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

export function errorResponse(
  message: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    const errors = error.issues.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    );
    return errorResponse(`Validation error: ${errors.join(", ")}`, 400);
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }

  return errorResponse("Internal server error", 500);
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse("Unauthorized", 401);
}

export function forbiddenResponse(): NextResponse<ApiResponse> {
  return errorResponse("Forbidden", 403);
}

export function notFoundResponse(): NextResponse<ApiResponse> {
  return errorResponse("Resource not found", 404);
}
