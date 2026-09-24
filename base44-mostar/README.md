# Mostar – Base44 port of the Relume export

Source for the Base44 app built from the Relume export `ewdt2pdm-relumesite-ai-design`.
The Relume components (Next.js + Tailwind v4) are converted to the Base44 stack
(Vite + React Router + Tailwind v3).

- `src/relume/components/` – Relume sections, one file per section (see `reference/sitemap.md`)
- `src/relume/ui/` – Relume button, badge, dialog, video iframe
- `src/relume/relume.css` – bundled fonts, responsive type tokens, color schemes 1–3
- `src/relume/tailwind.preset.cjs` – Relume tokens (colors, type scale, radii, breakpoints) as a Tailwind v3 preset
- `src/pages/` – Home, The house in the trees, Privacy policy, Terms of service
- `public/relume/` – images, logos, fonts from the export
- `reference/` – DESIGN.md, sitemap.md, assets.md, README.md from the export

Conversion notes:
- The export's `scheme-2` class uses `#1D1F21`, which DESIGN.md calls Scheme 3, so it is
  renamed to `scheme-3`. `scheme-2` is the light scheme from DESIGN.md.
- `relume-icons` is replaced by `lucide-react`, `motion/react` by `framer-motion`.

`apply-to-base44.sh [/app]` copies everything into a Base44 app checkout and wires up
Tailwind, `index.html` and `App.jsx`.
