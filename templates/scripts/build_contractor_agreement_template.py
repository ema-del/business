"""Generate a blank, fully templated Independent Contractor Agreement PDF.

Every party-, business-, date-, and money-specific value is a [BRACKETED
PLACEHOLDER] so the same file can be reused for any client or contractor.

Usage:  python3 build_contractor_agreement_template.py [output.pdf]
"""

import sys

from reportlab.lib.colors import HexColor, black
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

MARGIN = 1.0 * inch
GREY = HexColor("#666666")

title_style = ParagraphStyle(
    "title", fontName="Helvetica-Bold", fontSize=11, leading=16, spaceAfter=16,
    alignment=TA_LEFT, textColor=black,
)
body_style = ParagraphStyle(
    "body", fontName="Helvetica", fontSize=11, leading=16, spaceAfter=16,
    alignment=TA_LEFT, textColor=black,
)
item_style = ParagraphStyle(
    "item", parent=body_style, leftIndent=35, bulletIndent=18, spaceAfter=12,
)
sub_style = ParagraphStyle(
    "sub", fontName="Helvetica-Oblique", fontSize=11, leading=16,
    leftIndent=72, bulletIndent=53, spaceAfter=0, textColor=GREY,
)
sub_bullet_style = ParagraphStyle("subbullet", parent=sub_style, bulletFontName="Helvetica-Oblique")
sig_head_style = ParagraphStyle(
    "sighead", fontName="Helvetica-Bold", fontSize=11, leading=16, spaceAfter=10,
)
sig_label_style = ParagraphStyle("siglabel", fontName="Helvetica", fontSize=11, leading=16)

SUB_LETTERS = "abcdefghijklmnopqrstuvwxyz"


def item(number, text):
    return Paragraph(text, item_style, bulletText="%d." % number)


def subs(texts):
    out = []
    for i, text in enumerate(texts):
        style = sub_style if i < len(texts) - 1 else ParagraphStyle(
            "sublast", parent=sub_style, spaceAfter=12
        )
        out.append(Paragraph(text, style, bulletText="%s." % SUB_LETTERS[i]))
    return out


def signature_block(heading):
    rows = [[Paragraph(label, sig_label_style), ""]
            for label in ("Signature:", "Name:", "Company:", "Date:")]
    table = Table(rows, colWidths=[106, 265], rowHeights=[34] * 4)
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LINEBELOW", (1, 0), (1, -1), 0.9, black),
    ]))
    return KeepTogether([Paragraph(heading, sig_head_style), table])


