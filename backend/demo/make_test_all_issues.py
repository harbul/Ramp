"""Generate ONE deliberately-broken PDF that exercises every accessibility
issue Ramp can detect (and most it can fix), in a single 12-page document.

    python backend/demo/make_test_all_issues.py

Writes  backend/demo/Vendor-Guest-AllIssuesTest.pdf

The document is TAGGED (has a StructTreeRoot) so the figure/heading/table
rules actually fire — an untagged doc only trips the struct-tree/lang/title
findings and reports "no figures found" / "headings not applicable" instead
of the real per-element issues. Everything below maps to a specific rule in
backend/src/pdf_remediation/core/wcag.py or a specific triage signal in
backend/src/pdf_remediation/api/triage.py / inventory/src/classify_form.py.

Issues baked in, by section:

  Doc-level (Modernization — all auto-fixable in one click)
    - No /MarkInfo                          -> WCAG-marked-info
    - No /Lang                               -> WCAG-3.1.1-lang
    - No /Title                              -> WCAG-2.4.2-title
    - No PDF/UA XMP declaration              -> PDFUA-metadata
    - 3 unlabeled AcroForm text fields        -> WCAG-4.1.2-form-labels

  Remediation (AI drafts, human reviews)
    - 2 tagged /Figure elements, no /Alt      -> WCAG-1.1.1-figure-alt
      (a bar chart + a pie chart, same pattern as make_sample_pdf.py, so
      the AI has real content to describe)

  Compliance (manual-only, no automated fix)
    - Heading level skip: H1 -> H3            -> WCAG-1.3.1-heading-skip
    - A data table with NO /TH header cells   -> WCAG-1.3.1-table-headers
    - No /Outlines on a 12-page document      -> WCAG-2.4.5-bookmarks
    - Low-contrast gray-on-white text block   -> visual only, human-reviewed
      under WCAG-1.4.3-contrast (the checker can't measure contrast itself,
      but a reviewer opening the file will see the failure immediately)
    - Red/green "status by color alone" block -> visual only; WCAG 1.4.1
      (Use of Color) has no dedicated rule in wcag.py, included anyway
      since it's one of the most common real-world a11y bugs

  Routing / triage signals (visible via Dashboard "Analyze new PDF", NOT
  the plain Workbench upload — only /pdf/triage runs signal detection)
    - AcroForm field "employee_ssn"           -> sensitive-data keyword
                                                  (also "employee" -> employment
                                                  record signal)
    - AcroForm field "date_of_birth"           -> sensitive-data keyword (dob)
    - AcroForm field "supervisor_approval"     -> workflow/approval keyword
    - AcroForm field "authorized_signature"
      (/FT /Sig)                               -> has_signature_field signal
    - Filename contains "Vendor" + "Guest"     -> external-user keyword
      (checked against the FILENAME, not body text — hence the odd name)
    - Any AcroForm fields present at all       -> route=UNSUPPORTED /
      INTERACTIVE_FORMS on upload scan (soft state: Find Issues still
      works fully, per RemediateFlow's ScanSummary soft-state handling)

Not included (deliberately, or not practically fakeable):
    - Font missing /ToUnicode: reportlab/pikepdf's core-14 Helvetica is
      explicitly whitelisted by wcag.py's checker as OK without a
      ToUnicode CMap, so this rule won't fire no matter what text tool
      generates the content stream without embedding a broken custom font.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pikepdf
from pikepdf import Array, Dictionary, Name, Pdf, String

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
from make_sample_pdf import (  # noqa: E402
    GOLD,
    GREEN,
    PAGE_H,
    PAGE_W,
    _bar_chart,
    _image_xobject,
    _pie_chart,
    _text_font,
)

OUT_NAME = "Vendor-Guest-AllIssuesTest.pdf"


class PageBuilder:
    """Accumulates content-stream ops + structure elements for one page,
    handing back everything build() needs to wire into the doc-wide tree."""

    def __init__(self, pdf: Pdf, index: int):
        self.pdf = pdf
        self.index = index
        self.ops: list[bytes] = []
        self.mcid = 0
        self.parent_tree_entries: list = []  # ordered by MCID
        self.top_structs: list = []  # top-level struct elems this page contributes
        self.xobjects: dict[str, object] = {}
        self.annots: list = []

    def _next_mcid(self) -> int:
        m = self.mcid
        self.mcid += 1
        return m

    def text(self, tag: str, x: int, y: int, size: int, s: str, color=(0.02, 0.22, 0.15), parent=None):
        """Draw one line of text, wrap it in a tagged marked-content span, and
        register the owning struct element. Returns the struct element."""
        mcid = self._next_mcid()
        r, g, b = color
        self.ops.append(
            f"/{tag} <</MCID {mcid}>> BDC\n".encode()
            + f"BT /F1 {size} Tf {r} {g} {b} rg {x} {y} Td (".encode()
            + s.encode("latin-1", errors="replace")
            + b") Tj ET\nEMC\n"
        )
        elem = self.pdf.make_indirect(
            Dictionary(Type=Name.StructElem, S=Name(f"/{tag}"), P=parent, K=mcid)
        )
        self.parent_tree_entries.append(elem)
        return elem

    def figure(self, x, y, w, h, im_name, parent):
        mcid = self._next_mcid()
        self.ops.append(
            f"/Figure <</MCID {mcid}>> BDC\nq {w} 0 0 {h} {x} {y} cm /{im_name} Do Q\nEMC\n".encode()
        )
        elem = self.pdf.make_indirect(
            Dictionary(
                Type=Name.StructElem, S=Name.Figure, P=parent, K=mcid,
                A=Dictionary(O=Name.Layout, BBox=Array([x, y, x + w, y + h])),
            )
        )
        self.parent_tree_entries.append(elem)
        return elem

    def rect(self, x, y, w, h, color, stroke=False):
        r, g, b = color
        op = "RG" if stroke else "rg"
        fill_op = "S" if stroke else "f"
        self.ops.append(f"{r} {g} {b} {op} {x} {y} {w} {h} re {fill_op}\n".encode())

    def content(self) -> bytes:
        return b"".join(self.ops)


def _table(pb: PageBuilder, x: int, top_y: int, col_w: int, row_h: int, parent) -> object:
    """A 3x3 data table with NO /TH header cells — every cell is /TD, on
    purpose, to trip WCAG-1.3.1-table-headers."""
    rows = [
        ["Department", "Enrolled", "Budget"],
        ["Business", "1,240", "$2.1M"],
        ["Engineering", "980", "$3.4M"],
    ]
    table = pb.pdf.make_indirect(Dictionary(Type=Name.StructElem, S=Name.Table, P=parent, K=Array([])))
    tr_elems = []
    for r_i, row in enumerate(rows):
        y = top_y - r_i * row_h
        pb.rect(x, y - row_h, col_w * 3, row_h, (1, 1, 1), stroke=False)
        td_elems = []
        for c_i, cell in enumerate(row):
            cx = x + c_i * col_w
            pb.ops.append(f"{0.6} {0.6} {0.6} RG {cx} {y - row_h} {col_w} {row_h} re S\n".encode())
            mcid = pb._next_mcid()
            weight = 0.02 if r_i == 0 else 0.1
            pb.ops.append(
                f"/TD <</MCID {mcid}>> BDC\n".encode()
                + f"BT /F1 10 Tf {weight} {weight} {weight} rg {cx + 8} {y - row_h + 8} Td (".encode()
                + cell.encode("latin-1", errors="replace")
                + b") Tj ET\nEMC\n"
            )
            td = pb.pdf.make_indirect(Dictionary(Type=Name.StructElem, S=Name.TD, P=None, K=mcid))
            pb.parent_tree_entries.append(td)
            td_elems.append(td)
        tr = pb.pdf.make_indirect(
            Dictionary(Type=Name.StructElem, S=Name.TR, P=table, K=Array(td_elems))
        )
        for td in td_elems:
            td.P = tr
        tr_elems.append(tr)
    table.K = Array(tr_elems)
    return table


def build() -> Path:
    pdf = Pdf.new()
    font = _text_font(pdf)

    struct_root = pdf.make_indirect(Dictionary(Type=Name.StructTreeRoot))
    doc_elem = pdf.make_indirect(
        Dictionary(Type=Name.StructElem, S=Name.Document, P=struct_root, K=Array([]))
    )
    doc_kids: list = []
    parent_tree_nums: list = []

    pages: list[PageBuilder] = []

    def new_page() -> PageBuilder:
        pb = PageBuilder(pdf, len(pages))
        pages.append(pb)
        return pb

    # ── Page 1: cover ────────────────────────────────────────────────
    pb = new_page()
    h1 = pb.text("H1", 72, 700, 24, "Ramp Accessibility Test Document", parent=doc_elem)
    p1 = pb.text(
        "P", 72, 660, 11,
        "This file intentionally contains every issue Ramp's WCAG 2.1 AA checker can detect.",
        color=(0.1, 0.1, 0.1), parent=doc_elem,
    )
    doc_kids += [h1, p1]

    # ── Page 2: heading skip (H1 -> H3) ──────────────────────────────
    pb = new_page()
    h3 = pb.text("H3", 72, 700, 16, "Background and Purpose (this is H3, skipping H2)", parent=doc_elem)
    p2 = pb.text(
        "P", 72, 660, 11,
        "Screen-reader users navigate by heading level; skipping from H1 to H3 breaks that outline.",
        color=(0.1, 0.1, 0.1), parent=doc_elem,
    )
    doc_kids += [h3, p2]

    # ── Page 3: Figure 1 (bar chart, no alt) ─────────────────────────
    pb = new_page()
    h2a = pb.text("H2", 72, 720, 18, "Enrollment Data", parent=doc_elem)
    chart1 = _bar_chart()
    im0 = pdf.make_indirect(_image_xobject(pdf, chart1))
    fig_x, fig_y, fig_w, fig_h = 120, 430, 372, 220
    fig1 = pb.figure(fig_x, fig_y, fig_w, fig_h, "Im0", parent=doc_elem)
    pb.xobjects["Im0"] = im0
    cap1 = pb.text(
        "P", 120, 412, 10, "Figure 1. Fall headcount enrollment, 2019-2022.",
        color=(0.3, 0.3, 0.3), parent=doc_elem,
    )
    doc_kids += [h2a, fig1, cap1]

    # ── Page 4: Figure 2 (pie chart, no alt) ──────────────────────────
    pb = new_page()
    h2b = pb.text("H2", 72, 720, 18, "Budget Overview", parent=doc_elem)
    chart2 = _pie_chart()
    im0b = pdf.make_indirect(_image_xobject(pdf, chart2))
    fig2 = pb.figure(fig_x, fig_y, fig_w, fig_h, "Im0", parent=doc_elem)
    pb.xobjects["Im0"] = im0b
    cap2 = pb.text(
        "P", 120, 412, 10, "Figure 2. Operating budget allocation by category.",
        color=(0.3, 0.3, 0.3), parent=doc_elem,
    )
    doc_kids += [h2b, fig2, cap2]

    # ── Page 5: table with no /TH header cells ───────────────────────
    pb = new_page()
    h2c = pb.text("H2", 72, 720, 18, "Department Summary Table", parent=doc_elem)
    table = _table(pb, 72, 680, 150, 28, parent=doc_elem)
    doc_kids += [h2c, table]

    # ── Page 6: unlabeled form fields + signature field ──────────────
    pb = new_page()
    h2d = pb.text("H2", 72, 720, 18, "Applicant Information", parent=doc_elem)
    instr = pb.text(
        "P", 72, 690, 11, "None of the fields below carry an accessible label.",
        color=(0.1, 0.1, 0.1), parent=doc_elem,
    )
    doc_kids += [h2d, instr]

    field_specs = [
        ("employee_ssn", "Employee SSN:", 620),
        ("date_of_birth", "Date of Birth:", 580),
        ("supervisor_approval", "Supervisor Approval:", 540),
    ]
    fields = []
    page_index_6 = pb.index
    for name, label, y in field_specs:
        pb.ops.append(f"BT /F1 10 Tf 0.1 0.1 0.1 rg 72 {y + 8} Td ({label}) Tj ET\n".encode())
        pb.ops.append(f"0.6 0.6 0.6 RG 220 {y} 220 20 re S\n".encode())
        field = pdf.make_indirect(
            Dictionary(
                FT=Name.Tx, T=String(name), Subtype=Name.Widget,
                Rect=Array([220, y, 440, y + 20]), F=4,
                DA=String("/F1 10 Tf 0 g"),
            )
        )
        fields.append(field)
        pb.annots.append(field)

    sig_y = 500
    pb.ops.append(f"BT /F1 10 Tf 0.1 0.1 0.1 rg 72 {sig_y + 8} Td (Authorized Signature:) Tj ET\n".encode())
    pb.ops.append(f"0.6 0.6 0.6 RG 220 {sig_y} 220 20 re S\n".encode())
    sig_field = pdf.make_indirect(
        Dictionary(
            FT=Name.Sig, T=String("authorized_signature"), Subtype=Name.Widget,
            Rect=Array([220, sig_y, 440, sig_y + 20]), F=4,
        )
    )
    fields.append(sig_field)
    pb.annots.append(sig_field)

    # ── Page 7: low-contrast text (visual only, human-reviewed) ──────
    pb = new_page()
    h2e = pb.text("H2", 72, 720, 18, "Visual Design Notes", parent=doc_elem)
    low_contrast = pb.text(
        "P", 72, 680, 12, "This text is light gray on a white background - it fails contrast badly.",
        color=(0.85, 0.85, 0.85), parent=doc_elem,
    )
    doc_kids += [h2e, low_contrast]

    # ── Page 8: color-only meaning (red/green, colorblind-unfriendly) ─
    pb = new_page()
    h2f = pb.text("H2", 72, 720, 18, "Status Legend", parent=doc_elem)
    pb.rect(72, 660, 60, 30, (1, 0, 0))
    pb.rect(160, 660, 60, 30, (0, 0.6, 0))
    color_caption = pb.text(
        "P", 72, 630, 10,
        "Status is shown by color alone: red = rejected, green = approved. No icon or text distinguishes them.",
        color=(0.1, 0.1, 0.1), parent=doc_elem,
    )
    doc_kids += [h2f, color_caption]

    # ── Pages 9-12: filler so the doc exceeds 10 pages (bookmarks) ───
    for n in range(4):
        pb = new_page()
        filler = pb.text(
            "P", 72, 720, 12, f"Filler page {n + 1} of 4 - padding this document past 10 pages.",
            color=(0.2, 0.2, 0.2), parent=doc_elem,
        )
        doc_kids += [filler]

    # ── assemble pages into the PDF ───────────────────────────────────
    for pb in pages:
        resources = Dictionary(Font=Dictionary(F1=font))
        if pb.xobjects:
            resources.XObject = Dictionary(**pb.xobjects)
        page_dict = Dictionary(
            Type=Name.Page,
            MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
            Resources=resources,
            Contents=pdf.make_indirect(pikepdf.Stream(pdf, pb.content())),
            StructParents=pb.index,
        )
        if pb.annots:
            page_dict.Annots = Array(pb.annots)
        pdf.pages.append(pikepdf.Page(pdf.make_indirect(page_dict)))
        page_obj = pdf.pages[pb.index].obj
        for elem in pb.parent_tree_entries:
            if "/Pg" not in elem or elem.get("/Pg") is None:
                elem.Pg = page_obj
        for field in fields if pb.index == page_index_6 else []:
            field.P = page_obj
        parent_tree_nums.append(pb.index)
        parent_tree_nums.append(Array(pb.parent_tree_entries))

    doc_elem.K = Array(doc_kids)
    struct_root.K = Array([doc_elem])
    struct_root.ParentTree = pdf.make_indirect(Dictionary(Nums=parent_tree_nums))
    struct_root.ParentTreeNextKey = len(pages)
    pdf.Root.StructTreeRoot = struct_root

    # AcroForm — deliberately: no /TU on any field, no /NeedAppearances.
    pdf.Root.AcroForm = Dictionary(
        Fields=Array(fields),
        DR=Dictionary(Font=Dictionary(F1=font)),
        DA=String("/F1 10 Tf 0 g"),
    )

    # Deliberately OMITTED (the Modernization "before" state):
    #   pdf.Root.MarkInfo, pdf.Root.Lang, docinfo Title, PDF/UA XMP metadata,
    #   pdf.Root.Outlines (bookmarks)

    out = HERE / OUT_NAME
    pdf.save(out)
    pdf.close()
    return out


if __name__ == "__main__":
    path = build()
    print(f"wrote {path}")
    with pikepdf.open(path) as pdf:
        print(f"  pages={len(pdf.pages)}  tagged={'/StructTreeRoot' in pdf.Root}")
        print(f"  fields={len(pdf.Root.AcroForm.Fields)}")
