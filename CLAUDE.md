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
