import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export function ModalFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800",
        className,
      )}
      {...props}
    />
  );
}
