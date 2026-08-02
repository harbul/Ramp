"""WCAG 2.1 Level AA compliance checker for PDFs.

Runs a rules engine over a PDF and returns structured findings. Every rule maps
to a WCAG Success Criterion so results can be shown to reviewers in accessibility
terms. Rules that are deterministically fixable expose ``auto_fixable=True`` and
name the action that repairs them; the rest need reviewer input.

Rule catalog (WCAG 2.1 Level AA subset relevant to PDFs):

    1.1.1  Non-text content            figures carry /Alt or are marked artifact
    1.3.1  Info and relationships      struct tree present; heading hierarchy;
                                        table header rows; list markup
    1.3.2  Meaningful sequence         structure order defined
    2.4.2  Page Titled                 /Title in document info
    3.1.1  Language of Page            /Lang on the document catalog
    4.1.2  Name, Role, Value           every AcroForm field has /TU (label)
    PDF/UA Metadata claim              XMP declares pdfuaid:part=1
    Tagging flag                       /MarkInfo << /Marked true >>
    Font encoding                      fonts expose /ToUnicode so text is
                                        selectable and screen-readable

The checker only reads the PDF - it never mutates it. Fixers live in
``core.apply``, ``service._inject_tag_structure``, and future ``core.labels_write``.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field
from enum import StrEnum
from io import BytesIO

import pikepdf
from pikepdf import Name, Pdf

from .bookmarks import outline_is_valid
from .scan import walk_figures
from .tables import row_cells, table_rows, walk_tables


class Severity(StrEnum):
    BLOCKER = "BLOCKER"    # WCAG failure that fully blocks assistive tech
    MAJOR = "MAJOR"        # Significant barrier for AT users
    MINOR = "MINOR"        # Advisory / best-practice deviation


class Level(StrEnum):
    A = "A"
    AA = "AA"
    AAA = "AAA"


@dataclass
class Finding:
    rule_id: str                # e.g. "WCAG-1.1.1-figure-missing-alt"
    wcag_sc: str                # e.g. "1.1.1"
    wcag_level: Level
    title: str                  # short human label ("Figure missing alt text")
    description: str            # what's wrong, one paragraph
    severity: Severity
    passed: bool                # True = rule passed, False = finding
    auto_fixable: bool = False  # True if a fixer exists in this codebase
    fix_action: str | None = None  # name of the endpoint/action that repairs it
    location: str | None = None    # "Page 3, figure 2" / "AcroForm field 'First Name'"
    count: int = 0              # how many instances (0 for passing rules)
    manual_review: bool = False # True if the check can only be done by a human


@dataclass
class WcagReport:
    """The complete compliance picture for one PDF."""
    findings: list[Finding] = field(default_factory=list)
    score: int = 0              # 0-100, weighted by severity
    is_compliant: bool = False  # True iff no blockers/majors and score >= 90
    total_rules: int = 0
    passed_rules: int = 0
    blocker_count: int = 0
    major_count: int = 0
    minor_count: int = 0
    auto_fixable_count: int = 0
    summary: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


# ── rule implementations ────────────────────────────────────────────────

def _has_struct_tree(pdf: Pdf) -> bool:
    return "/StructTreeRoot" in pdf.Root


def _has_marked_info(pdf: Pdf) -> bool:
    mi = pdf.Root.get("/MarkInfo")
    if mi is None:
        return False
    try:
        return bool(mi.get("/Marked", False))
    except Exception:
        return False


def _doc_lang(pdf: Pdf) -> str | None:
    lang = pdf.Root.get("/Lang")
    if lang is None:
        return None
    try:
        return str(lang).strip()
    except Exception:
        return None


def _doc_title(pdf: Pdf) -> str | None:
    try:
        info = pdf.docinfo
    except Exception:
        return None
    if info is None:
        return None
    title = info.get("/Title")
    if title is None:
        return None
    try:
        t = str(title).strip()
        return t or None
    except Exception:
        return None


_PDFUA_PART_ELEMENT_RE = re.compile(r"<pdfuaid:part\b[^>]*>\s*1\s*</pdfuaid:part>")
_PDFUA_PART_ATTR_RE = re.compile(r'pdfuaid:part\s*=\s*"1"')


def _has_pdfua_metadata(pdf: Pdf) -> bool:
    """XMP metadata declares PDF/UA-1 conformance (pdfuaid:part = 1).

    Tolerates the namespace declaration living on the element itself, e.g.
    ``<pdfuaid:part xmlns:pdfuaid="...">1</pdfuaid:part>`` — the form
    pikepdf's own XMP writer produces — as well as the attribute-style
    ``pdfuaid:part="1"``. An exact-substring match on ``<pdfuaid:part>1``
    would reject perfectly valid XMP the moment any attribute sits between
    the tag name and its content, which is the common case.
    """
    try:
        meta_stream = pdf.Root.get("/Metadata")
        if meta_stream is None:
            return False
        raw = bytes(meta_stream.read_bytes())
        text = raw.decode("utf-8", errors="ignore")
        return bool(_PDFUA_PART_ELEMENT_RE.search(text) or _PDFUA_PART_ATTR_RE.search(text))
    except Exception:
        return False


def _acroform_fields(pdf: Pdf) -> list[tuple[str, pikepdf.Object]]:
    """Return (best-effort label, field object) for every terminal form field."""
    acro = pdf.Root.get("/AcroForm")
    if acro is None or "/Fields" not in acro:
        return []
    out: list[tuple[str, pikepdf.Object]] = []

    def visit(node):
        try:
            kids = node.get("/Kids")
        except Exception:
            kids = None
        if kids is not None and len(kids) > 0:
            for k in kids:
                visit(k)
            return
        # terminal field
        try:
            name = node.get("/T")
            label = str(name) if name is not None else "(unnamed)"
        except Exception:
            label = "(unnamed)"
        out.append((label, node))

    for f in acro.Fields:
        visit(f)
    return out


def _fonts_missing_tounicode(pdf: Pdf) -> int:
    """Count fonts across pages that lack /ToUnicode. Fonts without it can
    render fine but screen readers get gibberish."""
    seen: set[str] = set()
    missing = 0
    for page in pdf.pages:
        try:
            resources = page.obj.get("/Resources", {})
            fonts = resources.get("/Font")
        except Exception:
            continue
        if fonts is None:
            continue
        for _, font in fonts.items():
            try:
                key = f"{font.objgen[0]},{font.objgen[1]}"
            except Exception:
                key = str(id(font))
            if key in seen:
                continue
            seen.add(key)
            if font.get("/ToUnicode") is None:
                # Type 1 base 14 fonts are OK without ToUnicode; approximate by
                # checking if it's a well-known standard font
                subtype = font.get("/Subtype")
                name = font.get("/BaseFont")
                if subtype == Name.Type1 and name is not None:
                    name_str = str(name)
                    if any(std in name_str for std in ("Helvetica", "Times", "Courier", "Symbol", "ZapfDingbats")):
                        continue
                missing += 1
    return missing


def _iter_heading_levels(pdf: Pdf) -> list[int]:
    """Yield the level of each heading in document order.
    Returns a list of ints (1..6) for /H1-/H6 elements found in the struct tree.
    /H (generic heading) is treated as level 1 for the purpose of hierarchy checks.
    """
    if "/StructTreeRoot" not in pdf.Root:
        return []
    out: list[int] = []

    def visit(node, depth=0):
        if depth > 128:
            return
        if isinstance(node, pikepdf.Array):
            for k in node:
                visit(k, depth + 1)
            return
        if not isinstance(node, pikepdf.Dictionary):
            return
        s = node.get("/S")
        if s is not None:
            name = str(s)
            if name.startswith("/H"):
                suffix = name[2:]
                if suffix == "":
                    out.append(1)  # generic /H — treat as top level
                elif suffix.isdigit():
                    lvl = int(suffix)
                    if 1 <= lvl <= 6:
                        out.append(lvl)
        kids = node.get("/K")
        if kids is not None:
            visit(kids, depth + 1)

    root = pdf.Root.StructTreeRoot.get("/K")
    if root is not None:
        visit(root)
    return out


def _tables_missing_headers(pdf: Pdf) -> list[str]:
    """Return locations of /Table elements whose first row has no /TH cell.

    Uses the same row-walking as core.tables.fix_table_headers, so a table
    whose header row is wrapped in /THead is recognised here too - not just
    a flat /Table -> /TR shape.
    """
    bad_locations: list[str] = []
    for index, table in enumerate(walk_tables(pdf), start=1):
        rows = table_rows(table)
        if not rows:
            continue
        cells = row_cells(rows[0])
        if not any(str(c.get("/S", "")) == "/TH" for c in cells):
            bad_locations.append(f"Table {index}")
    return bad_locations


def _page_count(pdf: Pdf) -> int:
    return len(pdf.pages)


# ── main entry ──────────────────────────────────────────────────────────

def check_pdf_bytes(data: bytes) -> WcagReport:
    """Run every rule against a PDF and return a full WcagReport."""
    try:
        with pikepdf.open(BytesIO(data)) as pdf:
            return _check_open_pdf(pdf)
    except pikepdf.PasswordError:
        return _report_with_single_finding(Finding(
            rule_id="WCAG-encrypted",
            wcag_sc="n/a",
            wcag_level=Level.A,
            title="PDF is encrypted",
            description=(
                "The document is password-protected and cannot be analyzed. Remove"
                " the password or supply an unlocked copy before running accessibility"
                " checks."
            ),
            severity=Severity.BLOCKER,
            passed=False,
            manual_review=True,
        ))
    except pikepdf.PdfError as exc:
        return _report_with_single_finding(Finding(
            rule_id="WCAG-unreadable",
            wcag_sc="n/a",
            wcag_level=Level.A,
            title="PDF cannot be parsed",
            description=f"The PDF is corrupt or malformed: {exc}",
            severity=Severity.BLOCKER,
            passed=False,
            manual_review=True,
        ))


def _report_with_single_finding(finding: Finding) -> WcagReport:
    return _score(WcagReport(findings=[finding], total_rules=1))


def _check_open_pdf(pdf: Pdf) -> WcagReport:
    findings: list[Finding] = []

    # 1. Struct tree exists (foundational — WCAG 1.3.1)
    if _has_struct_tree(pdf):
        findings.append(Finding(
            rule_id="WCAG-1.3.1-struct-tree",
            wcag_sc="1.3.1",
            wcag_level=Level.A,
            title="Document is tagged",
            description="PDF contains a StructTreeRoot so assistive tech can navigate its structure.",
            severity=Severity.BLOCKER,
            passed=True,
        ))
    else:
        findings.append(Finding(
            rule_id="WCAG-1.3.1-struct-tree",
            wcag_sc="1.3.1",
            wcag_level=Level.A,
            title="Document is not tagged",
            description=(
                "The PDF has no structure tree. Screen readers cannot determine headings,"
                " lists, tables, or reading order. This is the single biggest accessibility"
                " barrier a PDF can have."
            ),
            severity=Severity.BLOCKER,
            passed=False,
            auto_fixable=True,
            fix_action="tag_pdf",
            location="Entire document",
            count=1,
        ))

    # 2. Marked as tagged (/MarkInfo)
    if _has_marked_info(pdf):
        findings.append(Finding(
            rule_id="WCAG-marked-info",
            wcag_sc="1.3.1",
            wcag_level=Level.A,
            title="Tagging flag is set",
            description="/MarkInfo declares the document as tagged so viewers use its structure.",
            severity=Severity.MINOR,
            passed=True,
        ))
    else:
        findings.append(Finding(
            rule_id="WCAG-marked-info",
            wcag_sc="1.3.1",
            wcag_level=Level.A,
            title="Tagging flag is missing",
            description=(
                "The document has no /MarkInfo entry declaring it tagged. Some viewers"
                " will not activate accessibility features without it."
            ),
            severity=Severity.MINOR,
            passed=False,
            auto_fixable=True,
            fix_action="tag_pdf",
            count=1,
        ))

    # 3. Language of page (WCAG 3.1.1)
    lang = _doc_lang(pdf)
    if lang:
        findings.append(Finding(
            rule_id="WCAG-3.1.1-lang",
            wcag_sc="3.1.1",
            wcag_level=Level.A,
            title=f"Document language declared: {lang}",
            description=f"The document catalog declares /Lang = {lang!r}.",
            severity=Severity.MAJOR,
            passed=True,
        ))
    else:
        findings.append(Finding(
            rule_id="WCAG-3.1.1-lang",
            wcag_sc="3.1.1",
            wcag_level=Level.A,
            title="Document language not declared",
            description=(
                "The catalog has no /Lang entry. Screen readers will not know which"
                " pronunciation and voice to use."
            ),
            severity=Severity.MAJOR,
            passed=False,
            auto_fixable=True,
            fix_action="set_language",
            count=1,
        ))

    # 4. Title (WCAG 2.4.2)
    title = _doc_title(pdf)
    if title:
        findings.append(Finding(
            rule_id="WCAG-2.4.2-title",
            wcag_sc="2.4.2",
            wcag_level=Level.A,
            title=f"Document title present",
            description=f"DocInfo /Title = {title!r}. Screen readers announce this on open.",
            severity=Severity.MAJOR,
            passed=True,
        ))
    else:
        findings.append(Finding(
            rule_id="WCAG-2.4.2-title",
            wcag_sc="2.4.2",
            wcag_level=Level.A,
            title="Document title missing",
            description=(
                "There is no /Title in the document info. The file name will be read"
                " aloud instead, which is often meaningless."
            ),
            severity=Severity.MAJOR,
            passed=False,
            auto_fixable=True,
            fix_action="set_title",
            count=1,
        ))

    # 5. Figures have /Alt (WCAG 1.1.1)
    figures = list(walk_figures(pdf))
    missing_alt = [f for f in figures if not f.has_alt_text]
    if not figures:
        findings.append(Finding(
            rule_id="WCAG-1.1.1-figure-alt",
            wcag_sc="1.1.1",
            wcag_level=Level.A,
            title="No figures found",
            description="Document contains no /Figure elements to check.",
            severity=Severity.MINOR,
            passed=True,
        ))
    elif not missing_alt:
        findings.append(Finding(
            rule_id="WCAG-1.1.1-figure-alt",
            wcag_sc="1.1.1",
            wcag_level=Level.A,
            title=f"All {len(figures)} figures have alt text",
            description="Every /Figure element carries an /Alt attribute.",
            severity=Severity.BLOCKER,
            passed=True,
        ))
    else:
        location = ", ".join(f"Page {f.page_number}, figure {f.index_on_page + 1}" for f in missing_alt[:3])
        if len(missing_alt) > 3:
            location += f", and {len(missing_alt) - 3} more"
        findings.append(Finding(
            rule_id="WCAG-1.1.1-figure-alt",
            wcag_sc="1.1.1",
            wcag_level=Level.A,
            title=f"{len(missing_alt)} figure(s) missing alt text",
            description=(
                "Images without alternative text are invisible to screen readers."
                " AI can propose descriptions from the image content; each proposal"
                " needs human review before it ships."
            ),
            severity=Severity.BLOCKER,
            passed=False,
            auto_fixable=True,
            fix_action="generate_alt_text",
            location=location,
            count=len(missing_alt),
        ))

    # 6. Heading hierarchy (WCAG 1.3.1)
    headings = _iter_heading_levels(pdf)
    if not headings:
        # Only flag missing headings if the doc actually has content beyond the cover
        if _page_count(pdf) > 1:
            findings.append(Finding(
                rule_id="WCAG-1.3.1-headings",
                wcag_sc="1.3.1",
                wcag_level=Level.AA,
                title="No headings found",
                description=(
                    "The document has no /H1-/H6 elements. Screen-reader users navigate"
                    " long documents by heading; without them, the only option is"
                    " reading top-to-bottom. Ramp can propose a heading structure by"
                    " comparing font sizes against the document's body text — every"
                    " promoted heading is listed for review, and no visible text,"
                    " layout, or formatting is touched."
                ),
                severity=Severity.MAJOR,
                passed=False,
                auto_fixable=True,
                fix_action="promote_headings",
                count=1,
            ))
        else:
            findings.append(Finding(
                rule_id="WCAG-1.3.1-headings",
                wcag_sc="1.3.1",
                wcag_level=Level.AA,
                title="Headings not applicable",
                description="Single-page document; heading hierarchy check skipped.",
                severity=Severity.MINOR,
                passed=True,
            ))
    else:
        # Check for skipped levels: e.g. H1 -> H3 is a skip
        prev = 0
        skipped: list[tuple[int, int]] = []
        for h in headings:
            if prev > 0 and h > prev + 1:
                skipped.append((prev, h))
            prev = h
        if skipped:
            desc = "; ".join(f"H{a} -> H{b}" for a, b in skipped[:3])
            findings.append(Finding(
                rule_id="WCAG-1.3.1-heading-skip",
                wcag_sc="1.3.1",
                wcag_level=Level.AA,
                title=f"Heading levels are skipped ({len(skipped)} place(s))",
                description=(
                    f"Skipping levels breaks assistive navigation: {desc}. Ramp can"
                    " renumber the existing headings so levels increase by 1 at a"
                    " time — this only changes the /H tag on headings the document"
                    " already has, never the visible text or formatting."
                ),
                severity=Severity.MINOR,
                passed=False,
                auto_fixable=True,
                fix_action="fix_heading_skip",
                count=len(skipped),
            ))
        else:
            findings.append(Finding(
                rule_id="WCAG-1.3.1-heading-skip",
                wcag_sc="1.3.1",
                wcag_level=Level.AA,
                title=f"Heading hierarchy is consistent ({len(headings)} heading(s))",
                description="No skipped levels in the document outline.",
                severity=Severity.MINOR,
                passed=True,
            ))

    # 7. Tables have /TH (WCAG 1.3.1)
    bad_tables = _tables_missing_headers(pdf)
    # Only report if there are any tables at all
    if _has_struct_tree(pdf):
        table_count = sum(1 for _ in walk_tables(pdf))

        if table_count == 0:
            pass  # no rule fires
        elif not bad_tables:
            findings.append(Finding(
                rule_id="WCAG-1.3.1-table-headers",
                wcag_sc="1.3.1",
                wcag_level=Level.A,
                title=f"All {table_count} table(s) have header rows",
                description="Every /Table element has /TH cells in its first row.",
                severity=Severity.MAJOR,
                passed=True,
            ))
        else:
            findings.append(Finding(
                rule_id="WCAG-1.3.1-table-headers",
                wcag_sc="1.3.1",
                wcag_level=Level.A,
                title=f"{len(bad_tables)} of {table_count} table(s) missing header cells",
                description=(
                    "Data tables without /TH cells make screen readers announce each"
                    " cell without column context. Ramp can retag the first row of"
                    " each table as column headers (/TH with /Scope=Column) - the"
                    " same fix you'd make by hand in a PDF editor."
                ),
                severity=Severity.MAJOR,
                passed=False,
                auto_fixable=True,
                fix_action="fix_table_headers",
                location=", ".join(bad_tables[:5]),
                count=len(bad_tables),
            ))

    # 8. Form fields have labels (WCAG 4.1.2)
    fields = _acroform_fields(pdf)
    if fields:
        # Exclude signature fields — they auto-label
        unlabelled = [name for name, obj in fields
                      if obj.get("/FT") != Name.Sig and not obj.get("/TU")]
        if unlabelled:
            findings.append(Finding(
                rule_id="WCAG-4.1.2-form-labels",
                wcag_sc="4.1.2",
                wcag_level=Level.A,
                title=f"{len(unlabelled)} of {len(fields)} form field(s) missing labels",
                description=(
                    "Form fields without /TU (tooltip label) are announced by their internal"
                    " name (or nothing at all) instead of their prompt. Screen-reader users"
                    " cannot tell what to fill in."
                ),
                severity=Severity.MAJOR,
                passed=False,
                auto_fixable=True,
                fix_action="infer_labels",
                location=", ".join(unlabelled[:5]) + (f", and {len(unlabelled) - 5} more" if len(unlabelled) > 5 else ""),
                count=len(unlabelled),
            ))
        else:
            findings.append(Finding(
                rule_id="WCAG-4.1.2-form-labels",
                wcag_sc="4.1.2",
                wcag_level=Level.A,
                title=f"All {len(fields)} form field(s) labelled",
                description="Every AcroForm field has a /TU tooltip.",
                severity=Severity.MAJOR,
                passed=True,
            ))

    # 9. Font encoding — every font has /ToUnicode
    missing_tounicode = _fonts_missing_tounicode(pdf)
    if missing_tounicode > 0:
        findings.append(Finding(
            rule_id="WCAG-encoding-tounicode",
            wcag_sc="1.1.1",
            wcag_level=Level.A,
            title=f"{missing_tounicode} font(s) lack Unicode mapping",
            description=(
                "Fonts without /ToUnicode may render visually but produce gibberish when"
                " copied or read aloud. Re-embed the font with proper Unicode mapping."
            ),
            severity=Severity.MAJOR,
            passed=False,
            manual_review=True,
            count=missing_tounicode,
        ))
    else:
        findings.append(Finding(
            rule_id="WCAG-encoding-tounicode",
            wcag_sc="1.1.1",
            wcag_level=Level.A,
            title="All fonts have Unicode mapping",
            description="Every non-standard font exposes /ToUnicode; text is selectable and readable.",
            severity=Severity.MINOR,
            passed=True,
        ))

    # 10. PDF/UA declaration
    if _has_pdfua_metadata(pdf):
        findings.append(Finding(
            rule_id="PDFUA-metadata",
            wcag_sc="1.3.1",
            wcag_level=Level.AA,
            title="PDF/UA-1 conformance declared",
            description="XMP metadata declares pdfuaid:part = 1, signaling to viewers that this file targets the accessibility standard.",
            severity=Severity.MINOR,
            passed=True,
        ))
    else:
        findings.append(Finding(
            rule_id="PDFUA-metadata",
            wcag_sc="1.3.1",
            wcag_level=Level.AA,
            title="PDF/UA-1 conformance not declared",
            description=(
                "The XMP metadata does not claim PDF/UA-1. This is advisory - the file"
                " can still be accessible without it - but declaring conformance tells"
                " viewers to trust the structure."
            ),
            severity=Severity.MINOR,
            passed=False,
            auto_fixable=True,
            fix_action="set_pdfua_metadata",
            count=1,
        ))

    # 11. Bookmarks for long documents (best-practice / WCAG 2.4.5)
    pages = _page_count(pdf)
    if pages > 10:
        if outline_is_valid(pdf):
            findings.append(Finding(
                rule_id="WCAG-2.4.5-bookmarks",
                wcag_sc="2.4.5",
                wcag_level=Level.AA,
                title=f"Bookmarks present in a {pages}-page document",
                description="The document outline provides skip navigation for a long document.",
                severity=Severity.MINOR,
                passed=True,
            ))
        else:
            has_broken_outline = "/Outlines" in pdf.Root
            findings.append(Finding(
                rule_id="WCAG-2.4.5-bookmarks",
                wcag_sc="2.4.5",
                wcag_level=Level.AA,
                title=(
                    f"Bookmarks are broken in a {pages}-page document"
                    if has_broken_outline
                    else f"No bookmarks in a {pages}-page document"
                ),
                description=(
                    (
                        "This document has a bookmark outline, but its entries don't"
                        " resolve to real pages in this file — likely left over from a"
                        " merge or template that was never fixed. Ramp can rebuild it"
                    )
                    if has_broken_outline
                    else (
                        "Documents longer than ~10 pages should include a bookmark"
                        " outline so users can jump between sections. Ramp can build"
                        " one automatically"
                    )
                ) + " from the document's heading structure, once headings exist.",
                severity=Severity.MINOR,
                passed=False,
                auto_fixable=True,
                fix_action="fix_bookmarks",
                count=1,
            ))

    # 12. Color contrast (manual — cannot reliably check from PDF)
    findings.append(Finding(
        rule_id="WCAG-1.4.3-contrast",
        wcag_sc="1.4.3",
        wcag_level=Level.AA,
        title="Color contrast requires manual review",
        description=(
            "Text-to-background contrast (≥ 4.5:1 for normal text, 3:1 for large) cannot"
            " be measured reliably from PDF content streams alone. Use a viewer with a"
            " contrast tool (Adobe Acrobat, PAC, or NVDA) to verify."
        ),
        severity=Severity.MINOR,
        passed=True,  # not a failure by our checker
        manual_review=True,
    ))

    return _score(WcagReport(findings=findings, total_rules=len(findings)))


def _score(report: WcagReport) -> WcagReport:
    """Compute overall score + rollups. Weights follow severity, and any BLOCKER
    failure caps the score."""
    weights = {Severity.BLOCKER: 25, Severity.MAJOR: 10, Severity.MINOR: 3}
    total_weight = 0
    lost_weight = 0
    for f in report.findings:
        w = weights[f.severity]
        total_weight += w
        if not f.passed and not f.manual_review:
            lost_weight += w
        if not f.passed:
            if f.severity == Severity.BLOCKER:
                report.blocker_count += 1
            elif f.severity == Severity.MAJOR:
                report.major_count += 1
            else:
                report.minor_count += 1
        else:
            report.passed_rules += 1
        if f.auto_fixable and not f.passed:
            report.auto_fixable_count += 1

    if total_weight == 0:
        report.score = 0
    else:
        report.score = max(0, round(100 * (total_weight - lost_weight) / total_weight))

    report.is_compliant = report.blocker_count == 0 and report.major_count == 0 and report.score >= 90

    if report.blocker_count > 0:
        report.summary = f"Not WCAG 2.1 AA compliant - {report.blocker_count} blocker(s) prevent assistive tech from using this document."
    elif report.major_count > 0:
        report.summary = f"Not WCAG 2.1 AA compliant - {report.major_count} major issue(s) remain."
    elif report.minor_count > 0:
        report.summary = f"WCAG 2.1 AA compliant with {report.minor_count} advisory improvement(s)."
    else:
        report.summary = "WCAG 2.1 AA compliant. No issues detected."
    return report
