---
name: canva-static-ads
description: Builds batches of static image ads (usually 10) for a Pacow client straight into Canva, by copying our ad templates into the client's Canva design and rewriting every page. Three modes - "on the go" (turn a client's current winning ad into statics, like ST), "first launch" (Skool rule - same avatar, awareness, angle and format on every ad, only the pain point changes, Ema gives the pains), and "new from winner" (new statics from a winning pain point or ad that Ema names, or that Claude digs up in Meta Ads and GHL). Use when Ema says "statics for <client>", "make image ads", "10 image ads from the winner", "first launch statics", "put them in Canva", or pastes Canva template and design links.
---

# Canva static ads

Ema gives a client, a mode and Canva links. You pull the facts, pick templates, write the copy and build every page in Canva yourself.

Before you start, read `lessons.md` in this folder. It holds Ema's past corrections. They override anything below.

## Input

Ema types something like: `statics ST, 10 ads from the winner Video - Wrong-tutor, templates <link>, put them here <link>`

- **Client** (required). Read their profile first (CLAUDE.md, "Clients").
- **Mode**: on the go / first launch / new from winner. If it's unclear which, ask in one line.
- **Template source**: Canva folder or design links. Default: Ema's template folder `FAHHSf9AJT0` (the "NEW" design `DAHOUShgf9M` has 22 ready pages).
- **Destination**: the Canva design to add pages to. If missing, ask. Never build inside the template designs.
- **How many**: default 10.

### Modes

**1. On the go** (live client, like ST). Turn the client's best current ad into statics.
- Find the winner Ema names in Meta (see "Finding the winner"). Pull its primary text, headline and the script.
- Every static keeps the winner's elements: same avatar, same pain, same mechanism, same proof, same CTA. Only the hook wording and template change.

**2. First launch** (Skool rule). All 5 Ad Map elements are the same on every ad except the pain point.
- Ema shares the pain points in chat. If she hasn't, ask for them. Don't pick pains yourself.
- Ask her for the avatar, awareness, angle and format if they aren't clear from the strategy doc. Follow `ad-map.md`: you never choose these.
- Spread the pains evenly across the batch (e.g. 5 pains x 2 templates). Name each page by its pain.
- Open the Skool "Making Killer Ads" section in "Pacow Playbook (from Skool)" before writing.

**3. New from winner.** Fresh statics built on a winning pain point or ad.
- If Ema names the winner, use it.
- If she says "find it", dig it up yourself (see "Finding the winner"), then tell her in 2-3 lines which ad/pain you picked and why (spend, CPL, booked calls) before you build.

## Step 1: gather (read only)

1. **Client profile** (Drive "00. Client Profiles (Claude)"): offer, proof, stats, guarantees, niche wording, ICP.
2. **Winner** (modes 1 and 3): the ad copy and script. Meta preview gives the primary text and a frame; Meta won't hand over the video file, so look for the script in Drive (search the client's short code plus "script", "angle", "pain point", e.g. "(ST) L2 Angle testing"). Say which script you matched and why.
3. **Destination design**: `read-design` with `page_metadata`, `design_content` and a thumbnail. Note how many pages exist and the client's brand look (fonts, colours, profile photo, handle) on pages already there.
4. **Templates**: `list-folder-items` on the template folder, then `read-design` on the template design with every page as a thumbnail. Look at them all before choosing.
5. **SOPs**: "(SOP) How to Create Static & Carousel Ads" (`1WhE9h_xZHepOzQiEqSvBrpm2KIs1_-c1Gb7NmUOyTtE`) and the Ad System Prompt (`15xYxMkl7Bh75wlC6ZsrdkYL4gS78rdR85Xzy8Dg9XhU`) for copy rules.

## Step 2: pick templates

- Pick text-led templates that fit the copy: tweet styles, notes/reminder app, iMessage checklist, letter, big stat, "To parents..." text, tweet card over background.
- Skip templates built around another brand's people, logos or university photos unless you can swap them for the client's.
- One template per ad. Mix light and dark backgrounds across the batch.

## Step 3: write the copy

