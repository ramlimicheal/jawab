"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              {sent
                ? "Check your email for a reset link"
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600">
                  If an account exists for <strong>{email}</strong>, you will receive a password reset email shortly.
                </p>
                <p className="text-xs text-gray-400">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                >
                  Try another email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send reset link
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-emerald-600 inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
