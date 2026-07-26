"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_LINKS } from "@/lib/nav-links";

const LINK_CLASS =
  "text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50";
const ACTIVE_LINK_CLASS = "font-medium text-black dark:text-zinc-50";

export function NavLinks() {
  const pathname = usePathname();
  const { status } = useAuth();

  const visibleLinks = NAV_LINKS.filter((link) => !link.protected || status === "authenticated");

  return (
    <nav className="flex items-center gap-4 text-sm">
      {visibleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={link.isActive(pathname) ? ACTIVE_LINK_CLASS : LINK_CLASS}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
