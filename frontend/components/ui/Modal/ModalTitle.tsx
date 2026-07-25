import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export function ModalTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-base font-semibold text-black dark:text-zinc-50", className)}
      {...props}
    />
  );
}
