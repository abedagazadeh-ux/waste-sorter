import { BIN_MAP, type ScanItem } from "@/lib/bins";
import { BinIcon } from "./BinIcon";

function Confidence({ level, light }: { level: ScanItem["confidence"]; light?: boolean }) {
  if (level === "høj") return null;
  const label = level === "lav" ? "Usikker – tjek guiden" : "Ret sikker";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
        light ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
      }`}
    >
      {label}
    </span>
  );
}

export function HeroItem({ item }: { item: ScanItem }) {
  const bin = BIN_MAP[item.bin];
  return (
    <section
      className="rise relative overflow-hidden rounded-[28px] p-5 text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,.55)]"
      style={{ background: `linear-gradient(160deg, ${bin.color}, ${bin.dark})` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/75">Skal i</p>
          <h2 className="mt-1 text-[34px] font-black leading-[1.02] tracking-tight">{bin.name}</h2>
        </div>
        <div className="-mr-1 -mt-1 shrink-0 rounded-2xl bg-white/15 p-2">
          <BinIcon id={bin.id} size={58} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-black/15 p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-bold">{item.name}</p>
          <Confidence level={item.confidence} light />
        </div>
        <p className="mt-1 text-[15px] leading-snug text-white/90">{item.reason}</p>
      </div>

      {item.prep.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {item.prep.map((p) => (
            <li
              key={p}
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-bold"
              style={{ color: bin.dark }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 flex items-start gap-2 text-[13px] leading-snug text-white/80">
        <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        {bin.where}
      </p>
    </section>
  );
}

export function SubItem({ item, index }: { item: ScanItem; index: number }) {
  const bin = BIN_MAP[item.bin];
  return (
    <section
      className="rise flex gap-3 rounded-2xl border border-black/10 bg-white p-3.5"
      style={{ animationDelay: `${80 + index * 70}ms` }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${bin.color}1f` }}
      >
        <BinIcon id={bin.id} size={36} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-stone-500">{item.name}</p>
        <p className="text-[19px] font-extrabold leading-tight" style={{ color: bin.dark }}>
          {bin.name}
        </p>
        <p className="mt-0.5 text-[13.5px] leading-snug text-stone-600">
          {item.reason}
          {item.prep.length > 0 && <span className="font-semibold text-stone-800"> · {item.prep.join(" · ")}</span>}
        </p>
        <div className="mt-1">
          <Confidence level={item.confidence} />
        </div>
      </div>
    </section>
  );
}
