"""Generate the PDF fixtures the test suite runs against.

Run:  python tests/fixtures/generate_fixtures.py

The campus corpus isn't available offline and we need known-good inputs whose
structure we control exactly, so the tagged fixtures are hand-built here rather
than exported from Acrobat. That has a second benefit: this file is an
executable description of the four links that make alt text reachable.

    Catalog /MarkInfo <</Marked true>>
    Catalog /StructTreeRoot
      -> StructElem { /S /Figure, /Alt (text), /Pg <page>, /K <mcid> }
      -> content stream:  /Figure <</MCID 0>> BDC ... EMC
      -> page /StructParents N -> ParentTree Nums: N -> array indexed by MCID

Break any one of them and a screen reader reads nothing, whatever /Alt says.
"""

from __future__ import annotations

import zlib
from pathlib import Path

import pikepdf
from pikepdf import Array, Dictionary, Name, Pdf, Stream, String

HERE = Path(__file__).parent

PAGE_W, PAGE_H = 612, 792


def _image_xobject(pdf: Pdf, rgb: tuple[int, int, int], w: int = 64, h: int = 48) -> Stream:
    """A tiny flate-compressed RGB image. Content doesn't matter; presence does."""
    raw = bytes(rgb) * (w * h)
    xobj = Stream(pdf, zlib.compress(raw))
    xobj.Type = Name.XObject
    xobj.Subtype = Name.Image
    xobj.Width = w
    xobj.Height = h
    xobj.ColorSpace = Name.DeviceRGB
    xobj.BitsPerComponent = 8
    xobj.Filter = Name.FlateDecode
    return xobj


def _font(pdf: Pdf) -> Dictionary:
    return pdf.make_indirect(
        Dictionary(
            Type=Name.Font,
            Subtype=Name.Type1,
            BaseFont=Name.Helvetica,
            Encoding=Name.WinAnsiEncoding,
        )
    )


def _marked_content(caption: str) -> bytes:
    """Page content with the figure and caption each wrapped in a marked-content
    sequence. The MCIDs here are what the structure elements point back at."""
    return (
        # Figure -> MCID 0
        b"/Figure <</MCID 0>> BDC\n"
        b"q 240 0 0 120 60 560 cm /Im0 Do Q\n"
        b"EMC\n"
        # Caption paragraph -> MCID 1
        b"/P <</MCID 1>> BDC\n"
        b"BT /F1 11 Tf 60 535 Td (" + caption.encode("ascii") + b") Tj ET\n"
        b"EMC\n"
    )


def _plain_content(caption: str) -> bytes:
    """Same visual result, no marked content — what an untagged legacy form looks like."""
    return (
        b"q 240 0 0 120 60 560 cm /Im0 Do Q\n"
        b"BT /F1 11 Tf 60 535 Td (" + caption.encode("ascii") + b") Tj ET\n"
    )


def _build_page(
    pdf: Pdf,
    font: Dictionary,
    caption: str,
    *,
    marked: bool,
    struct_parents: int | None,
    rgb: tuple[int, int, int] = (0x04, 0x39, 0x27),
):
    # Distinct colour per page: identical image bytes would make every figure
    # hash the same, hiding per-figure bugs behind a coincidence.
    xobj = _image_xobject(pdf, rgb)
    content = _marked_content(caption) if marked else _plain_content(caption)

    page = Dictionary(
        Type=Name.Page,
        MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
        Resources=Dictionary(
            Font=Dictionary(F1=font),
            XObject=Dictionary(Im0=pdf.make_indirect(xobj)),
        ),
        Contents=pdf.make_indirect(Stream(pdf, content)),
    )
    if struct_parents is not None:
        # Required for any content stream containing marked-content sequences
        # that are structural content items (ISO 32000-2, Table 359).
        page.StructParents = struct_parents
    return pdf.make_indirect(page)


