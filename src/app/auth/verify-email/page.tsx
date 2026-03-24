"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { update } = useSession();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          // Refresh session so dashboard banner disappears
          await update();
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    verify();
  }, [token, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-600 shadow-lg shadow-green-500/30 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
            J
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900">Jawab</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>
              {status === "loading" && "Verifying your email..."}
              {status === "success" && "Your email has been verified"}
              {status === "error" && "Verification failed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "loading" && (
              <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
            )}

            {status === "success" && (
              <>
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600">{message}</p>
                <Link href="/dashboard">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-sm text-gray-600">{message}</p>
                <Link href="/auth/login">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Back to Sign In
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
