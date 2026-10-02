"""Extract each artwork scan from the exhibition PDFs and export web images.

For every PDF in the parent folder: take the embedded scan, crop it to the
printed area plus a margin of real paper, neutralize the paper tone, and write
a large WebP and a thumbnail into public/works, plus src/works-meta.json with
pixel sizes. Run: python scripts/prepare_images.py (needs pymupdf, pillow, numpy).
"""
import io
import json
import pathlib

import numpy as np
import pymupdf
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT.parent
OUT = ROOT / "public" / "works"
META = ROOT / "src" / "works-meta.json"

LARGE = 1800
THUMB = 640
PAPER = np.array([246, 245, 241], dtype=np.float32)
ROTATE_180 = {"01"}  # scanned upside down


def ink_bbox(a):
    """Bounding box of the printed area, ignoring paper, specks and signatures."""
    h, w, _ = a.shape
    band = np.concatenate([a[: h // 25].reshape(-1, 3), a[-h // 25 :].reshape(-1, 3)])
    paper = np.median(band, axis=0)
    diff = np.abs(a.astype(np.int16) - paper.astype(np.int16)).max(axis=2)
    sat = a.max(axis=2).astype(np.int16) - a.min(axis=2).astype(np.int16)
    ink = (diff > 38) | (sat > 45)
    # ignore the outer 2% where scanner background and rounded corners live
    my, mx = int(h * 0.02), int(w * 0.02)
    ink[:my] = ink[-my:] = False
    ink[:, :mx] = ink[:, -mx:] = False
    y0, y1 = main_run(ink.mean(axis=1))
    x0, x1 = main_run(ink.mean(axis=0))
    return y0, y1, x0, x1


def main_run(density, threshold=0.04, gap=0.015):
    """Span of the inked blocks along one axis.

    Lines above the threshold are grouped into runs (small gaps bridged). Runs
    holding a real share of the ink are kept; a thin sheet edge or shadow
    standing apart from the print carries almost none and is dropped.
    """
    idx = np.where(density > threshold)[0]
    max_gap = int(len(density) * gap)
    runs, start = [], idx[0]
    for a, b in zip(idx, idx[1:]):
        if b - a > max_gap:
            runs.append((start, a))
            start = b
    runs.append((start, idx[-1]))
    mass = [density[a : b + 1].sum() for a, b in runs]
    kept = [r for r, m in zip(runs, mass) if m >= 0.08 * max(mass)]
    return kept[0][0], kept[-1][1]


def process(pdf):
    doc = pymupdf.open(pdf)
    xref = doc[0].get_images(full=True)[0][0]
    img = Image.open(io.BytesIO(doc.extract_image(xref)["image"])).convert("RGB")
    key = pdf.name[:2]
    if key in ROTATE_180:
        img = img.rotate(180)
    a = np.asarray(img)
    h, w, _ = a.shape
    y0, y1, x0, x1 = ink_bbox(a)
    m = int(max(y1 - y0, x1 - x0) * 0.045)
    y0, y1 = max(0, y0 - m), min(h, y1 + m)
    x0, x1 = max(0, x0 - m), min(w, x1 + m)
    crop = a[y0:y1, x0:x1].astype(np.float32)

    # paper tone = bright pixels in the margin ring; scale channels toward PAPER
    ring = np.concatenate([crop[: m // 2].reshape(-1, 3), crop[-m // 2 :].reshape(-1, 3)])
    bright = ring[ring.mean(axis=1) >= np.percentile(ring.mean(axis=1), 40)]
    gain = PAPER / np.median(bright, axis=0)
    out = Image.fromarray(np.clip(crop * gain, 0, 255).astype(np.uint8))

    large = out.copy()
    large.thumbnail((LARGE, LARGE), Image.LANCZOS)
    large.save(OUT / f"{key}.webp", quality=84, method=6)
    thumb = out.copy()
    thumb.thumbnail((THUMB, THUMB), Image.LANCZOS)
    thumb.save(OUT / f"{key}-thumb.webp", quality=78, method=6)
    return key, {"w": large.width, "h": large.height}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = dict(process(p) for p in sorted(SRC.glob("[0-9][0-9]_*.pdf")))
    META.write_text(json.dumps(meta, indent=2) + "\n")
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
