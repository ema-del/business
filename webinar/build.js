const pptxgen = require("pptxgenjs");
const sharp = require("sharp");

const INK = "111111", BLUE = "188DFB", GREEN = "00B050", RED = "E5383B",
  DARK = "1C1C1C", GREY = "5A5A5A", TINT = "EEF6FF", LIGHT = "F4F5F7";
const FONT = "Arial";
const W = 10, H = 5.625, FOOT = 0.5, BODY_H = H - FOOT;
const PRESENTER = "Viktorija";

// "*word*" -> blue bold run, "_word_" -> green bold run
function runs(text, base) {
  const out = [];
  const re = /(\*[^*]+\*|_[^_]+_)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), options: { ...base } });
    const color = m[0][0] === "*" ? BLUE : GREEN;
    out.push({ text: m[0].slice(1, -1), options: { ...base, color, bold: true } });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), options: { ...base } });
  return out;
}

function footer(pres, s) {
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - FOOT, w: W, h: FOOT, fill: { color: DARK }, line: { color: DARK } });
  s.addText([
    { text: "PACOW", options: { bold: true, color: "FFFFFF" } },
    { text: " MEDIA", options: { color: BLUE, bold: true } },
  ], { x: 0.45, y: H - FOOT, w: 3, h: FOOT, fontFace: FONT, fontSize: 13, charSpacing: 2, valign: "middle", margin: 0, isTextBox: true });
  s.addText(PRESENTER, { x: W - 3.45, y: H - FOOT, w: 3, h: FOOT, fontFace: FONT, fontSize: 12, color: "D0D0D0", align: "right", valign: "middle", margin: 0, isTextBox: true });
}

