import type { HTMLAttributes } from "react";
import { cn } from "../cn";

// pr-10 keeps the title clear of Modal's always-present close button.
export function ModalHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-zinc-200 p-4 pr-10 dark:border-zinc-800",
        className,
      )}
      {...props}
    />
  );
}
