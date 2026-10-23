---
name: client-strategy
description: Builds the full GrowthOS marketing strategy for a new Pacow client (ICP & personas, offer & guarantee, stats, pain points, ad copy, objection videos, VSL, thank-you VSL, form questions, CRM messages, marketing strategy doc), using the IPS strategy as the gold example. Use when Ema says "strategy <client>", "build the strategy for <client>", "do <client>'s strategy", or asks for any single strategy doc for a client ("strategy GC VSL", "pain points for <client>").
---

# Client strategy (GrowthOS)

One line from Ema in, a full strategy out. Ema gives the client, the offer they're selling and the funnel type. You gather everything yourself, check in twice, and build every doc in IPS's format.

Before you start, read `lessons.md` in this folder. It holds Ema's past corrections. They override anything below.

## Input

Ema types something like: `strategy Gaja Collective, coach certification, free training funnel`

- **Client** (required). Find the short code (e.g. GC, IPS) from their Drive folder or file names.
- **Offer** (the one program we advertise). If missing, take it from the onboarding call doc. If still unclear, ask.
- **Funnel** (free training, webinar, DM, etc.). Default: free training funnel, like IPS.

### Modes
- **Full** (default): gather → Drive setup → all docs → recap.
- **No setup** ("no drive", "no docs"): skip the Drive setup. Use this when the client's folders already exist.
- **Single doc** ("strategy GC VSL", "pain points for GC"): gather, then build only that doc.
- **Check only** ("check <client>"): gather, then report the checkpoint 1 summary, the Drive setup diff (what would be created vs skipped) and which strategy docs are blank vs already filled. Write nothing.

## Step 1: gather (read only)

Read all of these before writing a word:

0. **Client folder**: search Drive for `title contains '<client name>' and mimeType = 'application/vnd.google-apps.folder'`. Client folders sit next to IPS's. If more than 1 match, ask Ema.

1. **Client profile**: Drive folder "00. Client Profiles (Claude)" (id `1yryquCGWQNIS-kUvOm81Wjqg1SHFEw6f`), doc "Client Profile: Name (Business)".
2. **Intake form (required, full row)**: sheet "Student GrowthOS™ Accelerator Intake Form (Responses)" (id `1oA8hD1zDmwIbMGvN6EkrlcPbYVGU3unty0Uhril5r48`). Find the client's row (match email or name) and read every column, including the "Your Journey To Us" answers (why they chose Pacow, hesitations, what made them trust us).
   - Sheets connector down: export it with Drive `download_file_content` (`exportMimeType` xlsx), then read the saved file with `python3 -I` + openpyxl and pull the client's row.
   - Row still not found: say so at checkpoint 1 and ask Ema to paste the responses. The client profile copies most of the intake, but not the "Your Journey To Us" answers.
3. **Onboarding call doc**: "(XX) onboarding call" in the client's "01. Onboarding" folder. This says which offer we're going for and the funnel.
4. **Every email with the client**: Gmail search `from:@<client domain> OR to:@<client domain> OR cc:@<client domain>`, plus searches on the contacts' names and the business name (catches Viktorija's threads and forwards). Read each thread in full (`get_thread`, PLAIN_TEXT), not just previews. Open attachments and shared Drive/Docs links in them (Drive `read_file_content`). Case studies, origin story, testimonials, brand notes and ICP docs usually arrive this way.
5. **Slack**: find the client's private channel (`slack_search_channels` on the business name or short code; include private channels) and read it in full (`slack_read_channel`, plus `slack_read_thread` on threads with replies). Also search messages that mention the client name (`slack_search_public_and_private`), to catch team chat about them. Read shared files (`slack_read_file`) and linked docs. No channel yet: say so.
6. **CRM**: "(Pacow) Sales & Active Client CRM 2026" in "01. Clients" for offer, contract and ad budget. If they're not in it yet, say so. If the Sheets connector is down, use Drive `download_file_content` (xlsx export) or a Drive fullText search for the client name; Drive `read_file_content` only shows the first rows.

