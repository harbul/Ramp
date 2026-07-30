"""OCR-aware StructTreeRoot reconstruction.

Builds a proper tagged PDF structure tree from OCR results. Each recognized
text block becomes a /H1, /H, or /P structure element depending on its
block_type, and each meaningful image XObject becomes a /Figure element
(without /Alt, so the alt-text review flow picks them up later).
"""

from __future__ import annotations

import logging
from io import BytesIO

import pikepdf
from pikepdf import Array, Dictionary, Name

from ..core.images import ImageExtractionError, extract_png, is_meaningful
from ..core.render import RenderError
from ..models import OcrResult


def _crop_figure_from_page(pdf_bytes: bytes, page_number: int, bbox_topleft: tuple[float, float, float, float], *, accurate_bbox: bool = False) -> bytes:
    """Crop a figure region from a page using top-left origin coordinates.

    When accurate_bbox=True (bboxes from a layout detector like ONNX YOLO),
    applies only a small uniform 5% padding since the bboxes are precise.

    When accurate_bbox=False (bboxes from Claude's vision model), applies a
    30pt upward shift and asymmetric padding to compensate for Claude's
    systematic downward offset.

    Args:
        pdf_bytes: The full PDF file bytes
        page_number: 1-indexed page number
        bbox_topleft: (x0, y0, x1, y1) in points with top-left origin
        accurate_bbox: If True, bbox is from a layout detector (no shift needed)
    """
    import pypdfium2 as pdfium
    from .images import MAX_LONG_EDGE, downscale

    doc = pdfium.PdfDocument(pdf_bytes)
    try:
        page = doc[page_number - 1]
        page_w = page.get_width()
        page_h = page.get_height()

        x0, y0_top, x1, y1_top = bbox_topleft
        w = x1 - x0
        h = y1_top - y0_top

        if accurate_bbox:
            # Layout detector bboxes are precise — just add a small uniform margin
            pad_x = min(w * 0.05, 10.0)
            pad_y = min(h * 0.05, 10.0)
            x0 = max(1, x0 - pad_x)
            x1 = min(page_w - 1, x1 + pad_x)
            y0_top = max(1, y0_top - pad_y)
            y1_top = min(page_h - 1, y1_top + pad_y)
        else:
            # Claude's bboxes are shifted ~30pt downward — compensate
            shift_up = 30.0
            y0_top = y0_top - shift_up
            y1_top = y1_top - shift_up

            pad_top = min(h * 0.15, 25.0)
            pad_x = min(w * 0.10, 15.0)

            x0 = max(1, x0 - pad_x)
            x1 = min(page_w - 1, x1 + pad_x)
            y0_top = max(1, y0_top - pad_top)
            y1_top = min(page_h - 1, y1_top - 5.0)

        # pdfium crop margins: (left, bottom, right, top)
        left = x0
        right = page_w - x1
        top = y0_top
        bottom = page_h - y1_top

        bitmap = page.render(scale=2.0, crop=(left, bottom, right, top))
        pil = bitmap.to_pil()

        if pil.width < 1 or pil.height < 1:
            raise RenderError("Rendered region was empty.")

        if pil.mode not in ("RGB", "L"):
            pil = pil.convert("RGB")
        pil = downscale(pil, MAX_LONG_EDGE)

        buf = BytesIO()
        pil.save(buf, format="PNG", optimize=True)
        return buf.getvalue()
    finally:
        doc.close()


log = logging.getLogger(__name__)

# Mapping from OcrBlock.block_type to PDF structure element type
_BLOCK_TYPE_TO_STRUCT = {
    "TITLE": Name.H1,
    "HEADING": Name.H,
    "TEXT": Name.P,
}


