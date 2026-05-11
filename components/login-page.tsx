"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, Shield, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, verify2FA, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      setIsRedirecting(true);
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      // Check if 2FA is required (result is an object with requires2FA)
      if (result && typeof result === "object" && result.requires2FA) {
        setRequires2FA(true);
        setTempToken(result.tempToken);
        setIsLoading(false);
        return;
      }

      // Regular boolean result
      if (result !== true) {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred during login");
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await verify2FA(tempToken, otpCode);
      if (!success) {
        setError("Invalid verification code");
        setIsLoading(false);
      }
      // If success, isAuthenticated will change and useEffect will handle redirect
    } catch (err) {
      setError("An error occurred during verification");
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setOtpCode("");
    setTempToken("");
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  if (isRedirecting) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-heading mb-2">
            Library Management
          </h1>
          <p className="text-muted-foreground">Staff Portal</p>
          <p className="text-xs text-red-500 mt-2">
            ⚠️ Staff Only - Students use RFID Kiosk
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-border">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-heading">
              {requires2FA ? "Two-Factor Authentication" : "Admin Login"}
            </CardTitle>
            <CardDescription>
              {requires2FA
                ? "Enter the 6-digit code from your authenticator app"
                : "Enter your email and password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!requires2FA ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="admin@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handle2FASubmit} className="space-y-4">
                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* 2FA Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, ""))
                    }
                    disabled={isLoading}
                    required
                    className="text-center text-2xl tracking-widest"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Open your authenticator app to view your code
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>

                {/* Back Button */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </form>
            )}

            {/* Student Link - Only show on initial login screen */}
            {!requires2FA && (
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Are you a student?{" "}
                  <a href="/kiosk" className="text-primary hover:underline">
                    Use RFID Kiosk →
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}