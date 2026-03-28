"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 as Spinner } from "lucide-react";

export function VerificationBanner() {
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      const res = await fetch("/api/auth/verify-email", { method: "POST" });
      if (res.ok) {
        setVerificationSent(true);
      }
    } catch {
      // silently fail
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Verify your email</p>
          <p className="text-[13px] text-amber-600 font-medium">Please verify your email address to unlock all features.</p>
        </div>
      </div>
      {verificationSent ? (
        <span className="text-[13px] text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">Verification email sent!</span>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800 font-semibold shadow-sm"
          onClick={handleSendVerification}
          disabled={sendingVerification}
        >
          {sendingVerification && <Spinner className="w-3 h-3 animate-spin mr-2" />}
          Send verification email
        </Button>
      )}
    </div>
  );
}
