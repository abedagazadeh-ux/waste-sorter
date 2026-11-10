export type BinId =
  | "mad"
  | "rest"
  | "papir"
  | "pap"
  | "glas"
  | "metal"
  | "plast"
  | "karton"
  | "tekstil"
  | "farligt"
  | "elektronik"
  | "pant"
  | "storskrald";

export type Bin = {
  id: BinId;
  name: string;
  short: string;
  color: string;
  dark: string;
  /** Hvor/hvordan afleveres det */
  where: string;
  yes: string[];
  no: string[];
  tip?: string;
};

export const BINS: Bin[] = [
  {
    id: "rest",
    name: "Restaffald",
    short: "Rest",
    color: "#52525b",
    dark: "#3f3f46",
    where: "Den grå/sorte beholder ved huset",
    yes: [
      "Bleer og hygiejneprodukter",
      "Støvsugerposer og kattegrus",
      "Cigaretskodder og tyggegummi",
      "Porcelæn, keramik og krus",
      "Drikkeglas, ildfast glas og spejle",
      "Fedtet eller beskidt papir og pap",
      "Engangskaffekopper og køkkenrulle",
      "Vatpinde, vat, plastre og mundbind",
      "Engangshandsker og Styropor",
    ],
    no: ["Madrester", "Rene emballager af plast, metal, glas", "Batterier og elektronik"],
    tip: "Det, der ikke har en anden plads, ryger her. Drikkeglas og porcelæn hører IKKE til i glas.",
  },
  {
    id: "mad",
    name: "Madaffald",
    short: "Mad",
    color: "#8a5a2b",
    dark: "#6b4420",
    where: "Madspanden i køkkenet – tømmes i beholder med madaffald",
    yes: [
      "Madrester og rester fra tallerkenen",
      "Skræller, kerner og frugtrester",
      "Kød, fisk, ben og skaller",
      "Æggeskaller, brød og kager",
      "Kaffegrums med filter og teposer",
      "Visne blomster og små stueplanter",
    ],
    no: [
      "Plastposer (brug papir- eller madaffaldsposer)",
      "Bleer og kattegrus",
      "Flydende fedt og olie i store mængder",
      "Aske og cigaretskodder",
    ],
    tip: "Læg madaffald i den udleverede papir- eller bioplast-pose – aldrig i almindelig plastpose.",
  },
  {
    id: "papir",
    name: "Papir",
    short: "Papir",
    color: "#2563eb",
    dark: "#1d4ed8",
    where: "Papir-beholderen (ofte blå mærkat)",
    yes: [
      "Aviser, ugeblade og reklamer",
      "Printerpapir og kontorpapir",
      "Breve og konvolutter (også med rude)",
      "Papirposer og indpakningspapir",
      "Bøger uden hårdt omslag",
    ],
    no: [
      "Køkkenrulle og servietter",
      "Kvitteringer (termopapir)",
      "Fedtet eller vådt papir",
      "Pap og kartoner",
    ],
  },
  {
    id: "pap",
    name: "Pap",
    short: "Pap",
    color: "#c2832f",
    dark: "#9a6620",
    where: "Pap-beholderen (ofte brun/orange mærkat)",
    yes: [
      "Papkasser og kasseemballage",
      "Rene pizzabakker",
      "Æggebakker og papæsker",
      "Paprør (fx toiletruller)",
      "Kartoner til morgenmad, pasta mm.",
    ],
    no: [
      "Mad- og drikkekartoner (mælk, juice)",
      "Fedtet eller vådt pap",
      "Pap med meget tape (fjern tapen)",
    ],
    tip: "Fold papkasser sammen, så der er plads til mere.",
  },
  {
    id: "glas",
    name: "Glas",
    short: "Glas",
    color: "#15803d",
    dark: "#166534",
    where: "Glas-beholderen (ofte grøn mærkat)",
    yes: [
      "Glasflasker (vin, øl, olie, eddike)",
      "Syltetøjsglas og sauceglas",
      "Konserveglas uden låg",
    ],
    no: [
      "Drikkeglas og krus",
      "Ildfast glas og porcelæn",
      "Ruder og spejle",
      "Pærer og lysstofrør",
    ],
    tip: "Tag låg og kapsler af. Låg af metal kommer i Metal.",
  },
  {
    id: "metal",
    name: "Metal",
    short: "Metal",
    color: "#0e7490",
    dark: "#155e75",
    where: "Metal-beholderen (ofte grå/blå mærkat)",
    yes: [
      "Konservesdåser og dåselåg",
      "Drikkedåser uden pant",
      "Aluminiumsfolie og -bakker",
      "Metallåg og kapsler",
      "Kaffekapsler af aluminium",
      "Gryder, bestik og små metalting",
    ],
    no: [
      "Dåser med pant (de går i pantautomaten)",
      "Spraydåser med indhold",
      "Batterier",
    ],
    tip: "Skyl madrester af først.",
  },
  {
    id: "plast",
    name: "Plast",
    short: "Plast",
    color: "#ea580c",
    dark: "#c2410c",
    where: "Plast-beholderen (ofte orange mærkat)",
    yes: [
      "Plastflasker og dunke (uden pant)",
      "Yoghurtbægre og bakker",
      "Plastfolie og bæreposer",
      "Indpakning og emballage af blød plast",
      "Plastlegetøj, spande og haveredskaber",
    ],
    no: [
      "Mad- og drikkekartoner",
      "Bleer og beskidt plast",
      "PVC og Styropor",
      "Plastflasker med pant",
    ],
    tip: "Skyl eller tøm emballagen. Lad låg sidde på flasken.",
  },
  {
    id: "karton",
    name: "Mad- og drikkekartoner",
    short: "Karton",
    color: "#ca8a04",
    dark: "#a16207",
    where: "Beholder til mad- og drikkekartoner (ofte gul mærkat)",
    yes: [
      "Mælke- og juicekartoner",
      "Flødekartoner",
      "Kartoner til tomater, supper og bouillon",
      "Vinkartoner (Tetra Pak)",
    ],
    no: ["Almindelig pap", "Plastbægre", "Fedtet pap"],
    tip: "Skyl og skru proppen på. Fold kartonen sammen.",
  },
  {
    id: "tekstil",
    name: "Tekstil",
    short: "Tekstil",
    color: "#7e22ce",
    dark: "#6b21a8",
    where: "Tekstil-beholderen eller en lukket pose i tekstil-spanden",
    yes: [
      "Tøj – også slidt eller hullet",
      "Sko (bundet sammen to og to)",
      "Sengetøj, håndklæder og gardiner",
      "Tasker, bælter og klude",
    ],
    no: ["Vådt, mugget eller olie-snavset tekstil", "Madrasser og tæpper med fyld"],
    tip: "Skal være rent og tørt – put det i en lukket pose.",
  },
  {
    id: "farligt",
    name: "Farligt affald",
    short: "Farligt",
    color: "#dc2626",
    dark: "#b91c1c",
    where: "Lille rød boks eller farligt-affald-beholder",
    yes: [
      "Maling, lak og opløsningsmidler",
      "Kemikalier og rengøringsmidler med rester",
      "Spraydåser med indhold",
      "Lightere og termometre",
      "Olie og frostvæske",
    ],
    no: ["Medicin (til apoteket)", "Tomme rengøringsflasker (til Plast)", "Batterier (til elektronik/batteri)"],
    tip: "Hold farligt affald i original emballage. Medicinrester afleveres på apoteket.",
  },
  {
    id: "elektronik",
    name: "Småt elektronik og batterier",
    short: "Elektronik",
    color: "#be185d",
    dark: "#9d174d",
    where: "Egen elektronik-beholder/pose i din kommune – eller batteriboks i butikken",
    yes: [
      "Batterier og powerbanks",
      "Opladere, ledninger og kabler",
      "Mobiltelefoner, høretelefoner og små apparater",
      "Elektrisk tandbørste og barbermaskine",
      "LED-pærer og sparepærer",
    ],
    no: ["Store hvidevarer (storskrald)", "Almindelige glødepærer (Restaffald)"],
    tip: "Batterier skal tapes over på polerne. De må aldrig i restaffald – brandfare.",
  },
  {
    id: "pant",
    name: "Pant",
    short: "Pant",
    color: "#4d7c0f",
    dark: "#3f6212",
    where: "Pantautomat i supermarkedet",
    yes: [
      "Dåser med pant-mærke",
      "Plastflasker med pant-mærke",
      "Glasflasker med pant-mærke",
    ],
    no: ["Flasker og dåser uden pant-mærke"],
    tip: "Pant går tilbage i pengepungen: 1, 1,50 eller 3 kr. pr. stk.",
  },
  {
    id: "storskrald",
    name: "Storskrald",
    short: "Stor",
    color: "#44403c",
    dark: "#292524",
    where: "Kun hvis det er for stort til alle spande – bestilles hos kommunen",
    yes: ["Møbler og madrasser", "Hvidevarer", "Cykler og store ting"],
    no: ["Alt, der kan i en almindelig beholder"],
  },
];

export const BIN_MAP: Record<BinId, Bin> = Object.fromEntries(
  BINS.map((b) => [b.id, b]),
) as Record<BinId, Bin>;

export const BIN_IDS = BINS.map((b) => b.id) as BinId[];

export type ScanItem = {
  name: string;
  bin: BinId;
  confidence: "høj" | "mellem" | "lav";
  reason: string;
  prep: string[];
};

export type ScanResult = {
  recognized: boolean;
  items: ScanItem[];
  hint?: string;
};
