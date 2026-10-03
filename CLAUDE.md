# Pacow Monthly KPI Bottleneck Review

Trigger word: **"report"**. When Ema says "report" (optionally + a client name to scope it to one client), run this routine.

This routine is **READ-ONLY**. Never write, PUT, POST, or otherwise modify any Google Sheet, landing page, or ad account under any circumstance. Diagnosis and recommendations only.

## Data source

Sheet-only. Do **not** use the Meta Ads API/MCP to determine eligibility or pull performance numbers for the standard "report" run — pull everything from the client's Google Sheet.

- **Eligibility check:** open the client's Sheet, go to the current month's tab (daily rows), look at the two most recent dated rows. If both show $0/blank spend, skip the client for this run. Otherwise they're in scope.
- **Performance window:** trailing 7 days of daily rows in the current month's tab, aggregated from raw counts (sum numerators/denominators, then compute rates) — never average the daily percentage columns.
- **Fallback targets:** if a client's own Dash "Targets" row is blank for a given column, use the generic "Facebook Ad KPIs/Goals" tab fallback (CPM <$30, CPC <$4, unless the client's currency is non-USD, in which case treat these as directional only).

### Known Google Drive tooling limitation
`read_file_content` on these large multi-tab spreadsheets may return a structural "corpus_document" summary instead of raw cell values. If that happens, retry once to confirm it's not a one-off, then fall back to `download_file_content` (CSV export) — but note that CSV export only reaches the workbook's **first tab** ("Dash", the monthly rollup), not the per-month daily tabs. If daily-tab data is needed and both paths fail, say so explicitly rather than guessing at numbers.

### Meta Ads access
Meta Ads MCP access **is** available in this account for ad-hoc deep dives (campaign/ad set/ad-level data: CPM, CTR, targeting, audience overlap, live creative, ad previews) — use it whenever a client's diagnosis calls for verifying an audience/targeting/creative hypothesis beyond what the sheet shows. Some individual ad accounts may be MCP-blocked ("Ads MCP is gradually being rolled out") — check `is_ads_mcp_enabled` via `ads_get_ad_accounts` before assuming access, and note the block plainly if hit rather than guessing.

## Metric classification thresholds

**LPCR (Leads ÷ Link Clicks).** Goal 20%.
- ≥15% = Good
- 12–15% = Borderline
- <12% = Bad

**Single-threshold metrics** (no borderline zone — below target is a miss, at/above is good): CTR, SUP-% (show-up rate), Lead-to-Qualified Rate, Closing Rate, ROI (Contracted/Collected).

**Any Target/Max cost metric** (Cost per Lead, Cost per Pre-Qualified, Cost per Qualified, Cost Per Booked, Cost Per Call Taken, Cost Per New Client, etc.):
- Below Target = Good
- Target through ~1.3× Max = Borderline
- Beyond ~1.3× Max = Bad

## Funnel bottleneck playbook (top-down diagnostic order)

CPM (audience/reach) → CTR (creative/copy) → LPCR (landing page/offer) → Cost per Lead (rolls up the above three) → Pre-Qualified Rate / Cost per Pre-Qualified (qualifying step) → Qualified Rate / Cost per Qualified → Booking Rate / Cost per Booked (DM/nurture, call offer) → Show-Up Rate (reminders/pre-call engagement) → Cost per Call Taken → Closing Rate (sales script) → Cost per New Client / ROI (pricing/packaging).

**Rule: never blame a downstream stage while an upstream one is still broken** — but two bottlenecks can also be genuinely independent (e.g. a landing page problem and a call-reminder/show-up problem at the same time). Check whether a downstream miss actually traces to the upstream one before assuming it does.

## Backward decision-tree method (the default way to diagnose ANY shortfall)

