"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginInputSchema, type LoginInput } from "shared";
import { Button, Field, Form, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginInputSchema) });

  const onSubmit = (values: LoginInput) => {
    // TODO: replace with a real auth call once the backend exposes one.
    console.log("[mock] log in", values);
    router.push("/");
  };

  return (
    <div className="flex-1 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Sign in
      </h1>

      <Form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <Input type="password" {...register("password")} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          Sign in
        </Button>
      </Form>

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
