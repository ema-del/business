# Client offboarding: Drive archive + hand-off

Run this when Ema says to offboard a client (or "do a client" / "let's do [client]").

Inputs:
- Client name
- Client's original folder link (if Ema doesn't give it, search Drive for a folder with the client's name)
- Client's Shared Drive name (optional, Ema creates it and moves the files herself)

Past Clients folder (always the same):
https://drive.google.com/drive/folders/1l42gUMbxOeuUDCpZ-4niLQtsWB6EVmTu

## Goal
1. Make a full backup copy of the client's folder (all subfolders and files) inside Past Clients.
2. Ema moves the original folder into the client's Shared Drive herself.
3. Draft the hand-off message for the client. **Always do this step, every time, even if the backup already exists.**

## Step 1: map the original folder
- Use Google Drive search_files with: parentId = '[folder ID]'
- Always follow nextPageToken until it's empty.
- Go into every subfolder, all levels deep.
- Show Ema a short summary: number of folders, number of files, and anything that won't copy well (Google Forms lose responses, shortcuts and Google Sites don't copy).
- Check Past Clients for an existing folder with the client's name. If one exists, ask Ema before doing anything. If she says it's done, skip to Step 6.
- Wait for Ema's "go" before Step 2.

## Step 2: rebuild the folders
- Create a folder named [CLIENT NAME] inside Past Clients.
- Recreate every subfolder with the exact same names and structure.
- Use create_file with contentMimeType = application/vnd.google-apps.folder.

## Step 3: copy every file
- Use copy_file for each file, into the matching new folder.
- Always set the title to the original name (otherwise Google adds "Copy of").
- Go folder by folder and report progress after each one.

### If you hit your action limit
- Stop and tell Ema how many files are done out of the total.
- Give her a copy-paste brief for a new session listing ONLY the remaining files: file name, file ID, and the destination folder ID.
- Remind her not to move the original yet.

## Step 4: check the copy
- Count folders and files in the new copy and compare to the original.
- Say clearly: "Safe to move the original" or list what's missing.

## Step 5: Ema moves the original
- Ema drags the original folder's contents into the client's Shared Drive.
- You can't create Shared Drives or move files into them. That's her job.
- Once she confirms it's moved, search for the client's files again to get the new links.

## Step 6: draft the client message
- Draft only, in the chat. Never send. Ema sends it.
- Read the client's profile first (for their first name).
- One line per main folder, based on the actual file names inside it. Name the real things (sequence names, sheet names, video names), not generic descriptions.
- Follow this format exactly:

```
Hey [First name]!

Sorry for the delay on this, but we have transferred all your drive assets to this shared drive.

Here's everything we built together during the accelerator, all in one place:

1. 01. Onboarding: [what's inside]
[folder link]

2. 02. Creatives: [what's inside]
[folder link]

3. 03. CRM & Email Marketing: [what's inside]
[folder link]

4. 04. Reporting: [what's inside]
[folder link]

5. 05. Calls: [what's inside]
[folder link]

6. 06. Other: [what's inside]
[folder link]

Let me know if you can't open anything or something's missing!
```

Format rules:
- "Hey [First name]!" with no @.
- Say "the accelerator", not "GrowthOS".
- No top-level folder link, no emoji, no tips or recommendations, no sign-off.
- Match the folder list to the client's real folders (skip empty ones, add any extra ones in the same style).
- Drop "Sorry for the delay on this, but" only if Ema says the hand-off is on time.
- Writing rules from writing-style.md apply: no em dashes, no AI buzzwords.

## Rules
- Never delete, trash or move the original folder. Only copy.
- Never touch other clients' folders in Past Clients.
- Copies are a snapshot. Flag any sheets edited in the last 7 days, since they may have live data feeding in.
- Copies don't keep comments or version history. The original in the Shared Drive does.
- Client data lives in Drive only. Never copy it into this repo.