When the ask is "why is [bottom-line number] low" (booked calls, new clients, ROI — for a client, or for Pacow's own funnel), do not jump straight to the two or three usual suspects. Every sheet has ~20 numbers in the chain between spend and that bottom-line result, and any one of them can be the actual root cause. Work backward through all of them, mechanically:

1. **Start at the missed KPI** (e.g. 60 Min Calls Booked) and walk one stage upstream at a time: Call Taken → Call Booked → Qualified → Pre-Qualified → Lead → Link Clicks → Impressions/CPM. At each stage, compute the actual conversion rate or cost between it and the stage above it.
2. **At each stage, judge against the right baseline** — the sheet's own Target/Max row first; if that cell is blank, the client's own best historical month for that same metric (not a generic fallback) is the next best baseline. Only fall back to the global CPM/CPC fallback thresholds when neither exists.
3. **Context-adjust before calling a number bad.** The same raw number means different things in different contexts — most importantly B2B vs. B2C: a B2B audience (e.g. Pacow's own funnel, agency owners, course creators) is narrower and more competed-for, so a higher CPM/CPC than a B2C parent-and-student audience is expected and not automatically a problem. Judge a number against what's normal for *that* client's ICP and *that* client's own history, not a single universal bar.
4. **Find the single most-upstream broken number**, not just every anomaly in the list. If LPCR is bad AND Cost per Lead is bad, LPCR is the root cause (Cost per Lead is a downstream symptom of it) — name LPCR as the issue, not both. If two numbers are broken in ways that don't chain into each other (e.g. a landing page problem AND a separate show-up-rate problem), name both as independent issues, but don't let a real downstream problem get missed just because an upstream one is more dramatic.
5. **State the chain explicitly when it reframes the ask.** "You asked about X, but X is a symptom — the actual root cause further upstream is Y" is the expected shape of the answer, not an aside.

### Output format for this method: Issue → Solution → Tangible Action

Every bottleneck, from this method or any other diagnostic conversation in this chat, gets exactly this shape — simple, no fluff:
- **Issue:** the specific number, what it actually is, and what it should be (target/historical best).
- **Solution:** the one underlying fix, in a sentence.
- **Tangible Action:** the concrete next step — a test to run, a setting to change, a thing to check or fix. Not vague advice.

This replaces "5 points of investigation per bottleneck" as the default shape for day-to-day diagnostic replies in this chat (ad-hoc deep dives, A/B test requests, "why is X low" questions). The full monthly portfolio "report" run still uses chat tables + the BAD-only recap at the end (see Output format below); within that report, each bottleneck's writeup should also use Issue/Solution/Action rather than open-ended "5 points of investigation" language.

### Interpretive rules (apply these before writing any diagnosis)

1. **LPCR-first diagnosis rule:** when CTR is healthy but LPCR is low, name landing page/offer mismatch as the root cause of a Cost-per-Lead or lead-volume miss — ranked above CPM as the primary suspect.
2. **Zero-lead override rule:** real click volume + near-0 leads (LPCR near 0%) is always in scope and top priority — never hedge this under eligibility/intentionality uncertainty.
3. **Low-volume reactivation rule:** real leads but 0 downstream movement (0 pre-qualified/qualified/booked) → default hypothesis is a disconnected post-lead pipeline (survey/booking link never reconnected), not "just needs more volume."
4. **Pre-Qualified / Qualified interpretation rule:**
   - 0/0 on both, confirmed the client doesn't use that stage by design → mark **"not tracked, skip evaluating"** (currently applies to **Core Medical Training Center** and **Smarta Tutoring**).
   - Qualified nonzero while Pre-Qualified = 0 → proves the CRM/data pipe works. Diagnose as a **funnel/process gap** (survey being skipped/bypassed) — never call this a CRM/integration issue.
   - Only call something a CRM/integration issue when both fields are 0 with real lead volume AND there's no confirmation the client simply omits that stage.
5. **Revenue-lag caveat:** Closing Rate / Cost per New Client / ROI computed over a narrow trailing window can look artificially good/bad since revenue events lag the spend that generated the lead by weeks. Flag once per client when relevant; don't treat as a hard signal alone, especially at n=1 or n=2 downstream sample sizes.
6. **Small-sample caveat:** when a bottom-of-funnel stage (booked, taken, closed) has a sample size of 1–2 for the period, say so explicitly and don't treat the derived rate/cost as signal, good or bad.

## Output format

- Chat tables, **never an artifact**.
- Cover both good and bad metrics per client — not just the misses.
- Every client gets a full, independent write-up. Never write "same as above."
- For each identified bottleneck, use **Issue → Solution → Tangible Action** (see "Backward decision-tree method" above) — not open-ended "5 points of investigation." Keep it simple and concrete, not generic.
- End every full-portfolio report with a **BAD-only recap section**: hard-bad items only, borderline excluded. ⚠️ sanity-check flags (small sample, revenue lag, etc.) are still included there.

## Client roster

| Client | Meta Account | Sheet ID | Notes |
|---|---|---|---|
| Pacow Media | act_3720107534883410 | `1Rnf9ydutojWkWozdMgp6tXvZL8yGHZ-dzS1e36LUffU` | |
| EdvancedLearning | act_912963885192972 | `1wiyaH2GaVdBmUgN1r5ETsswxaG7SQ72zHGShsuA7JaY` | Ads MCP blocked on this account (rolling out) |
| Zinkerz | act_638396012894614 | `1zJqc4H7PsyAzext6MMpuGFYMPrr2Yrx1sUCCpy2fSho` | |
| Core Medical Training Center | act_1101825501101670 | `1nordSfrBDgMIz80lf_VSbQA7Y9w4w9zxawph4okq2L8` | Pre-Qualified/Qualified not tracked by design — skip evaluating |
| Personalized Prep | act_1747267276471518 | `1tNfePmCajYBhJRibCiVeUk4UJZPn1IXTnxW7X9k3W4Y` | |
| Class101 | act_2980228195651210 | `1BDn5J24XwEhq6IagIqGZAOd6nO-J6QAGM5Xdc3ebDxk` | Ads MCP blocked on this account (rolling out) |
| North Avenue Education | act_10100817269307566 | `1Z82ommJsxEn13PArnAGGu1Ki5H1OAvhVWnhze-DnDKI` | |
| Smarta Tutoring | act_597834280814934 (Ad Account #1 — the only funded one of 5 Smarta accounts under "Marta Mathews's Business") | `1hILrWWaiuV06tTlFmhPBj7iqfxIHiS1WMZUIzoqHweM` | Pre-Qualified/Qualified not tracked by design — skip evaluating. GBP currency. |

~~College Zoom — act_1495360371789422 — `15BB-dlXY_g-0Xl8A9UYv0X88BVs0I7TOFTRzOJC49QU`~~ — **offboarded, removed from active roster (2026-09-29).**

**Naming note:** "Smarta Tutoring" and "Much Smarter 1:1 Coaching" (act_1188526852804019) are two completely different companies. Much Smarter has no sheet on file and is not part of this routine — never conflate the two.
