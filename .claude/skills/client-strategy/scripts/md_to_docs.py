#!/usr/bin/env python3
"""Turn simple markdown into one Google Docs batchUpdate for an EMPTY doc.

Usage: python3 md_to_docs.py doc.md > requests.json
Then send {"requests": <that list>} with Google Docs update_doc on the blank doc.

Supports: # / ## / ### headings, paragraphs, "- " bullets, "1. " numbered
items, | tables | (first row bold, separator row skipped), **bold** and
[text](url) inline. A blank line separates blocks.
"""
import json
import re
import sys

INLINE = re.compile(r"\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)")


def u16(s):
    return len(s.encode("utf-16-le")) // 2


def parse_inline(text):
    """Return plain text plus (start, end, style) spans in UTF-16 offsets."""
    out, spans, pos = "", [], 0
    for m in INLINE.finditer(text):
        out += text[pos:m.start()]
        start = u16(out)
        if m.group(1) is not None:
            out += m.group(1)
            spans.append((start, u16(out), {"bold": True}, "bold"))
        else:
            out += m.group(2)
            spans.append((start, u16(out), {"link": {"url": m.group(3)}}, "link"))
        pos = m.end()
    out += text[pos:]
    return out, spans


def blocks(md):
    lines = md.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue
        if line.lstrip().startswith("|"):
            rows, first = [], True
            has_header = True
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if first and all(c == "" for c in cells):
                    has_header = False  # "| | |" = no header row
                elif not all(re.fullmatch(r":?-+:?", c) or c == "" for c in cells):
                    rows.append(cells)
                first = False
                i += 1
            width = max(len(r) for r in rows)
            yield ("table", ([r + [""] * (width - len(r)) for r in rows], has_header))
            continue
        m = re.match(r"(#{1,3}) (.*)", line)
        if m:
            yield ("HEADING_%d" % len(m.group(1)), m.group(2))
        elif re.match(r"\s*- ", line):
            yield ("bullet", re.sub(r"^\s*- ", "", line))
        elif re.match(r"\s*\d+\. ", line):
            yield ("number", re.sub(r"^\s*\d+\. ", "", line))
        else:
            yield ("NORMAL_TEXT", line)
        i += 1


def build(md):
    reqs, styles, cur = [], [], 1
    list_runs = []  # (kind, start, end) for consecutive bullet/number paragraphs

    def add_list(kind, start, end):
        if list_runs and list_runs[-1][0] == kind and list_runs[-1][2] == start:
            list_runs[-1] = (kind, list_runs[-1][1], end)
        else:
            list_runs.append((kind, start, end))

    for kind, content in blocks(md):
        if kind == "table":
            content, has_header = content
            R, C = len(content), len(content[0])
            i = cur
            reqs.append({"insertTable": {"rows": R, "columns": C, "location": {"index": i}}})
            filled = 0
            cell_reqs = []
            for r in range(R):
                for c in range(C):
                    text, spans = parse_inline(content[r][c])
                    if not text:
                        continue
                    at = i + 4 + r * (2 * C + 1) + 2 * c
                    cell_reqs.append((at, text, spans, has_header and r == 0))
            # fill from last cell to first so earlier indexes stay valid
            for at, text, _, _ in reversed(cell_reqs):
                reqs.append({"insertText": {"location": {"index": at}, "text": text}})
            # final positions of each cell's text after all fills
            shift = 0
            for at, text, spans, header in cell_reqs:
                s = at + shift
                e = s + u16(text)
                if header:
                    styles.append({"updateTextStyle": {"range": {"startIndex": s, "endIndex": e},
                                                       "textStyle": {"bold": True}, "fields": "bold"}})
                for a, b, st, f in spans:
                    styles.append({"updateTextStyle": {"range": {"startIndex": s + a, "endIndex": s + b},
                                                       "textStyle": st, "fields": f}})
                shift += u16(text)
            filled = shift
            cur = i + 3 + R * (2 * C + 1) + filled
            continue
        text, spans = parse_inline(content)
        start = cur
        reqs.append({"insertText": {"location": {"index": cur}, "text": text + "\n"}})
        end = cur + u16(text) + 1
        if kind.startswith("HEADING"):  # a blank doc's paragraphs are already NORMAL_TEXT
            styles.append({"updateParagraphStyle": {"range": {"startIndex": start, "endIndex": end},
                                                    "paragraphStyle": {"namedStyleType": kind},
                                                    "fields": "namedStyleType"}})
        if kind in ("bullet", "number"):
            add_list(kind, start, end)
        for a, b, st, f in spans:
            styles.append({"updateTextStyle": {"range": {"startIndex": start + a, "endIndex": start + b},
                                               "textStyle": st, "fields": f}})
        cur = end
    for kind, s, e in list_runs:
        preset = "BULLET_DISC_CIRCLE_SQUARE" if kind == "bullet" else "NUMBERED_DECIMAL_ALPHA_ROMAN"
        styles.append({"createParagraphBullets": {"range": {"startIndex": s, "endIndex": e},
                                                  "bulletPreset": preset}})
    return reqs + styles


if __name__ == "__main__":
    print(json.dumps(build(open(sys.argv[1], encoding="utf-8").read()), ensure_ascii=False, separators=(",", ":")))
