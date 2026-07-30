"""Catalog-level triage: is this PDF remediable, and how much work is there?

Cheap by design — open, walk the structure tree, close. No image extraction, no
model calls. This runs on every document in the library so the UI can label and
filter by tag status.
"""

from __future__ import annotations

from collections.abc import Iterator

import pikepdf
from pikepdf import Name, Object, Pdf

from ..errors import PdfUnreadable
from ..models import (
    DocScan, 
    DocumentRoute,
    FigureRef, 
    OCR_MAX_FILE_SIZE_BYTES,
    OCR_MAX_PAGES,
    TagStatus,
    UnsupportedReason,
)

# Guard against a malformed or hostile structure tree looping forever.
_MAX_DEPTH = 64


def _obj_ref(obj: Object) -> str:
    """Stable identifier for an indirect object: "12,0"."""
    objgen = obj.objgen
    return f"{objgen[0]},{objgen[1]}"


def _page_index_by_ref(pdf: Pdf) -> dict[str, int]:
    """Map page objgen -> 1-indexed page number, so a /Figure's /Pg resolves to
    the page number the reviewer sees."""
    return {_obj_ref(page.obj): n for n, page in enumerate(pdf.pages, start=1)}


def _first_mcid(kids: Object) -> int | None:
    """A StructElem's /K may be an int MCID, an /MCR dict, or an array of those.
    We only need the first marked-content id to locate the figure on the page."""
    if isinstance(kids, int):
        return kids
    if isinstance(kids, pikepdf.Dictionary):
        if kids.get("/Type") == Name.MCR and "/MCID" in kids:
            return int(kids.MCID)
        return None
    if isinstance(kids, pikepdf.Array):
        for kid in kids:
            mcid = _first_mcid(kid)
            if mcid is not None:
                return mcid
    return None


def _alt_of(elem: Object) -> str | None:
    alt = elem.get("/Alt")
    if alt is None:
        return None
    try:
        return str(alt)
    except Exception:
        return None


def _bbox_of(elem: Object) -> tuple[float, float, float, float] | None:
    """A figure's layout box lives at /A /BBox (a layout attribute dict), or
    occasionally in an array of attribute dicts. Returns four floats or None."""
    attrs = elem.get("/A")
    if attrs is None:
        return None
    candidates = list(attrs) if isinstance(attrs, pikepdf.Array) else [attrs]
    for attr in candidates:
        if isinstance(attr, pikepdf.Dictionary) and "/BBox" in attr:
            try:
                x0, y0, x1, y1 = (float(v) for v in attr.BBox)
                return (x0, y0, x1, y1)
            except (TypeError, ValueError):
                return None
    return None


def walk_figures(pdf: Pdf) -> Iterator[FigureRef]:
    """Yield every /Figure structure element, in document order.

    Real PDFs nest (Document -> Sect -> Figure), so this recurses rather than
    assuming the flat shape our fixtures happen to have. /Pg is inheritable, so
    an element without one takes its parent's page.
    """
    if "/StructTreeRoot" not in pdf.Root:
        return

    pages_by_ref = _page_index_by_ref(pdf)
    per_page_counter: dict[int, int] = {}
    seen: set[str] = set()

    def visit(node: Object, inherited_page: int | None, depth: int) -> Iterator[FigureRef]:
        if depth > _MAX_DEPTH:
            return

        if isinstance(node, pikepdf.Array):
            for kid in node:
                yield from visit(kid, inherited_page, depth + 1)
            return

        if not isinstance(node, pikepdf.Dictionary):
            return  # a bare MCID int — no structure to descend into

        # /Pg is inheritable down the tree.
        page_number = inherited_page
        pg = node.get("/Pg")
        if pg is not None:
            page_number = pages_by_ref.get(_obj_ref(pg), inherited_page)

        if node.get("/S") == Name.Figure:
            ref = _obj_ref(node)
            if ref not in seen:  # a tree can reference the same elem twice
                seen.add(ref)
                page = page_number or 1
                index = per_page_counter.get(page, 0)
                per_page_counter[page] = index + 1
                yield FigureRef(
                    struct_elem_ref=ref,
                    page_number=page,
                    index_on_page=index,
                    mcid=_first_mcid(node.get("/K")),
                    alt_text=_alt_of(node),
                    bbox=_bbox_of(node),
                )

        kids = node.get("/K")
        if kids is not None:
            yield from visit(kids, page_number, depth + 1)

    yield from visit(pdf.Root.StructTreeRoot.get("/K"), None, 0)


