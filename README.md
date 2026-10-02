# 界：析出的城市 · Boundary: The Deposited City

The QR-code companion site for architect Wenlu Guo's exhibition.
A single vertical scroll walks the same loop as the gallery: prologue, three zones of lines (drawn, pressed, deposited), the synthesis, the coda and the exit.

Live: https://leonine2021.github.io/deposited-city/

## Develop

```sh
npm install
npm run dev
```

Pushing to `main` builds the site and deploys it to GitHub Pages (`.github/workflows/deploy.yml`).

## Content

- `src/content.js` holds every visitor-facing text, in Chinese and English.
- `public/works/` holds the artwork images, generated from the scanned PDFs in the parent folder by `scripts/prepare_images.py` (needs `pymupdf`, `pillow`, `numpy`).
- `src/scenes.js` holds the scroll scenes, one per zone.
