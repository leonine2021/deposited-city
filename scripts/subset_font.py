"""Subset the Chinese text face to the characters the site uses.

京華老宋体 (KingHwa_OldSong) is 35 MB whole; the site ships only the glyphs
its texts need, as src/fonts/kinghwa-oldsong.woff2 (~200 KB). Run this again
whenever visitor text in src/content.js changes, or the new characters fall
back to Source Han Sans.

    npm pack @fontpkg/king-hwa-old-song        # the full TTF, once
    tar xzf fontpkg-king-hwa-old-song-*.tgz
    pip install fonttools brotli
    python3 scripts/subset_font.py package/京華老宋体v2.002.ttf
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = [ROOT / "src" / "content.js", ROOT / "src" / "main.js", ROOT / "index.html"]
OUT = ROOT / "src" / "fonts" / "kinghwa-oldsong.woff2"
# always present: ASCII, digits and the punctuation the texts may pick up
EXTRA = "".join(chr(c) for c in range(0x20, 0x7F)) + "“”‘’…—–·《》〈〉「」、。，；：？！（）【】○×©"


def main(ttf):
    chars = set(EXTRA)
    for f in SOURCES:
        chars |= set(f.read_text())
    text = "".join(sorted(c for c in chars if not c.isspace()))
    chars_file = ROOT / "src" / "fonts" / "subset.txt"
    chars_file.write_text(text)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "pyftsubset", ttf,
            f"--text-file={chars_file}",
            "--flavor=woff2",
            f"--output-file={OUT}",
            "--layout-features=",
            "--no-hinting",
            "--desubroutinize",
        ],
        check=True,
    )
    print(f"{OUT.name}: {len(text)} characters, {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1])
