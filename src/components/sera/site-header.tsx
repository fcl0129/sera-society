import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Experience", href: "/platform" },
  { label: "Hosting", href: "/about" },
  { label: "Occasions", href: "/event-pages" },
  { label: "How it works", href: "/invitations" },
] as const;

export function SiteHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 22);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-5 pt-4 md:px-10 md:pt-6">
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between border px-5 py-3.5 transition-all duration-300 md:px-8",
          scrolled
            ? "border-[#e8dbc8]/15 bg-[#0c1421]/78 shadow-[0_18px_48px_-32px_rgba(5,7,11,0.9)] backdrop-blur-xl"
            : "border-[#efe3d2]/10 bg-[#101827]/38 backdrop-blur-md",
        )}
      >
        <Link to="/" className="flex items-baseline gap-2 text-[#f1e5d5]">
          <span className="font-display text-[1.5rem] leading-none tracking-[-0.02em] md:text-[1.75rem]">Sera</span>
          <span className="text-[0.63rem] uppercase tracking-[0.34em] text-[#d8cab7]/78">Society</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-[0.8rem] uppercase tracking-[0.17em] transition-colors duration-200",
                  isActive ? "text-[#f4e7d4]" : "text-[#d8ccbc]/82 hover:text-[#f4e7d4]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            variant="ghost"
            className="h-10 rounded-none border border-[#e5d5c0]/35 px-5 text-[0.72rem] uppercase tracking-[0.16em] text-[#f3e9db] hover:bg-[#efe1cf]/12"
          >
            <Link to="/platform">View the experience</Link>
          </Button>
          <Button
            asChild
            className="h-10 rounded-none border border-[#f6e8d1]/70 bg-[#efe2cf] px-5 text-[0.72rem] uppercase tracking-[0.16em] text-[#281f1c] hover:bg-[#f5ead9]"
          >
            <Link to="/request-access">Request access</Link>
          </Button>
        </div>

        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center border border-[#e5d5c0]/35 text-[#f2e8da] md:hidden"
              aria-label="Open navigation"
            >
              <HamburgerMenuIcon className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={12}
            className="w-[calc(100vw-2.5rem)] max-w-sm rounded-none border-[#e4d6c2]/30 bg-[#0f1623]/96 p-5 text-[#efe6d8] shadow-[0_26px_70px_-34px_rgba(0,0,0,0.95)] backdrop-blur-xl"
          >
            <nav className="space-y-2" aria-label="Mobile primary">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-[#e4d6c2]/20 py-3 text-[0.76rem] uppercase tracking-[0.2em] text-[#eaddcc]/86"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                asChild
                variant="ghost"
                className="h-10 rounded-none border border-[#e5d5c0]/30 text-[0.72rem] uppercase tracking-[0.16em] text-[#f2e7d6] hover:bg-[#ecdfcd]/12"
              >
                <Link to="/platform" onClick={() => setMenuOpen(false)}>
                  View the experience
                </Link>
              </Button>
              <Button
                asChild
                className="h-10 rounded-none border border-[#f6e8d1]/70 bg-[#efe2cf] text-[0.72rem] uppercase tracking-[0.16em] text-[#281f1c] hover:bg-[#f5ead9]"
              >
                <Link to="/request-access" onClick={() => setMenuOpen(false)}>
                  Request access
                </Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
