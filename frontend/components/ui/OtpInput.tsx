"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "./cn";

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setDigit(index: number, digit: string): void {
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    const nextValue = nextDigits.join("");
    onChange(nextValue);
    if (!nextDigits.includes("")) {
      onComplete?.(nextValue);
    }
  }

  function handleChange(index: number, rawValue: string): void {
    const digit = rawValue.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>): void {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  }

  return (
    <div className="flex w-full gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className={cn(
            "h-16 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white text-center text-2xl font-semibold text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50",
            "focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:border-zinc-50 dark:focus:ring-zinc-50",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />
      ))}
    </div>
  );
}
