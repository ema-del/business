# Business repo — standing instructions

## Loom transcript → action items

Whenever the user pastes a Loom call transcript into the conversation, automatically
extract action items **per speaker**, formatted like:

```
Ema:

1. ...
2. ...

Jay:

1. ...
2. ...
```

**Roadmap rule:** if the transcript contains the word "roadmap" (case-insensitive),
append this action item to every speaker who is **not** Ema or Viktorija:

> Continue roadmap tasks and be ready for next coaching call

This applies per-transcript — only add the roadmap item when that transcript actually
contains "roadmap", and never add it to Ema's or Viktorija's list.

**Ordering rule:** order the speaker sections by dependency, not by speaking order or
alphabetically. If one person's action items block or are waited on by another
person's (e.g. Ema has to send something — a script, a link, an asset, feedback —
before the other person can act on theirs), list that blocking person's section
first. Example: if Ema needs to send Steve something before Steve can do his tasks,
list Ema first; if it's the reverse (Steve needs to send Ema something first), list
Steve first.

If there's no dependency either way (both sets of tasks can be done independently),
fall back to the speaking order in the transcript. If the dependency is mutual or
unclear, use best judgment on who the other party is more clearly waiting on first.