(async () => {
  const photo = "../images/1.webp";
  const portrait = (await sharp(photo).extract({ left: 0, top: 70, width: 600, height: 800 }).resize(420).jpeg({ quality: 78 }).toBuffer()).toString("base64");
  const square = (await sharp(photo).extract({ left: 20, top: 90, width: 520, height: 520 }).resize(420).jpeg({ quality: 78 }).toBuffer()).toString("base64");
  const PORTRAIT = "image/jpeg;base64," + portrait, SQUARE = "image/jpeg;base64," + square;

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Pacow Media Webinar";
  pres.author = "Pacow Media";

  const base = () => { const s = pres.addSlide(); s.background = { color: "FFFFFF" }; footer(pres, s); return s; };

  // Big centered statement
  function statement(text, sub, notes) {
    const s = base();
    const hasSub = !!sub;
    s.addText(runs(text, { color: INK, bold: true }), {
      x: 0.7, y: hasSub ? 0.55 : 0.4, w: W - 1.4, h: hasSub ? 2.6 : BODY_H - 0.8,
      fontFace: FONT, fontSize: text.length > 90 ? 30 : 36, align: "center", valign: "middle", margin: 0, isTextBox: true,
    });
    if (hasSub) s.addText(runs(sub, { color: GREY }), {
      x: 1.0, y: 3.3, w: W - 2.0, h: 1.2, fontFace: FONT, fontSize: 20, align: "center", valign: "top", margin: 0, isTextBox: true,
    });
    if (notes) s.addNotes(notes);
    return s;
  }

  // Blue section divider
  function section(kicker, title, notes) {
    const s = pres.addSlide();
    s.background = { color: BLUE };
    footer(pres, s);
    if (kicker) s.addText(kicker.toUpperCase(), { x: 0.7, y: 1.2, w: W - 1.4, h: 0.5, fontFace: FONT, fontSize: 16, bold: true, color: "D6EAFF", charSpacing: 4, align: "center", margin: 0, isTextBox: true });
    s.addText(title, { x: 0.7, y: kicker ? 1.75 : 1.2, w: W - 1.4, h: 1.9, fontFace: FONT, fontSize: 38, bold: true, color: "FFFFFF", align: "center", valign: "top", margin: 0, isTextBox: true });
    if (notes) s.addNotes(notes);
    return s;
  }

  function title(s, text, y = 0.4) {
    s.addText(runs(text, { color: INK, bold: true }), { x: 0.6, y, w: W - 1.2, h: 0.75, fontFace: FONT, fontSize: text.replace(/[*_]/g, "").length > 38 ? 25 : 30, align: "left", valign: "middle", margin: 0, isTextBox: true });
  }

  // Title + list of rows, each with a numbered/check marker
  function list(heading, items, opts = {}) {
    const s = base();
    title(s, heading);
    const top = 1.35, avail = BODY_H - top - 0.3;
    const gap = 0.14, rowH = Math.min(0.78, (avail - gap * (items.length - 1)) / items.length);
    items.forEach((it, i) => {
      const y = top + i * (rowH + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: W - 1.2, h: rowH, fill: { color: LIGHT }, line: { color: LIGHT }, rectRadius: 0.08 });
      const mark = opts.marker === "x" ? "✕" : opts.marker === "check" ? "✓" : String(i + 1);
      const mc = opts.marker === "x" ? RED : opts.marker === "check" ? GREEN : BLUE;
      s.addShape(pres.shapes.OVAL, { x: 0.78, y: y + (rowH - 0.42) / 2, w: 0.42, h: 0.42, fill: { color: mc }, line: { color: mc } });
      s.addText(mark, { x: 0.78, y: y + (rowH - 0.42) / 2, w: 0.42, h: 0.42, fontFace: FONT, fontSize: 15, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(runs(it, { color: INK }), { x: 1.4, y, w: W - 2.2, h: rowH, fontFace: FONT, fontSize: rowH < 0.62 ? 15 : 18, valign: "middle", margin: 0, isTextBox: true });
    });
    if (opts.notes) s.addNotes(opts.notes);
    return s;
  }

  // Title + 2-4 cards side by side
  function cards(heading, items, opts = {}) {
    const s = base();
    if (heading) title(s, heading);
    const n = items.length, gap = 0.3, x0 = 0.6, cw = (W - 1.2 - gap * (n - 1)) / n;
    const top = heading ? 1.45 : 0.6, ch = BODY_H - top - 0.45;
    items.forEach((it, i) => {
      const x = x0 + i * (cw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: top, w: cw, h: ch, fill: { color: it.fill || TINT }, line: { color: it.fill || TINT }, rectRadius: 0.12 });
      s.addText(it.big, { x: x + 0.25, y: top + 0.3, w: cw - 0.5, h: 0.9, fontFace: FONT, fontSize: it.bigSize || (n > 3 ? 26 : 34), bold: true, color: it.color || BLUE, valign: "top", margin: 0, isTextBox: true });
      s.addText(runs(it.text, { color: INK }), { x: x + 0.25, y: top + 1.25, w: cw - 0.5, h: ch - 1.5, fontFace: FONT, fontSize: n > 3 ? 14 : 17, valign: "top", margin: 0, isTextBox: true });
    });
    if (opts.notes) s.addNotes(opts.notes);
    return s;
  }

  // Horizontal flow of steps with arrows
  function flow(heading, steps, sub, notes) {
    const s = base();
    title(s, heading);
    const n = steps.length, arrow = 0.28, bw = (W - 1.2 - arrow * (n - 1)) / n, top = 1.7, bh = 1.75;
    steps.forEach((st, i) => {
      const x = 0.6 + i * (bw + arrow);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: top, w: bw, h: bh, fill: { color: i === n - 1 ? BLUE : TINT }, line: { color: i === n - 1 ? BLUE : TINT }, rectRadius: 0.1 });
      s.addText(st[0], { x: x + 0.08, y: top + 0.15, w: bw - 0.16, h: 0.6, fontFace: FONT, fontSize: 13, bold: true, color: i === n - 1 ? "FFFFFF" : INK, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(st[1], { x: x + 0.08, y: top + 0.8, w: bw - 0.16, h: 0.85, fontFace: FONT, fontSize: 10.5, color: i === n - 1 ? "FFFFFF" : GREY, align: "center", valign: "top", margin: 0, isTextBox: true });
      if (i < n - 1) s.addText("→", { x: x + bw, y: top + bh / 2 - 0.25, w: arrow, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: BLUE, align: "center", valign: "middle", margin: 0, isTextBox: true });
    });
    if (sub) s.addText(runs(sub, { color: GREY }), { x: 0.6, y: top + bh + 0.35, w: W - 1.2, h: 0.6, fontFace: FONT, fontSize: 16, align: "center", margin: 0, isTextBox: true });
    if (notes) s.addNotes(notes);
    return s;
  }

  // ---------------- SLIDES ----------------

  // 1. Title
  {
    const s = base();
    s.addImage({ data: PORTRAIT, x: 0.55, y: 0.45, w: 2.85, h: 3.8, sizing: { type: "cover", w: 2.85, h: 3.8 }, rounding: false });
    s.addText(runs("How Coaches & Education Brands Get *5–10 High-Ticket Clients* a Month With Meta Ads", { color: INK, bold: true }), {
      x: 3.85, y: 0.45, w: 5.6, h: 2.45, fontFace: FONT, fontSize: 27, valign: "middle", margin: 0, isTextBox: true,
    });
    s.addText(runs("Without cold DMs or posting all day — in _5 simple steps_…", { color: GREY }), {
      x: 3.85, y: 3.0, w: 5.6, h: 0.9, fontFace: FONT, fontSize: 18, valign: "top", margin: 0, isTextBox: true,
    });
    s.addNotes("Welcome everyone in. Introduce yourself briefly, then set the promise: by the end they'll know the 5-step system we use to turn Meta ads into booked, qualified sales calls.");
  }

  statement("Stay until the end… there's a *bonus* 😉", "Everyone who stays gets something to help them put this into action.", "The bonus is the free Growth Call on slide 62. Tease it now so people stay.");

  cards("There's a good chance you feel…", [
    { big: "Exhausted", text: "from posting on social media every week with *no clients* to show for it" },
    { big: "Frustrated", text: "from sending DMs, chasing referrals and following up… and *nobody replies*" },
  ]);

  statement("Or worse… the people who DO book a call are *not qualified* and can't afford your offer", null, "Pause here. This is the pain point most of our clients mention first on calls.");

  cards("And what you actually want is…", [
    { big: "Predictable", text: "high-ticket clients coming in *every single month*, not just in a good month", color: GREEN, fill: "EAF8EF" },
    { big: "Freedom", text: "to spend your time *delivering and growing*, not chasing leads", color: GREEN, fill: "EAF8EF" },
  ]);

  statement("To get there, you need a *predictable way* to get new clients month after month");
  statement("That's exactly what we're covering *today*");

  section("", "Before we dive in…");

  statement("Organic reach keeps *shrinking*", "Posting more often isn't a growth strategy. It's a lottery ticket.");
  statement("Referrals are great… but you can't *schedule* them", "When business depends on word of mouth, revenue goes up and down with it.");

  section("The old solution…", "Cold DMs & chasing leads");

  list("Problems with this strategy…", [
    "Most messages get *ignored*, and inboxes are more crowded than ever",
    "Even fewer turn into a *booked call*",
    "It eats *hours* of your day, every day",
    "Bottom line… it's *not predictable*",
  ], { marker: "x" });

  statement("And Meta doesn't want you to *spam* its users…", "It keeps getting harder to reach people with messages they never asked for.");

  statement("You need a strategy that brings the right people *to you*");

  statement("And conversations are still a *big part* of this…", "The difference is that people who come to you are already interested, so they reply and book far more often.");

  statement("Introducing… *The GrowthOS™ Acquisition System*", "Meta ads + a qualifying funnel + automation + a sales process, all working together.");

  list("My goals for this training…", [
    "Show you why ads *alone* don't work, and what's actually missing",
    "Walk you through the *5 steps* we use to turn ads into qualified sales calls",
    "Show you how to *automate* it, so you can focus on your clients",
  ]);

  // About me
  {
    const s = base();
    s.addImage({ data: SQUARE, x: 0.6, y: 0.5, w: 3.5, h: 3.5, sizing: { type: "cover", w: 3.5, h: 3.5 } });
    s.addText(runs("Hey, I'm *Viktorija* 👋", { color: INK, bold: true }), { x: 4.5, y: 0.5, w: 5, h: 0.7, fontFace: FONT, fontSize: 28, margin: 0, isTextBox: true });
    s.addText([
      { text: "I help run Pacow Media alongside Ema", options: { bullet: true, breakLine: true } },
      { text: "We build Meta ad systems for coaches, consultants, course creators & education brands", options: { bullet: true, breakLine: true } },
      { text: "I review our clients' sales calls, scripts and messaging, so ads turn into revenue", options: { bullet: true, breakLine: true } },
      { text: "[Add a personal detail: where you're based, background, a fun fact]", options: { bullet: true } },
    ], { x: 4.5, y: 1.35, w: 5, h: 2.8, fontFace: FONT, fontSize: 16, color: INK, paraSpaceAfter: 10, valign: "top", margin: 0, isTextBox: true });
    s.addNotes("Personalise the last bullet before presenting. Keep this slide short, 30–45 seconds.");
  }

  statement("Here's what we kept seeing on *calls*…", "Brilliant experts. Great offers. But no system to get clients consistently.");

  list("Most businesses we talk to are…", [
    "Posting on Instagram and hoping the *right people* see it",
    "Sending DMs and following up *manually*",
    "Relying on *referrals* and word of mouth",
    "Boosting posts, or paying an agency that *didn't deliver*",
  ], { marker: "x" });

  statement("“We tried ads before… and it *didn't work*.”", "We hear this on almost every call.");

  statement("The ads weren't the problem. The *system behind them* was.");

  cards("What was missing…", [
    { big: "Offer", text: "A clear, *specific* promise for one type of person" },
    { big: "Filter", text: "Qualification, so only *serious buyers* book" },
    { big: "Follow-up", text: "Funnel + automation that gets people *to show up*" },
    { big: "Sales", text: "A process that *closes* the calls you get" },
  ]);

  statement("So we asked: when does someone actually *buy* a high-ticket offer?");

  cards(null, [
    { big: "After they WATCH you", bigSize: 24, text: "Video lets them see how you think, so *trust* is built before the call" },
    { big: "After they TALK to you", bigSize: 24, text: "A *real conversation* is where people decide to invest" },
  ]);

  statement("How do we bring those two together, *at scale*?");

  flow("The GrowthOS™ Acquisition System", [
    ["Meta Ad", "Calls out one person & one problem"],
    ["Qualify", "Short form: budget, intent & fit"],
    ["VSL + Booking", "They watch you, then pick a time"],
    ["Automation", "Email + SMS reminders & nurture"],
    ["Sales Call", "Only qualified, warmed-up leads"],
    ["New Client", "Predictable, month after month"],
  ], "Every piece is built to *filter out* the wrong people and *warm up* the right ones.");

  section("", "And it works…");

  // Proof numbers
  {
    const s = base();
    title(s, "Our own pipeline in 2026 so far…");
    const stats = [["1,014", "leads"], ["156", "calls booked"], ["26", "new clients"], ["€188K+", "contracted revenue"]];
    const gap = 0.3, cw = (W - 1.2 - gap * 3) / 4;
    stats.forEach(([n, l], i) => {
      const x = 0.6 + i * (cw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.5, w: cw, h: 2.2, fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.12 });
      s.addText(n, { x, y: 1.75, w: cw, h: 1.0, fontFace: FONT, fontSize: n.length > 5 ? 34 : 44, bold: true, color: BLUE, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(l, { x, y: 2.8, w: cw, h: 0.6, fontFace: FONT, fontSize: 16, color: INK, align: "center", valign: "top", margin: 0, isTextBox: true });
    });
    s.addText("Pacow Media's own Meta ads, Jan–Sep 2026", { x: 0.6, y: 4.0, w: W - 1.2, h: 0.4, fontFace: FONT, fontSize: 12, color: GREY, align: "center", margin: 0, isTextBox: true });
    s.addNotes("Source: (PCW) Business Reporting Daily Official 2026, Total row. 1,014 leads, 156 short calls booked, 26 new clients, €188,589.69 contracted revenue. September is month-to-date, so refresh these numbers before presenting.");
  }

  // Chart
  {
    const s = base();
    title(s, "€34.8K ad spend → *€188.6K* contracted");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    s.addChart(pres.charts.BAR, [
      { name: "Ad spend (€)", labels: months, values: [992, 1830, 2282, 2380, 3718, 3258, 7294, 6490, 6551] },
      { name: "Contracted revenue (€)", labels: months, values: [14326, 8470, 7847, 12964, 50785, 7020, 26325, 34773, 26080] },
    ], {
      x: 0.6, y: 1.25, w: W - 1.2, h: 3.75, barDir: "col", barGrouping: "clustered",
      chartColors: ["B8BEC7", BLUE], showLegend: true, legendPos: "t", legendFontSize: 11, legendFontFace: FONT,
      catAxisLabelColor: GREY, valAxisLabelColor: GREY, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
      valAxisLabelFormatCode: "€#,##0", valGridLine: { color: "E5E5E5", size: 0.5 }, catGridLine: { style: "none" },
    });
    s.addNotes("Monthly ad spend vs contracted revenue from our own reporting sheet. May was the standout month: €3.7K spend → €50.8K contracted. September is month-to-date.");
  }

  // Client examples
  {
    const s = base();
    title(s, "Example: a *family services* business");
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.4, w: 4.2, h: 2.9, fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.12 });
    s.addText("$21,900", { x: 0.6, y: 1.7, w: 4.2, h: 1.1, fontFace: FONT, fontSize: 50, bold: true, color: BLUE, align: "center", margin: 0, isTextBox: true });
    s.addText("in sales from Pacow ads, and counting", { x: 0.8, y: 2.85, w: 3.8, h: 0.8, fontFace: FONT, fontSize: 16, color: INK, align: "center", margin: 0, isTextBox: true });
    s.addText(runs("“So definitely made back *Pacow fee plus Meta ads spend*. Plus more ❤️”", { color: INK, italic: true }), { x: 5.2, y: 1.4, w: 4.2, h: 2.9, fontFace: FONT, fontSize: 20, valign: "middle", margin: 0, isTextBox: true });
    s.addNotes("From the client group DM (21 Sep 2026). Get the client's OK before showing their words publicly, and consider adding their name/photo if they agree.");
  }
  {
    const s = base();
    title(s, "And an *online English school*…");
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.4, w: W - 1.2, h: 2.9, fill: { color: LIGHT }, line: { color: LIGHT }, rectRadius: 0.12 });
    s.addText(runs("“…as you can see, *5 meetings booked* within the last 24 hours, so great results, we're happy 🙌”", { color: INK, italic: true }), { x: 1.0, y: 1.6, w: W - 2.0, h: 2.5, fontFace: FONT, fontSize: 26, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addNotes("From the #pacow-englisher Slack channel (June 2026). Confirm the client is happy to be quoted. Swap in a screenshot of the message if you have one, since screenshots work well on webinars.");
  }

  statement("I'm going to show you the *5 steps*…", "The exact process we use with every client.");

  list("The 5 steps of the GrowthOS™ system", [
    "*Step 1:* Strategy, Offer & Database Reactivation",
    "*Step 2:* Meta Ads that filter for the right people",
    "*Step 3:* Lead Qualification",
    "*Step 4:* Funnel, CRM & Full Automation",
    "*Step 5:* Sales Coaching, Optimisation & Scale",
  ]);

  // STEP 1
  section("Step 1", "Strategy, Offer & Database Reactivation");
  statement("A muddy offer *kills campaigns*… no matter how good the ads are");
  cards("Your offer needs ONE of each…", [
    { big: "1", text: "*Person* you serve" },
    { big: "1", text: "*Problem* you solve" },
    { big: "1", text: "*Solution* you deliver" },
    { big: "1", text: "*Promise* you make" },
  ], { notes: "Add: …and one guarantee that backs it up. This is our offer-strategy framework." });
  statement("Your headline must *call out your ideal client* and name their problem or goal");
  list("Examples…", [
    "“Coaches: how to book *10 qualified sales calls* a month without cold DMs”",
    "“How tutoring businesses fill their *fall enrolment* in 30 days”",
    "“Consultants doing $10K/mo: the *3-step system* to reach $30K”",
  ], { notes: "Illustrative examples. Swap in real headlines from client campaigns if you prefer." });
  statement("Your old leads are sitting on *money*", "While we build, we reactivate your existing database. In most cases that brings 1–3 extra sales in the first two weeks, before a single ad goes live.");

  // STEP 2
  section("Step 2", "Meta Ads");
  statement("The ad is your *first filter*", "The copy and targeting should turn away the wrong people and attract the right ones.");
  list("How we run it…", [
    "Launch *3–10 ad angles* built from your ideal client's top pain points",
    "Start at around *$100/day* (about $3K/month)",
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
  statement("The moment someone books, the *system takes over*", "It reminds them, warms them up, and gets them to show up ready to buy, without you chasing anyone.");

  {
    const s = list("Quick check-in…", [
      "How are you doing so far?",
      "Can you see how *powerful* this can be?",
      "Can you see how this could get you *more clients*?",
    ], { notes: "Ask them to reply in the chat. Read a few answers out loud." });
  }

  // STEP 5
  section("Step 5", "Sales Coaching, Optimisation & Scale");
  statement("A *10% lift* in your close rate = thousands more every month… with the _same ad spend_");
  {
    const s = base();
    title(s, "The numbers we watch");
    const rows = [
      ["Click-through rate", "> 1%"],
      ["Cost per lead", "< €22"],
      ["Cost per booked call", "< €215"],
      ["Show-up rate", "> 75%"],
      ["Close rate", "> 30%"],
      ["Return on contracted revenue", "> 4x"],
      ["Return on cash collected", "> 2x"],
    ];
    const hdr = { bold: true, color: "FFFFFF", fill: { color: DARK } };
    s.addTable([
      [{ text: "Metric", options: hdr }, { text: "Target", options: { ...hdr, align: "center" } }],
      ...rows.map(([a, b], i) => [
        { text: a, options: { fill: { color: i % 2 ? "FFFFFF" : LIGHT } } },
        { text: b, options: { align: "center", bold: true, color: BLUE, fill: { color: i % 2 ? "FFFFFF" : LIGHT } } },
      ]),
    ], { x: 1.5, y: 1.3, w: 7, colW: [4.6, 2.4], fontFace: FONT, fontSize: 14, color: INK, rowH: 0.38, border: { type: "solid", pt: 0.5, color: "E0E0E0" }, valign: "middle" });
    s.addNotes("Targets from our reporting sheet. Adjust the currency for your audience if needed.");
  }
  list("What to expect in the first 90 days", [
    "*Weeks 1–2:* strategy locked in + database reactivation",
    "*Weeks 2–4:* ads live, with real data coming in",
    "*By week 4:* full funnel, CRM & automation running",
    "*Months 2–3:* sales coaching, optimisation & scaling",
    "*Target:* 2–3x on cash collected, 4–6x on pipeline revenue",
  ]);

  list("Let's recap the 5 steps", [
    "*Step 1:* Strategy, Offer & Database Reactivation",
    "*Step 2:* Meta Ads that filter for the right people",
    "*Step 3:* Lead Qualification",
    "*Step 4:* Funnel, CRM & Full Automation",
    "*Step 5:* Sales Coaching, Optimisation & Scale",
  ]);

  statement("If you followed these 5 steps, do you think you'd get *more clients* every month?", null, "Get them to answer in the chat.");
  statement("And you'd never have to send another *cold DM* again…");
  statement("Let me ask you a *question*…");
  statement("Would you like us to build this *with you*?", "So it's done right, faster, without the trial and error.");

  // Offer
  {
    const s = base();
    title(s, "The *Growth Accelerator*");
    s.addText("90–120 days · done with you", { x: 0.6, y: 1.1, w: 5, h: 0.4, fontFace: FONT, fontSize: 15, color: GREY, margin: 0, isTextBox: true });
    const left = [
      "Full funnel setup (landing page + VSL)",
      "Unlimited done-for-you ad scripts",
      "Unlimited done-for-you ad editing",
      "Private coach: 2x/month 1:1 calls + DM support",
    ];
    const right = [
      "Step-by-step curriculum (Skool)",
      "Sales scripts & call reviews",
      "Private Slack channel",
      "Your GrowthOS™ roadmap from day 1 to graduation",
    ];
    [left, right].forEach((col, c) => {
      col.forEach((t, i) => {
        const x = 0.6 + c * 4.5, y = 1.75 + i * 0.66;
        s.addShape(pres.shapes.OVAL, { x, y: y + 0.07, w: 0.36, h: 0.36, fill: { color: GREEN }, line: { color: GREEN } });
        s.addText("✓", { x, y: y + 0.07, w: 0.36, h: 0.36, fontFace: FONT, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
        s.addText(t, { x: x + 0.5, y, w: 3.8, h: 0.5, fontFace: FONT, fontSize: 15, color: INK, valign: "middle", margin: 0, isTextBox: true });
      });
    });
    s.addNotes("Tier 2 (DWY) from the Offer Suite doc. Price isn't shown on the slide; cover it on the call.");
  }

  list("Who this works for…", [
    "*Coaches, consultants, course creators* & education brands",
    "Doing around *$5K+/month* in revenue",
    "With a *high-ticket offer* ($1K+)",
    "Able to invest around *$100/day* in ads",
  ], { marker: "check" });

  list("Who this is NOT for…", [
    "People looking for a *get-rich-quick* shortcut",
    "Anyone who isn't willing to *invest in ads*",
    "People who won't *show up* to calls or follow the process",
  ], { marker: "x" });

  {
    const s = base();
    title(s, "Our *guarantee*");
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.3, w: 3.6, h: 3.0, fill: { color: BLUE }, line: { color: BLUE }, rectRadius: 0.12 });
    s.addText("Profitable ads, or we keep working with you.", { x: 0.85, y: 1.5, w: 3.1, h: 2.6, fontFace: FONT, fontSize: 22, bold: true, color: "FFFFFF", valign: "middle", margin: 0, isTextBox: true });
    s.addText("If you do your part:", { x: 4.6, y: 1.3, w: 4.8, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: INK, margin: 0, isTextBox: true });
    s.addText([
      { text: "$100+/day in ads for 3 months", options: { bullet: true, breakLine: true } },
      { text: "Post 5x a week on social media", options: { bullet: true, breakLine: true } },
      { text: "Attend every 1:1 coaching call", options: { bullet: true, breakLine: true } },
      { text: "Apply our messaging & sales process", options: { bullet: true, breakLine: true } },
      { text: "Payments & monthly check-ins on time", options: { bullet: true } },
    ], { x: 4.6, y: 1.8, w: 4.8, h: 2.5, fontFace: FONT, fontSize: 15, color: INK, paraSpaceAfter: 6, valign: "top", margin: 0, isTextBox: true });
    s.addNotes("From the Offer Suite: anything over 1x ROAS on contracted revenue counts as profitable. Check the exact guarantee wording with Ema before presenting. The 'or we keep working with you' part is my placeholder.");
  }

  statement("🎁 *Bonus* for everyone who stayed:", "A free Growth Call. We'll look at your offer and funnel and map out your ad strategy.");

  {
    const s = base();
    s.addText(runs("Book your free *Growth Call*", { color: INK, bold: true }), { x: 0.6, y: 0.8, w: W - 1.2, h: 1.0, fontFace: FONT, fontSize: 40, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.0, y: 2.2, w: 4.0, h: 0.85, fill: { color: GREEN }, line: { color: GREEN }, rectRadius: 0.15 });
    s.addText("Click the link in the chat →", { x: 3.0, y: 2.2, w: 4.0, h: 0.85, fontFace: FONT, fontSize: 20, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText("[Paste your booking link here]", { x: 0.6, y: 3.4, w: W - 1.2, h: 0.5, fontFace: FONT, fontSize: 16, color: GREY, align: "center", margin: 0, isTextBox: true });
    s.addNotes("Replace the placeholder with the live booking link and drop it in the chat. Stay on this slide for Q&A.");
  }

  await pres.writeFile({ fileName: "Pacow_Media_Webinar.pptx" });
  console.log("slides:", pres.slides.length);
})();
