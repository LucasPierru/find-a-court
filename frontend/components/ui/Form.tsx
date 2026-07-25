import { forwardRef, type FormHTMLAttributes } from "react";
import { cn } from "./cn";

export type FormProps = FormHTMLAttributes<HTMLFormElement>;

// The recurring `<form className="flex flex-col gap-5">` shell used by
// every form in the app (CreateEventForm, Login, Register).
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { className, ...props },
  ref,
) {
  return <form ref={ref} className={cn("flex flex-col gap-5", className)} {...props} />;
});
