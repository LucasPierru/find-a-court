"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { requestOtpSchema, verifyOtpSchema, type RequestOtp, type VerifyOtp } from "shared";
import { Button, Field, Form, Input } from "@/components/ui";
import { useOtpAuth } from "@/hooks/useOtpAuth";

type CodeStepValues = Omit<VerifyOtp, "email">;
const codeStepSchema = verifyOtpSchema.omit({ email: true });

export default function LoginPage() {
  const router = useRouter();
  const { step, email, error, isSubmitting, requestCode, verifyCode, backToEmail } = useOtpAuth();

  const emailForm = useForm<RequestOtp>({ resolver: zodResolver(requestOtpSchema) });
  const codeForm = useForm<CodeStepValues>({ resolver: zodResolver(codeStepSchema) });

  const onRequestCode = emailForm.handleSubmit(async (values) => {
    await requestCode(values.email);
  });

  const onVerifyCode = codeForm.handleSubmit(async (values) => {
    const success = await verifyCode(values.code, values.name || undefined);
    if (success) router.push("/");
  });

  return (
    <div className="flex-1 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Sign in
      </h1>

      {step === "email" ? (
        <Form onSubmit={onRequestCode} className="mt-8">
          <Field label="Email" error={emailForm.formState.errors.email?.message}>
            <Input type="email" {...emailForm.register("email")} />
          </Field>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            Send code
          </Button>
        </Form>
      ) : (
        <Form onSubmit={onVerifyCode} className="mt-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-black dark:text-zinc-50">{email}</span>.
          </p>

          <Field label="Code" error={codeForm.formState.errors.code?.message}>
            <Input type="text" inputMode="numeric" maxLength={6} {...codeForm.register("code")} />
          </Field>

          <Field
            label="Name"
            hint="Only needed the first time - leave blank if you already have an account."
            error={codeForm.formState.errors.name?.message}
          >
            <Input type="text" {...codeForm.register("name")} />
          </Field>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            Verify
          </Button>

          <button
            type="button"
            onClick={backToEmail}
            className="self-start text-sm text-zinc-600 underline underline-offset-2 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Use a different email
          </button>
        </Form>
      )}

      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-black underline underline-offset-2 dark:text-zinc-50"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
