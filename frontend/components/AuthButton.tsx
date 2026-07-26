"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";

export function AuthButton() {
  const router = useRouter();
  const { status, user, logout, openAuthModal } = useAuth();

  async function handleLogout(): Promise<void> {
    await logout();
    router.push("/");
  }

  if (status === "loading") {
    return null;
  }

  if (status === "authenticated" && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-zinc-600 dark:text-zinc-400 sm:inline">
          {user.name}
        </span>
        <Button type="button" variant="outline" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button type="button" onClick={openAuthModal}>
      Sign in
    </Button>
  );
}