Drive searches return pages: always follow `nextPageToken` until none comes back, or you'll miss folders and files.

Never copy client data into this repo. It's public. Client data lives in Drive and chat only.

**Checkpoint 1.** Tell Ema "got it" with a short bullet summary: business, the offer we're selling (price, length, next start dates), current numbers (leads, booking rate, show rate, close rate), qualified-lead definition, proof available (case studies, stats), goals and fears, setup status. Then a **"What they sent"** list: every useful thing found in email or Slack (case studies, testimonials, origin story, brand docs, videos, stats, access), with the date and source. If sources disagree (price, dates, budget), list both values. End with any gap that blocks the strategy. Wait for her go.

## Step 2: Drive setup (skip in "no setup" mode)

Gold reference folder: IPS (id `1oYP_ExchlNA5KL-Dyies5d5pCaAyG-pr`). Mirror its structure into the client's folder:

| Folder | Files (rename "(IPS)" to "(XX)") |
|---|---|
| 01. Onboarding | Marketing Strategy - Growth OS Accelerator, ICP & Personas, GrowthOS™ Roadmap, GrowthOS™ Tech Setup, onboarding call |
| 01. Onboarding / VSLs | VSL, Thank you VSL |
| 02. Creatives | Ad Copy, Pain points |
| 02. Creatives / First Launch | (empty folder) |
| 02. Creatives / Hammer/Objs | Obj/hammer them videos |
| 03. CRM & Email Marketing | form questions, New lead, Qualified lead, Reminders, Cancelled, No Show, Long Term |
| 04. Reporting | "(XX) - Business Reporting B2C": copy of "(TEMPLATE) - Business Reporting B2C" (id `1tA8fiuGm5HmyJdfdVKC14iMfh_GinZLGm7z-5ufLnOQ`), never IPS's sheet |
| 05. Calls, 06. Other | folders only |

Rules:
- List the client's folder first. Never duplicate a file or folder that already exists.
- New docs are blank Google Docs (`create_file` with `contentMimeType: application/vnd.google-apps.document`). Don't copy IPS content into them.
- Skip IPS's media (videos, images, logos, GIFs). They're IPS's own.
- Files the client has that IPS doesn't (e.g. a nurturing doc): leave them alone and list them.
- Then list what you made and what you skipped, with links.

## Step 3: build the docs

Build in this order. Before each doc, read IPS's version (Drive `read_file_content` with `includeComments: true`, the comments show what the client pushed back on) and match its **structure and length only**. Rewrite every word for the new client: never reuse IPS's claims, numbers or stories. IPS's docs predate some of Ema's rules (its ICP uses a segment split, some docs have em dashes and "this isn't X, it's Y" lines), so `lessons.md` and `writing-style.md` always win over IPS's wording. Some IPS docs have several tabs: follow the newest one ("Updated" over "Tab 1").

