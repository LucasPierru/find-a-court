import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "@/components/NavLinks";
import { PAGE_WIDTH_CLASS } from "@/lib/layout";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 relative border-b border-white/30 bg-white/60 shadow-sm backdrop-blur-xl backdrop-saturate-150 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent dark:border-white/10 dark:bg-zinc-900/40 dark:before:via-white/20">
      <div className={`flex h-14 items-center justify-between ${PAGE_WIDTH_CLASS}`}>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50"
          >
            Find a Court
          </Link>
          <div className="hidden sm:block">
            <NavLinks />
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
