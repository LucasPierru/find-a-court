"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_LINKS } from "@/lib/nav-links";

const LINK_CLASS =
  "block px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50";
const ACTIVE_LINK_CLASS =
  "block bg-zinc-100 px-4 py-2 text-sm font-medium text-black dark:bg-zinc-800 dark:text-zinc-50";

export function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useAuth();

  const visibleLinks = NAV_LINKS.filter((link) => !link.protected || status === "authenticated");

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={link.isActive(pathname) ? ACTIVE_LINK_CLASS : LINK_CLASS}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