| # | Doc | IPS example (file id) |
|---|---|---|
| 1 | ICP & Personas | `1uayf5I7nucmp1BeqL60kn3aJH32BYy9oXGCC_q56if8` |
| 2 | Offer & Guarantee | (no doc: 1 offer line + 1 guarantee, IPS style below) |
| 3 | Stats | (no doc: list, see below) |
| 4 | Pain points | `1Few9ZCksG2Nhltwj5KcutQcBtkuQ2X91DeU4d_uMvJs` |
| 5 | Ad Copy | `1Qt6pqbaodWjl2BWax5go6HsJNkmx9DhW6vpJN6ZPycY` |
| 6 | Obj/hammer them videos | `1DIdfLBZGH7DvHyH5DkuOUsDdFBoWOay3kUqcexZrnHU` |
| 7 | VSL | `1D8JexmoS0jzfd2TGdRCZIbQQ7GoIqwEuyXaC1E5P4-0` |
| 8 | Thank you VSL | `1iqWyRm9PQ1AqMEpJHsmFh79sWqWZBSF4j5I7iIUEMhg` |
| 9 | form questions | `1X-nSd4UEHIj07MSAT6w4jUh6ZPc2B6jj8q2B2f9ZAeU` |
| 10 | CRM: New lead | `1KlnC-4HfPH0Oj_xstQeZ6agaBl5_DTAEgbhAalToHlo` |
| 11 | CRM: Qualified lead | `1jpqeA0JR6JkudvpHKBOISCNeOqnmOXhEdqi-Jos4KDI` |
| 12 | CRM: Reminders | `1Q8NHHk7vcNVDS2SBoCZo-uNYJufLWJ6iKKywBdlG5ug` |
| 13 | CRM: Cancelled | `1pwbIlcJOs-Kfi6s-X063SDM1U_ajelGGpBXQsVW0nIU` |
| 14 | CRM: No Show | `1pJbRVoTuBKUBLAQqlaQ2K7tG_nEwbUP2OF1bRhrmCSQ` |
| 15 | CRM: Long Term | `1El0lsI9QKFn_mtFdTdGqS4h9xS4CG6E2tvOnxkziPCA` |
| 16 | Marketing Strategy (pulls 1-15 together) | `1ypkfUrrrPA2BAL2VnbW3osQ9C8nDkQyl9u55_lOvZ3Y` |

**Checkpoint 2.** After docs 1-3 (ICP, offer & guarantee, stats), stop and wait for Ema's OK. Everything after builds on them. After that, run docs 4-16 one at a time without stopping, unless Ema says otherwise.

### Doc rules

**ICP & Personas**
- Section 1 market overview (market context, key challenge, segmentation logic, buying calendar with real enrollment dates), Section 2 personas, Section 3 intake claims with a verdict, Section 4 messaging per persona.
- Personas = **1 archetype, different places in life** (e.g. "the burned-out corporate exec", "the woman who just got laid off", "the empty nester"). Never random splits like "aspiring X vs adjacent professional". Table: persona · her place in life · what keeps her up at night · what she needs to hear · proof we can use. Map real case studies to each persona; mark personas without proof as [NEED: case study].

**Offer & Guarantee** (IPS style)
- Offer: 1 headline line with a real timeline from the program ("Become a ... & ... in 21 Weeks").
- Guarantee in the founder's voice: "Here's my promise: go through the training, do the work, show up to mentorship, and follow the steps. If you don't ..., I'll keep working with you until you do, at no additional cost." Use the client's own guarantee idea if they gave one, as an option B.

**Stats**: list only stats found in the gathered sources. Then list what's missing (grad count, income range, top earner, pass rates, employers, press, brand deals, reviews).

**Pain points**: real web research (extended search, several queries in one turn: Reddit/forums, reviews of competitors, news). Plus the client's own case-study quotes, which are usually the best voice of customer. Output 5 pains, each: the pain in their words as a heading, 2-3 bullets of evidence with quotes, 1 hook. Then "the deepest emotional pain" line and which pains suit cold ads vs landing page/retargeting. End with a Sources list of links.

**Ad copy**: 4 ads + 4 headlines, IPS structure (hook naming the audience in the first 3-5 words, what they'll learn in the free training with ✅/✔ bullets, proof lines, CTA to watch then book a free Career Call). 1 ad carries the guarantee.

**Objection videos**: follow the "Updated" tab of IPS's doc, minus its price video. 5 scripts in the founder's voice, each a standalone ~30-second video. Keep IPS's header (record vertically, 5 videos, 1 USD/video, 5 USD/day, goal). Objections are reasons someone hesitates to **start with this client** (saturation, age, time, will I get clients, which program is legit, etc.). Hooks get to the objection in the first sentence. **Never mention the client's price.** Comparing to other things (a degree, years of school) is fine. Add 2 backup objections as one-liners.

**VSL**: IPS's 12 sections (hook, who it's for, promise, imagine, proof, origin story, the one problem, 3 steps, options, offer + guarantee, testimonials repeated, CTA) plus the b-roll list at the top. Origin story from the client's own words; where they left gaps, put [CLIENT: add ...] instead of inventing life events. CTA mentions the next real enrollment date.

