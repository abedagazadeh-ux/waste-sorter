import { BIN_MAP, type BinId } from "@/lib/bins";

export function BinIcon({ id, size = 48, className }: { id: BinId; size?: number; className?: string }) {
  const bin = BIN_MAP[id];
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 60 66"
      className={className}
      role="img"
      aria-label={bin.name}
    >
      {/* krop */}
      <path d="M12 20h36l-3.2 38a4 4 0 0 1-4 3.6H19.2a4 4 0 0 1-4-3.6z" fill={bin.color} />
      {/* skygge */}
      <path d="M38 20h10l-3.2 38a4 4 0 0 1-4 3.6H34z" fill={bin.dark} opacity=".45" />
      {/* låg */}
      <rect x="7" y="11" width="46" height="10" rx="3.5" fill={bin.dark} />
      <rect x="23" y="6" width="14" height="6" rx="3" fill={bin.dark} />
      {/* mærkat */}
      <rect x="21" y="30" width="18" height="18" rx="4" fill="#fff" opacity=".92" />
      <path d="M26 39h8M30 35v8" stroke={bin.color} strokeWidth="2.6" strokeLinecap="round" opacity=".0" />
      <circle cx="30" cy="39" r="4.2" fill={bin.color} />
      {/* hjul */}
      <circle cx="19" cy="62" r="3" fill="#1c1917" />
      <circle cx="41" cy="62" r="3" fill="#1c1917" />
    </svg>
  );
}
