import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-zinc-600 dark:text-zinc-400", className)} {...props} />
  );
}