def _count_images(pdf: Pdf) -> int:
    total = 0
    for page in pdf.pages:
        xobjects = page.obj.get("/Resources", {}).get("/XObject")
        if xobjects is None:
            continue
        for obj in xobjects.values():
            if obj.get("/Subtype") == Name.Image:
                total += 1
    return total


def is_tagged(pdf: Pdf) -> bool:
    """Tagged means a structure tree exists.

    /MarkInfo <</Marked true>> is what PDF/UA requires, but plenty of real
    tagged PDFs omit it while carrying a perfectly good tree. Requiring it would
    reject documents we can genuinely fix, so the tree is the test and MarkInfo
    is something we repair on the way out (see apply.py).
    """
    return "/StructTreeRoot" in pdf.Root


def _has_form_fields(pdf: Pdf) -> bool:
    """Check if PDF contains interactive form fields."""
    try:
        if "/AcroForm" not in pdf.Root:
            return False
        acro_form = pdf.Root.AcroForm
        if "/Fields" not in acro_form:
            return False
        fields = acro_form.Fields
        return len(fields) > 0
    except Exception:
        return False


def _has_digital_signatures(pdf: Pdf) -> bool:
    """Check if PDF contains digital signatures."""
    try:
        if "/AcroForm" not in pdf.Root:
            return False
        acro_form = pdf.Root.AcroForm
        if "/SigFlags" in acro_form and acro_form.SigFlags > 0:
            return True
        # Check for signature fields
        if "/Fields" in acro_form:
            for field in acro_form.Fields:
                if field.get("/FT") == Name.Sig:
                    return True
        return False
    except Exception:
        return False


def _estimate_scan_dominance(pdf: Pdf) -> bool:
    """Estimate if document is scan-dominant based on image coverage vs text.
    
    A scan-dominant document has large images covering most page area
    with little meaningful text structure.
    """
    if len(pdf.pages) == 0:
        return False
        
    # Sample first few pages to avoid processing entire large documents
    sample_pages = min(3, len(pdf.pages))
    scan_indicators = 0
    total_indicators = 0
    
    for i in range(sample_pages):
        page = pdf.pages[i]
        page_dict = page.obj
        
        # Check for images taking up significant page area
        try:
            resources = page_dict.get("/Resources", {})
            xobjects = resources.get("/XObject", {})
            
            large_images = 0
            for obj in xobjects.values():
                if obj.get("/Subtype") == Name.Image:
                    # Consider images > 100px in either dimension as potentially large
                    width = obj.get("/Width", 0)  
                    height = obj.get("/Height", 0)
                    if width > 100 and height > 100:
                        large_images += 1
            
            # If page has large images and minimal text content, likely scanned
            if large_images > 0:
                total_indicators += 1
                # Basic heuristic: if we have large images, assume scan-like
                scan_indicators += 1
                
        except Exception:
            # If we can't analyze the page, be conservative
            continue
    
    # If majority of sampled pages appear scan-like, classify as scan-dominant
    return total_indicators > 0 and scan_indicators / total_indicators > 0.5


def _detect_language_issues(pdf: Pdf) -> bool:
    """Basic language detection - check for non-ASCII characters that might indicate non-English."""
    try:
        # Sample text from first page
        if len(pdf.pages) == 0:
            return False
            
        # This is a basic heuristic - in production you'd want proper language detection
        # For now, just check document metadata and basic character patterns
        info = pdf.docinfo
        if info:
            title = info.get("/Title", "")
            subject = info.get("/Subject", "")
            author = info.get("/Author", "")
            
            # Check for non-ASCII characters in metadata
            text_to_check = f"{title} {subject} {author}".strip()
            if text_to_check:
                # Basic check for non-ASCII characters
                try:
                    text_to_check.encode('ascii')
                except UnicodeEncodeError:
                    return True
                    
        return False
    except Exception:
        return False


