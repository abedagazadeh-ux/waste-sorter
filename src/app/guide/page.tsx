import type { Metadata } from "next";
import { BinIcon } from "@/components/BinIcon";
import { BINS } from "@/lib/bins";

export const metadata: Metadata = {
  title: "Guide til alle spande – Sortér",
  description: "Se hvad der skal i hvilken skraldespand i Danmark.",
};

export default function GuidePage() {
  return (
    <main>
      <h1 className="text-[28px] font-black leading-tight tracking-tight">Alle spande</h1>
      <p className="mt-1 text-[15px] leading-snug text-stone-600">
        Landets ti sorteringer plus elektronik og pant. Tryk på en spand for at se, hvad der hører til.
      </p>

      <div className="mt-3 rounded-2xl bg-[#14532d]/10 p-3.5 text-[13.5px] leading-snug text-[#14532d]">
        <b>Bemærk:</b> Mange kommuner har kombinerede beholdere (fx papir og pap sammen, eller metal og glas sammen).
        Fraktionerne er de samme – følg mærkaterne på din egen spand.
      </div>

      <div className="mt-4 space-y-2.5">
        {BINS.map((b) => (
          <details key={b.id} className="group overflow-hidden rounded-2xl border border-black/10 bg-white">
            <summary className="flex cursor-pointer items-center gap-3.5 p-3.5">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${b.color}1f` }}
              >
                <BinIcon id={b.id} size={36} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-extrabold leading-tight" style={{ color: b.dark }}>
                  {b.name}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-stone-500">{b.where}</span>
              </span>
              <svg
                className="chev shrink-0 text-stone-400 transition-transform"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="border-t border-black/5 px-4 pb-4 pt-3">
              <p className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-emerald-700">Ja tak</p>
              <ul className="space-y-1">
                {b.yes.map((y) => (
                  <li key={y} className="flex gap-2 text-[14.5px] leading-snug">
                    <span className="mt-[1px] font-black text-emerald-600">✓</span>
                    {y}
                  </li>
                ))}
              </ul>
              <p className="mb-1.5 mt-3.5 text-[12px] font-extrabold uppercase tracking-wider text-red-700">Nej tak</p>
              <ul className="space-y-1">
                {b.no.map((n) => (
                  <li key={n} className="flex gap-2 text-[14.5px] leading-snug text-stone-700">
                    <span className="mt-[1px] font-black text-red-600">✕</span>
                    {n}
                  </li>
                ))}
              </ul>
              {b.tip && (
                <p className="mt-3.5 rounded-xl bg-stone-100 p-3 text-[13.5px] leading-snug text-stone-700">
                  <b>Tip:</b> {b.tip}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
