import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}
