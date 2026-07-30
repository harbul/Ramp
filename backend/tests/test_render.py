"""Figure-region rendering, including the rotation transform.

The crop math is the risky part, and the sample PDF only exercises /Rotate=90.
So these build synthetic pages at all four rotations with a filled rectangle in
a *known* sub-region, render via the figure renderer, and assert the output is
the size and colour we expect. That verifies the transform for 0/90/180/270
without eyeballing a single image.
"""

from __future__ import annotations

from io import BytesIO

import pikepdf
import pytest
from PIL import Image

from pdf_remediation.core.render import (
    RENDER_SCALE,
    bbox_is_meaningful,
    crop_margins,
    render_figure_png,
    render_regions,
)

PAGE_W, PAGE_H = 612, 792


def _page_with_red_box(box: tuple[int, int, int, int], rotate: int) -> bytes:
    """A white page with one solid red rectangle at `box` (unrotated user
    space). `rotate` sets /Rotate."""
    x0, y0, x1, y1 = box
    content = (
        f"1 1 1 rg 0 0 {PAGE_W} {PAGE_H} re f\n"          # white background
        f"1 0 0 rg {x0} {y0} {x1 - x0} {y1 - y0} re f\n"  # red box
    ).encode()

    pdf = pikepdf.Pdf.new()
    page = pikepdf.Dictionary(
        Type=pikepdf.Name.Page,
        MediaBox=pikepdf.Array([0, 0, PAGE_W, PAGE_H]),
        Rotate=rotate,
        Resources=pikepdf.Dictionary(),
        Contents=pdf.make_indirect(pikepdf.Stream(pdf, content)),
    )
    pdf.pages.append(pikepdf.Page(pdf.make_indirect(page)))
    buf = BytesIO()
    pdf.save(buf)
    return buf.getvalue()


def _dominant_is_red(png: bytes) -> bool:
    img = Image.open(BytesIO(png)).convert("RGB")
    img = img.resize((16, 16))  # cheap average
    reds = sum(1 for px in list(img.getdata()) if px[0] > 180 and px[1] < 80 and px[2] < 80)
    return reds > (16 * 16) * 0.5


@pytest.mark.parametrize("rotate", [0, 90, 180, 270])
def test_render_lands_on_the_figure_region_at_every_rotation(rotate):
    """The red box is the 'figure'. Whatever the page rotation, rendering its
    BBox must come back red — if the transform is wrong, we'd crop a white area."""
    box = (100, 600, 300, 750)  # a rectangle in the upper-left
    data = _page_with_red_box(box, rotate)

    png = render_figure_png(data, 1, box)

    assert _dominant_is_red(png), f"rotation {rotate}: cropped the wrong region"


@pytest.mark.parametrize("rotate", [0, 90, 180, 270])
def test_rendered_dimensions_are_the_readers_view(rotate):
    """A 200x150 box renders 200x150 upright, but 150x200 on a page rotated
    90/270 — because a reader sees the figure rotated too. The model should get
    the reader's view, so the swap is correct, not a bug.
    """
    box = (100, 600, 300, 750)  # 200 wide, 150 tall in unrotated space
    data = _page_with_red_box(box, rotate)

    png = render_figure_png(data, 1, box)
    img = Image.open(BytesIO(png))

    if rotate in (90, 270):
        exp_w, exp_h = 150, 200
    else:
        exp_w, exp_h = 200, 150

    assert abs(img.width - exp_w * RENDER_SCALE) <= 4
    assert abs(img.height - exp_h * RENDER_SCALE) <= 4


def test_crop_margins_rot0_is_identity_shape():
    # box flush to bottom-left corner -> only right and top margins
    margins = crop_margins((0, 0, 100, 200), (0, 0, PAGE_W, PAGE_H), 0)
    left, bottom, right, top = margins
    assert (left, bottom) == (0, 0)
    assert right == pytest.approx(PAGE_W - 100)
    assert top == pytest.approx(PAGE_H - 200)


def test_crop_margins_rot90_matches_hand_derivation():
    # verified against the real /Rotate=90 sample: bbox (0,417,612,792) -> (417,0,0,0)
    margins = crop_margins((0, 417, PAGE_W, PAGE_H), (0, 0, PAGE_W, PAGE_H), 90)
    assert margins == pytest.approx((417.0, 0.0, 0.0, 0.0))


def test_bbox_ordering_is_normalised():
    # upper-right..lower-left ordering still works
    a = crop_margins((300, 750, 100, 600), (0, 0, PAGE_W, PAGE_H), 0)
    b = crop_margins((100, 600, 300, 750), (0, 0, PAGE_W, PAGE_H), 0)
    assert a == pytest.approx(b)


def test_negative_mediabox_origin_is_handled():
    # some PDFs put the origin off (0,0); margins must stay non-negative
    margins = crop_margins((10, 10, 50, 50), (-20, -20, 100, 100), 0)
    assert all(m >= 0 for m in margins)


def test_tiny_bbox_is_not_meaningful():
    assert not bbox_is_meaningful((0, 0, 5, 5))       # a rule
    assert bbox_is_meaningful((0, 0, 200, 150))       # a figure


def test_render_regions_opens_once_and_preserves_order():
    box_a = (100, 600, 300, 750)
    box_b = (100, 100, 250, 200)
    data = _page_with_red_box(box_a, 0)

    pngs = render_regions(data, [(1, box_a), (1, box_b), (99, box_a)])

    assert len(pngs) == 3
    assert pngs[0] is not None and _dominant_is_red(pngs[0])
    assert pngs[1] is not None            # white region renders fine, just not red
    assert not _dominant_is_red(pngs[1])
    assert pngs[2] is None                # page 99 out of range -> None, not a crash
