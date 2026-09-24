---
name: "ewdt2pdm.relumesite.ai"
theme: "dark"

colors:
  neutral:
    shade-0: "#FFFFFF"
    shade-1: "#F2F2F2"
    shade-2: "#D9D9DA"
    shade-3: "#B3B4B5"
    shade-4: "#818384"
    shade-5: "#4F5152"
    shade-6: "#1D1F21"
    shade-7: "#040709"
    white: "#FFFFFF"
  korma:
    shade-1: "#F3ECE7"
    shade-2: "#E7D9CF"
    shade-3: "#AD7C59"
    shade-4: "#8B4513"
    shade-5: "#6F370F"
    shade-6: "#371B07"
    shade-7: "#291405"
  golden-grass:
    shade-1: "#FBF6E8"
    shade-2: "#F7EDD2"
    shade-3: "#E5C062"
    shade-4: "#DAA520"
    shade-5: "#AE8419"
    shade-6: "#57420C"
    shade-7: "#413109"
  sea-green:
    shade-1: "#EAF3EE"
    shade-2: "#D5E7DD"
    shade-3: "#6CAD89"
    shade-4: "#2E8B57"
    shade-5: "#246F45"
    shade-6: "#123722"
    shade-7: "#0D291A"
  steel-blue:
    shade-1: "#ECF2F7"
    shade-2: "#DAE6F0"
    shade-3: "#7DA7CA"
    shade-4: "#4682B4"
    shade-5: "#386890"
    shade-6: "#1C3448"
    shade-7: "#152736"

typography:
  heading:
    fontFamily: "Bricolage Grotesque"
    fontWeight: 700
  body:
    fontFamily: "Space Grotesk"
    fontWeight: 400
  sizes:
    desktop:
      h1: 84px
      h2: 60px
      h3: 48px
      h4: 40px
      h5: 32px
      h6: 26px
      text-large: 26px
      text-medium: 20px
      text-regular: 18px
      text-small: 16px
      text-tiny: 12px
    mobile:
      h1: 48px
      h2: 44px
      h3: 32px
      h4: 24px
      h5: 20px
      h6: 18px
      text-large: 18px
      text-medium: 16px
      text-regular: 14px
      text-small: 12px
      text-tiny: 10px

ui:
  style: "sleek"
  buttonRadius: 100px
  tagRadius: 100px
  inputRadius: 12px

cards:
  style: "outlined"
  borderWidth: 1px
  dividerWidth: 1px
  radiusLarge: 0px
  radiusMedium: 0px
  radiusSmall: 0px

schemes:
  - name: "Scheme 1"
    background: "neutral-shade-7"
    backgroundHex: "#040709"
    foregroundHex: "#040709"
    textHex: "#ffffff"
    accentHex: "#ffffff"
    borderValue: "#ffffff33"
    useLogoVariant: dark
    cssClass: "scheme-1"
  - name: "Scheme 2"
    background: "neutral-shade-1"
    backgroundHex: "#F2F2F2"
    foregroundHex: "#F2F2F2"
    textHex: "#040709"
    accentHex: "#8B4513"
    borderValue: "#04070926"
    useLogoVariant: light
    cssClass: "scheme-2"
  - name: "Scheme 3"
    background: "neutral-shade-6"
    backgroundHex: "#1D1F21"
    foregroundHex: "#1D1F21"
    textHex: "#ffffff"
    accentHex: "#ffffff"
    borderValue: "#ffffff33"
    useLogoVariant: dark
    cssClass: "scheme-3"
---

# ewdt2pdm.relumesite.ai — Design Specification

This file contains machine-readable design tokens in the YAML frontmatter above, and human-readable guidance below.

## Colors

The design uses a **dark** theme with a neutral palette and 4 chromatic palettes.

- **Neutral shades** range from shade-0 (darkest) to shade-7 (lightest), plus white
- **Korma** — primary shade: `#8B4513`
- **Golden Grass** — primary shade: `#DAA520`
- **Sea Green** — primary shade: `#2E8B57`
- **Steel Blue** — primary shade: `#4682B4`

Use the CSS custom properties from `react/globals.css` for all colors (e.g. `--color-neutral-darkest`, `--color-blue-ribbon`).

## Typography

Headings use **Bricolage Grotesque** at weight 700. Body text uses **Space Grotesk** at weight 400.

The type scale has desktop and mobile sizes. Apply mobile sizes at smaller breakpoints. All values are in `react/globals.css`.

## UI Elements

UI style is **sleek** with button radius 100px. Cards use the **outlined** style with border-width 1px.

## Color Schemes

Sections use color schemes to control their visual appearance. Each scheme is derived from a single background color — all other colors (text, foreground, accent, border) are automatically computed for optimal contrast.

| Scheme | Background | Text | Accent | Logo | CSS class |
|--------|-----------|------|--------|------|-----------|
| Scheme 1 | Neutral Darkest (#040709) | #ffffff | #ffffff | dark | `.scheme-1` |
| Scheme 2 | Neutral Lightest (#F2F2F2) | #040709 | #8B4513 | light | `.scheme-2` |
| Scheme 3 | Neutral Darker (#1D1F21) | #ffffff | #ffffff | dark | `.scheme-3` |

Apply a scheme by adding its CSS class to the section element. See `sitemap.md` for which scheme each section uses.

### Tweaking Schemes

To create visual variation, you can change which scheme a section uses. When switching schemes:

- Swap the CSS class (e.g. change `.scheme-1` to `.scheme-2`)
- All child elements automatically inherit the correct text, accent, and border colors
- Use the matching logo variant (`logo-light.svg` or `logo-dark.svg`) based on the scheme's `useLogoVariant`
- Alternate between light and dark schemes to create visual rhythm