def story():
    s = [Paragraph("INDEPENDENT CONTRACTOR AGREEMENT", title_style)]

    s.append(Paragraph(
        "This Work for Hire Agreement (&ldquo;Agreement&rdquo;) is made on "
        "________________, between [SERVICE PROVIDER FULL NAME] "
        "(&ldquo;The Service Provider&rdquo;) and [CLIENT COMPANY NAME] "
        "(&ldquo;The Client&rdquo;).", body_style))

    s.append(item(1,
        "DESCRIPTION OF SERVICES. Beginning on [START DATE], The Service Provider "
        "will provide the following services (collectively, the &ldquo;Services&rdquo;):"))
    s += subs([
        "[Describe service #1]",
        "[Describe service #2]",
        "[Describe service #3]",
        "[Describe service #4]",
        "[Describe service #5 &mdash; add or remove lines as needed]",
    ])

    s.append(item(2,
        "SERVICE LOCATION. The Service to be provided under this Agreement shall be "
        "performed at [SERVICE LOCATION] (e.g. The Service Provider&rsquo;s place of "
        "business / home office)."))

    s.append(item(3,
        "SCHEDULE AND DAYS OFF. The Service Provider&rsquo;s assistance is generally "
        "available to provide Services"))
    s += subs([
        "[DAYS OF THE WEEK], [NUMBER] days per week",
        "Work will be performed for at least [NUMBER] hrs a day",
        "Times will be agreed upon by client and service provider at least [NUMBER] "
        "days prior to each work day",
        "The service provider will be consistent and will perform their task diligently "
        "every day, unless extenuating circumstances apply (e.g. poor health, family "
        "emergency)",
    ])

    s.append(item(4,
        "PAYMENT FOR SERVICES. The Client will pay compensation to The Service Provider "
        "for the Services at a rate of [$RATE] per [HOUR / WEEK / MONTH] + "
        "[$COMMISSION AMOUNT] commission for [DESCRIBE WHAT EARNS THE COMMISSION]. "
        "The Service Provider will have an opportunity to ascend to "
        "[$INCREASED RATE] per [HOUR / WEEK / MONTH] and [$INCREASED COMMISSION] "
        "commission after milestones are set and met after the initial [NUMBER] days "
        "of training. Those milestones will be added as an amendment to this Agreement "
        "when they are created after the first [NUMBER] days of training. The "
        "compensation shall be payable and due on [PAYMENT DATES] of each month."))

    s.append(item(5,
        "TERM/TERMINATION. Either party may terminate this Agreement upon [NUMBER] days "
        "written notice to the other party. Provided, however, that each party may "
        "terminate the Agreement immediately without prior notice in the event of a "
        "breach of this Agreement by the other party. Upon Termination, The Client will "
        "send any remaining payments due immediately."))

    s.append(item(6,
        "NON-DISCLOSURE AND NON-SOLICITATION. The Service Provider shall not directly or "
        "indirectly disclose to any person other than a representative of The Client at "
        "any time either during the term of this Agreement or following termination or "
        "expiration thereof, any confidential or proprietary information pertaining to "
        "The Client, including but not limited to customer lists, contacts, financial "
        "data, sales data, supply sources, business opportunities for new or developing "
        "business, plans and models, or trade secrets. Furthermore, The Service Provider "
        "agrees that during the term of this Agreement, and for [NUMBER] years following "
        "the termination of this Agreement, The Service Provider shall not directly or "
        "indirectly solicit or attempt to solicit any customer or suppliers of The Client "
        "other than on behalf of The Client."))

    s.append(item(7,
        "RELATIONSHIP OF PARTIES. It is understood by the parties that The Service "
        "Provider is an independent contractor with respect to The Client and not an "
        "employee of The Client. The Client will not provide fringe benefits, including "
        "health insurance benefits, paid vacation, or any employee benefit, for the "
        "benefit of The Service Provider."))

    s.append(item(8,
        "WORK PRODUCT OWNERSHIP. Any works copyrighted, ideas, discoveries, inventions, "
        "patents, products, or other information (collectively, the &ldquo;Work "
        "Product&rdquo;) developed in whole or in part by The Service Provider in "
        "connection with the Services shall be the exclusive property of The Client. Upon "
        "request, The Service Provider shall sign all documents necessary to confirm or "
        "perfect the exclusive ownership of The Client to the Work Product."))

    s.append(item(9,
        "LIABILITY. The Service Provider will not be liable for loss, damage or delay of "
        "The Client&rsquo;s project due to circumstances beyond The Service "
        "Provider&rsquo;s control. Such circumstances may include (but are not limited "
        "to) public unrest, power outages, and inability to contact The Client. In the "
        "event of such loss, damage, or delay, The Service Provider will make every "
        "effort to notify The Client immediately."))

    s.append(item(10,
        "CONFIDENTIALITY. The Service Provider will not at any time or in any manner, "
        "either directly or indirectly, use for personal benefit of The Service Provider, "
        "or divulge, disclose or communicate in any manner any information that is "
        "proprietary to The Client. The Service Provider will protect such information "
        "and treat it as strictly confidential. This provision shall continue to be "
        "effective after the termination of this Agreement. Upon termination of this "
        "Agreement, The Service Provider will return to The Client all records, notes, "
        "documentation and other items that were used, created, or controlled by The "
        "Service Provider during the term of this Agreement with the exception of items "
        "purchased by The Service Provider and not reimbursed by The Client."))

    s.append(item(11,
        "SEVERABILITY. If any provision of this Agreement shall be held to be invalid or "
        "unenforceable for any reason, the remaining provisions shall continue to be "
        "valid and enforceable. If a court finds that any provision of this Agreement is "
        "invalid or unenforceable, but that by limiting such provision would become valid "
        "and enforceable, then such provision shall be deemed to be written, construed, "
        "and enforced as so limited."))

    s.append(item(12,
        "GOVERNING LAW. This Agreement shall be governed by and construed in accordance "
        "with the laws of [STATE / COUNTRY], without regard to its conflict of law "
        "provisions."))

    s.append(item(13,
        "ENTIRE AGREEMENT. This Agreement contains the entire agreement of the parties "
        "and supersedes all prior discussions, representations, and agreements relating "
        "to its subject matter. Any amendment must be in writing and signed by both "
        "parties."))

    s.append(Spacer(1, 40))
    s.append(KeepTogether([
        signature_block("CLIENT:"),
        Spacer(1, 24),
        signature_block("SERVICE PROVIDER:"),
    ]))
    return s


def build(path):
    doc = BaseDocTemplate(
        path, pagesize=LETTER,
        leftMargin=MARGIN, rightMargin=MARGIN, topMargin=MARGIN, bottomMargin=MARGIN,
        title="Independent Contractor Agreement (Template)",
        author="", subject="Independent Contractor Agreement Template",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body")
    doc.addPageTemplates([PageTemplate(id="page", frames=[frame])])
    doc.build(story())
    return path


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "Independent_Contractor_Agreement_TEMPLATE.pdf"
    print("wrote", build(out))
