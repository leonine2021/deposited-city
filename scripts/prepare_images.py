"""Export each artwork as web images into public/works.

Sources, in order of preference:

1. High-resolution scans in ../works/ (JPEG), listed in SCANS with the
   rotation that brings each one upright (the works were scanned sideways).
2. A flat placeholder, for works in PENDING that have no usable scan yet. It
   keeps the proportions recorded in works-meta.json so the layouts hold.
3. The exhibition PDFs in the parent folder (../NN_*.pdf). Reading them needs
   pymupdf; without it they are left as built.

Each scan is cropped to the printed area plus a margin of real paper, the
paper tone is neutralized, and a large WebP and a thumbnail are written to
public/works.

Region-only works (the abstract ones) are shown only as one region, never
whole: NN-detail.webp and NN-detail-thumb.webp. The region comes from the
artist's own crop in ../works/crops/NN.jpg when there is one (CROPS), or
else is cut from the scan by the fractions in DETAILS. src/works-meta.json
records pixel sizes, the detail region and which works are pending.

Run: python scripts/prepare_images.py [NN ...]   (needs pillow, numpy; pymupdf for PDFs)

When a scan arrives for a pending work: add it to SCANS, drop it from PENDING,
run the script with that number.
"""
import io
import json
import pathlib
import sys

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT.parent
SCAN_DIR = SRC / "works"
OUT = ROOT / "public" / "works"
META = ROOT / "src" / "works-meta.json"

LARGE = 2600
DETAIL = 2400
THUMB = 640
PAPER = np.array([246, 245, 241], dtype=np.float32)
ROTATE_180 = {"01"}  # PDF scan of 01 is upside down

# work id -> (scan file, degrees to rotate counter-clockwise to stand upright)
SCANS = {
    "00": ("wave.jpg", 90),
    "01": ("wtc.jpg", 90),
    "02": ("brick.jpg", 90),
    "03": ("bamboo.jpg", -90),
    "05": ("dream.jpg", -90),
    "06": ("blood.jpg", -90),
    "07": ("heart.jpg", 90),
    "08": ("island.jpg", 90),
    "10": ("salt fload001.jpg", 90),
    "12": ("drops.jpg", -90),
}

# works without a sharp scan yet: a flat placeholder instead of a blurry image
PENDING = {"04", "09", "11", "14", "15", "16"}

# the artist's own crops, used as the region as they are (no scan needed)
CROPS = {"03", "06", "10", "13"}
CROP_DIR = SCAN_DIR / "crops"
PLACEHOLDER = (220, 217, 210)
PLACEHOLDER_H = 1200

# work id -> detail region (x0, y0, x1, y1) as fractions of the exported image
DETAILS = {
    "00": (0.12, 0.22, 0.92, 0.82),  # the sealed black block and the swirl above it
    "03": (0.30, 0.12, 0.80, 0.55),  # broken black marks (superseded by the artist's crop)
    "06": (0.30, 0.30, 0.75, 0.68),  # thread grooves as vessels (superseded by the artist's crop)
    "10": (0.33, 0.18, 0.97, 0.62),  # salt crystals on the dark ground (superseded by the artist's crop)
    "12": (0.27, 0.07, 0.67, 0.47),  # salt rings, each the edge of one drop
}


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


def load_scan(key):
    name, deg = SCANS[key]
    img = Image.open(SCAN_DIR / name).convert("RGB")
    return img.rotate(deg, expand=True) if deg else img


def load_pdf(key):
    import pymupdf

    (pdf,) = SRC.glob(f"{key}_*.pdf")
    doc = pymupdf.open(pdf)
    xref = doc[0].get_images(full=True)[0][0]
    img = Image.open(io.BytesIO(doc.extract_image(xref)["image"])).convert("RGB")
    return img.rotate(180) if key in ROTATE_180 else img


def save_pair(key, out):
    large = out.copy()
    large.thumbnail((LARGE, LARGE), Image.LANCZOS)
    large.save(OUT / f"{key}.webp", quality=84, method=6)
    thumb = out.copy()
    thumb.thumbnail((THUMB, THUMB), Image.LANCZOS)
    thumb.save(OUT / f"{key}-thumb.webp", quality=78, method=6)
    return {"w": large.width, "h": large.height}


def export(key, img):
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

    info = save_pair(key, out)
    if key in DETAILS:
        fx0, fy0, fx1, fy1 = DETAILS[key]
        W, H = out.size
        detail = out.crop((int(fx0 * W), int(fy0 * H), int(fx1 * W), int(fy1 * H)))
        thumb = detail.copy()
        thumb.thumbnail((THUMB, THUMB), Image.LANCZOS)
        thumb.save(OUT / f"{key}-detail-thumb.webp", quality=78, method=6)
        detail.thumbnail((DETAIL, DETAIL), Image.LANCZOS)
        detail.save(OUT / f"{key}-detail.webp", quality=84, method=6)
        info["detail"] = {
            "x": round(fx0, 3),
            "y": round(fy0, 3),
            "cw": round(fx1 - fx0, 3),
            "ch": round(fy1 - fy0, 3),
            "w": detail.width,
            "h": detail.height,
        }
    return info


def export_region(key, img, info=None):
    """The region image and its thumbnail, from an already-cropped picture."""
    thumb = img.copy()
    thumb.thumbnail((THUMB, THUMB), Image.LANCZOS)
    thumb.save(OUT / f"{key}-detail-thumb.webp", quality=78, method=6)
    detail = img.copy()
    detail.thumbnail((DETAIL, DETAIL), Image.LANCZOS)
    detail.save(OUT / f"{key}-detail.webp", quality=84, method=6)
    info = dict(info or {"w": detail.width, "h": detail.height})
    info["detail"] = {"x": 0, "y": 0, "cw": 1, "ch": 1, "w": detail.width, "h": detail.height}
    return info


def placeholder(key, old):
    aspect = old["w"] / old["h"] if old else 4 / 5
    h = PLACEHOLDER_H
    out = Image.new("RGB", (round(h * aspect), h), PLACEHOLDER)
    info = save_pair(key, out)
    info["pending"] = True
    return info


def main(keys):
    OUT.mkdir(parents=True, exist_ok=True)
    meta = json.loads(META.read_text()) if META.exists() else {}
    for key in keys:
        if key in CROPS:
            img = Image.open(CROP_DIR / f"{key}.jpg").convert("RGB")
            meta[key] = export_region(key, img, meta.get(key) if key in SCANS else None)
        elif key in PENDING:
            meta[key] = placeholder(key, meta.get(key))
        else:
            if key in SCANS:
                img = load_scan(key)
            else:
                try:
                    img = load_pdf(key)
                except ImportError:
                    print(f"{key}: no scan and pymupdf missing, left as is")
                    continue
            meta[key] = export(key, img)
        print(key, meta[key])
    META.write_text(json.dumps(dict(sorted(meta.items())), indent=2) + "\n")


if __name__ == "__main__":
    main(sys.argv[1:] or [f"{i:02d}" for i in range(17)])