def build_ocr_structure(
    pdf_bytes: bytes,
    ocr_result: OcrResult,
    job_id: str,
    storage,
    *,
    layout_detector=None,
) -> tuple[bytes, list[dict]]:
    """Build structure tree from OCR result.

    Replaces each page's content stream with marked-content sequences for every
    OCR text block. Also identifies meaningful image XObjects and wraps them as
    /Figure structure elements.

    Returns:
        tuple of (tagged_pdf_bytes, detected_images)
        where detected_images is a list of dicts with keys:
        - image_id: str (e.g. 'img-p1-0')
        - page_number: int
        - bbox: tuple
        - suggested_alt_text: str (placeholder like 'Figure on page 1: [image description needed]')
        - image_location: str (storage key where PNG was saved)
    """
    detected_images: list[dict] = []

    with pikepdf.open(BytesIO(pdf_bytes)) as pdf:
        # Global MCID counter across all pages (resets per StructParents entry)
        all_struct_elems: list[pikepdf.Object] = []
        parent_tree_nums: list = []  # [page_index, Array([struct_elems...])]

        for page_idx, page in enumerate(pdf.pages):
            page_number = page_idx + 1  # 1-indexed
            page_mcid = 0
            page_struct_elems: list[pikepdf.Object] = []
            image_index = 0

            # --- Text structure elements from OCR blocks ---
            ocr_page = _get_ocr_page(ocr_result, page_number)

            # Parse existing content stream
            existing_content = _read_page_content(page)

            # Build new marked content for text blocks
            text_marked_content = b""
            ocr_figure_blocks = []  # FIGURE blocks to crop from page scan

            if ocr_page is not None:
                for block in ocr_page.blocks:
                    # FIGURE blocks are visual regions (logos, charts, photos)
                    # detected by the OCR provider within the page scan.
                    # These get cropped from the page and shown for alt-text review.
                    if block.block_type == "FIGURE":
                        ocr_figure_blocks.append(block)
                        continue

                    struct_type = _BLOCK_TYPE_TO_STRUCT.get(
                        block.block_type, Name.P
                    )

                    # Add BDC/EMC marked content sequence for this block
                    text_marked_content += (
                        f"/{str(struct_type)[1:]} <</MCID {page_mcid}>> BDC\n"
                    ).encode()
                    # Emit a text rendering placeholder (invisible text behind image)
                    # This uses TJ with the block text so text extraction works
                    text_marked_content += _build_invisible_text_operator(
                        block.text, block.bbox, ocr_page.width, ocr_page.height, page
                    )
                    text_marked_content += b"EMC\n"

                    # Create struct elem for this text block
                    struct_elem = pdf.make_indirect(Dictionary({
                        "/Type": Name.StructElem,
                        "/S": struct_type,
                        "/Pg": page.obj,
                        "/K": page_mcid,
                    }))
                    page_struct_elems.append(struct_elem)
                    page_mcid += 1

            # --- Figure structure elements from layout detector or OCR ---
            # If a layout detector is available, use its bboxes (more accurate).
            # Otherwise fall back to Claude's FIGURE blocks (with shift hack).
            figure_bboxes: list[tuple[float, float, float, float]] = []
            use_layout_detector_bboxes = False

            if layout_detector is not None:
                import pypdfium2 as _pdfium
                _doc = _pdfium.PdfDocument(pdf_bytes)
                _page = _doc[page_number - 1]
                _bitmap = _page.render(scale=2.0)
                _pil = _bitmap.to_pil()
                _doc.close()

                detections = layout_detector.detect_figures(
                    _pil,
                    float(page.obj.get("/MediaBox")[2]) if page.obj.get("/MediaBox") else 612.0,
                    float(page.obj.get("/MediaBox")[3]) if page.obj.get("/MediaBox") else 792.0,
                )
                if detections:
                    figure_bboxes = [d.bbox for d in detections]
                    use_layout_detector_bboxes = True
                    log.info(
                        "Using layout detector: %d figure(s) on page %d",
                        len(figure_bboxes), page_number,
                    )

            # Fall back to OCR FIGURE blocks if no layout detector or no detections
            if not figure_bboxes and ocr_figure_blocks and ocr_page is not None:
                for fig_block in ocr_figure_blocks:
                    fig_w = abs(fig_block.bbox[2] - fig_block.bbox[0])
                    fig_h = abs(fig_block.bbox[3] - fig_block.bbox[1])
                    if fig_w < 30 or fig_h < 30:
                        log.info(
                            "Skipping tiny figure on page %d: bbox=%s (%.0fx%.0f)",
                            page_number, fig_block.bbox, fig_w, fig_h,
                        )
                        continue
                    figure_bboxes.append(fig_block.bbox)

            # Process detected figures
            if figure_bboxes:
                for fig_bbox in figure_bboxes:
                    image_id = f"img-p{page_number}-{image_index}"
                    storage_key = f"jobs/{job_id}/ocr/images/{image_id}.png"

                    try:
                        png_bytes = _crop_figure_from_page(
                            pdf_bytes, page_number, fig_bbox,
                            accurate_bbox=use_layout_detector_bboxes,
                        )
                        storage.put_bytes(storage_key, png_bytes, "image/png")

                        detected_images.append({
                            "image_id": image_id,
                            "page_number": page_number,
                            "bbox": fig_bbox,
                            "suggested_alt_text": (
                                f"Figure on page {page_number}: "
                                f"[image description needed]"
                            ),
                            "image_location": storage_key,
                        })
                    except (RenderError, Exception) as exc:
                        log.warning(
                            "Could not crop figure region on page %d: %s",
                            page_number, exc,
                        )
                        detected_images.append({
                            "image_id": image_id,
                            "page_number": page_number,
                            "bbox": fig_bbox,
                            "suggested_alt_text": (
                                f"Figure on page {page_number}: "
                                f"[image description needed]"
                            ),
                            "image_location": storage_key,
                        })

                    # Create /Figure struct elem (no /Alt — alt-text review picks it up)
                    text_marked_content += (
                        f"/Figure <</MCID {page_mcid}>> BDC\n"
                    ).encode()
                    text_marked_content += b"EMC\n"

                    # Convert fig_bbox from top-left origin to PDF
                    # bottom-left origin for the /BBox attribute
                    try:
                        page_media = page.obj.get("/MediaBox")
                        pg_h = float(page_media[3]) - float(page_media[1]) if page_media else 792.0
                    except (TypeError, ValueError, IndexError):
                        pg_h = 792.0
                    fb = fig_bbox
                    fig_pdf_bbox = Array([
                        fb[0],            # x0 (same)
                        pg_h - fb[3],     # y0 in PDF coords (flip y1_top)
                        fb[2],            # x1 (same)
                        pg_h - fb[1],     # y1 in PDF coords (flip y0_top)
                    ])

                    fig_struct_elem = pdf.make_indirect(Dictionary({
                        "/Type": Name.StructElem,
                        "/S": Name.Figure,
                        "/Pg": page.obj,
                        "/K": page_mcid,
                        "/A": Dictionary({
                            "/O": Name.Layout,
                            "/BBox": fig_pdf_bbox,
                        }),
                    }))
                    page_struct_elems.append(fig_struct_elem)
                    page_mcid += 1
                    image_index += 1

            # --- Figure structure elements from image XObjects ---
            resources = page.obj.get("/Resources", {})
            xobjects = resources.get("/XObject")

            if xobjects is not None:
                # Collect image XObject names, filtering out full-page scan images
                image_names = []
                for xobj_name, xobj in xobjects.items():
                    try:
                        if xobj.get("/Subtype") == Name.Image and is_meaningful(xobj):
                            # Check if this is a full-page scan image (artifact, not figure)
                            if _is_fullpage_scan(xobj, page):
                                log.info(
                                    "Skipping full-page scan image %s on page %d (artifact)",
                                    xobj_name, page_number,
                                )
                                continue
                            image_names.append((xobj_name, xobj))
                    except Exception:
                        continue

                for xobj_name, xobj in image_names:
                    image_id = f"img-p{page_number}-{image_index}"
                    storage_key = f"jobs/{job_id}/ocr/images/{image_id}.png"

                    # Extract and store the image as PNG
                    try:
                        png_bytes = extract_png(xobj)
                        storage.put_bytes(storage_key, png_bytes, "image/png")

                        # Get bounding box from the XObject dimensions
                        width = int(xobj.get("/Width", 0))
                        height = int(xobj.get("/Height", 0))
                        bbox = (0, 0, width, height)

                        detected_images.append({
                            "image_id": image_id,
                            "page_number": page_number,
                            "bbox": bbox,
                            "suggested_alt_text": f"Figure on page {page_number}: [image description needed]",
                            "image_location": storage_key,
                        })
                    except ImageExtractionError as exc:
                        log.warning(
                            "Could not extract image %s on page %d: %s",
                            xobj_name, page_number, exc,
                        )
                        # Still create a struct elem for it even if extraction failed
                        detected_images.append({
                            "image_id": image_id,
                            "page_number": page_number,
                            "bbox": (0, 0, 0, 0),
                            "suggested_alt_text": f"Figure on page {page_number}: [image description needed]",
                            "image_location": storage_key,
                        })

                    # Create /Figure struct elem WITHOUT /Alt
                    # (so alt-text review picks it up)
                    try:
                        page_media = page.obj.get("/MediaBox")
                        fig_bbox = Array([
                            float(page_media[0]) + 1, float(page_media[1]) + 1,
                            float(page_media[2]) - 1, float(page_media[3]) - 1,
                        ]) if page_media else Array([1, 1, 611, 791])
                    except (TypeError, ValueError, IndexError):
                        fig_bbox = Array([1, 1, 611, 791])

                    fig_struct_elem = pdf.make_indirect(Dictionary({
                        "/Type": Name.StructElem,
                        "/S": Name.Figure,
                        "/Pg": page.obj,
                        "/K": page_mcid,
                        "/A": Dictionary({
                            "/O": Name.Layout,
                            "/BBox": fig_bbox,
                        }),
                    }))
                    page_struct_elems.append(fig_struct_elem)
                    page_mcid += 1
                    image_index += 1

            # --- Rebuild page content stream with marked content ---
            new_content = text_marked_content

            # Wrap image Do commands in marked content:
            # - /Figure images get BDC with MCID
            # - Full-page scan images get wrapped as /Artifact
            # Collect all image XObject names on this page (including full-page scans)
            all_page_image_names: set[str] = set()
            fullpage_scan_names: set[str] = set()
            if xobjects is not None:
                for xobj_name, xobj in xobjects.items():
                    try:
                        if xobj.get("/Subtype") == Name.Image and is_meaningful(xobj):
                            all_page_image_names.add(xobj_name)
                            if _is_fullpage_scan(xobj, page):
                                fullpage_scan_names.add(xobj_name)
                    except Exception:
                        continue

            if xobjects is not None and (image_names or fullpage_scan_names):
                figure_mcid_start = page_mcid - len(image_names)
                try:
                    instructions = pikepdf.parse_content_stream(page)
                    new_instructions = []
                    img_mcid_counter = figure_mcid_start

                    meaningful_names = {name for name, _ in image_names}
                    for instruction in instructions:
                        op = str(instruction.operator)
                        if (
                            op == "Do"
                            and instruction.operands
                            and str(instruction.operands[0]) in meaningful_names
                        ):
                            # Wrap in BDC/EMC for figure (gets MCID for struct tree)
                            props = pikepdf.Dictionary({"/MCID": img_mcid_counter})
                            new_instructions.append(
                                pikepdf.ContentStreamInstruction(
                                    [Name.Figure, props], pikepdf.Operator("BDC")
                                )
                            )
                            new_instructions.append(instruction)
                            new_instructions.append(
                                pikepdf.ContentStreamInstruction(
                                    [], pikepdf.Operator("EMC")
                                )
                            )
                            img_mcid_counter += 1
                        elif (
                            op == "Do"
                            and instruction.operands
                            and str(instruction.operands[0]) in fullpage_scan_names
                        ):
                            # Wrap full-page scan as Artifact (screen readers skip it)
                            artifact_props = pikepdf.Dictionary({
                                "/Type": Name("/Background"),
                            })
                            new_instructions.append(
                                pikepdf.ContentStreamInstruction(
                                    [Name("/Artifact"), artifact_props],
                                    pikepdf.Operator("BDC"),
                                )
                            )
                            new_instructions.append(instruction)
                            new_instructions.append(
                                pikepdf.ContentStreamInstruction(
                                    [], pikepdf.Operator("EMC")
                                )
                            )
                        else:
                            new_instructions.append(instruction)

                    image_content = pikepdf.unparse_content_stream(new_instructions)
                except pikepdf.PdfError:
                    # Fallback: keep existing content as-is, wrap images at end
                    image_content = existing_content
                    fallback_content = b""
                    img_mcid_counter = figure_mcid_start
                    for xobj_name, _ in image_names:
                        fallback_content += (
                            f"/Figure <</MCID {img_mcid_counter}>> BDC\n"
                        ).encode()
                        fallback_content += f"q {xobj_name} Do Q\n".encode()
                        fallback_content += b"EMC\n"
                        img_mcid_counter += 1
                    image_content = existing_content + b"\n" + fallback_content
            else:
                # No images to wrap — keep existing content
                image_content = existing_content

            # Combine: text marked content (invisible overlay) + image content
            final_content = new_content + image_content
            page.obj["/Contents"] = pdf.make_stream(final_content)

            # Set StructParents on the page
            page.obj["/StructParents"] = page_idx

            # Build ParentTree entry for this page
            if page_struct_elems:
                parent_tree_nums.append(page_idx)
                parent_tree_nums.append(Array(page_struct_elems))

            all_struct_elems.extend(page_struct_elems)

        # --- Build the Document root element ---
        doc_elem = pdf.make_indirect(Dictionary({
            "/Type": Name.StructElem,
            "/S": Name("/Document"),
            "/K": Array(all_struct_elems) if all_struct_elems else Array([]),
        }))

        # Set parent references on all struct elems -> Document
        for elem in all_struct_elems:
            elem["/P"] = doc_elem

        # --- Build ParentTree number tree ---
        parent_tree = pdf.make_indirect(Dictionary({
            "/Nums": Array(parent_tree_nums),
        }))

        # --- Build StructTreeRoot ---
        struct_tree_root = pdf.make_indirect(Dictionary({
            "/Type": Name.StructTreeRoot,
            "/K": doc_elem,
            "/ParentTree": parent_tree,
        }))

        # Set Document element's parent to StructTreeRoot
        doc_elem["/P"] = struct_tree_root

        # --- Attach to document catalog ---
        pdf.Root["/StructTreeRoot"] = struct_tree_root
        pdf.Root["/MarkInfo"] = Dictionary({"/Marked": True})
        pdf.Root["/Lang"] = pikepdf.String("en")

        # Set document title from OCR metadata if available
        _set_document_title(pdf, ocr_result)

        # Write tagged PDF
        out = BytesIO()
        pdf.save(out)
        tagged_pdf_bytes = out.getvalue()

    return tagged_pdf_bytes, detected_images


