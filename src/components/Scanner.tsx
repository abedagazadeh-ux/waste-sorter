"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ScanResult } from "@/lib/bins";
import { addHistory } from "@/lib/history";
import { HeroItem, SubItem } from "./ResultCard";

type Phase = "camera" | "loading" | "result" | "error";
type Cam = "starting" | "live" | "blocked";

const QUICK = ["Mælkekarton", "Pizzabakke", "Kaffegrums", "Chipspose", "Batteri", "Glas uden pant"];

function toJpeg(src: CanvasImageSource, w: number, h: number, max: number, q: number) {
  const scale = Math.min(1, max / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q);
}

export function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("camera");
  const [cam, setCam] = useState<Cam>("starting");
  const [frozen, setFrozen] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [textMode, setTextMode] = useState(false);
  const [query, setQuery] = useState("");
  const [torch, setTorch] = useState(false);
  const [canTorch, setCanTorch] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setTorch(false);
    setCanTorch(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCam("blocked");
      return;
    }
    setCam("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (!v) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      v.srcObject = stream;
      await v.play().catch(() => {});
      const caps = stream.getVideoTracks()[0]?.getCapabilities?.() as { torch?: boolean } | undefined;
      setCanTorch(Boolean(caps?.torch));
      setCam("live");
    } catch {
      setCam("blocked");
    }
  }, []);

  useEffect(() => {
    if (phase === "camera") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void startCamera();
    }
    return () => {
      if (phase === "camera") stopCamera();
    };
  }, [phase, startCamera, stopCamera]);

  async function analyze(payload: { image?: string; text?: string }, preview: string | null, label?: string) {
    setFrozen(preview);
    setPhase("loading");
    setError("");
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, mime: "image/jpeg" }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Noget gik galt.");
      const r = data as ScanResult;
      setResult(r);
      if (r.recognized) {
        let thumb: string | undefined;
        if (preview) {
          const img = new Image();
          img.src = preview;
          await img.decode().catch(() => {});
          thumb = img.naturalWidth ? toJpeg(img, img.naturalWidth, img.naturalHeight, 96, 0.6) : undefined;
        }
        addHistory(
          r.items.map((i, idx) => ({ name: i.name || label || "Genstand", bin: i.bin, thumb: idx === 0 ? thumb : undefined })),
        );
      }
      navigator.vibrate?.(r.recognized ? [20, 40, 20] : 60);
      setPhase("result");
    } catch (e) {
      setError(
        e instanceof DOMException && e.name === "AbortError"
          ? "Det tog for lang tid. Tjek din forbindelse og prøv igen."
          : e instanceof Error
            ? e.message
            : "Noget gik galt.",
      );
      setPhase("error");
    }
  }

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth || cam !== "live") return;
    navigator.vibrate?.(25);
    const url = toJpeg(v, v.videoWidth, v.videoHeight, 800, 0.72);
    stopCamera();
    void analyze({ image: url.split(",")[1] }, url);
  }

  async function onFile(file?: File) {
    if (!file) return;
    try {
      const bmp = await createImageBitmap(file);
      const url = toJpeg(bmp, bmp.width, bmp.height, 800, 0.72);
      stopCamera();
      void analyze({ image: url.split(",")[1] }, url);
    } catch {
      setError("Kunne ikke læse billedet. Prøv et andet.");
      setPhase("error");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function submitText(q: string) {
    const t = q.trim();
    if (t.length < 2) return;
    stopCamera();
    setTextMode(false);
    void analyze({ text: t }, null, t);
  }

  function reset() {
    setResult(null);
    setFrozen(null);
    setError("");
    setQuery("");
    setPhase("camera");
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch {
      /* ikke understøttet */
    }
  }

  /* ---------- Resultat ---------- */
  if (phase === "result" && result) {
    const [first, ...rest] = result.items;
    return (
      <div className="space-y-3 pb-4">
        {!result.recognized || !first ? (
          <div className="rise rounded-3xl border border-black/10 bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">?</div>
            <h2 className="text-xl font-extrabold">Jeg kunne ikke se det tydeligt</h2>
            <p className="mt-1.5 text-[15px] text-stone-600">
              {result.hint || "Kom tættere på, sørg for lys, og hold kun én ting i billedet."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-1">
              {frozen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={frozen} alt="Dit billede" className="h-11 w-11 rounded-xl object-cover ring-1 ring-black/10" />
              )}
              <p className="text-[13px] font-semibold uppercase tracking-wider text-stone-500">
                {rest.length > 0 ? `${result.items.length} ting fundet` : "Resultat"}
              </p>
            </div>
            <HeroItem item={first} />
            {rest.map((it, i) => (
              <SubItem key={it.name + i} item={it} index={i} />
            ))}
            <p className="px-1 pt-1 text-[12.5px] leading-snug text-stone-500">
              Har din kommune kombinerede spande, ligger flere typer i samme beholder – følg mærkaterne på din spand.{" "}
              <Link href="/guide" className="font-semibold text-[#14532d] underline underline-offset-2">
                Se alle spande
              </Link>
            </p>
          </>
        )}
        <button
          onClick={reset}
          className="sticky bottom-[84px] w-full rounded-2xl bg-[#14231b] py-4 text-[17px] font-extrabold text-white shadow-lg active:scale-[.98]"
        >
          Scan næste ting
        </button>
      </div>
    );
  }

  /* ---------- Fejl ---------- */
  if (phase === "error") {
    return (
      <div className="rise rounded-3xl border border-black/10 bg-white p-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-700">!</div>
        <h2 className="text-xl font-extrabold">Det lykkedes ikke</h2>
        <p className="mt-1.5 text-[15px] text-stone-600">{error}</p>
        <button onClick={reset} className="mt-5 w-full rounded-2xl bg-[#14231b] py-4 text-[17px] font-extrabold text-white active:scale-[.98]">
          Prøv igen
        </button>
      </div>
    );
  }

  /* ---------- Kamera + loading ---------- */
  const loading = phase === "loading";
  return (
    <div>
      <div className="relative h-[min(58dvh,540px)] overflow-hidden rounded-[28px] bg-[#0f1a14] shadow-[0_18px_40px_-20px_rgba(0,0,0,.6)]">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`h-full w-full object-cover transition-opacity duration-300 ${cam === "live" && !loading ? "opacity-100" : "opacity-0"}`}
        />

        {loading && frozen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={frozen} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}

        {/* hjørner */}
        {!loading && cam === "live" && (
          <div className="pointer-events-none absolute inset-8">
            {["left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl"].map((c) => (
              <span key={c} className={`absolute h-9 w-9 border-white/90 ${c}`} />
            ))}
            <p className="absolute inset-x-0 -bottom-1 text-center text-[13px] font-semibold text-white/85 drop-shadow">
              Hold én ting midt i rammen
            </p>
          </div>
        )}

        {cam === "starting" && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/70">Starter kamera…</div>
        )}

        {cam === "blocked" && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-7 text-center text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </div>
            <p className="text-[15px] leading-snug text-white/85">
              Kameraet er ikke tilgængeligt her. Tag et billede med din telefon i stedet – det virker lige så godt.
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-2xl bg-white px-6 py-3.5 text-[16px] font-extrabold text-[#14231b] active:scale-95"
            >
              Tag billede
            </button>
          </div>
        )}

        {loading && (
          <>
            <div className="scanline" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-x-0 bottom-5 flex justify-center">
              <span className="flex items-center gap-2.5 rounded-full bg-black/60 px-4 py-2.5 text-[14px] font-bold text-white backdrop-blur">
                <span className="dots" aria-hidden />
                Finder den rigtige spand
              </span>
            </div>
          </>
        )}

        {canTorch && !loading && cam === "live" && (
          <button
            onClick={toggleTorch}
            aria-label="Lommelygte"
            className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur ${torch ? "bg-yellow-300 text-black" : "bg-black/40 text-white"}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
            </svg>
          </button>
        )}
      </div>

      {/* knapper */}
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="flex flex-col items-center gap-1.5 justify-self-start text-[12px] font-bold text-stone-600 disabled:opacity-40"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <circle cx="9" cy="10" r="1.8" />
              <path d="m21 16-5-5-8 8" />
            </svg>
          </span>
          Galleri
        </button>

        <button
          onClick={capture}
          disabled={loading || cam !== "live"}
          aria-label="Scan skrald"
          className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full border-[5px] border-[#14231b] bg-transparent transition-transform active:scale-90 disabled:opacity-40"
        >
          <span className="h-[62px] w-[62px] rounded-full bg-[#14532d]" />
        </button>

        <button
          onClick={() => setTextMode(true)}
          disabled={loading}
          className="flex flex-col items-center gap-1.5 justify-self-end text-[12px] font-bold text-stone-600 disabled:opacity-40"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7V5h16v2M12 5v14M9 19h6" />
            </svg>
          </span>
          Skriv
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {/* skriv-ark */}
      {textMode && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/50" onClick={() => setTextMode(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              submitText(query);
            }}
            className="rise mx-auto w-full max-w-md rounded-t-[28px] bg-[#faf8f3] p-5 pb-8"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15" />
            <h2 className="text-xl font-extrabold">Hvad skal du af med?</h2>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="fx pizzabakke, batteri, yoghurtbæger"
              className="mt-3 w-full rounded-2xl border border-black/15 bg-white px-4 py-3.5 text-[17px] outline-none focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/20"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => submitText(q)}
                  className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13.5px] font-semibold text-stone-700 active:bg-stone-100"
                >
                  {q}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={query.trim().length < 2}
              className="mt-4 w-full rounded-2xl bg-[#14231b] py-4 text-[17px] font-extrabold text-white disabled:opacity-40"
            >
              Find spand
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
