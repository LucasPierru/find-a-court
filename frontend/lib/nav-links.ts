export type NavLink = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
  protected: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", isActive: (pathname) => pathname === "/", protected: false },
  {
    href: "/events",
    label: "Events",
    isActive: (pathname) =>
      pathname === "/events" || (pathname.startsWith("/events/") && !pathname.startsWith("/events/new")),
    protected: false,
  },
  {
    href: "/events/new",
    label: "Create Event",
    isActive: (pathname) => pathname.startsWith("/events/new"),
    protected: true,
  },
];
