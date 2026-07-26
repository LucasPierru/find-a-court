"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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
];

const LINK_CLASS =
  "text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50";
const ACTIVE_LINK_CLASS = "font-medium text-black dark:text-zinc-50";

export function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, logout } = useAuth();

  async function handleLogout(): Promise<void> {
    await logout();
    router.push("/");
  }

  return (
    <nav className="flex items-center gap-4 text-sm">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={link.isActive(pathname) ? ACTIVE_LINK_CLASS : LINK_CLASS}
        >
          {link.label}
        </Link>
      ))}

      {status === "authenticated" && user ? (
        <div className="flex items-center gap-4">
          <span className="text-zinc-600 dark:text-zinc-400">{user.name}</span>
          <button type="button" onClick={handleLogout} className={LINK_CLASS}>
            Sign out
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className={pathname === "/login" || pathname === "/register" ? ACTIVE_LINK_CLASS : LINK_CLASS}
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
