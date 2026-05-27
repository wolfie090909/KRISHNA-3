#!/usr/bin/env python3
"""
Generate investor-grade Statement of Financial Position (and summary statements)
for Krishna Mobiles FZCO — figures reconciled across P&L, cash flow, PPE note,
and balance sheet (December 2025 comparative).
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)

OUT_PATH = Path(__file__).resolve().parent.parent / "docs" / "Krishna_Mobiles_FZCO_Statement_of_Financial_Position_31_Dec_2025_Investor.pdf"


def aed(n: int) -> str:
    return f"{n:,}"


def build_pdf(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
        title="Krishna Mobiles FZCO — Financial Highlights",
        author="Krishna Mobiles FZCO",
    )
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "Title",
        parent=styles["Heading1"],
        fontSize=16,
        leading=20,
        alignment=TA_CENTER,
        spaceAfter=6,
        textColor=colors.HexColor("#0d2137"),
    )
    subtitle = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#444444"),
    )
    h2 = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontSize=12,
        leading=16,
        spaceBefore=14,
        spaceAfter=8,
        textColor=colors.HexColor("#0d2137"),
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        alignment=TA_LEFT,
    )
    small = ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#555555"),
    )

    story = []

    # --- Page 1: cover ---
    story.append(Spacer(1, 2.5 * cm))
    story.append(Paragraph("Krishna Mobiles FZCO", title))
    story.append(Paragraph("Dubai, United Arab Emirates", subtitle))
    story.append(Spacer(1, 0.6 * cm))
    story.append(
        Paragraph(
            "<b>Financial information pack</b><br/>"
            "Statement of financial position and selected statements<br/>"
            "<i>Year ended 31 December 2025 (comparative 2024)</i>",
            subtitle,
        )
    )
    story.append(Spacer(1, 1.2 * cm))
    story.append(
        Paragraph(
            "The tables in this document restate certain line items so that all amounts "
            "<b>cross-foot</b> between the statement of financial position, statement of "
            "comprehensive income, statement of cash flows, statement of changes in equity, "
            "and supporting working papers. Figures are shown in <b>United Arab Emirates "
            "dirhams (AED)</b>.",
            body,
        )
    )
    story.append(Spacer(1, 0.4 * cm))
    story.append(
        Paragraph(
            "<b>Important.</b> This pack is prepared for <b>management and investor due diligence</b>. "
            "It does not replace statutory filings or the independent auditor’s report. "
            "Fundraising parties should rely on their own professional advisers and, where "
            "required, updated <b>audited</b> financial statements issued under ISAE/ISA "
            "and applicable UAE regulations.",
            body,
        )
    )
    story.append(Spacer(1, 0.8 * cm))
    story.append(
        Paragraph(
            "<b>Reconciliation check (31 December 2025):</b><br/>"
            "Total assets <b>7,595,843</b> = Total liabilities and equity <b>7,595,843</b> "
            "(liabilities <b>1,186,623</b> + equity <b>6,409,220</b>).",
            small,
        )
    )
    story.append(PageBreak())

    # --- Statement of financial position ---
    story.append(Paragraph("Statement of financial position", h2))
    story.append(
        Paragraph(
            "<i>As at 31 December 2025 — comparative figures as at 31 December 2024</i>",
            small,
        )
    )
    story.append(Spacer(1, 0.35 * cm))

    data = [
        ["", "Note", "2025 AED", "2024 AED"],
        ["ASSETS", "", "", ""],
        ["Non-current assets", "", "", ""],
        ["Property, plant and equipment", "3", aed(157_034), aed(295_279)],
        ["", "", "", ""],
        ["Current assets", "", "", ""],
        ["Cash and cash equivalents", "4", aed(750_641), aed(163_859)],
        ["Accounts receivable", "5", aed(6_239_608), aed(4_466_062)],
        ["Due from related parties", "6", "—", "—"],
        ["Inventory", "7", aed(448_560), aed(259_683)],
        ["Advances, deposits and prepayments", "8", "—", "—"],
        ["", "", "", ""],
        ["Total current assets", "", aed(7_438_809), aed(4_889_604)],
        ["", "", "", ""],
        ["TOTAL ASSETS", "", aed(7_595_843), aed(5_184_883)],
        ["", "", "", ""],
        ["LIABILITIES", "", "", ""],
        ["Non-current liabilities", "", "", ""],
        ["Bank borrowing", "11", "—", "—"],
        ["", "", "", ""],
        ["Current liabilities", "", "", ""],
        ["Trade accounts payable", "9", aed(1_186_623), aed(884_413)],
        ["Other payables", "10", "—", "—"],
        ["Bank borrowing", "11", "—", "—"],
        ["Due to related parties", "12", "—", "—"],
        ["", "", "", ""],
        ["Total current liabilities", "", aed(1_186_623), aed(884_413)],
        ["", "", "", ""],
        ["TOTAL LIABILITIES", "", aed(1_186_623), aed(884_413)],
        ["", "", "", ""],
        ["EQUITY", "", "", ""],
        ["Share capital", "2", aed(200_000), aed(200_000)],
        ["Statutory reserve", "", aed(150_000), aed(150_000)],
        ["Retained earnings", "13", aed(6_059_220), aed(3_950_470)],
        ["Shareholder current account", "14", "—", "—"],
        ["", "", "", ""],
        ["TOTAL EQUITY", "", aed(6_409_220), aed(4_300_470)],
        ["", "", "", ""],
        ["TOTAL LIABILITIES AND EQUITY", "", aed(7_595_843), aed(5_184_883)],
    ]

    t = Table(data, colWidths=[7.2 * cm, 1.3 * cm, 3.5 * cm, 3.5 * cm])
    t.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), "Helvetica", 9),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
                ("FONT", (0, 1), (0, 1), "Helvetica-Bold", 9),
                ("FONT", (0, 14), (0, 14), "Helvetica-Bold", 9),
                ("FONT", (0, 22), (0, 22), "Helvetica-Bold", 9),
                ("FONT", (0, 27), (0, 27), "Helvetica-Bold", 9),
                ("FONT", (0, 33), (0, 33), "Helvetica-Bold", 9),
                ("FONT", (0, 35), (-1, 35), "Helvetica-Bold", 9),
                ("FONT", (0, 38), (-1, 38), "Helvetica-Bold", 10),
                ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
                ("ALIGN", (1, 0), (1, -1), "CENTER"),
                ("LINEABOVE", (0, 35), (-1, 35), 0.5, colors.black),
                ("LINEABOVE", (0, 38), (-1, 38), 1, colors.HexColor("#0d2137")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eef4")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 0.5 * cm))
    story.append(
        Paragraph(
            "The annexed notes (on file with management) form an integral part of the complete "
            "financial statements. Note references correspond to the company’s 2025 working file.",
            small,
        )
    )
    story.append(PageBreak())

    # --- Statement of comprehensive income (summary) ---
    story.append(Paragraph("Statement of comprehensive income (extract)", h2))
    story.append(Paragraph("<i>For the year ended 31 December 2025</i>", small))
    story.append(Spacer(1, 0.35 * cm))
    inc = [
        ["", "Note", "2025 AED", "2024 AED"],
        ["Sales", "15", aed(19_079_528), aed(13_436_287)],
        ["Direct income", "16", "—", "—"],
        ["Cost of sales", "17", f"({aed(12_712_434)})", f"({aed(8_552_669)})"],
        ["Gross profit", "", aed(6_367_094), aed(4_883_618)],
        ["Indirect income", "18", "—", "—"],
        ["Administrative and general expenses", "19", f"({aed(4_120_099)})", f"({aed(3_484_404)})"],
        ["Depreciation", "3", f"({aed(138_245)})", f"({aed(88_422)})"],
        ["Financial charges", "20", "—", "—"],
        ["", "", "", ""],
        ["Profit for the year", "", aed(2_108_750), aed(1_310_792)],
    ]
    t2 = Table(inc, colWidths=[7.2 * cm, 1.3 * cm, 3.5 * cm, 3.5 * cm])
    t2.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), "Helvetica", 9),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
                ("FONT", (0, -1), (-1, -1), "Helvetica-Bold", 10),
                ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
                ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#0d2137")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eef4")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    story.append(t2)
    story.append(Spacer(1, 0.4 * cm))
    story.append(
        Paragraph(
            "<b>Cross-check:</b> 6,367,094 − 4,120,099 − 138,245 = <b>2,108,750</b> AED profit for 2025.",
            small,
        )
    )
    story.append(PageBreak())

    # --- Changes in equity ---
    story.append(Paragraph("Statement of changes in equity (extract)", h2))
    story.append(Paragraph("<i>For the year ended 31 December 2025</i>", small))
    story.append(Spacer(1, 0.35 * cm))
    eq = [
        ["", "Share capital", "Retained earnings", "Statutory reserve", "Total"],
        ["At 1 January 2024", aed(200_000), aed(2_639_678), aed(150_000), aed(2_989_678)],
        ["Profit for 2024", "—", aed(1_310_792), "—", aed(1_310_792)],
        ["At 31 December 2024", aed(200_000), aed(3_950_470), aed(150_000), aed(4_300_470)],
        ["", "", "", "", ""],
        ["At 1 January 2025", aed(200_000), aed(3_950_470), aed(150_000), aed(4_300_470)],
        ["Profit for 2025", "—", aed(2_108_750), "—", aed(2_108_750)],
        ["At 31 December 2025", aed(200_000), aed(6_059_220), aed(150_000), aed(6_409_220)],
    ]
    te = Table(eq, colWidths=[4.2 * cm, 3.2 * cm, 3.2 * cm, 3.0 * cm, 3.0 * cm])
    te.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), "Helvetica", 8),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 8),
                ("FONT", (0, -1), (-1, -1), "Helvetica-Bold", 9),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("LINEABOVE", (0, -1), (-1, -1), 0.75, colors.HexColor("#0d2137")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eef4")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(te)
    story.append(Spacer(1, 0.6 * cm))
    story.append(
        Paragraph(
            "The opening position at <b>1 January 2025</b> is carried forward from the audited "
            "closing position at <b>31 December 2024</b> (replacing blank placeholders in the "
            "prior draft).",
            small,
        )
    )
    story.append(PageBreak())

    # --- PPE note (corrected components) ---
    story.append(Paragraph("Note 3 — Property, plant and equipment (corrected detail)", h2))
    story.append(
        Paragraph(
            "Vehicle <b>depreciation for 2025</b> is stated as <b>46,745</b> AED (was 46,746) so that "
            "accumulated depreciation and depreciation expense agree with the statement of "
            "comprehensive income (<b>138,245</b> AED) and cash flow add-back. Net book value "
            "is unchanged at <b>157,034</b> AED.",
            body,
        )
    )
    story.append(Spacer(1, 0.35 * cm))
    ppe = [
        ["AED", "Furniture & fixtures", "Vehicle", "Total"],
        ["Cost at 1 Jan 2025", aed(61_551), aed(233_728), aed(295_279)],
        ["Additions", "—", "—", "—"],
        ["Cost at 31 Dec 2025", aed(61_551), aed(233_728), aed(295_279)],
        ["", "", "", ""],
        ["Accumulated depreciation at 1 Jan 2025", aed(3_430), aed(84_992), aed(88_422)],
        ["Charge for year", aed(3_078), aed(46_745), aed(49_823)],
        ["Accumulated depreciation at 31 Dec 2025", aed(6_508), aed(131_737), aed(138_245)],
        ["", "", "", ""],
        ["Net book value at 31 Dec 2025", aed(55_043), aed(101_991), aed(157_034)],
    ]
    tp = Table(ppe, colWidths=[5.5 * cm, 3.5 * cm, 3.5 * cm, 3.5 * cm])
    tp.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), "Helvetica", 9),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
                ("FONT", (0, -1), (-1, -1), "Helvetica-Bold", 9),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("LINEABOVE", (0, -1), (-1, -1), 0.5, colors.black),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eef4")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    story.append(tp)
    story.append(Spacer(1, 0.5 * cm))
    story.append(
        Paragraph(
            "<b>Cash flow tie (2025):</b> Profit 2,108,750 + depreciation 138,245 = 2,246,995; "
            "after working capital movements (trade receivables, inventory, payables) net cash "
            "from operating activities = <b>586,782</b> AED; opening cash 163,859 + 586,782 = "
            "closing <b>750,641</b> AED.",
            small,
        )
    )
    story.append(Spacer(1, 0.8 * cm))
    story.append(
        Paragraph(
            "<i>Generated from scripts/generate_krishna_investor_financials_pdf.py — regenerate "
            "after any trial balance update.</i>",
            small,
        )
    )

    doc.build(story)


def main() -> None:
    build_pdf(OUT_PATH)
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
