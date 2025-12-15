"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailAlertPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Please Verify Your Email</h1>
        <p className="text-muted-foreground">
          We have sent a verification link to your email address. Please check
          your inbox (and spam folder) and click the link to activate your
          account.
        </p>

        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
