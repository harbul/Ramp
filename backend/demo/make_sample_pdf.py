"""Generate a deliberately-inaccessible sample PDF for the demo.

The file is TAGGED (has a structure tree with /Figure elements) but the figures
have NO /Alt — exactly the case the tool remediates. Two real, describable
images (a bar chart and a pie chart) so the AI produces meaningful alt text in
the demo, each with a caption so the model can tie image to context.

    python backend/demo/make_sample_pdf.py

Writes  backend/demo/sample_inaccessible.pdf

Scope note: this tool remediates alt text, not bookmarks. The sample therefore
contains alt-text issues (which it detects AND fixes), not bookmark issues.
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import pikepdf
from PIL import Image, ImageDraw, ImageFont
from pikepdf import Array, Dictionary, Name, Pdf, Stream, String

HERE = Path(__file__).parent
PAGE_W, PAGE_H = 612, 792
GREEN = (4, 57, 39)
GOLD = (196, 181, 129)


def _font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _bar_chart() -> Image.Image:
    """Fall enrollment by year — clearly a bar chart, clearly increasing."""
    w, h = 640, 380
    img = Image.new("RGB", (w, h), "white")
    d = ImageDraw.Draw(img)
    title, label = _font(26), _font(18)

    d.text((20, 14), "Fall Enrollment by Year", fill=GREEN, font=title)

    years = ["2019", "2020", "2021", "2022"]
    values = [28_500, 30_200, 31_800, 33_400]
    base_y, top_y, left_x, bar_w, gap = 330, 90, 70, 90, 50
    scale = (base_y - top_y) / max(values)

    d.line((left_x - 10, base_y, w - 20, base_y), fill=(120, 120, 120), width=2)
    for i, (yr, val) in enumerate(zip(years, values, strict=True)):
        x = left_x + i * (bar_w + gap)
        bar_h = val * scale
        d.rectangle((x, base_y - bar_h, x + bar_w, base_y), fill=GREEN)
        d.text((x + 8, base_y + 8), yr, fill=(40, 40, 40), font=label)
        d.text((x + 2, base_y - bar_h - 26), f"{val:,}", fill=GOLD, font=label)
    return img


def _pie_chart() -> Image.Image:
    """Operating budget by category — a labelled pie."""
    w, h = 640, 380
    img = Image.new("RGB", (w, h), "white")
    d = ImageDraw.Draw(img)
    title, label = _font(26), _font(16)

    d.text((20, 14), "Operating Budget by Category", fill=GREEN, font=title)

    slices = [
        ("Instruction", 52, GREEN),
        ("Research", 21, GOLD),
        ("Facilities", 15, (138, 120, 66)),
        ("Student Services", 12, (90, 110, 100)),
    ]
    box = (60, 80, 340, 360)
    start = 0.0
    for _name, pct, color in slices:
        end = start + pct * 3.6
        d.pieslice(box, start, end, fill=color, outline="white", width=3)
        start = end

    ly = 110
    for name, pct, color in slices:
        d.rectangle((380, ly, 404, ly + 24), fill=color)
        d.text((414, ly + 2), f"{name} — {pct}%", fill=(40, 40, 40), font=label)
        ly += 40
    return img


def _image_xobject(pdf: Pdf, pil: Image.Image) -> Stream:
    """Embed a PIL image as a JPEG XObject (DCTDecode — PDF reads JPEG natively)."""
    buf = BytesIO()
    pil.convert("RGB").save(buf, format="JPEG", quality=88)
    xobj = Stream(pdf, buf.getvalue())
    xobj.Type = Name.XObject
    xobj.Subtype = Name.Image
    xobj.Width = pil.width
    xobj.Height = pil.height
    xobj.ColorSpace = Name.DeviceRGB
    xobj.BitsPerComponent = 8
    xobj.Filter = Name.DCTDecode
    return xobj


def _text_font(pdf: Pdf) -> Dictionary:
    return pdf.make_indirect(
        Dictionary(
            Type=Name.Font, Subtype=Name.Type1,
            BaseFont=Name.Helvetica, Encoding=Name.WinAnsiEncoding,
        )
    )


def build() -> Path:
    pdf = Pdf.new()
    font = _text_font(pdf)

    # placement of each figure on its page: (x, y, width, height) in points
    fig_rect = (120, 430, 372, 220)   # bbox [120, 430, 492, 650]
    x, y, fw, fh = fig_rect

    struct_root = pdf.make_indirect(Dictionary(Type=Name.StructTreeRoot))
    doc_elem = pdf.make_indirect(
        Dictionary(Type=Name.StructElem, S=Name.Document, P=struct_root, K=Array([]))
    )
    parent_tree = Array([])
    doc_kids = Array([])

    pages_spec = [
        ("Office of Institutional Research", "Enrollment Report", _bar_chart(),
         "Figure 1. Fall headcount enrollment, 2019-2022."),
        ("Office of the Budget", "Budget Overview", _pie_chart(),
         "Figure 2. Operating budget allocation by category."),
    ]

    for i, (kicker, title, chart, caption) in enumerate(pages_spec):
        xobj = pdf.make_indirect(_image_xobject(pdf, chart))
        # content stream: heading + paragraph, then the figure (MCID 0) and its
        # caption (MCID 1), each in a marked-content sequence.
        content = (
            b"BT /F1 10 Tf 0.02 0.22 0.15 rg 72 720 Td (" + kicker.encode() + b") Tj ET\n"
            b"BT /F1 20 Tf 0.02 0.22 0.15 rg 72 694 Td (" + title.encode() + b") Tj ET\n"
            b"0.85 0.82 0.5 rg 72 686 468 2 re f\n"
            b"BT /F1 11 Tf 0.1 0.1 0.1 rg 72 660 Td "
            b"(Sacramento State - Sample document for accessibility remediation.) Tj ET\n"
            + f"/Figure <</MCID 0>> BDC\nq {fw} 0 0 {fh} {x} {y} cm /Im0 Do Q\nEMC\n".encode()
            + b"/P <</MCID 1>> BDC\n"
            b"BT /F1 10 Tf 0.3 0.3 0.3 rg 120 412 Td (" + caption.encode() + b") Tj ET\n"
            b"EMC\n"
        )

        page = Dictionary(
            Type=Name.Page,
            MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
            Resources=Dictionary(
                Font=Dictionary(F1=font),
                XObject=Dictionary(Im0=xobj),
            ),
            Contents=pdf.make_indirect(Stream(pdf, content)),
            StructParents=i,
        )
        pdf.pages.append(pikepdf.Page(pdf.make_indirect(page)))
        page = pdf.pages[i].obj

        # /Figure with /A /BBox (the placement rect) and NO /Alt — the issue.
        figure = pdf.make_indirect(Dictionary(
            Type=Name.StructElem, S=Name.Figure, P=doc_elem, Pg=page, K=0,
            A=Dictionary(O=Name.Layout, BBox=Array([x, y, x + fw, y + fh])),
        ))
        para = pdf.make_indirect(
            Dictionary(Type=Name.StructElem, S=Name.P, P=doc_elem, Pg=page, K=1)
        )
        doc_kids.append(figure)
        doc_kids.append(para)
        parent_tree.append(i)
        parent_tree.append(Array([figure, para]))

    doc_elem.K = doc_kids
    struct_root.K = Array([doc_elem])
    struct_root.ParentTree = pdf.make_indirect(Dictionary(Nums=parent_tree))
    struct_root.ParentTreeNextKey = len(pages_spec)

    pdf.Root.StructTreeRoot = struct_root
    pdf.Root.MarkInfo = Dictionary(Marked=True)
    pdf.Root.Lang = String("en-US")
    with pdf.open_metadata() as meta:
        meta["dc:title"] = "Sacramento State - Sample (Inaccessible)"

    out = HERE / "sample_inaccessible.pdf"
    pdf.save(out)
    pdf.close()
    return out


if __name__ == "__main__":
    path = build()
    print(f"wrote {path}")
    with pikepdf.open(path) as pdf:
        print(f"  pages={len(pdf.pages)}  tagged={'/StructTreeRoot' in pdf.Root}")