Write all ads in chat-ready form first (in your head or scratchpad), then build. Rules:
- Writing style: `writing-style.md`. No em dashes. No "not X, it's Y" or any negate-then-assert line, even if the winning script uses one (flag it to Ema instead).
- Hook names the audience in the first 3 to 5 words ("GCSE parents: ...", "Year 10 & 11 parents: ...").
- Proof only from the profile, live ads or Drive. Missing proof = `[PLACEHOLDER]`. Never invent student results, names or numbers.
- Use the client's best proof on every ad and vary the wording. Don't rotate in weaker or unverified proof unless Ema asks.
- Every ad ends with the client's CTA (e.g. "Book a free consultation 👇").
- Keep the date/time text on app-style templates current.

## Step 4: build in Canva

1. **Copy templates in.** `merge-designs` with `modify_existing_design`, `insert_pages` from the template design, `after_page_number` = last page. One call for all pages.
   - **Gotcha:** pages land in reverse order. Re-read `page_metadata` before editing and map page numbers to templates from the content, not from the order you asked for.
2. **Open one transaction.** `read-design` with `open_transaction: true` and `design_content` for the new pages. The result is often too big: it gets saved to a file. Parse it with `python3 -I` (json) to list every element per page: `locator_id`, type, top/left/width/height, text, media id. Group elements have `children`; their locators are `PAGE-GROUP-CHILD`.
3. **Swap brand bits on tweet/profile templates.**
   - Name and handle: `replace_text` on the group's text children. Then `resize_element` them to about 450 wide or they wrap.
   - Profile photo: find the client's avatar media id on an existing client page (`read-design` that page with the transaction open), then `update_fill` the avatar shape with that `asset_id`. It works on circle shapes.
   - Delete blue verified badges unless the client is verified.
4. **Edit one page per call** with `edit-design` (`keep_open`). After each call, look at the returned thumbnail and fix overlaps before moving on.
   - `replace_text` flattens mixed formatting. For text with bold/normal runs (e.g. "Your kid... **The test got different.**"), use `find_and_replace_text` once per run to keep the bold.
   - Text overflow: shorten the copy first, then `format_text` `font_size`, then `position_element` to push lower blocks down. Body text should stay 36px+ at 1080x1350.
   - Some templates have tiny placeholder fonts (13px). Always `format_text` body text to a real size.
   - **Gotcha:** `crop_media` on a photo or video box zooms the media weirdly. If it happens, `crop_media` again with `top: 0, left: 0` and the box's own width/height to restore it, then use `position_element` to move the box instead.
   - Some "photos" are video fills. That's fine: Ema exports them as PNG.
5. **Check every page** against the thumbnail: no overlaps, consistent margins, nothing off the page, no leftover template text (names, "Lorem ipsum", other brands, ACT/SAT wording).
6. **Save.** Ema asked for the ads in Canva, so `commit` once all pages look clean. Pages are added, never replacing hers. If she said "preview first", show thumbnails and wait.

## Finding the winner (Meta Ads + GHL)

- Account: `ads_get_ad_accounts`, match the client name (pick the one with spend and a payment method if there are several).
- Ads: `ads_get_ad_entities`, `level: ad`, `date_preset: maximum` or `last_90d`, fields id, name, amount_spent, effective_status plus results and cost per result (verify field names with `ads_get_field_context`). Filter by name if Ema gave one. Sort by spend; the winner is usually high spend with the lowest cost per lead/booked call.
- Copy: `ads_get_ad_preview` on the ad id gives primary text, headline, CTA and a frame.
- GHL (when booked calls matter more than leads): check bookings by UTM/ad name for the same ads. If GHL access isn't there, say so and use Meta only.
- Report in 2-3 lines before building: the ad, spend, CPL or cost per booked call, and the pain/angle it uses.

## Output (reply to Ema)

Short, bullets, answer first:
- Where they are: design link and page numbers (note the reverse order if you didn't fix it).
- What every ad keeps from the winner/brief, in one list.
- One line per ad: page number, template style, hook.
- Things to check: anything unverified, assumptions (e.g. which script matched the winner), template quirks (video fills, blank pages that were already there).
- Never upload to Meta or touch live ads. Ask first.

## Never

- Edit or delete the original templates.
- Put client data in this repo (it's public). Scratch files go in the session scratchpad only.
- Pick the Ad Map elements yourself in first-launch mode.
- Invent proof, results or testimonials.
