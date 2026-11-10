"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Scan",
    icon: (
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M7 12h10" />
    ),
  },
  {
    href: "/guide",
    label: "Guide",
    icon: (
      <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM17 8h2v12M9 9h5M9 13h5" />
    ),
  },
  {
    href: "/historik",
    label: "Historik",
    icon: <path d="M12 7v5l3 2M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Hovedmenu"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-[#faf8f3]/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md">
        {tabs.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold tracking-wide ${
                  active ? "text-[#14532d]" : "text-stone-500"
                }`}
              >
                <span
                  className={`flex h-7 w-14 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-[#14532d]/12" : ""
                  }`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {t.icon}
                  </svg>
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
