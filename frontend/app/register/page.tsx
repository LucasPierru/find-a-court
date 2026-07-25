"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerInputSchema, type RegisterInput } from "shared";
import { Button, Field, Form, Input } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerInputSchema) });

  const onSubmit = (values: RegisterInput) => {
    // TODO: replace with a real registration call once the backend exposes one.
    console.log("[mock] register", values);
    router.push("/");
  };

  return (
    <div className="flex-1 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Create an account
      </h1>

      <Form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <Field label="Name" error={errors.name?.message}>
          <Input type="text" {...register("name")} />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <Input type="password" {...register("password")} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          Register
        </Button>
      </Form>

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
