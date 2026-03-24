"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Invalid reset link. Please request a new password reset.</p>
            <Link href="/auth/forgot-password">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Request new reset link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-2xl">Set new password</CardTitle>
            <CardDescription>
              {success ? "Your password has been reset" : "Enter your new password below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <Link href="/auth/login">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Sign in
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Reset password
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