def _ocr_bbox_to_pdf(
    ocr_bbox: tuple[float, float, float, float],
    ocr_page_width: float,
    ocr_page_height: float,
    page,
) -> tuple[float, float, float, float]:
    """Convert an OCR bounding box to PDF user-space coordinates.

    OCR providers return coordinates with top-left origin.
    PDF user space has origin at bottom-left. This converts between them
    for use with render_figure_png.

    Also clamps to leave at least 1pt margin from page edges so pdfium
    crop doesn't reject "crop exceeds page dimensions" errors.
    """
    x0, y0, x1, y1 = ocr_bbox

    # Get PDF page dimensions
    try:
        media_box = page.obj.get("/MediaBox")
        if media_box:
            pdf_width = float(media_box[2]) - float(media_box[0])
            pdf_height = float(media_box[3]) - float(media_box[1])
        else:
            pdf_width, pdf_height = 612.0, 792.0
    except (TypeError, ValueError, IndexError):
        pdf_width, pdf_height = 612.0, 792.0

    # Scale OCR coordinates to PDF space
    if ocr_page_width > 0 and ocr_page_height > 0:
        scale_x = pdf_width / ocr_page_width
        scale_y = pdf_height / ocr_page_height
    else:
        scale_x = scale_y = 1.0

    pdf_x0 = x0 * scale_x
    pdf_x1 = x1 * scale_x
    # Flip Y: OCR is top-down, PDF is bottom-up
    pdf_y0 = pdf_height - (y1 * scale_y)
    pdf_y1 = pdf_height - (y0 * scale_y)

    # Clamp to leave at least 1pt margin from page edges
    # (pdfium rejects crops that touch or exceed the page boundary)
    margin = 1.0
    pdf_x0 = max(margin, pdf_x0)
    pdf_y0 = max(margin, pdf_y0)
    pdf_x1 = min(pdf_width - margin, pdf_x1)
    pdf_y1 = min(pdf_height - margin, pdf_y1)

    # Ensure valid bbox (x0 < x1, y0 < y1)
    if pdf_x0 >= pdf_x1:
        pdf_x0 = margin
        pdf_x1 = pdf_width - margin
    if pdf_y0 >= pdf_y1:
        pdf_y0 = margin
        pdf_y1 = pdf_height - margin

    return (pdf_x0, pdf_y0, pdf_x1, pdf_y1)


