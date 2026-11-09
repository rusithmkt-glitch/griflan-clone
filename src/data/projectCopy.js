const copy = {
  voltfuel: {
    year: "2026",
    role: "Identity · E-commerce · Launch film",
    summary: [
      "Voltfuel came to us with a great formula and a forgettable shelf presence. We rebuilt the brand around a single idea — controlled aggression — and carried it from the tub lid to the checkout flow.",
      "A charged red, blackout typography and a bolt marque that reads at arm's length or across a stadium. The storefront ships in three markets and converts like a landing page twice its size.",
    ],
    stats: [
      ["+38%", "DTC conversion"],
      ["3", "Launch markets"],
      ["6 wks", "Identity to ship"],
    ],
  },
  sunnyface: {
    year: "2026",
    role: "Identity · Packaging · Design system",
    summary: [
      "Better-for-you candy usually whispers. Sunnyface shouts in yellow. We built a smile-first identity that owns the fixture and survives a 40mm wrapper.",
      "A rounded serif, a six-swatch fruit palette and a packaging system that scales from single bars to variety cartons without losing the grin.",
    ],
    stats: [
      ["#1", "Category shelf standout"],
      ["14", "SKUs at launch"],
      ["+52%", "Repeat purchase"],
    ],
  },
  upshop: {
    year: "2025",
    role: "Identity · Product · Motion",
    summary: [
      "Upshop powers checkout for thousands of storefronts, yet nobody knew the name. We gave the infrastructure a face: a looping marque, a deep-green system and a product language that feels calm under load.",
      "The identity flexes from developer docs to a consumer-facing pay button, with motion guidelines that keep every transition under 240ms.",
    ],
    stats: [
      ["2.1M", "Monthly checkouts"],
      ["-31%", "Support tickets"],
      ["99.98%", "Uptime badge"],
    ],
  },
  northtrail: {
    year: "2025",
    role: "Strategy · Web · Editorial",
    summary: [
      "Retirement marketing is all beige handshakes. Northtrail wanted the opposite: a brand about momentum, not winding down. We set a quiet serif against field-guide greens and brass.",
      "An editorial system of trail markers, contour lines and plain-spoken copy turns a complex wealth product into a journey people actually finish.",
    ],
    stats: [
      ["+44%", "Qualified leads"],
      ["8", "Content pillars"],
      ["4.8", "Trust score"],
    ],
  },
  "new-engen": {
    year: "2026",
    role: "Identity · Campaign · Motion",
    summary: [
      "New Engen grows brands for a living, so their own had to out-grow everyone else's. We built an acid-green identity with a hexagonal seed marque and a campaign engine that ships weekly.",
      "Genuine. Impact. Two words, one system: every asset is generated from a single grid so the studio can move at client speed without drifting off-brand.",
    ],
    stats: [
      ["+61%", "Inbound briefs"],
      ["2", "Studio launches"],
      ["120+", "Campaign assets"],
    ],
  },
  "acorn-suite": {
    year: "2025",
    role: "Product · Design system · Identity",
    summary: [
      "Acorn's creator tools were powerful and scattered. We unified five products under one canopy: a mint-and-teal system, a shared component library and an identity that grows with the user.",
      "From first upload to paid subscription, the suite now reads as one continuous surface instead of five disconnected apps.",
    ],
    stats: [
      ["5→1", "Products unified"],
      ["+27%", "Activation"],
      ["180", "System components"],
    ],
  },
  mailerbest: {
    year: "2026",
    role: "Identity · Web · Illustration",
    summary: [
      "Email is the oldest channel on the internet and the most ignored. Mailerbest hired us to make opening mail feel like a small event. Acid yellow, hand-drawn illustration and a wordmark with a wink.",
      "The site demos the product in the browser: scroll and watch a campaign assemble itself, then send yourself a proof in one click.",
    ],
    stats: [
      ["+33%", "Open rate"],
      ["9", "Illustration sets"],
      ["2.4x", "Trial starts"],
    ],
  },
  tinyfish: {
    year: "2025",
    role: "Identity · Product · Motion",
    summary: [
      "Small loans carry big stigma. Tinyfish asked for a brand that feels like relief, not debt. We answered with sea-glass teal, a swimming marque and copy that never talks down.",
      "The product onboards in under two minutes and explains every fee in plain language — the identity's calm is the product's calm.",
    ],
    stats: [
      ["$47M", "Series B raised"],
      ["<2 min", "Onboarding"],
      ["4.9", "App store rating"],
    ],
  },
  cogito: {
    year: "2026",
    role: "Strategy · Identity · Motion",
    summary: [
      "Applied-AI brands all reach for the same gradient orb. Cogito wanted thought made visible: a violet spark marque, a reasoning-grid pattern and a voice that explains rather than impresses.",
      "We built the identity to survive being acquired — modular enough to sit inside a parent brand without losing its edge.",
    ],
    stats: [
      ["$250M", "Acquisition"],
      ["+48%", "Demo requests"],
      ["1", "Very happy exit"],
    ],
  },
  mem: {
    year: "2025",
    role: "Art direction · Identity · Editorial",
    summary: [
      "MEM is a culture desk with strong opinions. We gave it a red oval stamp, a newsprint grid and a type system that treats headlines like posters.",
      "Every story ships with its own cover art generated from the same rules, so the feed reads as one loud, coherent magazine.",
    ],
    stats: [
      ["3x", "Share rate"],
      ["40+", "Cover artists"],
      ["1", "Unmistakable feed"],
    ],
  },
  gridline: {
    year: "2026",
    role: "Identity · Editorial · Print",
    summary: [
      "An architecture studio that draws before it builds. Gridline's identity is a drawing set: brass rules, blueprint slate and a serif that behaves like a dimension line.",
      "Print and web share one grid, so a project sheet, a monograph and the website feel like the same instrument at different scales.",
    ],
    stats: [
      ["11", "Monographs printed"],
      ["+29%", "Competition wins"],
      ["2", "Design awards"],
    ],
  },
  aurora: {
    year: "2026",
    role: "Product · Identity · Design system",
    summary: [
      "Open finance is plumbing; Aurora wanted it to feel like weather. We built a night-sky system with a moving light band and a product UI that glows only where money moves.",
      "The design system encodes trust: every balance, consent and connection state has its own colour and motion, audited for accessibility.",
    ],
    stats: [
      ["+40%", "Account links"],
      ["AA", "Contrast audited"],
      ["16", "Bank connectors"],
    ],
  },
};

export function getCopy(slug) {
  return (
    copy[slug] || {
      year: "2026",
      role: "Identity · Web · Motion",
      summary: [
        "A full brand build from strategy to shipped product.",
        "One system, every surface.",
      ],
      stats: [
        ["1", "Identity"],
        ["1", "Website"],
        ["1", "Motion kit"],
      ],
    }
  );
}

export default copy;