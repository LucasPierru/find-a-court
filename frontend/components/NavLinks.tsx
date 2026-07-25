"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home", isActive: (pathname: string) => pathname === "/" },
  {
    href: "/events",
    label: "Events",
    isActive: (pathname: string) =>
      pathname === "/events" ||
      (pathname.startsWith("/events/") && !pathname.startsWith("/events/new")),
  },
  {
    href: "/events/new",
    label: "Create Event",
    isActive: (pathname: string) => pathname.startsWith("/events/new"),
  },
  {
    href: "/login",
    label: "Sign in",
    isActive: (pathname: string) =>
      pathname === "/login" || pathname === "/register",
  },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 text-sm">
      {LINKS.map((link) => {
        const active = link.isActive(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "font-medium text-black dark:text-zinc-50"
                : "text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
