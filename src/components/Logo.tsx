export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
        <rect width="40" height="40" rx="11" fill="#14532d" />
        <path d="M13 15h14l-1.3 14.2a2 2 0 0 1-2 1.8h-7.4a2 2 0 0 1-2-1.8z" fill="#bbf7d0" />
        <rect x="11" y="11.5" width="18" height="3.5" rx="1.5" fill="#fff" />
        <rect x="17" y="9" width="6" height="3" rx="1.5" fill="#fff" />
        <path d="M17 20.5v6M20 20.5v6M23 20.5v6" stroke="#14532d" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="text-[22px] font-black tracking-tight">Sortér</span>
    </div>
  );
}
