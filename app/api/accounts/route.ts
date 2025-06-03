import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import axios from "axios";

// Handler for GET /api/accounts
// Fetches all accounts or details for a specific account if 'accountId' query param is present
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiUrl = process.env.BACKEND_URL;
    if (!apiUrl) {
      console.error("BACKEND_URL environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const accountId = request.nextUrl.searchParams.get("accountId");

    if (accountId) {
      // Fetch specific account details
      console.log(`Fetching details for accountId: ${accountId}`);
      const response = await axios.get(
        `${apiUrl}/api/account/${accountId}/details`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      return NextResponse.json(response.data);
    } else {
      // Fetch all accounts (original logic)
      console.log("Fetching all accounts");
      const response = await axios.get(`${apiUrl}/api/accounts`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      return NextResponse.json(response.data);
    }
  } catch (error: any) {
    console.error("Error in /api/accounts GET:", error);
    const status = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Error processing request";
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
