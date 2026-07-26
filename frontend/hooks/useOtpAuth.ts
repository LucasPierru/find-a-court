"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { requestOtp, verifyOtp } from "@/lib/auth-api";

type Step = "email" | "code";

export function useOtpAuth() {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestCode(emailValue: string): Promise<void> {
    setError(null);
    setIsSubmitting(true);
    try {
      await requestOtp(emailValue);
      setEmail(emailValue);
      setStep("code");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode(code: string, name?: string): Promise<boolean> {
    setError(null);
    setIsSubmitting(true);
    try {
      const session = await verifyOtp(email, code, name);
      login(session);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  function backToEmail(): void {
    setError(null);
    setStep("email");
  }

  return { step, email, error, isSubmitting, requestCode, verifyCode, backToEmail };
}
