#!/usr/bin/env python3
"""Build one Google Docs batchUpdate in IPS house formatting (no headings).

Used for Ad Copy, Objection videos, VSL, Thank-you VSL and Form questions.
In your own script: from ips_format import *; d = Doc(); d.p(...); reqs = d.build(end_index)
  d.p("text")                        normal paragraph, 12pt above/below
  d.p(("Label", B), " rest")          bold label + normal text
  d.p(("RECORD ...", REDB))           bold red 13pt recording note
  d.p(("T" + V, B), "body")            bold title, soft break, body in the same paragraph
  d.p("x", sp=False, bullet=g)        g = ("disc"|"num", d.newlist()), one g per list
  d.blank()                           empty 12pt paragraph
Style keys: b, i, u, red, big (13pt), hl (yellow highlight), link (url).
build(end) wipes the doc: end = endIndex of the last body paragraph (from read_doc).
Send with writeControl.requiredRevisionId from the same read_doc."""
import json
V="\u000b"
RED={"color":{"rgbColor":{"red":1}}}
BLUE={"color":{"rgbColor":{"red":0.067,"green":0.333,"blue":0.8}}}
YEL={"color":{"rgbColor":{"red":1,"green":1}}}
def u(s): return len(s.encode('utf-16-le'))//2
def style(k):
    st,f={},[]
    if 'b' in k: st['bold']=True; f.append('bold')
    if 'i' in k: st['italic']=True; f.append('italic')
    if 'u' in k: st['underline']=True; f.append('underline')
    if 'red' in k: st['foregroundColor']=RED; f.append('foregroundColor')
    if 'big' in k: st['fontSize']={"magnitude":13,"unit":"PT"}; f.append('fontSize')
    if 'hl' in k: st['backgroundColor']=YEL; f.append('backgroundColor')
    if 'link' in k:
        st['link']={"url":k['link']}; st['foregroundColor']=BLUE; st['underline']=True
        f+= ['link','foregroundColor','underline']
    return st, ",".join(dict.fromkeys(f))
class Doc:
    def __init__(s): s.P=[]; s.g=0
    def p(s,*segs,sp=True,bullet=None):
        # segs: str or (str, dict)
        segs=[(x,{}) if isinstance(x,str) else x for x in segs]
        s.P.append((segs,sp,bullet))
    def blank(s,sp=True): s.p("",sp=sp)
    def newlist(s): s.g+=1; return s.g
    def build(s,end):
        text="".join("".join(t for t,_ in segs)+"\n" for segs,_,_ in s.P)
        E=1+u(text)
        R=[{"deleteParagraphBullets":{"range":{"startIndex":1,"endIndex":end-1}}},
           {"deleteContentRange":{"range":{"startIndex":1,"endIndex":end-1}}},
           {"insertText":{"location":{"index":1},"text":text}},
           {"updateParagraphStyle":{"range":{"startIndex":1,"endIndex":E},"paragraphStyle":{"namedStyleType":"NORMAL_TEXT","spaceAbove":{"magnitude":0,"unit":"PT"},"spaceBelow":{"magnitude":0,"unit":"PT"}},"fields":"namedStyleType,spaceAbove,spaceBelow"}},
           {"updateTextStyle":{"range":{"startIndex":1,"endIndex":E},"textStyle":{},"fields":"bold,italic,underline,foregroundColor,backgroundColor,fontSize,link"}}]
        i=1; runs=[]; sps=[]
        for segs,sp,bl in s.P:
            start=i
            for t,k in segs:
                n=u(t)
                if k and n:
                    st,f=style(k)
                    R.append({"updateTextStyle":{"range":{"startIndex":i,"endIndex":i+n},"textStyle":st,"fields":f}})
                i+=n
            i+=1
            if sp:
                if sps and sps[-1][1]==start: sps[-1][1]=i
                else: sps.append([start,i])
            if bl:
                if runs and runs[-1][0]==bl and runs[-1][2]==start: runs[-1][2]=i
                else: runs.append([bl,start,i])
        for a,b in sps:
            R.append({"updateParagraphStyle":{"range":{"startIndex":a,"endIndex":b},"paragraphStyle":{"spaceAbove":{"magnitude":12,"unit":"PT"},"spaceBelow":{"magnitude":12,"unit":"PT"}},"fields":"spaceAbove,spaceBelow"}})
        for bl,a,b in runs:
            R.append({"createParagraphBullets":{"range":{"startIndex":a,"endIndex":b},"bulletPreset":"NUMBERED_DECIMAL_ALPHA_ROMAN" if bl[0]=="num" else "BULLET_DISC_CIRCLE_SQUARE"}})
        return R
B={'b':1}; BU={'b':1,'u':1}; REDB={'b':1,'red':1,'big':1}
