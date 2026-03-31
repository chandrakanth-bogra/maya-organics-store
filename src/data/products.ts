export interface ProductDef {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  meta_description: string;
  image_main: string;
  image_thumb: string | null;
  highlights: string[];
  specs: { label: string; value: string }[];
  usage_note: string;
  texture_class: string;
  has_size_guide: boolean;
}

export const PRODUCTS: ProductDef[] = [
  {
    slug: "perlite",
    name: "Perlite",
    category: "Volcanic Mineral",
    tagline:
      "Sterile, pH-neutral volcanic glass that expands when heated — creating a lightweight, porous structure for superior drainage and aeration in any soil mix.",
    meta_description:
      "Buy premium horticultural perlite in India. pH neutral, sterile volcanic glass for drainage and aeration. From ₹99.",
    image_main: "perlite-jar.jpg",
    image_thumb: "perlite-plain.jpg",
    highlights: [
      "Prevents waterlogging — air pockets drain excess water instantly",
      "pH neutral 7.0 — won't alter your soil chemistry",
      "Sterile and pathogen-free — safe straight from the bag",
      "Does not decompose — permanent structure amendment",
      "Lightweight — significantly reduces pot weight",
      "Reusable — rinse and reuse season after season",
    ],
    specs: [
      { label: "Material", value: "Expanded volcanic glass (amorphous)" },
      { label: "Grain Size", value: "2–4 mm (Medium / Coarse)" },
      { label: "pH", value: "Neutral — 7.0" },
      { label: "Colour", value: "White" },
      { label: "Sterile", value: "Yes — high-temperature processed" },
      { label: "Reusable", value: "Yes — rinse and reuse" },
    ],
    usage_note:
      "Add 20–30% to general mixes, 40–60% for succulents and cacti. Blend with coco peat for seed starting. Use standalone in semi-hydro and hydroponic setups.",
    texture_class: "texture-perlite",
    has_size_guide: false,
  },
  {
    slug: "vermiculite",
    name: "Vermiculite",
    category: "Hydrated Mineral",
    tagline:
      "A naturally occurring mineral that expands when heated, creating a lightweight, absorbent medium. It holds moisture and nutrients close to roots — ideal for seedlings and moisture-sensitive plants.",
    meta_description:
      "Buy premium horticultural vermiculite in India. Moisture-retaining mineral for seedlings, propagation and potting mixes. From ₹99.",
    image_main: "vermiculite-jar.jpg",
    image_thumb: "vermiculite-plain.jpg",
    highlights: [
      "Holds 3–4× its volume in water — ideal for moisture-sensitive plants",
      "Retains nutrients in its layered structure near the root zone",
      "Slightly alkaline pH — buffers acidic coco peat mixes naturally",
      "Sterile and pathogen-free — safe straight from the bag",
      "Lightweight — adds body to mixes without adding weight",
      "Excellent for seed germination and cutting propagation",
    ],
    specs: [
      { label: "Material", value: "Expanded hydrated magnesium silicate" },
      { label: "Grain Size", value: "2–4 mm (Medium)" },
      { label: "pH", value: "Slightly alkaline — 7.0–7.5" },
      { label: "Colour", value: "Golden brown" },
      { label: "Sterile", value: "Yes — exfoliated at high temperature" },
      { label: "Reusable", value: "Yes" },
    ],
    usage_note:
      "30–50% with coco peat for seedlings. Root cuttings directly in moistened vermiculite. Add 20–30% to mixes for moisture-loving tropical plants.",
    texture_class: "texture-vermiculite",
    has_size_guide: true,
  },
  {
    slug: "pumice",
    name: "Pumice",
    category: "Volcanic Rock",
    tagline:
      "A lightweight, porous volcanic rock that drains rapidly while providing excellent aeration. Its gritty texture prevents compaction and improves root structure — the essential ingredient for succulent and cactus mixes.",
    meta_description:
      "Buy premium horticultural pumice in India. Volcanic rock for succulents, cacti and well-draining soil mixes. From ₹99.",
    image_main: "pumice-plain.jpg",
    image_thumb: null,
    highlights: [
      "Fast-draining — prevents root rot even during heavy monsoon downpours",
      "Hard and gritty — never breaks down or compresses",
      "pH neutral 6.5–7.5 — compatible with every plant type",
      "Denser than perlite — keeps tall pots stable and grounded",
      "Does not float or blow away — stays exactly where you put it",
      "Durable and reusable indefinitely — rinse and reuse season after season",
    ],
    specs: [
      { label: "Material", value: "Volcanic pumice rock" },
      { label: "Grain Size", value: "3–6 mm (Coarse)" },
      { label: "pH", value: "Neutral — 6.5–7.5" },
      { label: "Colour", value: "Light grey / off-white" },
      { label: "Sterile", value: "Yes — naturally inert" },
      { label: "Reusable", value: "Yes — rinse and reuse" },
    ],
    usage_note:
      "40–60% for succulents and cacti. 20–30% general potting mix amendment. Layer at pot base instead of gravel for drainage. Top dress to reduce moisture evaporation.",
    texture_class: "texture-pumice",
    has_size_guide: true,
  },
  {
    slug: "leca",
    name: "LECA",
    category: "Expanded Clay",
    tagline:
      "Lightweight Expanded Clay Aggregate — fired clay pellets that are porous and pH neutral. The cleanest growing medium for semi-hydro and full hydroponic setups.",
    meta_description:
      "Buy LECA clay balls in India. Lightweight expanded clay aggregate for hydroponics, semi-hydro and drainage. From ₹99.",
    image_main: "clayballs-jar.jpg",
    image_thumb: "clayballs-plain.jpg",
    highlights: [
      "Completely reusable — clean and sterilise indefinitely",
      "Eliminates fungus gnats and soil-borne pathogens permanently",
      "pH neutral and chemically inert — no interference with nutrients",
      "Wicks moisture upward in passive hydro — roots drink on demand",
      "Maximum air space around roots — zero compaction ever",
      "Clean modern look — see roots through clear pots, no mess",
    ],
    specs: [
      { label: "Material", value: "Fired expanded clay" },
      { label: "Pellet Size", value: "8–15 mm (Standard)" },
      { label: "pH", value: "Neutral — 6.5–7.0" },
      { label: "Colour", value: "Terracotta brown" },
      { label: "Sterile", value: "Yes — kiln-fired" },
      { label: "Reusable", value: "Yes — indefinitely" },
    ],
    usage_note:
      "Always soak LECA in clean water for 24–48 hours before use. Maintain reservoir at ¼ pot height. Change nutrient solution every 1–2 weeks.",
    texture_class: "texture-leca",
    has_size_guide: true,
  },
  {
    slug: "zeolite",
    name: "Zeolite",
    category: "Natural Mineral",
    tagline:
      "A naturally occurring crystalline mineral with a unique porous structure that traps and slowly releases nutrients. It reduces fertiliser runoff, improves water retention, and can be regenerated for reuse.",
    meta_description:
      "Buy zeolite for plants in India. Natural mineral that retains nutrients and improves fertiliser efficiency. From ₹99.",
    image_main: "zeolite-jar.jpg",
    image_thumb: "zeolite-plain.jpg",
    highlights: [
      "CEC up to 180 meq/100g — captures and holds nutrients like a sponge",
      "Reduces fertiliser frequency — nutrients released slowly over weeks",
      "Buffers soil pH — keeps it stable between waterings",
      "Absorbs excess ammonia — reduces odour in containers",
      "Improves water retention in fast-draining sandy mixes",
      "Regenerable — recharge by soaking in diluted fertiliser solution",
    ],
    specs: [
      { label: "Material", value: "Natural clinoptilolite zeolite" },
      { label: "Grain Size", value: "1–4 mm" },
      { label: "pH", value: "Neutral — 6.8–7.2" },
      { label: "CEC", value: "Up to 180 meq/100g" },
      { label: "Colour", value: "Light grey / green-grey" },
      { label: "Reusable", value: "Yes — rechargeable" },
    ],
    usage_note:
      "Add 10–20% to any potting mix. Soak used zeolite in diluted fertiliser to recharge. Useful in coco coir mixes and hydroponic systems to buffer and hold nutrients.",
    texture_class: "texture-default",
    has_size_guide: false,
  },
  {
    slug: "cocopeat",
    name: "Cocopeat",
    category: "Organic Medium",
    tagline:
      "India's finest coir pith — washed and buffered and ready to grow. Holds up to 10× its weight in water while maintaining 22% air space — keeping roots moist and breathing even in peak summer heat.",
    meta_description:
      "Buy premium washed and buffered cocopeat in India. India's finest coir pith for potting mixes, hydroponics and container gardening. From ₹99.",
    image_main: "cocopeat-plain.jpg",
    image_thumb: null,
    highlights: [
      "Holds up to 10× its dry weight in water — never dries out between waterings",
      "22% air-filled porosity even when saturated — roots breathe constantly",
      "Washed and buffered — EC <0.5 mS/cm safe for all plants and hydroponics",
      "pH 5.5–6.8 — optimal range for most vegetables and tropicals",
      "Renewable and sustainable — reclaimed from coconut processing waste",
      "Re-hydrates fully — soak for 30 minutes if it ever dries out",
    ],
    specs: [
      { label: "pH", value: "5.5 – 6.8" },
      { label: "EC (buffered)", value: "<0.5 mS/cm" },
      { label: "Water Retention", value: "Up to 10× dry weight" },
      { label: "Air-Filled Porosity", value: "~22% (even when saturated)" },
      { label: "CEC", value: "40 – 100 meq/100g" },
      { label: "Origin", value: "Tamil Nadu / Kerala, India" },
    ],
    usage_note:
      "Base ingredient in all potting mixes at 40–50% by volume. Mix 60:40 with perlite or pumice for most plants. Max 20% for succulents. Soak compressed block in water for 15 minutes before first use.",
    texture_class: "texture-perlite",
    has_size_guide: false,
  },
  {
    slug: "vermicompost",
    name: "Vermicompost",
    category: "Organic Fertiliser",
    tagline:
      "Living nutrition. Not just fertiliser. Vermicompost is what happens when earthworms process organic matter through their gut. The result contains plant growth hormones, beneficial microbes, and a full NPK profile — things no synthetic fertiliser can replicate.",
    meta_description:
      "Buy premium vermicompost in India. Living nutrition with plant growth hormones, beneficial microbes and full NPK profile. From ₹99.",
    image_main: "vermicompost-plain.jpg",
    image_thumb: null,
    highlights: [
      "Contains auxins, gibberellins and cytokinins — plant growth hormones no NPK can replicate",
      "Microbial diversity 10–20× higher than raw compost",
      "Slow-release NPK — zero burn risk even at generous doses",
      "Full NPK: 1–2.5% N, 0.9–1.7% P, 1–2.5% K",
      "pH 6.5–7.5 — compatible with nearly every plant type",
      "BIS IS 16702:2018 compliant — verified quality standard",
    ],
    specs: [
      { label: "Nitrogen (N)", value: "1.0 – 2.5%" },
      { label: "Phosphorus (P₂O₅)", value: "0.9 – 1.7%" },
      { label: "Potassium (K₂O)", value: "1.0 – 2.5%" },
      { label: "pH", value: "6.5 – 7.5" },
      { label: "CEC", value: "50 – 100 meq/100g" },
      { label: "Standard", value: "FCO 1985 / BIS IS 16702:2018" },
    ],
    usage_note:
      "20–30% by volume for most plants. Top dress every 6–8 weeks. Max 5% in seed-starting mixes — growth hormones in high concentration can suppress delicate seedling roots.",
    texture_class: "texture-pumice",
    has_size_guide: false,
  },
  {
    slug: "neem-cake",
    name: "Neem Cake",
    category: "Organic Soil Amendment",
    tagline:
      "Feed your soil. Defend your roots. Cold-pressed neem cake is the residue left after extracting oil from neem seeds — simultaneously a slow-release organic fertiliser (NPK 4:1:2) and a powerful soil defender that disrupts pest life cycles, deters nematodes, and suppresses fungal pathogens.",
    meta_description:
      "Buy cold-pressed neem cake in India. Organic slow-release fertiliser and natural soil defender — NPK 4:1:2, controls nematodes and pests. From ₹99.",
    image_main: "neemcake-plain.jpg",
    image_thumb: null,
    highlights: [
      "Cold-pressed only — 800–2000+ ppm azadirachtin retained (solvent-extracted has 50–300 ppm)",
      "Seven modes of pest defence — antifeedant, IGR, repellent, oviposition deterrent, nematicide, antifungal, systemic",
      "Controls root-knot nematodes, white grubs and fungus gnats",
      "Slow-release nitrogen (NPK ~4:1:2) with built-in nitrification inhibitor",
      "Safe for beneficial soil microbes and earthworms",
      "8–15% residual oil confirms cold-pressed quality — oily sheen, strong pungent smell",
    ],
    specs: [
      { label: "Nitrogen (N)", value: "3 – 5%" },
      { label: "Azadirachtin", value: "800 – 2000+ ppm (cold-pressed)" },
      { label: "Residual Oil", value: "8 – 15%" },
      { label: "Potassium (K₂O)", value: "1 – 2%" },
      { label: "Processing", value: "Cold-pressed (not solvent-extracted)" },
      { label: "Origin", value: "Telangana / Rajasthan, India" },
    ],
    usage_note:
      "Top dress every 4–6 weeks. Mix 5% by volume into potting mix at planting time. Never use in seed-starting mixes — bioactive compounds can suppress delicate seedling roots.",
    texture_class: "texture-perlite",
    has_size_guide: false,
  },
];

export function getProduct(slug: string): ProductDef | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