def _is_fullpage_scan(xobj, page) -> bool:
    """Detect whether an image XObject is a full-page scan (the background).

    A full-page scan image covers the entire page and represents the scanned
    document itself. Per the PRD, these should be treated as artifacts after
    the OCR text layer is added — not as /Figure elements needing alt text.

    Heuristic: if the image resolution is high (typical scan DPI produces images
    much larger than the page in points) and it's rendered at or near page size
    in the content stream, it's the page scan.
    """
    try:
        img_width = int(xobj.get("/Width", 0))
        img_height = int(xobj.get("/Height", 0))
    except (TypeError, ValueError):
        return False

    # Get page dimensions
    try:
        media_box = page.obj.get("/MediaBox")
        if media_box:
            page_w = float(media_box[2]) - float(media_box[0])
            page_h = float(media_box[3]) - float(media_box[1])
        else:
            page_w, page_h = 612.0, 792.0
    except (TypeError, ValueError, IndexError):
        page_w, page_h = 612.0, 792.0

    # A typical scanned page at 200-300 DPI on US Letter (8.5x11"):
    # 200 DPI = 1700x2200, 300 DPI = 2550x3300
    # The image is much larger than the page in points (612x792).
    # If the image pixel dimensions are at least 2x the page point dimensions
    # in both axes, it's almost certainly the full-page scan.
    MIN_SCAN_RATIO = 1.5  # image_pixels / page_points

    width_ratio = img_width / page_w if page_w > 0 else 0
    height_ratio = img_height / page_h if page_h > 0 else 0

    if width_ratio >= MIN_SCAN_RATIO and height_ratio >= MIN_SCAN_RATIO:
        return True

    # Also catch cases where the image aspect ratio closely matches the page
    # and it's the only large image (covers > 80% of page area equivalent)
    img_aspect = img_width / img_height if img_height > 0 else 0
    page_aspect = page_w / page_h if page_h > 0 else 0

    if img_aspect > 0 and page_aspect > 0:
        aspect_match = abs(img_aspect - page_aspect) / page_aspect < 0.15
        is_large = img_width >= 1000 and img_height >= 1000
        if aspect_match and is_large and (width_ratio >= 1.0 or height_ratio >= 1.0):
            return True

    return False