def _tagged(path: Path, *, alt_texts: list[str | None], captions: list[str]) -> None:
    """A tagged PDF: one page per caption, one /Figure each.

    alt_texts[i] is None to leave /Alt absent (the gap we remediate), or a string
    to pre-populate it (the already-remediated case).
    """
    pdf = Pdf.new()
    font = _font(pdf)

    struct_root = pdf.make_indirect(Dictionary(Type=Name.StructTreeRoot))
    doc_elem = pdf.make_indirect(
        Dictionary(Type=Name.StructElem, S=Name.Document, P=struct_root, K=Array([]))
    )

    parent_tree_nums = Array([])
    doc_kids = Array([])

    palette = [(0x04, 0x39, 0x27), (0xC4, 0xB5, 0x81), (0x8A, 0x78, 0x42)]

    for i, (caption, alt) in enumerate(zip(captions, alt_texts, strict=True)):
        page = _build_page(
            pdf, font, caption, marked=True, struct_parents=i, rgb=palette[i % len(palette)]
        )
        pdf.pages.append(pikepdf.Page(page))
        # pikepdf copies the dict on append; re-fetch the live page object.
        page = pdf.pages[i].obj

        figure = Dictionary(
            Type=Name.StructElem,
            S=Name.Figure,
            P=doc_elem,
            Pg=page,
            K=0,  # MCID 0 in this page's content stream
        )
        if alt is not None:
            figure.Alt = String(alt)
        figure = pdf.make_indirect(figure)

        para = pdf.make_indirect(
            Dictionary(Type=Name.StructElem, S=Name.P, P=doc_elem, Pg=page, K=1)
        )

        doc_kids.append(figure)
        doc_kids.append(para)

        # StructParents i -> array indexed by MCID -> the element owning that MCID.
        parent_tree_nums.append(i)
        parent_tree_nums.append(Array([figure, para]))

    doc_elem.K = doc_kids
    struct_root.K = Array([doc_elem])
    struct_root.ParentTree = pdf.make_indirect(Dictionary(Nums=parent_tree_nums))
    struct_root.ParentTreeNextKey = len(captions)

    pdf.Root.StructTreeRoot = struct_root
    pdf.Root.MarkInfo = Dictionary(Marked=True)
    pdf.Root.Lang = String("en-US")

    pdf.save(path)
    pdf.close()


def _tagged_no_figures(path: Path) -> None:
    """Tagged and well-formed, but nothing to remediate — text only."""
    pdf = Pdf.new()
    font = _font(pdf)

    struct_root = pdf.make_indirect(Dictionary(Type=Name.StructTreeRoot))
    doc_elem = pdf.make_indirect(
        Dictionary(Type=Name.StructElem, S=Name.Document, P=struct_root, K=Array([]))
    )

    page = pdf.make_indirect(
        Dictionary(
            Type=Name.Page,
            MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
            Resources=Dictionary(Font=Dictionary(F1=font)),
            Contents=pdf.make_indirect(
                Stream(
                    pdf,
                    b"/P <</MCID 0>> BDC\n"
                    b"BT /F1 12 Tf 60 700 Td (Direct Deposit Authorization) Tj ET\n"
                    b"EMC\n",
                )
            ),
            StructParents=0,
        )
    )
    pdf.pages.append(pikepdf.Page(page))
    page = pdf.pages[0].obj

    para = pdf.make_indirect(
        Dictionary(Type=Name.StructElem, S=Name.P, P=doc_elem, Pg=page, K=0)
    )
    doc_elem.K = Array([para])
    struct_root.K = Array([doc_elem])
    struct_root.ParentTree = pdf.make_indirect(Dictionary(Nums=Array([0, Array([para])])))
    struct_root.ParentTreeNextKey = 1

    pdf.Root.StructTreeRoot = struct_root
    pdf.Root.MarkInfo = Dictionary(Marked=True)
    pdf.Root.Lang = String("en-US")

    pdf.save(path)
    pdf.close()


def _untagged(path: Path) -> None:
    """No StructTreeRoot, no MarkInfo — the realistic legacy scan. Must be refused."""
    pdf = Pdf.new()
    font = _font(pdf)
    page = _build_page(pdf, font, "Scanned travel receipt", marked=False, struct_parents=None)
    pdf.pages.append(pikepdf.Page(page))
    pdf.save(path)
    pdf.close()


def main() -> None:
    _tagged(
        HERE / "tagged_with_figures.pdf",
        captions=["Figure 1: campus building", "Figure 2: voided check sample"],
        alt_texts=[None, None],
    )
    _tagged(
        HERE / "tagged_alt_present.pdf",
        captions=["Figure 1: campus building"],
        alt_texts=["Students walking outside a Sacramento State campus building."],
    )
    _tagged_no_figures(HERE / "tagged_no_figures.pdf")
    _untagged(HERE / "untagged_scanned.pdf")

    for p in sorted(HERE.glob("*.pdf")):
        with pikepdf.open(p) as pdf:
            tagged = "/StructTreeRoot" in pdf.Root
            print(f"  {p.name:28} {len(pdf.pages)} page(s)  tagged={tagged}")


if __name__ == "__main__":
    main()
