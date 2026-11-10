import { NextResponse } from "next/server";
import { BINS, BIN_IDS, type ScanResult } from "@/lib/bins";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "gemini-flash-lite-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const binRules = BINS.map(
  (b) =>
    `- id "${b.id}" = ${b.name}\n  JA: ${b.yes.join("; ")}\n  NEJ: ${b.no.join("; ")}`,
).join("\n");

const SYSTEM_PROMPT = `Du er Danmarks mest præcise sorteringsassistent til husholdningsaffald.
Brugeren står med ét stykke affald og skal vide, HVILKEN SKRALDESPAND/BEHOLDER derhjemme det skal i, efter de danske nationale regler for ensartet affaldssortering (10 fraktioner + småt elektronik/batterier).
Svar ALDRIG med genbrugsstation, medmindre genstanden er så stor, at den ikke kan i nogen beholder (så bruges "storskrald").

Tilgængelige beholdere:
${binRules}

Beslutningsregler:
1. Find først materialet. Læs tekst/symboler på emballagen (pant-mærke, PET, PP, PVC, Tetra Pak, "genbrugspapir" osv.).
2. Pant-mærke eller tydelig pantflaske/pantdåse -> "pant".
3. Emballage med flere materialer: del op i flere items, hvis det er let at skille ad (fx glas + metallåg, yoghurtbæger + folielåg). Højst 4 items. Det vigtigste item står først.
4. Mad- og drikkekartoner (mælk, juice, Tetra Pak) -> "karton", ALDRIG "pap" eller "plast".
5. Drikkeglas, porcelæn, keramik, ildfast glas, spejle og ruder -> "rest" (ikke "glas").
6. Rene pizzabakker -> "pap". Fedtet/beskidt pap og papir -> "rest".
7. Madrester, skræller, kaffegrums, teposer -> "mad".
8. Batterier, opladere, kabler, LED-pærer -> "elektronik". Maling, kemikalier, spraydåser med indhold -> "farligt". Medicin: "farligt" med besked om at aflevere på apoteket i prep.
9. Brugt køkkenrulle, servietter, tandbørster, bleer, cigaretskodder, kattegrus, støvsugerposer -> "rest".
10. Er du i tvivl, vælg den mest sandsynlige beholder og sæt confidence til "lav" eller "mellem". Gæt aldrig "høj" uden at være sikker.
11. Ses der intet affald, er billedet for utydeligt eller mørkt, eller er det ikke en genstand: sæt recognized=false, items=[] og skriv et kort tip i hint (fx "Kom tættere på og sørg for lys").

Format:
- name: genstandens korte danske navn (fx "Mælkekarton").
- reason: ÉN kort sætning på dansk (max 14 ord), der forklarer hvorfor den ryger i netop den beholder.
- prep: 0-3 meget korte handlinger på dansk (fx "Skyl den", "Skru proppen på", "Tag låget af"). Tom liste hvis intet kræves.
- Skriv i du-form. Ingen emojis.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    recognized: { type: "BOOLEAN" },
    hint: { type: "STRING" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          bin: { type: "STRING", enum: BIN_IDS },
          confidence: { type: "STRING", enum: ["høj", "mellem", "lav"] },
          reason: { type: "STRING" },
          prep: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["name", "bin", "confidence", "reason", "prep"],
      },
    },
  },
  required: ["recognized", "items"],
};

// Meget simpel rate limit pr. IP (bor i hukommelsen)
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 30;
}

type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };

async function callGemini(parts: GeminiPart[], apiKey: string): Promise<ScanResult> {
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 700,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("Gemini fejl", res.status, t.slice(0, 300));
    throw new Error(`gemini_${res.status}`);
  }

  const json = await res.json();
  const text: string | undefined = json?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) throw new Error("empty");

  const parsed = JSON.parse(text) as ScanResult;
  const items = (parsed.items ?? [])
    .filter((i) => BIN_IDS.includes(i.bin))
    .slice(0, 4)
    .map((i) => ({
      name: String(i.name ?? "").slice(0, 60),
      bin: i.bin,
      confidence: i.confidence ?? "mellem",
      reason: String(i.reason ?? "").slice(0, 200),
      prep: Array.isArray(i.prep) ? i.prep.slice(0, 3).map((s) => String(s).slice(0, 60)) : [],
    }));

  return {
    recognized: Boolean(parsed.recognized) && items.length > 0,
    items,
    hint: parsed.hint ? String(parsed.hint).slice(0, 160) : undefined,
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Serveren mangler API-nøgle." }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "ukendt";
  if (limited(ip)) {
    return NextResponse.json({ error: "Du scanner lidt for hurtigt – vent et øjeblik." }, { status: 429 });
  }

  let payload: { image?: string; mime?: string; text?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørgsel." }, { status: 400 });
  }

  let parts: GeminiPart[];
  if (typeof payload.image === "string" && payload.image.length > 100) {
    const mime = payload.mime && /^image\/(jpeg|png|webp)$/.test(payload.mime) ? payload.mime : "image/jpeg";
    if (payload.image.length > 4_000_000) {
      return NextResponse.json({ error: "Billedet er for stort." }, { status: 413 });
    }
    parts = [
      { inline_data: { mime_type: mime, data: payload.image } },
      { text: "Hvilken skraldespand skal dette i? Svar som JSON." },
    ];
  } else if (typeof payload.text === "string" && payload.text.trim().length >= 2) {
    const q = payload.text.trim().slice(0, 120);
    parts = [{ text: `Brugeren skriver at de har: "${q}". Hvilken skraldespand skal det i? Svar som JSON.` }];
  } else {
    return NextResponse.json({ error: "Send et billede eller en tekst." }, { status: 400 });
  }

  try {
    let result: ScanResult | null = null;
    let lastErr: unknown;
    for (let attempt = 0; attempt < 3 && !result; attempt++) {
      try {
        result = await callGemini(parts, apiKey);
      } catch (e) {
        lastErr = e;
        const retryable =
          e instanceof Error && /gemini_(429|5\d\d)|empty|Unexpected|JSON|timed out|aborted|fetch failed/i.test(e.message);
        if (!retryable) throw e;
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
      }
    }
    if (!result) throw lastErr;
    return NextResponse.json(result);
  } catch (e) {
    console.error("scan fejlede", e);
    return NextResponse.json(
      { error: "Kunne ikke scanne lige nu. Prøv igen om lidt." },
      { status: 502 },
    );
  }
}