def _get_ocr_page(ocr_result: OcrResult, page_number: int):
    """Get the OcrPage for a given 1-indexed page number, or None."""
    for page in ocr_result.pages:
        if page.page_number == page_number:
            return page
    return None


def _read_page_content(page) -> bytes:
    """Read the raw content stream bytes from a page."""
    if "/Contents" not in page.obj:
        return b""
    contents = page.obj["/Contents"]
    if isinstance(contents, pikepdf.Array):
        result = b""
        for stream in contents:
            result += stream.read_bytes()
        return result
    return contents.read_bytes()


def _build_invisible_text_operator(
    text: str,
    bbox: tuple[float, float, float, float],
    page_width: float,
    page_height: float,
    page,
) -> bytes:
    """Build PDF operators to render invisible text at the block's position.

    Uses text rendering mode 3 (invisible) so the text is present for
    accessibility/extraction but doesn't visually interfere with the scan image.
    The text is positioned according to the OCR bounding box coordinates.
    """
    if not text.strip():
        return b""

    x0, y0, x1, y1 = bbox

    # Convert OCR coordinates to PDF user space
    # OCR coords are typically top-left origin; PDF is bottom-left
    # Scale to actual page dimensions
    try:
        page_media = page.obj.get("/MediaBox")
        if page_media:
            pdf_width = float(page_media[2]) - float(page_media[0])
            pdf_height = float(page_media[3]) - float(page_media[1])
        else:
            pdf_width = 612.0  # letter width default
            pdf_height = 792.0  # letter height default
    except (TypeError, ValueError, IndexError):
        pdf_width = 612.0
        pdf_height = 792.0

    # Scale OCR coordinates to PDF space
    if page_width > 0 and page_height > 0:
        scale_x = pdf_width / page_width
        scale_y = pdf_height / page_height
        pdf_x = x0 * scale_x
        # Flip Y axis: OCR is top-down, PDF is bottom-up
        pdf_y = pdf_height - (y1 * scale_y)
    else:
        pdf_x = x0
        pdf_y = pdf_height - y1

    # Estimate font size from bbox height
    block_height = abs(y1 - y0)
    font_size = max(1, min(72, block_height * (pdf_height / page_height) if page_height > 0 else 12))

    # Escape text for PDF string
    escaped_text = _escape_pdf_string(text)

    # Render invisible text (mode 3)
    content = b"BT\n"
    content += f"3 Tr\n".encode()  # invisible text rendering mode
    content += f"/F1 {font_size:.1f} Tf\n".encode()
    content += f"{pdf_x:.2f} {pdf_y:.2f} Td\n".encode()
    content += f"({escaped_text}) Tj\n".encode()
    content += b"ET\n"
    return content


def _escape_pdf_string(text: str) -> str:
    """Escape special characters for a PDF literal string."""
    # Replace backslash first, then parens
    result = text.replace("\\", "\\\\")
    result = result.replace("(", "\\(")
    result = result.replace(")", "\\)")
    result = result.replace("\r", "\\r")
    result = result.replace("\n", "\\n")
    # Remove any non-latin1 characters that can't go in a PDF literal string
    result = result.encode("latin-1", errors="replace").decode("latin-1")
    return result


def _set_document_title(pdf, ocr_result: OcrResult) -> None:
    """Set the document title from OCR data.

    Uses the first TITLE block found, or falls back to a generic title.
    """
    title = None
    for page in ocr_result.pages:
        for block in page.blocks:
            if block.block_type == "TITLE" and block.text.strip():
                title = block.text.strip()
                break
        if title:
            break

    if not title:
        title = "OCR Reconstructed Document"

    # Set in document info dictionary
    with pdf.open_metadata() as meta:
        meta["dc:title"] = title
