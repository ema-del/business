# The Enrollment Ad Map (Pacow Media · GrowthOS™)

The 5 decisions behind every ad we ship for education clients. Run them in order to plan a new ad (Plan mode, top to bottom), or backwards to reverse-engineer an ad spotted in the wild (Swipe-file mode, bottom to top).

## Who decides
Ema chooses every ad and makes all 5 decisions herself. Claude does NOT pick the avatar, awareness level, pain, angle or format, and does not suggest ad strategy or which ads to make unless Ema explicitly asks.

When Ema says "ad map", she'll give her 5 choices (in any order or shorthand). Claude's job:
- Map her words to the 5 steps below and write the ad exactly to those choices.
- If one of the 5 is missing or unclear, ask her for it. Don't fill it in.

## The 5 decisions

### 1. Who's the ad for
Name the exact niche, then narrow it to one real person inside that niche and where they are in their journey. One avatar, never a broad audience.
- Examples: parent of an ACT/SAT student · adult learner picking a language school · family shopping admissions consultants · student choosing a vocational program
- Always add the niche detail: grade, deadline, or score gap.

### 2. Level of awareness
Have they named the problem, or are they still shopping tutors?
- **Unaware:** "I don't know I have a problem"
- **Problem Aware:** "I know I have a problem"
- **Solution Aware:** "I know coaching/this method exists"
- **Aware of My Offer:** "I know you exist"

### 3. The pain we're speaking to
What's actually keeping them up at night? One pain per ad.
- Examples: score plateaued 2 tests in a row · application deadline creeping up · tried self-study, still stuck · booked calls with families who won't enroll · cohort seats not filling on time

### 4. The angle/approach
The wrapper around the pain point: the same problem, said a different way.
- Mistakes · New Method · Proof · Personal Story · Benefit · Contrarian · Guarantee

### 5. Format
- Static · Carousel · Video

## Worked example: ACT tutoring client
Parent, junior year student → Problem Aware → Score plateaued twice → Proof → Before/after stat card (static)

## How to run it

**When Ema gives her choices:**
1. Read the client's profile (Drive: "00. Client Profiles (Claude)") only for facts: their niche wording, offers, real proof, stats and guarantees.
2. Repeat her choices back as one line: Avatar → Awareness → Pain → Angle → Format.
3. Write the ad to exactly those choices, following our ad rules (Ad System Prompt, Skool "Making Killer Ads") and writing style: hook names the audience in the first 3 to 5 words, real numbers and real proof, no invented results ([PLACEHOLDER] if proof is missing), no em dashes.
4. Output by format: static = headline + visual idea + caption; carousel = slide by slide + caption; video = short script (hook, body, CTA).
5. Don't add extra ads, alternative angles or strategy suggestions unless she asks.

**Swipe-file mode (only when Ema asks to break down an ad):**
Work bottom to top: name the format, angle, pain, awareness level and who it's for. Stop there unless she asks for more.