**Thank-you VSL**: IPS's 7 sections. If show rate is a known leak, put the confirm step early and repeat it in the close. If affordability or "can't decide alone" is a known issue, add the "invite your partner" line and flag it.

**Form questions**: Form 1 opt-in, Form 2 qualification survey, Form 3 booking. Build qualifiers from the client's "what makes a lead qualified" answer (location, budget readiness, time, etc.). Mark disqualifying answers ❌ (cannot book). Add 1 non-disqualifying persona question so the closer knows which story to lead with. Short "why these questions" bullets.

**CRM messages and Marketing Strategy**: match IPS's structure and channels (SMS/email) exactly. Use the client's real call-taker name, booking link and cohort dates, or placeholders.

### Ad creatives (static ads): copy only, never design

- **Never create, copy or edit ad designs in Canva.** The VA or Ema builds the visuals.
- **Template:** use the one Ema names. If she doesn't name one, pick it yourself from the Canva template library ("NEW", design `DAHOUShgf9M`) or a past client's ad file (e.g. "(IPS) ads"), and say which design and page(s) you picked and why in 1 line.
- **Output: the exact copy for every text element on that template, word for word**, per ad, ready to paste. Read the template's elements first (Canva `read-design`, `design_content`) so you know which elements exist (headline, body, name, handle, CTA, labels). Format per ad:
  ```
  Ad 1 · Pain 1 - First launch
  Headline: ...
  Body: ...
  Name: ...
  Handle: ...
  CTA: ...
  ```
  Keep each element about as long as the template's original text, so it fits. Same copy for feed and vertical unless the vertical has extra elements.
- **Images:** say which client photo or logo goes where (e.g. founder photo in place of the template's person, client logo in place of the template's background icon). Never invent images.

### VA briefs (Ema shares a brief doc)

When Ema shares a VA brief (Canva brief, GHL brief, etc.) and says "make it for <client>":
- **Edit that doc in place** (Google Docs `update_doc`, revision-guarded, highest index first). Don't create a new doc and don't rewrite its structure.
- **Swap every client-specific element** to the new client: business name, website, Instagram and other links, ad names/numbering (fix typos like "Paing 5"), and every ad's copy.
- **Keep the generic parts** as they are: instructions, Loom/training links, example folders, the template link, image placeholders.
- **Ad copy in a brief follows that brief's own format** (e.g. title, italic audience line, bold hook, body, proof lines with bold results, mechanism line, CTA), filled with the client's real pains, proof and offer. Same bold/italic pattern as the original.
- Read the doc back after editing and check every element changed.

## Output rules

- Output each doc **in chat**, formatted for Google Docs (markdown tables Ema can paste with right-click → "Paste from Markdown"). Don't write into the Drive docs unless Ema says "write it" or "put it in the doc".
- Follow `writing-style.md` and the CLAUDE.md writing rules in every doc: no em dashes, no "not X, it's Y" sentences, no banned words, digits for numbers.
- Never invent proof, numbers, stats, case studies or life events. Missing = [PLACEHOLDER] or [CLIENT: ...].
- End every doc with a short "Confirm with <client contact>" list: only real open questions, 2-5 bullets.
- Ads written with the Ad Map (`ad-map.md`) follow that file instead: Ema picks all 5 decisions.

## Final recap (to Ema, not the client)

When the last doc is done, give Ema 1 recap in chat:
- What was built (doc list).
- **Every placeholder and open question** across all docs, grouped by topic (proof and case studies, offer and guarantee, program details, funnel and sales, setup), each with the doc it blocks.
- The top 3 things to chase first because they block launch.

Don't draft a client email unless Ema asks.

## Learning

When Ema corrects something during a run ("don't do X", "I want it like Y"), apply it right away, then add it to `lessons.md` as 1 dated line so the next client gets it right the first time. Commit and push that change if you're in the repo.
