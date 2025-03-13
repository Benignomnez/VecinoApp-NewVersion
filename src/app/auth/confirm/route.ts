import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Creating a handler for the GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Default redirect to homepage
  const redirectTo = new URL("/", request.url);

  if (token_hash && type) {
    try {
      // Verify the OTP (One-Time Password) token
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });

      if (!error) {
        // If verification is successful, redirect to home page with successful confirmation flag
        redirectTo.searchParams.set("emailConfirmed", "true");
        console.log(
          "Email confirmation successful, redirecting to:",
          redirectTo.toString()
        );
        return NextResponse.redirect(redirectTo);
      } else {
        console.error("Error verifying email:", error);
      }
    } catch (err) {
      console.error("Unexpected error in confirmation handler:", err);
    }
  }

  // In case of errors, redirect to error page
  return NextResponse.redirect(
    new URL("/auth?error=confirmationFailed", request.url)
  );
}
