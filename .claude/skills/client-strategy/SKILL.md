---
name: client-strategy
description: Builds the full GrowthOS marketing strategy for a new Pacow client (ICP & personas, offer & guarantee, stats, pain points, ad copy, objection videos, VSL, thank-you VSL, form questions, CRM messages, marketing strategy doc), using IPS's strategy as the template of which docs and sections to build (never its content). Use when Ema says "strategy <client>", "build the strategy for <client>", "do <client>'s strategy", or asks for any single strategy doc for a client ("strategy GC VSL", "pain points for <client>").
---

# Client strategy (GrowthOS)

One line from Ema in, a full strategy out. Ema gives the client, the offer they're selling and the funnel type. You gather everything yourself, check in twice, and build every doc with the same elements as IPS, written from scratch for this client.

Before you start, read `lessons.md` in this folder. It holds Ema's past corrections. They override anything below.

## Input

Ema types something like: `strategy Gaja Collective, coach certification, free training funnel`

- **Client** (required). Find the short code (e.g. GC, IPS) from their Drive folder or file names.
- **Offer** (the one program we advertise). If missing, take it from the onboarding call doc. If still unclear, ask.
- **Funnel** (free training, webinar, Meta form, DM, etc.). Find its Whimsical "(Details)" map (e.g. "New Free Training Funnel (Details)", "Booking Meta Form Funnel (Details)") and build every doc for THAT funnel's steps. IPS is a free training funnel; don't carry its landing page, survey or "watch the training" steps into other funnels. If the funnel is unclear, ask.

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

7. **Client's own assets**: their website (program pages, prices, schedules, requirements, financial aid, reviews, stats like pass rates), socials and any page they list in the intake. These answer most gaps before you mark anything [PLACEHOLDER].

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

**IPS is a template of elements, not content.** It tells you which docs exist, which sections each one has, roughly how long, and the house formatting style. Everything inside comes from THIS client: their audience (age, gender, life stage), their funnel, their offer, numbers, proof, wording and assumptions. IPS sells to moms, so never carry over "she/her", "moms", or any IPS audience, claim, stat, guarantee wording or funnel step. Use gender-neutral wording ("they", "you") unless the client's own data says the audience is one gender.

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

**Checkpoint 2.** After docs 1-3 (ICP, offer & guarantee, stats), stop and wait for Ema's OK. Everything after builds on them. After that, run docs 4-16 one at a time without stopping, unless Ema says otherwise. If Ema says "go for all", skip this stop and build all 16; she reviews in Drive at the end.

Offer & guarantee and Stats have no doc of their own: put them in the ICP & Personas doc as their own sections, and repeat them in the Marketing Strategy doc.

### Doc rules

**ICP & Personas**
- Section 1 market overview (market context, key challenge, segmentation logic, buying calendar with real enrollment dates), Section 2 personas, Section 3 intake claims with a verdict, Section 4 messaging per persona.
- Personas = **1 archetype, different places in life** (e.g. "the burned-out corporate exec", "the one who just got laid off", "the empty nester"). Never random splits like "aspiring X vs adjacent professional". Table: persona · their place in life · what keeps them up at night · what they need to hear · proof we can use. Map real case studies to each persona; mark personas without proof as [NEED: case study].

**Offer & Guarantee** (IPS style)
- Offer: 1 headline line with a real timeline from the program ("Become a ... & ... in 21 Weeks").
- Guarantee in the founder's voice: "Here's my promise: go through the training, do the work, show up to mentorship, and follow the steps. If you don't ..., I'll keep working with you until you do, at no additional cost." Use the client's own guarantee idea if they gave one, as an option B.

**Stats**: list only stats found in the gathered sources. Then list what's missing (grad count, income range, top earner, pass rates, employers, press, brand deals, reviews).

**Pain points**: real web research (extended search, several queries in one turn: Reddit/forums, reviews of competitors, news). Plus the client's own case-study quotes, which are usually the best voice of customer. Output 5 pains, each: the pain in their words as a heading, 2-3 bullets of evidence with quotes, 1 hook. Then "the deepest emotional pain" line and which pains suit cold ads vs landing page/retargeting. End with a Sources list of links.

