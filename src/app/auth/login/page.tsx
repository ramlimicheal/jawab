"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  receiveUpdates: z.boolean().default(true),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      receiveUpdates: true,
    },
  });

  const receiveUpdates = watch("receiveUpdates");

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="h-screen max-h-screen w-full bg-white flex flex-col md:flex-row antialiased font-sans overflow-hidden">
      {/* Left Side */}
      <div className="hidden md:flex md:w-[40%] xl:w-[35%] p-8 lg:p-12 border-r border-gray-100 flex-col relative overflow-hidden bg-[#FAFAFA] h-full justify-between">
        {/* Faint 'J' Watermark Background */}
        <div className="absolute -top-32 -left-32 text-emerald-900/5 font-bold select-none pointer-events-none" style={{ fontSize: '400px', lineHeight: 1 }}>
          J
        </div>

        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition z-10 text-gray-600 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="relative z-10 w-full mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              J
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Jawab</span>
          </div>
          <p className="text-gray-600 text-[13px] xl:text-[14px] leading-relaxed mb-4 font-medium">
            Jawab is your complete AI platform designed to simplify customer engagement and capture leads. It supports growing businesses from initial inquiry to final booking.
          </p>
          <p className="text-gray-600 text-[13px] xl:text-[14px] leading-relaxed font-medium">
            With Jawab, you can lead more efficiently.
          </p>

          <div className="flex gap-8 mt-16 text-xs text-gray-400 font-semibold tracking-wide">
            <Link href="#" className="hover:text-gray-700 transition-colors">About</Link>
            <Link href="#" className="hover:text-gray-700 transition-colors">FAQ</Link>
            <Link href="#" className="hover:text-gray-700 transition-colors">Support</Link>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-[60%] xl:w-[65%] p-6 md:p-10 lg:p-12 flex flex-col justify-center bg-white h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-[400px] xl:max-w-[420px] w-full mx-auto flex flex-col justify-center min-h-0 h-full">
          {/* Mobile Back Button (Rendered only on small screens) */}
          <Link href="/" className="md:hidden w-10 h-10 mb-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition z-10 text-gray-600 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="shrink-0 mb-6">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Register or login</h1>
            <p className="text-[13px] xl:text-[14px] text-gray-500 font-medium leading-relaxed pr-6">
              To keep things easy, just log in with your work email or hit that button to continue!
            </p>
          </div>

          <div className="shrink-0 flex-1 flex flex-col justify-center space-y-5">
            {/* OAuth Buttons */}
            <div className="space-y-3 shrink-0">
              <Button
                type="button"
                className="w-full justify-center h-10 xl:h-11 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[13px] xl:text-[14px] font-bold transition-all shadow-sm rounded-xl"
                onClick={async () => {
                  setLoading(true);
                  const demoEmail = `demo_${Date.now()}@jawab.ai`;
                  const demoPass = "demo123456";
                  
                  // Silent auto-register to populate DB instantly
                  await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: "Demo Guest", email: demoEmail, password: demoPass }),
                  });
                  
                  const result = await signIn("credentials", {
                    email: demoEmail,
                    password: demoPass,
                    redirect: false,
                  });
                  
                  if (!result?.error) {
                    router.push("/dashboard");
                  } else {
                    setError("Failed to generate demo session.");
                    setLoading(false);
                  }
                }}
              >
                🚀 Instant Demo Login
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center h-10 xl:h-11 text-[13px] xl:text-[14px] font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 transition-all rounded-xl"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </Button>
              <Button
                type="button"
                className="w-full justify-center h-10 xl:h-11 bg-black hover:bg-gray-900 text-white text-[13px] xl:text-[14px] font-semibold transition-all shadow-md rounded-xl"
                onClick={() => alert("Apple sign-in coming soon!")}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-1.15 2.14-.39 3.86.38 4.74 2.18-4.04 2.4-3.35 7.55.93 9.29-1.04 2.67-2.92 5.02-4.25 5.85zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Sign in with Apple
              </Button>
            </div>

            <div className="relative shrink-0">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-[10px] xl:text-[11px] font-bold uppercase tracking-widest text-gray-400">
                <span className="px-3 bg-white">OR</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 shrink-0">
              {error && (
                <div className="bg-red-50 text-red-600 text-[12px] xl:text-[13px] p-2 xl:p-3 rounded-xl border border-red-100 font-medium text-center">
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5 xl:space-y-2">
                <Label htmlFor="email" className="text-[12px] xl:text-[13px] font-bold text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  className={`h-10 xl:h-11 text-[13px] xl:text-[14px] bg-gray-50/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl px-4 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-[11px] xl:text-[12px] text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5 xl:space-y-2 relative">
                <Label htmlFor="password" className="text-[12px] xl:text-[13px] font-bold text-gray-900">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-10 xl:h-11 text-[13px] xl:text-[14px] bg-gray-50/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl px-4 pr-10 tracking-${showPassword ? 'normal' : 'widest'} ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] xl:text-[12px] text-red-500 font-medium">{errors.password.message}</p>
                )}
                <div className="flex justify-end pt-1">
                  <Link href="/auth/forgot-password" className="text-[11px] xl:text-[12px] font-semibold text-emerald-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Custom Toggle Switch for updates */}
              <div className="flex items-start justify-between py-3 xl:py-4 border-t border-b border-gray-50 my-2 xl:my-4">
                <div className="pr-4">
                  <Label htmlFor="updates" className="text-[12px] xl:text-[13px] font-bold text-gray-900 cursor-pointer mb-0.5 block">
                    Receive feature updates and AI tips
                  </Label>
                  <p className="text-[11px] xl:text-[12px] text-gray-500 font-medium leading-relaxed">
                    Get occasional insights, new feature releases, and smart AI strategies.
                  </p>
                </div>
                <button
                  type="button"
                  id="updates"
                  onClick={() => setValue("receiveUpdates", !receiveUpdates, { shouldDirty: true })}
                  className={`relative inline-flex h-5 w-9 xl:h-6 xl:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-1 ${
                    receiveUpdates ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={receiveUpdates}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 xl:h-5 xl:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      receiveUpdates ? 'translate-x-4 xl:translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 xl:h-11 bg-[#42a878] hover:bg-[#348a60] text-white font-semibold text-[13px] xl:text-[14px] rounded-xl shadow-[0_4px_14px_0_rgba(66,168,120,0.39)] transition-all hover:-translate-y-0.5" 
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
          </div>

          <div className="mt-4 xl:mt-6 text-center shrink-0">
            <span className="text-[12px] xl:text-[13px] text-gray-500 font-medium">Not signed up yet? </span>
            <Link href="/auth/register" className="text-[12px] xl:text-[13px] font-bold text-emerald-600 hover:underline">
              Register Now
            </Link>
          </div>

          <div className="mt-8 text-center text-[10px] xl:text-[11px] text-gray-400 font-medium tracking-wide shrink-0">
            Jawab - Designed for Gulf Enterprises - All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
