export type Guide = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  content: Section[];
};

type Section = {
  heading?: string;
  body?: string;
  list?: string[];
};

export const guides: Guide[] = [
  {
    slug: "building-the-perfect-potting-mix",
    title: "Building the Perfect Potting Mix",
    category: "Mixing Guides",
    excerpt: "A well-built potting mix is the foundation of healthy container plants. Learn how to combine amendments for drainage, aeration, and nutrition.",
    readTime: "5 min read",
    content: [
      {
        body: "The biggest mistake container gardeners make is reaching for off-the-shelf potting soil and calling it done. Commercial mixes compact over time, retain too much moisture, and often lack the aeration that roots actually need. Building your own mix takes minutes and pays dividends for the life of your plants.",
      },
      {
        heading: "The three components of a great mix",
        body: "A good potting mix balances three things: structure (what holds the mix together), drainage (what moves water through), and nutrition (what feeds the plant).",
        list: [
          "Structure: Cocopeat or a quality potting base provides moisture retention and a root-friendly texture.",
          "Drainage & aeration: Perlite, pumice, or LECA break compaction and create air pockets around roots.",
          "Nutrition: Vermicompost or neem cake add slow-release nutrients and beneficial microbes.",
        ],
      },
      {
        heading: "A general-purpose mix (works for most houseplants)",
        body: "Start with this ratio and adjust based on your plant's needs:",
        list: [
          "50% cocopeat",
          "30% perlite",
          "20% vermicompost",
        ],
      },
      {
        heading: "For succulents and cacti",
        body: "Succulents need fast drainage above everything else. Increase the inorganic fraction significantly:",
        list: [
          "30% cocopeat",
          "40% pumice or perlite",
          "20% coarse sand or grit",
          "10% vermicompost",
        ],
      },
      {
        heading: "For orchids",
        body: "Orchids need extreme aeration and almost no moisture retention. LECA works well as a standalone medium for semi-hydro setups, or use a chunky bark-and-perlite mix.",
      },
      {
        heading: "Final tips",
        body: "Pre-wet your cocopeat before mixing. Dry coir is hydrophobic and won't absorb water evenly. Soak it, break it apart, then combine with your amendments. And always choose horticultural-grade perlite — construction-grade has different particle sizes and may contain impurities.",
      },
    ],
  },
  {
    slug: "why-drainage-matters",
    title: "Why Drainage is Everything in Container Gardening",
    category: "Basics",
    excerpt: "Root rot is the number one killer of container plants — and it's almost always a drainage problem, not a watering problem.",
    readTime: "4 min read",
    content: [
      {
        body: "When people overwater, the water is rarely the actual problem. The problem is soil that holds water too long and starves roots of oxygen. Roots need both water and air — and when a pot stays saturated for days, the air pockets collapse, beneficial bacteria die, and anaerobic conditions invite root rot.",
      },
      {
        heading: "How drainage works in a container",
        body: "In a pot, water has nowhere to go except through the drainage hole — or into the air through evaporation. Dense soil slows this process dramatically. A mix with adequate perlite or pumice creates channels that allow water to drain in minutes, not days.",
      },
      {
        heading: "Signs your mix lacks drainage",
        list: [
          "Soil stays wet for more than 4–5 days after watering",
          "You see yellowing lower leaves despite regular feeding",
          "A musty smell from the soil",
          "Wilting even when the soil is wet (classic root rot symptom)",
        ],
      },
      {
        heading: "The fix: increase your inorganic fraction",
        body: "The fastest way to improve drainage is to repot with more perlite, pumice, or LECA in the mix. For most houseplants, 25–40% perlite by volume is the sweet spot. For succulents and cacti, go higher — 40–60%.",
      },
      {
        heading: "Zeolite as a drainage aid",
        body: "Zeolite is underrated for drainage. It improves soil porosity while also capturing and slowly releasing nutrients and ammonium. Adding 10–15% zeolite to a mix improves both drainage and nutrient retention simultaneously.",
      },
    ],
  },
  {
    slug: "cocopeat-guide",
    title: "Cocopeat: The Best Organic Base Medium",
    category: "Product Guides",
    excerpt: "Cocopeat is India's most versatile growing medium — but quality varies enormously. Here's what to look for and how to use it properly.",
    readTime: "6 min read",
    content: [
      {
        body: "Cocopeat (also called coir pith or coco peat) is the fibrous material that sits between the outer shell and the inner husk of a coconut. When processed correctly, it becomes one of the most versatile growing media available — renewable, pH-neutral, and excellent at both moisture retention and aeration.",
      },
      {
        heading: "What makes good cocopeat",
        body: "Not all cocopeat is equal. The most important factors are:",
        list: [
          "Salt content: Raw coir is high in sodium and potassium salts, which can burn roots. Quality cocopeat is washed and buffered before sale.",
          "Particle size: A good mix has fine pith plus some fibre, giving structure without compaction.",
          "EC (electrical conductivity): Should be low (under 1 mS/cm) — high EC indicates salts haven't been flushed.",
          "pH: Ideal range is 5.5–6.5 for most plants.",
        ],
      },
      {
        heading: "How to rehydrate cocopeat",
        body: "Compressed cocopeat blocks expand 5–8x when rehydrated. Break the block into a large container, add water gradually, and allow it to fully absorb before mixing. Dry coir is hydrophobic — if you add it dry to a pot, it won't absorb water properly the first few weeks.",
      },
      {
        heading: "Cocopeat uses",
        list: [
          "As a standalone medium for seedlings and cuttings",
          "As the base of any potting mix (pair with perlite for drainage)",
          "In hydroponics as an inert substrate",
          "As a soil conditioner mixed into heavy garden beds",
        ],
      },
      {
        heading: "Cocopeat vs peat moss",
        body: "Peat moss is mined from ecologically sensitive bogs and takes thousands of years to regenerate. Cocopeat is a byproduct of coconut processing — India produces it in abundance. Cocopeat has similar properties to peat moss (water retention, slightly acidic pH) but is fully renewable. There's no reason to use peat moss when cocopeat is available.",
      },
    ],
  },
  {
    slug: "growing-with-leca",
    title: "Growing with LECA: A Beginner's Guide",
    category: "Hydroponics",
    excerpt: "LECA (Lightweight Expanded Clay Aggregate) lets you grow plants with near-zero risk of overwatering. Here's how the semi-hydro method works.",
    readTime: "7 min read",
    content: [
      {
        body: "LECA stands for Lightweight Expanded Clay Aggregate — small, porous clay balls that have been fired at very high temperatures until they expand. They don't compress, don't degrade, and can be washed and reused indefinitely. For a certain type of grower, LECA is life-changing.",
      },
      {
        heading: "How LECA works",
        body: "Plants grown in LECA are typically set up in a 'semi-hydro' system: the pot sits in a reservoir of nutrient solution, and the LECA wicks moisture up to the roots through capillary action. The roots at the bottom stay hydrated; the roots at the top stay in air. It's almost impossible to overwater.",
      },
      {
        heading: "What you need to get started",
        list: [
          "LECA balls (rinsed thoroughly before first use)",
          "A nursery pot with drainage holes",
          "An outer pot or tray to hold the reservoir",
          "A hydroponic nutrient solution (liquid fertiliser designed for hydroponics)",
          "A way to check EC and pH (optional but recommended)",
        ],
      },
      {
        heading: "The reservoir method step by step",
        list: [
          "Rinse LECA in clean water for several minutes to remove dust.",
          "Fill your inner pot with LECA and place your plant, spreading roots through the medium.",
          "Set the inner pot inside an outer pot or tray.",
          "Add nutrient solution to the outer pot so the bottom 1–2cm of the inner pot sits in liquid.",
          "Let the solution drop to near-zero before refilling — this creates a wet-dry cycle that strengthens roots.",
        ],
      },
      {
        heading: "Transitioning from soil to LECA",
        body: "Wash all the soil off the roots completely before moving to LECA. Soil particles left behind will rot and introduce bacteria. Soak the bare roots in clean water for a few days before planting in LECA to help them adjust to the new environment.",
      },
      {
        heading: "Best plants for LECA",
        body: "Monsteras, pothos, philodendrons, peace lilies, orchids, and most tropical foliage plants thrive in LECA. Succulents and cacti are not ideal — they prefer dry periods that the semi-hydro method doesn't provide well.",
      },
    ],
  },
  {
    slug: "vermicompost-guide",
    title: "Vermicompost: Living Nutrition for Your Plants",
    category: "Organic Inputs",
    excerpt: "Vermicompost is more than fertiliser — it's a living ecosystem in a bag. Here's how worm castings work and how to use them effectively.",
    readTime: "5 min read",
    content: [
      {
        body: "Vermicompost is organic matter that has been broken down by earthworms. What comes out the other end is something remarkable: a crumbly, dark, odourless material packed with plant-available nutrients, beneficial bacteria, growth hormones, and enzymes that dramatically improve soil life.",
      },
      {
        heading: "What's actually in vermicompost",
        list: [
          "NPK: Nitrogen, phosphorus, and potassium in plant-available form — released slowly over time",
          "Micronutrients: Calcium, magnesium, sulphur, zinc, and more",
          "Beneficial bacteria and fungi: Improve nutrient uptake and protect roots from pathogens",
          "Humic acids: Improve soil structure and nutrient chelation",
          "Plant growth hormones: Auxins and cytokinins that directly stimulate root and shoot growth",
        ],
      },
      {
        heading: "How to use vermicompost",
        list: [
          "In potting mixes: 10–20% by volume as a slow-release nutritional component",
          "As a top dressing: Apply 1–2cm around the base of established plants and water in",
          "As a liquid feed: Steep 1 part vermicompost in 5 parts water for 24 hours, strain, and apply",
          "For seed starting: Mix 10–15% into seedling mix for gentle nutrition",
        ],
      },
      {
        heading: "Quality signals to look for",
        body: "Good vermicompost is dark brown to black, earthy-smelling (like fresh soil, not compost), and crumbly — not wet or slimy. It should have no visible unprocessed organic matter. If it smells sour or has large chunks of undecomposed material, it hasn't finished processing.",
      },
      {
        heading: "Vermicompost vs chemical fertiliser",
        body: "Chemical fertilisers deliver nutrients quickly but do nothing for soil life. Repeated use of chemical-only feeding degrades soil biology over time. Vermicompost feeds the soil food web, which in turn feeds your plant — the way nature intended. Use it as your base nutrition and supplement with liquid fertilisers if needed.",
      },
    ],
  },
  {
    slug: "zeolite-soil-health",
    title: "How Zeolite Improves Soil and Water Quality",
    category: "Product Guides",
    excerpt: "Zeolite is one of the most underrated soil amendments available. Its unique crystal structure captures nutrients, improves drainage, and helps regulate pH.",
    readTime: "4 min read",
    content: [
      {
        body: "Zeolite is a naturally occurring mineral with a highly porous, cage-like crystal structure. These tiny pores give zeolite an enormous surface area — one gram of zeolite has roughly the surface area of a football field. This structure allows it to capture, store, and slowly release nutrients and water in a way few other minerals can.",
      },
      {
        heading: "What zeolite does in soil",
        list: [
          "Cation exchange: Zeolite captures ammonium (NH4+) and other positively charged nutrients, preventing them from washing out with irrigation",
          "Slow-release nutrition: Captured nutrients are released gradually as plants need them",
          "Drainage improvement: The porous structure increases soil aeration without sacrificing too much moisture",
          "pH buffering: Zeolite has mild pH-buffering properties that help maintain a stable root zone",
        ],
      },
      {
        heading: "How to use zeolite",
        list: [
          "In potting mixes: Add 10–20% by volume as a partial replacement for perlite",
          "In garden beds: Broadcast 100–200g per square metre and till into the top 15cm",
          "For lawn care: Apply 50g per square metre to improve drainage in compacted lawns",
          "In aquariums and hydroponics: Zeolite is safe and effective for capturing ammonia in water",
        ],
      },
      {
        heading: "Zeolite vs perlite",
        body: "Perlite is primarily for drainage and aeration — it has almost no nutrient value and doesn't improve water quality. Zeolite does less for drainage than perlite, but adds significant nutritional benefits. The best approach is often to use both together: perlite for drainage, zeolite for nutrient retention.",
      },
      {
        heading: "Recharging zeolite",
        body: "Over time, zeolite's cation exchange capacity can become saturated. You can 'recharge' it by soaking in a dilute solution of calcium nitrate or potassium solution, which displaces the captured ammonium and refills the exchange sites. This makes zeolite a long-term investment in your soil.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
