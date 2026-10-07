# Pacow Media

## Video editor brief for Thuan

Ema names a client ("run the Thuan brief for NAE"). Build the brief, then
stop and let Ema send the Slack message herself.

### 1. Find the newest script

The client's folder lives under `01. Clients`. Inside it, scripts sit in
`02. Creatives/<offer or campaign>/Ad Bank`. A client can have several offer
tracks, each with its own Ad Bank, so check them all and take the Google Doc
with the newest `modifiedTime`.

### 2. Duplicate it into Thuan's briefs

Thuan's briefs folder: `1_KHOyTqrKVjDjmjRplb64b6KKMERdppF`

Copy the script into the client's subfolder there, keeping the original
title. Subfolders use the client's initials (NAE, ST, ZK, CMS). Create the
subfolder if it does not exist. Read the copy afterwards to confirm it is
not empty.

### 3. Log it in the payouts tracker

Sheet `1LqKT7x0JfBhGMga3QbeeSzCgsZg8XFEEu-GUy_N_4WA`, tab `Sep`.

The tab stays `Sep` even in later months. Ema keeps adding to it, so match
the tab the data is actually in rather than the current month.

Write columns A to D only:

| Column | Value |
| --- | --- |
| A | today, as `M/D/YYYY` |
| B | client initials plus a short descriptor (`ST level 2 mock exams`) |
| C | link to the duplicated script doc |
| D | number of scripts in the doc |

Never use the Sheets `append` call. Rows below the last filled one already
hold Rate and Project Total formulas, so append writes past the table and
orphans the row. Read column A first, find the first row empty in A to D,
and write that exact range.

E and F are formulas. Never write them.

A new row inherits no number format, so its date renders as `2026-10-07`
instead of `10/7/2026`. After writing, run `scripts/sheets_api.py
copyformat` from a filled row onto the new one.

Units are per video at $50, so D drives the payout. D = 1 for a single
script; a doc holding five numbered scripts is 5.

### 4. Draft the Slack message

Channel: `Thuan x Pacow Media` (`C0C0EKEA0KF`). It is a Slack Connect
channel, so it can only be drafted into, never posted to. Always draft and
let Ema send.

```
:new:  NEW VIDEO

Hey @thuan! New videos are ready to be edited :blush:

Brief here: <payouts tracker link, Sep tab>

The style is: video ad style

the client is: <client funnel or landing page>

The video is linked inside the script. <anything else Thuan needs>

LMK if you need more from me! Thanks
```

Do not link the script doc here. It is already in column C of the tracker.

### Finding the client's page

In this order:

1. The client profile in `00. Client Profiles (Claude)`
   (`1yryquCGWQNIS-kUvOm81Wjqg1SHFEw6f`). Profiles come from the GrowthOS
   intake form. Some list funnel pages outright under "Social profiles".
2. GHL, if the client has a sub-account: `getFunnels` gives each step's
   path. Pick the funnel matching the script's offer, then its opt-in step,
   which is where the ad clicks through to. GHL gives no domain, so combine
   the path with the domain from step 1 or 3.
3. The profile's contact email domain, as a last resort.

Always fetch the finished URL and confirm it returns 200 before putting it
in a brief. The email domain is unreliable: SmartaTutoring's email is
`@smartatutoring.co.uk` but their funnel is on `smartaeducation.co.uk`, and
franchise clients like Class101 sit on a path under a parent domain. If the
check fails, ask Ema rather than guessing.

## Writing for VAs

Short, plain English. Short sentences. No em dashes, use commas, periods or
parentheses. No "this isn't X, it's Y". Avoid: delve, leverage, unlock,
seamless, elevate, empower, streamline, game-changer, crucial, robust,
transformative.

## Google access

The Drive connector reads and copies files and creates folders. It cannot
edit a Doc's body or write spreadsheet cells, since `update_file` only
changes a title or parent.

Sheet writes go through `scripts/sheets_api.py`, authenticated by a service
account (`sheets-writer@sheets-automation-508110.iam.gserviceaccount.com`,
already an editor on the tracker). The key is not stored in this repo or in
the environment, so Ema pastes it each session and it is written to the
scratchpad, never to the repo.

Editing a Doc's body needs the Docs API, which is not set up. Hand Ema the
text to paste instead.
