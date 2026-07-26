"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requestOtpSchema, verifyOtpSchema, type RequestOtp } from "shared";
import {
  Button,
  Field,
  Input,
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  OtpInput,
} from "@/components/ui";
import { useOtpAuth } from "@/hooks/useOtpAuth";

const registerStartSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: requestOtpSchema.shape.email,
});
type RegisterStartValues = z.infer<typeof registerStartSchema>;

const codeOnlySchema = verifyOtpSchema.pick({ code: true });
type CodeOnlyValues = z.infer<typeof codeOnlySchema>;

type Mode = "sign-in" | "register";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState<string | undefined>(undefined);
  const { step, email, error, isSubmitting, requestCode, verifyCode, backToEmail } = useOtpAuth();

  const signInForm = useForm<RequestOtp>({ resolver: zodResolver(requestOtpSchema) });
  const registerForm = useForm<RegisterStartValues>({ resolver: zodResolver(registerStartSchema) });
  const codeForm = useForm<CodeOnlyValues>({ resolver: zodResolver(codeOnlySchema) });

  useEffect(() => {
    if (open) return;
    /* eslint-disable react-hooks/set-state-in-effect -- reacting to the
       `open` prop transitioning to false, not deriving render state from it */
    backToEmail();
    setMode("sign-in");
    setName(undefined);
    signInForm.reset();
    registerForm.reset();
    codeForm.reset();
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- backToEmail/signInForm/registerForm/codeForm are recreated every render; only `open`'s transition should trigger this
  }, [open]);

  function toggleMode(): void {
    setMode((current) => (current === "sign-in" ? "register" : "sign-in"));
  }

  const onSignIn = signInForm.handleSubmit(async (values) => {
    setName(undefined);
    await requestCode(values.email);
  });

  const onRegisterStart = registerForm.handleSubmit(async (values) => {
    setName(values.name);
    await requestCode(values.email);
  });

  const onVerifyCode = codeForm.handleSubmit(async (values) => {
    await verifyCode(values.code, name);
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>
          {step === "email" ? (mode === "sign-in" ? "Sign in" : "Create an account") : "Enter your code"}
        </ModalTitle>
        <ModalDescription>
          {step === "email"
            ? "We'll email you a one-time code — no password needed."
            : `We sent a 6-digit code to ${email}.`}
        </ModalDescription>
      </ModalHeader>

      {step === "email" && mode === "sign-in" && (
        <form onSubmit={onSignIn}>
          <ModalBody className="flex flex-col gap-5">
            <Field label="Email" error={signInForm.formState.errors.email?.message}>
              <Input type="email" autoFocus {...signInForm.register("email")} />
            </Field>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="button"
              onClick={toggleMode}
              className="self-end text-sm text-zinc-600 underline underline-offset-2 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              New here? Create an account
            </button>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" loading={isSubmitting}>
              Send code
            </Button>
          </ModalFooter>
        </form>
      )}

      {step === "email" && mode === "register" && (
        <form onSubmit={onRegisterStart}>
          <ModalBody className="flex flex-col gap-5">
            <Field label="Name" error={registerForm.formState.errors.name?.message}>
              <Input type="text" autoFocus {...registerForm.register("name")} />
            </Field>

            <Field label="Email" error={registerForm.formState.errors.email?.message}>
              <Input type="email" {...registerForm.register("email")} />
            </Field>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="button"
              onClick={toggleMode}
              className="self-end text-sm text-zinc-600 underline underline-offset-2 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Already have an account? Sign in
            </button>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" loading={isSubmitting}>
              Send code
            </Button>
          </ModalFooter>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={onVerifyCode}>
          <ModalBody className="flex flex-col gap-5">
            <Field label="Code" error={codeForm.formState.errors.code?.message}>
              <Controller
                control={codeForm.control}
                name="code"
                render={({ field }) => (
                  <OtpInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onComplete={() => onVerifyCode()}
                    disabled={isSubmitting}
                    autoFocus
                  />
                )}
              />
            </Field>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="button"
              onClick={backToEmail}
              className="self-end text-sm text-zinc-600 underline underline-offset-2 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Use a different email
            </button>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" loading={isSubmitting}>
              Verify
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}