def classify_document(pdf: Pdf, file_size_bytes: int) -> tuple[DocumentRoute, UnsupportedReason | None, bool]:
    """Classify document and determine routing path.
    
    Returns:
        - DocumentRoute: Which workflow the document should follow
        - UnsupportedReason: If unsupported, the specific reason (None if supported)  
        - bool: Whether document is scan-dominant
    """
    # Basic validation first
    page_count = len(pdf.pages)
    is_scan_dominant = _estimate_scan_dominance(pdf)
    
    # Check technical limitations
    if file_size_bytes > OCR_MAX_FILE_SIZE_BYTES:
        return DocumentRoute.UNSUPPORTED, UnsupportedReason.FILE_TOO_LARGE, is_scan_dominant
        
    if page_count > OCR_MAX_PAGES:
        return DocumentRoute.UNSUPPORTED, UnsupportedReason.TOO_MANY_PAGES, is_scan_dominant
    
    # Check for interactive elements
    if _has_form_fields(pdf):
        return DocumentRoute.UNSUPPORTED, UnsupportedReason.INTERACTIVE_FORMS, is_scan_dominant
        
    if _has_digital_signatures(pdf):
        return DocumentRoute.UNSUPPORTED, UnsupportedReason.DIGITALLY_SIGNED, is_scan_dominant
    
    # Check language issues
    if _detect_language_issues(pdf):
        return DocumentRoute.UNSUPPORTED, UnsupportedReason.NON_ENGLISH_LANGUAGE, is_scan_dominant
    
    # Check document structure for routing decision
    tagged = is_tagged(pdf)
    figures = list(walk_figures(pdf))
    missing_alt = sum(1 for f in figures if not f.has_alt_text)
    
    if tagged:
        if figures and missing_alt > 0:
            # Tagged document with figures missing alt text -> existing workflow
            return DocumentRoute.ALT_TEXT_REMEDIATION, None, is_scan_dominant
        elif not figures:
            # Tagged but no figures -> nothing to process
            return DocumentRoute.UNSUPPORTED, UnsupportedReason.NO_PROCESSABLE_CONTENT, is_scan_dominant
        else:
            # Tagged with all figures having alt text -> nothing to do
            return DocumentRoute.UNSUPPORTED, UnsupportedReason.NO_PROCESSABLE_CONTENT, is_scan_dominant
    else:
        # Untagged document
        if is_scan_dominant and file_size_bytes <= OCR_MAX_FILE_SIZE_BYTES and page_count <= OCR_MAX_PAGES:
            # Eligible for OCR reconstruction
            return DocumentRoute.OCR_RECONSTRUCTION, None, is_scan_dominant
        else:
            # Born-digital untagged -> needs manual tagging
            return DocumentRoute.UNSUPPORTED, UnsupportedReason.BORN_DIGITAL_UNTAGGED, is_scan_dominant


def scan_pdf(pdf: Pdf, file_size_bytes: int = 0) -> DocScan:
    """Scan PDF and classify for routing."""
    figures = list(walk_figures(pdf))
    missing = sum(1 for f in figures if not f.has_alt_text)

    if not is_tagged(pdf):
        tag_status = TagStatus.UNTAGGED
    elif figures and missing:
        tag_status = TagStatus.TAGGED
    else:
        # Tagged but nothing to do: no figures at all, or every figure already
        # has alt text. Either way there's no work — same bucket.
        tag_status = TagStatus.TAGGED_NO_FIGURES

    # Classify document for routing
    route, unsupported_reason, is_scan_dominant = classify_document(pdf, file_size_bytes)

    return DocScan(
        tag_status=tag_status,
        page_count=len(pdf.pages),
        figure_count=len(figures),
        figures_missing_alt=missing,
        image_count=_count_images(pdf),
        route=route,
        unsupported_reason=unsupported_reason,
        size_bytes=file_size_bytes,
        is_scan_dominant=is_scan_dominant,
    )


def scan_bytes(data: bytes) -> DocScan:
    try:
        with pikepdf.open(_as_stream(data)) as pdf:
            return scan_pdf(pdf, len(data))
    except pikepdf.PasswordError as exc:
        # Handle encrypted PDFs specially
        return DocScan(
            tag_status=TagStatus.UNTAGGED,
            page_count=0,
            figure_count=0,
            figures_missing_alt=0,
            image_count=0,
            route=DocumentRoute.UNSUPPORTED,
            unsupported_reason=UnsupportedReason.ENCRYPTED_PDF,
            size_bytes=len(data),
            is_scan_dominant=False,
        )
    except pikepdf.PdfError as exc:
        # Handle corrupt PDFs
        return DocScan(
            tag_status=TagStatus.UNTAGGED,
            page_count=0,
            figure_count=0,
            figures_missing_alt=0,
            image_count=0,
            route=DocumentRoute.UNSUPPORTED,
            unsupported_reason=UnsupportedReason.CORRUPT_PDF,
            size_bytes=len(data),
            is_scan_dominant=False,
        )


def _as_stream(data: bytes):
    from io import BytesIO

    return BytesIO(data)
