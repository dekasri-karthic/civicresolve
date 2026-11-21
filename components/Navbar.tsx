"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, PlusCircle, Search, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", shortLabel: "Home" },
    { href: "/report", label: "Report Issue", shortLabel: "Report", icon: PlusCircle },
    { href: "/track", label: "Track Issues", shortLabel: "Track", icon: Search },
    { href: "/admin", label: "Admin Portal", shortLabel: "Admin", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
                CivicResolve
              </span>
              <p className="hidden md:block text-[10px] text-teal-600 font-medium tracking-wider uppercase">
                Report • Track • Resolve
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal-50 text-teal-700 shadow-xs border border-teal-200"
                      : "text-slate-600 hover:text-teal-700 hover:bg-slate-50"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">{link.shortLabel}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
