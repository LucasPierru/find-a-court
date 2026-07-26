"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { requestOtpSchema, verifyOtpSchema } from "shared";
import { Button, Field, Form, Input } from "@/components/ui";
import { useOtpAuth } from "@/hooks/useOtpAuth";

const registerStartSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: requestOtpSchema.shape.email,
});
type RegisterStartValues = z.infer<typeof registerStartSchema>;

const codeOnlySchema = verifyOtpSchema.pick({ code: true });
type CodeOnlyValues = z.infer<typeof codeOnlySchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const { step, email, error, isSubmitting, requestCode, verifyCode, backToEmail } = useOtpAuth();

  const startForm = useForm<RegisterStartValues>({ resolver: zodResolver(registerStartSchema) });
  const codeForm = useForm<CodeOnlyValues>({ resolver: zodResolver(codeOnlySchema) });

  const onStart = startForm.handleSubmit(async (values) => {
    setName(values.name);
    await requestCode(values.email);
  });

  const onVerifyCode = codeForm.handleSubmit(async (values) => {
    const success = await verifyCode(values.code, name);
    if (success) router.push("/");
  });

  return (
    <div className="flex-1 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Create an account
      </h1>

      {step === "email" ? (
        <Form onSubmit={onStart} className="mt-8">
          <Field label="Name" error={startForm.formState.errors.name?.message}>
            <Input type="text" {...startForm.register("name")} />
          </Field>

          <Field label="Email" error={startForm.formState.errors.email?.message}>
            <Input type="email" {...startForm.register("email")} />
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-black underline underline-offset-2 dark:text-zinc-50"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
