import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export function ModalBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto p-4", className)} {...props} />;
}
