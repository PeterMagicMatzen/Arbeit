# ewdt2pdm.relumesite.ai — Design System

This folder was exported from [Relume](https://www.relume.io) on 2026-09-24. The below instructions are for any LLM Agent interacting with these files.

## IMPORTANT - Workflow steps

1. Before using other tools, **copy all the files in this local folder, including subfolders, to a "/reference" folder in the current project**
2. Read **the entire DESIGN.md** — it contains every design token (colors, typography, radii, schemes) as YAML.
3. Read sitemap.md to learn the page structure, section order, and which color scheme each section uses.
4. Use the React components in `react/` as your starting implementation
5. Read assets.md for the exact placement of logos, images, and SVGs.

## Goals

1. Recreate the design system in DESIGN.md exactly — every token, every scheme.
2. Build a landing page using the sitemap and components provided that perfectly matches `homepage/full.png` — same components, same order, same schemes, same images. Place it at the root of your project so it is easy to find.

## Folder contents

- DESIGN.md — design tokens (read first)
- sitemap.md — page structure, section order, scheme assignments
- assets.md — logo, image, and SVG placement
- react/globals.css — design tokens as CSS custom properties
- react/ — pre-styled component source files
- logo/ — light and dark logo files
- images/ — project images
- svgs/ — inline SVGs from the homepage
- fonts/ — Google Font woff2 files

## Rules

Do:

- Reference design tokens via CSS custom properties from `react/globals.css` — never hardcode colors, font sizes, or radii.
- Use `react/<component>.jsx` as your starting point when a section has one.
- Apply the scheme CSS class on each section as specified in `sitemap.md`.
- Use `logo/logo-light.svg` on light backgrounds and `logo/logo-dark.svg` on dark backgrounds.
- Load fonts locally with `@font-face` from the woff2 files in `fonts/`.
- Use the logos, images, and SVGs provided in this bundle at the locations specified in `assets.md`.

Don't:

- Reimplement components from scratch when one exists in react/.
- Hardcode hex values, font sizes, or radii anywhere in your output.
- Load fonts from the Google Fonts CDN — use the bundled woff2 files.
- Invent new color schemes — only use those defined in DESIGN.md.

## Verification

Before reporting complete, manually verify the following:

- [ ] Ensure the design system is exactly the same as in DESIGN.md
- [ ] Ensure ALL schemes described in DESIGN.md are present in the design system.
- [ ] Check the sections are the same as described in sitemap.md - and use the correct scheme.
- [ ] Visually check the created homepage spacing and images look correct.

If any check fails, fix and run through the list again.