**Ad copy**: 4 ads + 4 headlines with IPS's elements (hook naming the audience in the first 3-5 words, ✅/✔ bullets on what they get from the next funnel step, proof lines, CTA that matches the client's funnel, e.g. watch the training, or fill the Meta form and book). 1 ad carries the guarantee.

**Objection videos**: follow the "Updated" tab of IPS's doc, minus its price video. 5 scripts in the founder's voice, each a standalone ~30-second video. Keep IPS's header (record vertically, 5 videos, 1 USD/video, 5 USD/day, goal). Objections are reasons someone hesitates to **start with this client** (saturation, age, time, will I get clients, which program is legit, etc.). Hooks get to the objection in the first sentence. **Never mention the client's price.** Comparing to other things (a degree, years of school) is fine. Add 2 backup objections as one-liners.

**VSL**: IPS's 12 sections (hook, who it's for, promise, imagine, proof, origin story, the one problem, 3 steps, options, offer + guarantee, testimonials repeated, CTA) plus the b-roll list at the top. Origin story from the client's own words; where they left gaps, put [CLIENT: add ...] instead of inventing life events. CTA mentions the next real enrollment date.

**Thank-you VSL**: IPS's 7 sections. If show rate is a known leak, put the confirm step early and repeat it in the close. If affordability or "can't decide alone" is a known issue, add the "invite your partner" line and flag it.

**Form questions**: Form 1 opt-in, Form 2 qualification survey, Form 3 booking. Build qualifiers from the client's "what makes a lead qualified" answer (location, budget readiness, time, etc.). Mark disqualifying answers ❌ (cannot book). Add 1 non-disqualifying persona question so the closer knows which story to lead with. Short "why these questions" bullets.

**CRM messages and Marketing Strategy**: use IPS's set of flows and channels (SMS/email) as the checklist, then fit each flow to the client's funnel (e.g. a Meta form funnel has no landing-page survey). Use the client's real call-taker name, booking link and cohort dates, or placeholders.

**Marketing Strategy doc**: match the formatting of Ema's current strategy docs (real table of contents, bold labels, 👉 lines, checkboxes, a link to each of this client's docs). If Ema pastes another client's strategy in as the layout, keep the layout and rewrite every word for this client: offer, guarantee, stats, funnel map, budget, targeting, the founder's name, and delete the other client's leftovers. Every link must point to this client's docs (the API can't create smart chips, so use the doc title as a hyperlink). Read it back and check no other client's name, link or assumption is left. Tell Ema to refresh the table of contents and untick approval checkboxes copied from the other client.

## Output rules

- **Always write each doc into its Google Doc in the client's Drive folder** (the blank docs from step 2), so the link stays the same. Don't paste full docs in chat; in chat give Ema the doc link plus 1-2 lines on what's in it.
  - How: write the doc as simple markdown in the scratchpad (headings `#`/`##`/`###`, `- ` bullets, `1. ` lists, `| tables |`, `**bold**`, `[text](url)`; write `(` `)` inside URLs as `%28` `%29`; use `| | |` as the first table row for a table without a header). Run `python3 -I .claude/skills/client-strategy/scripts/md_to_docs.py doc.md` and send its output as `requests` to Google Docs `update_doc` on the blank doc. Then read the doc back with Drive `read_file_content` to check it.
  - **Match IPS's formatting** in Ad Copy, Objection videos, VSL, Thank-you VSL and Form questions. No headings and no doc title. Bold labels instead ("Ad Copy 1 (persona)", "OBJECTION VIDEO 1 - "...?"", "Confirm with <contact>"). 12pt space above/below on every paragraph. Recording notes ("RECORD VERTICALLY/HORIZONTAL...", "EXAMPLE:") bold red 13pt. VSLs start with the placeholder line in bold italic yellow highlight; each section is a bold title + soft line break + first paragraph in one paragraph. Form headers bold + underlined; questions bold, answers bulleted. ✅ lists sit in one paragraph with soft line breaks. Build these with `scripts/ips_format.py` (see its docstring), not `md_to_docs.py`.
  - The script only works on an **empty** doc. If the doc already has content, don't overwrite it: ask Ema (or add the new version as a new tab).
  - Google Docs connector down: say so, and fall back to giving the doc in chat.
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
