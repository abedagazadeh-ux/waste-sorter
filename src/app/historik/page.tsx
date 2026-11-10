"use client";

import Link from "next/link";
import { BinIcon } from "@/components/BinIcon";
import { BIN_MAP } from "@/lib/bins";
import { clearHistory, removeHistory, useHistory } from "@/lib/history";

function ago(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "lige nu";
  if (m < 60) return `${m} min siden`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} t siden`;
  return new Date(t).toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

export default function HistoryPage() {
  const items = useHistory();
  return (
    <main>
      <div className="flex items-end justify-between">
        <h1 className="text-[28px] font-black leading-tight tracking-tight">Historik</h1>
        {items.length > 0 && (
          <button onClick={clearHistory} className="pb-1 text-[13.5px] font-bold text-red-700">
            Ryd alt
          </button>
        )}
      </div>
      <p className="mt-1 text-[14px] text-stone-500">Gemmes kun på din telefon.</p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-black/20 p-8 text-center">
          <p className="text-[17px] font-extrabold">Ingen scanninger endnu</p>
          <p className="mt-1 text-[14.5px] text-stone-600">Dine seneste scanninger dukker op her, så du hurtigt kan slå dem op igen.</p>
          <Link href="/" className="mt-5 inline-block rounded-2xl bg-[#14231b] px-6 py-3.5 font-extrabold text-white">
            Scan noget
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((e) => {
            const b = BIN_MAP[e.bin];
            if (!b) return null;
            return (
              <li key={e.id} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3">
                {e.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.thumb} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 7V5h16v2M12 5v14M9 19h6" />
                    </svg>
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15.5px] font-bold">{e.name}</p>
                  <p className="text-[12.5px] text-stone-500">{ago(e.at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <BinIcon id={b.id} size={26} />
                  <span className="text-[13.5px] font-extrabold" style={{ color: b.dark }}>
                    {b.short}
                  </span>
                </div>
                <button onClick={() => removeHistory(e.id)} aria-label="Fjern" className="p-1.5 text-stone-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
