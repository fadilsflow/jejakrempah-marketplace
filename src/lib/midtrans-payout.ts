import axios from "axios";

interface MidtransPayoutPayload {
  payoutId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  description?: string;
}

interface MidtransPayoutResponse {
  success: boolean;
  transactionId?: string;
  status?: string;
  message?: string;
}

const MIDTRANS_BASE_URL = process.env.MIDTRANS_BASE_URL || "https://app.sandbox.midtrans.com/iris";
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

export async function createMidtransPayout(
  payload: MidtransPayoutPayload
): Promise<MidtransPayoutResponse> {
  if (!MIDTRANS_SERVER_KEY) {
    console.log(
      "Midtrans server key not configured, using mock response for testing"
    );
    return {
      success: true,
      transactionId: `MOCK_${Date.now()}`,
      status: "completed",
    };
  }

  try {
    const authHeader = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
      "base64"
    );

    const response = await axios.post(
      `${MIDTRANS_BASE_URL}/api/v1/payouts`,
      {
        payouts: [
          {
            beneficiary_name: payload.accountHolderName,
            beneficiary_account: payload.accountNumber,
            beneficiary_bank: payload.bankName,
            beneficiary_email: "", // Optional, bisa dikosongkan
            amount: payload.amount.toString(),
            notes: payload.description || `Payout for ${payload.payoutId}`,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
          Accept: "application/json",
        },
      }
    );

    if (response.data && response.data.payouts && response.data.payouts[0]) {
      const payoutData = response.data.payouts[0];
      return {
        success: payoutData.status !== "rejected",
        transactionId: payoutData.reference_no,
        status: payoutData.status,
        message: payoutData.status === "rejected" ? payoutData.errors : undefined,
      };
    }

    return {
      success: false,
      message: "Invalid response from Midtrans",
    };
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { errors?: string; error_message?: string } };
      message?: string;
    };
    console.error("Midtrans payout error:", err.response?.data || err.message);
    return {
      success: false,
      message: 
        err.response?.data?.errors || 
        err.response?.data?.error_message || 
        err.message || 
        "Payout failed",
    };
  }
}

export async function checkMidtransPayoutStatus(
  referenceNo: string
): Promise<MidtransPayoutResponse> {
  if (!MIDTRANS_SERVER_KEY) {
    throw new Error("Midtrans server key is not configured");
  }

  try {
    const authHeader = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
      "base64"
    );

    const response = await axios.get(
      `${MIDTRANS_BASE_URL}/api/v1/payouts/${referenceNo}`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          Accept: "application/json",
        },
      }
    );

    if (response.data) {
      return {
        success: response.data.status !== "rejected",
        transactionId: response.data.reference_no || referenceNo,
        status: response.data.status,
        message: response.data.status === "rejected" ? response.data.errors : undefined,
      };
    }

    return {
      success: false,
      message: "Invalid response from Midtrans",
    };
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { errors?: string; error_message?: string } };
      message?: string;
    };
    console.error(
      "Midtrans status check error:",
      err.response?.data || err.message
    );
    return {
      success: false,
      message:
        err.response?.data?.errors ||
        err.response?.data?.error_message ||
        err.message ||
        "Status check failed",
    };
  }
}