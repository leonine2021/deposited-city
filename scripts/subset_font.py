"""Subset the Chinese text face to the characters the site uses.

MiSans (Xiaomi, free for commercial use) is ~6.5 MB per weight; the site
ships only the glyphs its texts need, as src/fonts/misans-regular.woff2
(~150 KB). Run this again whenever visitor text in src/content.js changes,
or the new characters fall back to Source Han Sans.

    npm pack @fontpkg/mi-sans                  # the full fonts, once
    tar xzf fontpkg-mi-sans-*.tgz
    pip install fonttools brotli
    python3 scripts/subset_font.py package/MiSans-Regular.otf src/fonts/misans-regular.woff2
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = [ROOT / "src" / "content.js", ROOT / "src" / "main.js", ROOT / "index.html"]
# always present: ASCII, digits and the punctuation the texts may pick up
EXTRA = "".join(chr(c) for c in range(0x20, 0x7F)) + "“”‘’…—–·《》〈〉「」、。，；：？！（）【】○×©"


def main(source, out):
    out = pathlib.Path(out)
    chars = set(EXTRA)
    for f in SOURCES:
        chars |= set(f.read_text())
    text = "".join(sorted(c for c in chars if not c.isspace()))
    chars_file = out.parent / "subset.txt"
    out.parent.mkdir(parents=True, exist_ok=True)
    chars_file.write_text(text)
    subprocess.run(
        [
            "pyftsubset", source,
            f"--text-file={chars_file}",
            "--flavor=woff2",
            f"--output-file={out}",
            "--layout-features=",
            "--no-hinting",
            "--desubroutinize",
        ],
        check=True,
    )
    print(f"{out.name}: {len(text)} characters, {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else ROOT / "src" / "fonts" / "misans-regular.woff2")
