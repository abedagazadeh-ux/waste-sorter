import { Logo } from "@/components/Logo";
import { Scanner } from "@/components/Scanner";

export default function Home() {
  return (
    <main>
      <header className="mb-4 flex items-center justify-between">
        <Logo />
        <span className="rounded-full bg-[#14532d]/10 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-[#14532d]">
          Danske regler
        </span>
      </header>
      <h1 className="mb-4 text-[26px] font-black leading-[1.1] tracking-tight">
        Hvilken spand skal det i?
        <span className="block text-[15px] font-medium tracking-normal text-stone-500">
          Peg kameraet på dit affald og få svaret med det samme.
        </span>
      </h1>
      <Scanner />
    </main>
  );
}
