// Builds Pacow_Media_Webinar.pptx. Run from this folder: node build.js
// Needs: npm install pptxgenjs sharp. Photo: PHOTO=path/to/photo node build.js
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");

// Brand (from pacowmedia landing page)
const BG = "0A0A0C", PURPLE = "7C3CFF", LILAC = "B79CFF", WHITE = "FFFFFF",
  MUTED = "A6A1B5", CARD = "17131F", CARD_LINE = "2C2344", RED = "FF5C7A", GREEN = "3DDC97";
const FONT = "Arial";
const W = 10, H = 5.625;
const PRESENTER = "Viktorija";
const PHOTO = process.env.PHOTO || "viktorija.webp";

// "*word*" -> purple bold, "_word_" -> white bold underlined in purple
function runs(text, base) {
  const out = [];
  const re = /(\*[^*]+\*|_[^_]+_)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), options: { ...base } });
    const inner = m[0].slice(1, -1);
    if (m[0][0] === "*") out.push({ text: inner, options: { ...base, color: LILAC, bold: true } });
    else out.push({ text: inner, options: { ...base, color: WHITE, bold: true, underline: { style: "heavy", color: PURPLE } } });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), options: { ...base } });
  return out;
}

async function background(glowY, strength) {
  // Dark canvas, faint grid, purple glow - mirrors the landing page hero
  const grid = [];
  for (let x = 0; x <= 1920; x += 80) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="1080" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>`);
  for (let y = 0; y <= 1080; y += 80) grid.push(`<line x1="0" y1="${y}" x2="1920" y2="${y}" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <defs><radialGradient id="g" cx="50%" cy="${glowY}%" r="70%">
      <stop offset="0%" stop-color="#5B2BD6" stop-opacity="${strength}"/>
      <stop offset="45%" stop-color="#2A1760" stop-opacity="${strength * 0.55}"/>
      <stop offset="100%" stop-color="#0A0A0C" stop-opacity="0"/></radialGradient></defs>
    <rect width="1920" height="1080" fill="#0A0A0C"/>
    <rect width="1920" height="1080" fill="url(#g)"/>${grid.join("")}</svg>`;
  return "image/jpeg;base64," + (await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer()).toString("base64");
}

(async () => {
  const BG_MAIN = await background(115, 0.55);
  const BG_SECTION = await background(55, 0.95);
  const portrait = (await sharp(PHOTO).extract({ left: 0, top: 70, width: 600, height: 800 }).resize(420).jpeg({ quality: 80 }).toBuffer()).toString("base64");
  const square = (await sharp(PHOTO).extract({ left: 20, top: 90, width: 520, height: 520 }).resize(420).jpeg({ quality: 80 }).toBuffer()).toString("base64");
  const PORTRAIT = "image/jpeg;base64," + portrait, SQUARE = "image/jpeg;base64," + square;

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Pacow Media Webinar";
  pres.author = "Pacow Media";

  const chromeObjects = [
    { text: { text: "PACOW", options: { x: 0.45, y: H - 0.5, w: 0.9, h: 0.35, fontFace: FONT, fontSize: 14, bold: true, color: WHITE, valign: "middle", margin: 0 } } },
    { text: { text: ".", options: { x: 1.2, y: H - 0.5, w: 0.2, h: 0.35, fontFace: FONT, fontSize: 14, bold: true, color: PURPLE, valign: "middle", margin: 0 } } },
    { text: { text: PRESENTER + " · Pacow Media", options: { x: W - 3.45, y: H - 0.5, w: 3, h: 0.35, fontFace: FONT, fontSize: 10, color: MUTED, align: "right", valign: "middle", margin: 0 } } },
  ];
  pres.defineSlideMaster({ title: "MAIN", background: { data: BG_MAIN }, objects: chromeObjects });
  pres.defineSlideMaster({ title: "SECTION", background: { data: BG_SECTION }, objects: chromeObjects });
  const base = (master = "MAIN") => pres.addSlide({ masterName: master });
  const BODY_BOTTOM = H - 0.65;

  function pill(s, text, x, y, w) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.4, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.2 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.18, y: y + 0.14, w: 0.12, h: 0.12, fill: { color: PURPLE }, line: { color: PURPLE } });
    s.addText(text, { x: x + 0.38, y, w: w - 0.5, h: 0.4, fontFace: FONT, fontSize: 12, bold: true, color: "15121C", valign: "middle", margin: 0, isTextBox: true });
  }
  function card(s, x, y, w, h, fill = CARD, line = CARD_LINE) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: line, width: 1 }, rectRadius: 0.12 });
  }

  function statement(text, sub, notes) {
    const s = base();
    s.addText(runs(text, { color: WHITE, bold: true }), {
      x: 0.7, y: sub ? 0.5 : 0.35, w: W - 1.4, h: sub ? 2.65 : BODY_BOTTOM - 0.6,
      fontFace: FONT, fontSize: text.length > 90 ? 30 : 36, align: "center", valign: "middle", margin: 0, isTextBox: true,
    });
    if (sub) s.addText(runs(sub, { color: MUTED }), { x: 1.0, y: 3.3, w: W - 2.0, h: 1.3, fontFace: FONT, fontSize: 19, align: "center", valign: "top", margin: 0, isTextBox: true });
    if (notes) s.addNotes(notes);
    return s;
  }

  function section(kicker, title, notes) {
    const s = base("SECTION");
    if (kicker) pill(s, kicker, W / 2 - 0.8, 1.25, 1.6);
    s.addText(title, { x: 0.7, y: kicker ? 1.9 : 1.3, w: W - 1.4, h: 1.9, fontFace: FONT, fontSize: 38, bold: true, color: WHITE, align: "center", valign: "top", margin: 0, isTextBox: true });
    if (notes) s.addNotes(notes);
    return s;
  }

  function title(s, text, y = 0.4) {
    s.addText(runs(text, { color: WHITE, bold: true }), { x: 0.6, y, w: W - 1.2, h: 0.75, fontFace: FONT, fontSize: text.replace(/[*_]/g, "").length > 38 ? 25 : 30, valign: "middle", margin: 0, isTextBox: true });
  }

  function list(heading, items, opts = {}) {
    const s = base();
    title(s, heading);
    const top = 1.35, avail = BODY_BOTTOM - top - 0.15;
    const gap = 0.14, rowH = Math.min(0.78, (avail - gap * (items.length - 1)) / items.length);
    items.forEach((it, i) => {
      const y = top + i * (rowH + gap);
      card(s, 0.6, y, W - 1.2, rowH);
      const mark = opts.marker === "x" ? "✕" : opts.marker === "check" ? "✓" : String(i + 1);
      const mc = opts.marker === "x" ? RED : opts.marker === "check" ? GREEN : PURPLE;
      s.addShape(pres.shapes.OVAL, { x: 0.78, y: y + (rowH - 0.42) / 2, w: 0.42, h: 0.42, fill: { color: mc }, line: { color: mc } });
      s.addText(mark, { x: 0.78, y: y + (rowH - 0.42) / 2, w: 0.42, h: 0.42, fontFace: FONT, fontSize: 15, bold: true, color: opts.marker ? BG : WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(runs(it, { color: WHITE }), { x: 1.4, y, w: W - 2.2, h: rowH, fontFace: FONT, fontSize: rowH < 0.62 ? 15 : 18, valign: "middle", margin: 0, isTextBox: true });
    });
    if (opts.notes) s.addNotes(opts.notes);
    return s;
  }

  function cards(heading, items, opts = {}) {
    const s = base();
    if (heading) title(s, heading);
    const n = items.length, gap = 0.3, cw = (W - 1.2 - gap * (n - 1)) / n;
    const top = heading ? 1.45 : 1.1, ch = Math.min(BODY_BOTTOM - top - 0.2, 2.8);
    items.forEach((it, i) => {
      const x = 0.6 + i * (cw + gap);
      card(s, x, top, cw, ch);
      s.addText(it.big, { x: x + 0.25, y: top + 0.3, w: cw - 0.5, h: 0.9, fontFace: FONT, fontSize: it.bigSize || (n > 3 ? 26 : 34), bold: true, color: it.color || LILAC, valign: "top", margin: 0, isTextBox: true });
      s.addText(runs(it.text, { color: WHITE }), { x: x + 0.25, y: top + 1.25, w: cw - 0.5, h: ch - 1.5, fontFace: FONT, fontSize: n > 3 ? 16 : 20, valign: "top", margin: 0, isTextBox: true });
    });
    if (opts.notes) s.addNotes(opts.notes);
    return s;
  }

  function flow(heading, steps, sub, notes) {
    const s = base();
    title(s, heading);
    const n = steps.length, arrow = 0.28, bw = (W - 1.2 - arrow * (n - 1)) / n, top = 1.6, bh = 1.75;
    steps.forEach((st, i) => {
      const x = 0.6 + i * (bw + arrow), last = i === n - 1;
      card(s, x, top, bw, bh, last ? PURPLE : CARD, last ? PURPLE : CARD_LINE);
      s.addText(st[0], { x: x + 0.08, y: top + 0.15, w: bw - 0.16, h: 0.6, fontFace: FONT, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(st[1], { x: x + 0.08, y: top + 0.8, w: bw - 0.16, h: 0.85, fontFace: FONT, fontSize: 11.5, color: last ? "EDE6FF" : MUTED, align: "center", valign: "top", margin: 0, isTextBox: true });
      if (!last) s.addText("→", { x: x + bw, y: top + bh / 2 - 0.25, w: arrow, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: LILAC, align: "center", valign: "middle", margin: 0, isTextBox: true });
    });
    if (sub) s.addText(runs(sub, { color: MUTED }), { x: 0.6, y: top + bh + 0.35, w: W - 1.2, h: 0.6, fontFace: FONT, fontSize: 16, align: "center", margin: 0, isTextBox: true });
    if (notes) s.addNotes(notes);
    return s;
  }

  function quote(heading, text, who, role, notes) {
    const s = base();
    title(s, heading);
    card(s, 0.6, 1.35, W - 1.2, 3.35);
    s.addText("“", { x: 0.85, y: 1.35, w: 0.8, h: 0.9, fontFace: FONT, fontSize: 60, bold: true, color: PURPLE, margin: 0, isTextBox: true });
    s.addText(runs(text, { color: WHITE, italic: true }), { x: 1.1, y: 1.75, w: W - 2.2, h: 2.1, fontFace: FONT, fontSize: text.length > 220 ? 16 : 19, valign: "middle", margin: 0, isTextBox: true });
    s.addText([
      { text: who, options: { bold: true, color: WHITE, breakLine: true } },
      { text: role, options: { color: MUTED } },
    ], { x: 1.1, y: 3.9, w: W - 2.2, h: 0.65, fontFace: FONT, fontSize: 13, margin: 0, isTextBox: true });
    if (notes) s.addNotes(notes);
    return s;
  }

  // ---------------- SLIDES ----------------

  // Title
  {
    const s = base("SECTION");
    s.addImage({ data: PORTRAIT, x: 6.75, y: 0.5, w: 2.75, h: 3.67, sizing: { type: "cover", w: 2.75, h: 3.67 } });
    pill(s, "Education brands & course creators", 0.6, 0.7, 3.9);
    s.addText(runs("How Education Brands Add _10‑20+ New Students_ a Month With Facebook & Instagram Ads", { color: WHITE, bold: true }), {
      x: 0.6, y: 1.3, w: 5.9, h: 2.3, fontFace: FONT, fontSize: 28, valign: "middle", margin: 0, isTextBox: true,
    });
    s.addText([
      { text: "Using ", options: { color: MUTED } },
      { text: "GrowthOS™", options: { color: WHITE, bold: true } },
      { text: " – our Meta & Instagram ads system, live in 14 days", options: { color: MUTED } },
    ], { x: 0.6, y: 3.75, w: 5.9, h: 0.7, fontFace: FONT, fontSize: 15, valign: "top", margin: 0, isTextBox: true });
    s.addNotes("Welcome everyone in. Promise: by the end they'll know the 5-step system we use to turn Facebook & Instagram ads into qualified calls and new students.");
  }

  statement("Stay until the end… there's a *bonus* 😉", "Everyone who stays gets something to help them put this into action.", "The bonus is the free Growth Call near the end. Tease it now so people stay.");

  cards("There's a good chance you feel…", [
    { big: "Exhausted", text: "from posting content every week with *no enrolments* to show for it" },
    { big: "Frustrated", text: "that growth depends on referrals, word of mouth and *seasonal spikes*" },
  ]);

  statement("Or worse… the people who DO enquire are *not a fit*, and can't afford your programme", null, "Pause here. This is the pain point most education founders mention first on calls.");

  cards("And what you actually want is…", [
    { big: "Predictable", text: "new students enrolling *every single month*, not just in peak season" },
    { big: "Freedom", text: "to focus on *teaching and delivery*, not chasing leads" },
  ]);

  statement("To get there, you need a *predictable way* to fill your programme month after month");
  statement("That's exactly what we're covering *today*");

  section("", "Before we dive in…");

  statement("Organic reach keeps *shrinking*", "Posting more often isn't a growth strategy. It's a lottery ticket.");
  statement("Referrals are great… but you can't *schedule* them", "When enrolments depend on word of mouth, revenue rises and falls with the school calendar.");

  section("The old way", "Boosted posts & cookie-cutter agencies");

  list("Problems with this approach…", [
    "Generic ads that could be for *any business*",
    "Leads that enquire… and *never book*",
    "No follow-up, so interested families *go cold*",
    "Money spent with *no idea* what's actually working",
  ], { marker: "x" });

  statement("“We tried ads before… and it *didn't work*.”", "We hear this on almost every call.");
  statement("The ads weren't the problem. The *system behind them* was.");

  cards("What was missing…", [
    { big: "Offer", text: "A clear, *specific* promise for one type of student" },
    { big: "Filter", text: "Qualification, so only *serious families* book" },
    { big: "Follow-up", text: "Funnel + automation that gets people *to show up*" },
    { big: "Sales", text: "A process that turns calls into *enrolments*" },
  ]);

  statement("So we asked: when does someone actually *enrol* in a high-ticket programme?");

  cards(null, [
    { big: "After they WATCH you", bigSize: 24, text: "Video lets them see how you teach and think, so *trust* is built before the call" },
    { big: "After they TALK to you", bigSize: 24, text: "A *real conversation* is where parents and students decide to invest" },
  ]);

  statement("How do we bring those two together, *at scale*?");

  statement("Introducing… *GrowthOS™*", "Meta & Instagram ads + a qualifying funnel + automation + a sales process, all working together.");

  flow("How GrowthOS™ works", [
    ["Meta Ad", "Speaks to one student & one problem"],
    ["Qualify", "Short form: budget, intent & fit"],
    ["VSL + Booking", "They watch you, then pick a time"],
    ["Automation", "Email + SMS reminders & nurture"],
    ["Growth Call", "Only qualified, warmed-up leads"],
    ["New Student", "Month after month"],
  ], "Every piece is built to *filter out* the wrong people and *warm up* the right ones.");

  list("My goals for this training…", [
    "Show you why ads *alone* don't work, and what's actually missing",
    "Walk you through the *5 steps* we use to turn ads into enrolments",
    "Show you how to *automate* it, so you can focus on your students",
  ]);

  // About me
  {
    const s = base();
    s.addImage({ data: SQUARE, x: 0.6, y: 0.5, w: 3.5, h: 3.5, sizing: { type: "cover", w: 3.5, h: 3.5 } });
    s.addText(runs("Hey, I'm *Viktorija* 👋", { color: WHITE, bold: true }), { x: 4.5, y: 0.5, w: 5, h: 0.7, fontFace: FONT, fontSize: 28, margin: 0, isTextBox: true });
    s.addText([
      { text: "I co-run Pacow Media with Ema", options: { bullet: true, breakLine: true } },
      { text: "We build Facebook & Instagram ad systems for education brands & course creators", options: { bullet: true, breakLine: true } },
      { text: "35+ education brands trust us, from tutoring to test prep to online schools", options: { bullet: true, breakLine: true } },
      { text: "[Add a personal detail: where you're based, background, a fun fact]", options: { bullet: true } },
    ], { x: 4.5, y: 1.35, w: 5, h: 2.8, fontFace: FONT, fontSize: 16, color: WHITE, paraSpaceAfter: 10, valign: "top", margin: 0, isTextBox: true });
    s.addNotes("Personalise the last bullet before presenting. Keep this slide short, 30–45 seconds.");
  }

  section("", "And it works…");

  // Headline stats
  {
    const s = base();
    title(s, "The results so far…");
    const stats = [["$5M+", "in client revenue generated"], ["4–7x", "average return on ad spend"], ["35+", "education brands"], ["98%", "client satisfaction"]];
    const gap = 0.3, cw = (W - 1.2 - gap * 3) / 4;
    stats.forEach(([n, l], i) => {
      const x = 0.6 + i * (cw + gap);
      card(s, x, 1.5, cw, 2.4);
      s.addText(n, { x, y: 1.8, w: cw, h: 1.0, fontFace: FONT, fontSize: 40, bold: true, color: LILAC, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(l, { x: x + 0.15, y: 2.85, w: cw - 0.3, h: 0.8, fontFace: FONT, fontSize: 14, color: WHITE, align: "center", valign: "top", margin: 0, isTextBox: true });
    });
    s.addNotes("Same numbers as the landing page.");
  }

  // Client results grid
  {
    const s = base();
    title(s, "What our clients are seeing");
    const res = [
      ["$250,000", "added in 60 days", "Sarah Mack · SeoulQuest"],
      ["$71,000", "added from a $4K budget", "Julian Millidge · Englisher"],
      ["$170,000", "added in 3 months", "Alex Willson · Lingua Verna"],
      ["17", "booked calls in 30 days", "Eric R. · Rath Tutoring"],
      ["30+", "booked calls in 60 days", "Mo Kaushal · MK Elite Tutoring"],
      ["$1 → $6", "return on every dollar", "Jonjo W. · Sankakoo Coding Bootcamp"],
    ];
    const gx = 0.25, gy = 0.2, cw = (W - 1.2 - gx * 2) / 3, ch = 1.45;
    res.forEach(([big, what, who], i) => {
      const x = 0.6 + (i % 3) * (cw + gx), y = 1.3 + Math.floor(i / 3) * (ch + gy);
      card(s, x, y, cw, ch);
      s.addText(big, { x: x + 0.2, y: y + 0.12, w: cw - 0.4, h: 0.55, fontFace: FONT, fontSize: 24, bold: true, color: LILAC, margin: 0, isTextBox: true });
      s.addText(what, { x: x + 0.2, y: y + 0.66, w: cw - 0.4, h: 0.35, fontFace: FONT, fontSize: 13, color: WHITE, margin: 0, isTextBox: true });
      s.addText(who, { x: x + 0.2, y: y + 1.02, w: cw - 0.4, h: 0.3, fontFace: FONT, fontSize: 10.5, color: MUTED, margin: 0, isTextBox: true });
    });
  }

  quote("“Paid back my investment in *7 days*”",
    "I run a live online Arabic program for adults. Other agencies handed me cookie-cutter funnels and generic ad copy. Pacow learned the product, studied my audience, and built a funnel that fits the way my business actually works. I paid back my entire investment within the first 7 days of going live.",
    "Alex Willson", "Founder @ Lingua Verna");

  quote("In their own words…",
    "Ema and Viktorija were so helpful throughout the whole process, from setting up the funnel to helping us make advertising materials to sales coaching. Their skills and wisdom helped us achieve in just a few months what would have taken us forever to figure out ourselves.",
    "Anna Chen Teunis", "Co-Founder @ Sigma Education");

  statement("I'm going to show you the *5 steps*…", "The exact process we use with every education brand we work with.");

  const STEPS = [
    "*Step 1:* Strategy, Offer & Database Reactivation",
    "*Step 2:* Facebook & Instagram Ads that filter for the right students",
    "*Step 3:* Lead Qualification",
    "*Step 4:* Funnel, CRM & Full Automation",
    "*Step 5:* Sales Coaching, Optimisation & Scale",
  ];
  list("The 5 steps of GrowthOS™", STEPS);

  // STEP 1
  section("Step 1", "Strategy, Offer & Database Reactivation");
  statement("A muddy offer *kills campaigns*… no matter how good the ads are");
  cards("Your offer needs ONE of each…", [
    { big: "1", text: "*Student* you serve" },
    { big: "1", text: "*Problem* you solve" },
    { big: "1", text: "*Solution* you deliver" },
    { big: "1", text: "*Promise* you make" },
  ], { notes: "Add: …and one guarantee that backs it up." });
  statement("Your headline must *call out your ideal student* and name their problem or goal");
  list("Examples…", [
    "“How busy professionals become *conversational in Spanish* in 90 days”",
    "“The *SAT prep plan* that gets students 150+ points higher, without cramming”",
    "“How tutoring centres fill *fall enrolment* in 30 days”",
  ], { notes: "Illustrative examples. Swap in real headlines from client campaigns if you prefer." });
  statement("Your old leads are sitting on *money*", "While we build, we reactivate your existing database. In most cases that brings 1–3 extra sales in the first two weeks, before a single ad goes live.");

  // STEP 2
  section("Step 2", "Facebook & Instagram Ads");
  statement("The ad is your *first filter*", "The copy and targeting should turn away the wrong people and attract the right families and students.");
  list("How we run it…", [
    "Launch *3–10 ad angles* built from your ideal student's top pain points",
    "Start at *$100+/day* in ad spend",
    "Track *cost per lead, cost per booked call* and lead quality from day one",
    "*Kill* what isn't working, *scale* what is",
  ]);

  // STEP 3
  section("Step 3", "Lead Qualification");
  flow("Two layers of filtering", [
    ["Layer 1: The Ad", "Targeting + messaging repel the wrong people"],
    ["Layer 2: The Form", "Questions screen for budget, intent & fit"],
    ["Your Calendar", "Only people who pass both can book"],
  ], "Your time is protected and your *close rate goes up*.");
  statement("Pro tip: qualify enough… but *not too much*", "Too many questions cause a big drop-off. Keep only the ones that decide fit.");

  // STEP 4
  section("Step 4", "Funnel, CRM & Full Automation");
  cards("What we build…", [
    { big: "Funnel", bigSize: 24, text: "Landing page, VSL and call booking flow" },
    { big: "Reminders", bigSize: 24, text: "Automated email + SMS confirmations and reminders" },
    { big: "CRM", bigSize: 24, text: "Pipeline stages, no-show follow-up and nurture" },
  ]);
  statement("The moment someone books, the *system takes over*", "It reminds them, warms them up, and gets them to show up ready to enrol, without you chasing anyone.");

  list("Quick check-in…", [
    "How are you doing so far?",
    "Can you see how *powerful* this can be?",
    "Can you see how this could bring you *more students*?",
  ], { notes: "Ask them to reply in the chat. Read a few answers out loud." });

  // STEP 5
  section("Step 5", "Sales Coaching, Optimisation & Scale");
  statement("A *10% lift* in your close rate = thousands more every month… with the _same ad spend_");
  {
    const s = base();
    title(s, "The numbers we watch");
    const rows = [
      ["Click-through rate", "> 1%"],
      ["Qualified lead → booked call", "> 65%"],
      ["Show-up rate", "> 75%"],
      ["Close rate", "> 30%"],
      ["Return on contracted revenue", "> 4x"],
      ["Return on cash collected", "> 2x"],
    ];
    const hdr = { bold: true, color: WHITE, fill: { color: PURPLE } };
    s.addTable([
      [{ text: "Metric", options: hdr }, { text: "Target", options: { ...hdr, align: "center" } }],
      ...rows.map(([a, b], i) => [
        { text: a, options: { color: WHITE, fill: { color: i % 2 ? "120F18" : CARD } } },
        { text: b, options: { align: "center", bold: true, color: LILAC, fill: { color: i % 2 ? "120F18" : CARD } } },
      ]),
    ], { x: 1.5, y: 1.3, w: 7, colW: [4.6, 2.4], fontFace: FONT, fontSize: 14, rowH: 0.4, border: { type: "solid", pt: 0.5, color: CARD_LINE }, valign: "middle" });
    s.addNotes("Targets from our reporting sheets.");
  }

  // 90-day journey
  {
    const s = base();
    title(s, "The *90-day* journey");
    const phases = [
      ["01", "Week 1", "Welcome & setup", "Done for you", "GrowthOS™ portal, 1:1 onboarding with Ema & Viktorija, private Slack, ad accounts & tracking connected"],
      ["02", "Weeks 2–4", "Strategy & build", "Done for you", "Offer, ads, landing pages, funnel and sales process built. Ads live in 14 days"],
      ["03", "Days 30–90", "Optimise & grow", "Coaching", "We optimise the campaigns and coach you and your team on sales as we scale"],
    ];
    const gap = 0.3, cw = (W - 1.2 - gap * 2) / 3, top = 1.35, ch = 3.3;
    phases.forEach(([n, when, what, tag, desc], i) => {
      const x = 0.6 + i * (cw + gap);
      card(s, x, top, cw, ch);
      s.addText(n, { x: x + 0.25, y: top + 0.2, w: 1, h: 0.5, fontFace: FONT, fontSize: 26, bold: true, color: PURPLE, margin: 0, isTextBox: true });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + cw - 1.45, y: top + 0.27, w: 1.2, h: 0.32, fill: { color: i < 2 ? PURPLE : "2C2344" }, line: { color: i < 2 ? PURPLE : "2C2344" }, rectRadius: 0.16 });
      s.addText(tag, { x: x + cw - 1.45, y: top + 0.27, w: 1.2, h: 0.32, fontFace: FONT, fontSize: 10, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(when, { x: x + 0.25, y: top + 0.85, w: cw - 0.5, h: 0.3, fontFace: FONT, fontSize: 12, color: MUTED, margin: 0, isTextBox: true });
      s.addText(what, { x: x + 0.25, y: top + 1.15, w: cw - 0.5, h: 0.45, fontFace: FONT, fontSize: 18, bold: true, color: WHITE, margin: 0, isTextBox: true });
      s.addText(desc, { x: x + 0.25, y: top + 1.7, w: cw - 0.5, h: 1.45, fontFace: FONT, fontSize: 12.5, color: MUTED, valign: "top", margin: 0, isTextBox: true });
    });
  }

  list("Let's recap the 5 steps", STEPS);

  statement("If you followed these 5 steps, do you think you'd get *more students* every month?", null, "Get them to answer in the chat.");
  statement("And you'd never have to rely on *referrals and luck* again…");
  statement("Let me ask you a *question*…");
  statement("Would you like us to build this *for you*?", "The first month is fully done for you. Then we optimise and coach you as we grow.");

  // What's included
  {
    const s = base();
    title(s, "Working with *Pacow*");
    const left = [
      "Offer & messaging strategy",
      "Ad scripts written & ads edited for you",
      "Landing pages, VSL & full funnel",
      "CRM, email & SMS automation",
    ];
    const right = [
      "Media buying & weekly optimisation",
      "Sales process, scripts & call reviews",
      "1:1 coaching with Ema & Viktorija",
      "Private Slack + GrowthOS™ portal",
    ];
    [left, right].forEach((col, c) => col.forEach((t, i) => {
      const x = 0.6 + c * 4.5, y = 1.45 + i * 0.72;
      s.addShape(pres.shapes.OVAL, { x, y: y + 0.07, w: 0.36, h: 0.36, fill: { color: PURPLE }, line: { color: PURPLE } });
      s.addText("✓", { x, y: y + 0.07, w: 0.36, h: 0.36, fontFace: FONT, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(t, { x: x + 0.5, y, w: 3.8, h: 0.5, fontFace: FONT, fontSize: 15, color: WHITE, valign: "middle", margin: 0, isTextBox: true });
    }));
    s.addNotes("Check this list matches the offer you're pitching on this webinar. Price isn't shown; cover it on the call.");
  }

  list("This is for you if…", [
    "You're an *education brand or course creator* already earning $10K+/month",
    "You've tried ads or content and *hit a ceiling*",
    "You get great results, but *growth is inconsistent*",
    "You can invest *$100+/day* in ad spend",
  ], { marker: "check" });

  list("This is NOT for you if…", [
    "You're just starting out, with *no offer or revenue*",
    "You want a *quick hack*, not a system",
    "You have *no budget* for paid advertising yet",
    "You want to hand it off and stay *completely hands-off*",
  ], { marker: "x" });

  // Guarantee
  {
    const s = base("SECTION");
    pill(s, "Try it risk free", W / 2 - 0.95, 0.6, 1.9);
    s.addText("No-Results, No-Pay Guarantee", { x: 0.6, y: 1.2, w: W - 1.2, h: 0.8, fontFace: FONT, fontSize: 34, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(runs("If we don't generate *15–30 qualified booked calls in 90 days*, we work for free until you do.", { color: WHITE }), { x: 1.2, y: 2.15, w: W - 2.4, h: 1.2, fontFace: FONT, fontSize: 20, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText("We win when you win.", { x: 0.6, y: 3.5, w: W - 1.2, h: 0.5, fontFace: FONT, fontSize: 16, italic: true, color: MUTED, align: "center", margin: 0, isTextBox: true });
    s.addNotes("Same guarantee as the landing page. Mention the conditions (ad spend, showing up to calls, applying the process) if you're asked.");
  }

  statement("🎁 *Bonus* for everyone who stayed:", "A free Growth Call. We'll look at your offer and funnel and map out your ad strategy.");

  // CTA
  {
    const s = base("SECTION");
    s.addText(runs("Ready to add _10‑20+ students_ a month? 👋", { color: WHITE, bold: true }), { x: 0.6, y: 0.7, w: W - 1.2, h: 1.1, fontFace: FONT, fontSize: 34, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.75, y: 2.1, w: 4.5, h: 0.85, fill: { color: PURPLE }, line: { color: PURPLE }, rectRadius: 0.42 });
    s.addText("Book your free Growth Call →", { x: 2.75, y: 2.1, w: 4.5, h: 0.85, fontFace: FONT, fontSize: 20, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText("Only 3 spots per month · link in the chat", { x: 0.6, y: 3.15, w: W - 1.2, h: 0.4, fontFace: FONT, fontSize: 14, color: MUTED, align: "center", margin: 0, isTextBox: true });
    s.addText("[Paste your booking link here]", { x: 0.6, y: 3.65, w: W - 1.2, h: 0.4, fontFace: FONT, fontSize: 13, color: LILAC, align: "center", margin: 0, isTextBox: true });
    s.addNotes("Replace the placeholder with the live booking link and drop it in the chat. Stay on this slide for Q&A.");
  }

  await pres.writeFile({ fileName: "Pacow_Media_Webinar.raw.pptx" });
  console.log("slides:", pres.slides.length);
})();
