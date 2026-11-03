# Bina Adult Care — design system

Warm, human and calm: a family home, not a hospital. Tokens live in `tailwind.config.js`;
reusable classes live in `src/index.css` (`@layer components`).

## Color — "Dusty Blue & Soft White"

All colors live in `tailwind.config.js`; components use the tokens, never raw hex values.

| Brand color      | Token             | Hex       | Use                                                        |
| ---------------- | ----------------- | --------- | ---------------------------------------------------------- |
| Dusty Blue       | `brand-400`       | `#527D96` | Icons, check marks, accent rules, carousel dots            |
| Dusty Blue (UI)  | `brand-600`       | `#517C94` | Primary buttons, top bar, CTA box, active nav link         |
| Hover / links    | `brand-700`       | `#426B83` | Button hover, text links, pill labels                      |
| Soft Blue        | `brand-200`       | `#A9C5D3` | Feature cards (`.card-soft`) — always with Deep Navy text  |
| Blue tints       | `brand-50 / 100`  | `#EAF1F4` / `#E3ECF1` | Icon circles, pills, tab bar                  |
| Soft White       | `cream`           | `#F4F7F8` | Page background                                            |
| Deep Navy        | `navy`            | `#263E52` | Headings, navigation text, footer                          |
| Warm Champagne   | `champagne`       | `#D9C7A3` | Accent button, heading rules, step lines, footer link hover |
| Pure White       | `white`           | `#FFFFFF` | Header, cards, content sections                            |
| Body text        | `slate`           | `#52636A` | Paragraphs and descriptions                                |
| Border           | `line`            | `#DCE5E9` | Card borders, dividers (`line-strong` `#C9D6DC` for fields) |
| Footer text      | `mist`            | `#DCE5E0` | Supporting text on the navy footer                         |

**Accessibility notes** (WCAG AA, 4.5:1 for normal text):
- White on `#527D96` is 4.44:1, so surfaces carrying white text use `#517C94` (4.51:1), one shade darker and visually identical.
- Text links use `#426B83` (5.7:1 on white) because `#527D96` text on Soft White is 4.1:1.
- Body grey on Soft Blue is 3.5:1, so `.card-soft` switches its text to Deep Navy (6.1:1).
- Navy on Champagne buttons is 6.7:1; Champagne hover on the footer is 6.7:1.

## Typography

| Class         | Font              | Size          | Use                                |
| ------------- | ----------------- | ------------- | ---------------------------------- |
| `.t-display`  | DM Serif Display  | 36 → 56px     | Homepage H1                        |
| `.t-page`     | DM Serif Display  | 36 → 52px     | Inner page H1                      |
| `.t-section`  | DM Serif Display  | 26 → 36px     | Section H2 (centered ones get a Champagne rule) |
| `.t-title`    | DM Serif Display  | 22px          | Card and form titles               |
| `.t-subtitle` | DM Serif Display  | 17px          | Card headings                      |
| body          | DM Sans 400       | 16px / 1.6    | Paragraphs (`#52636A`)             |
| buttons       | DM Sans 600       | 15px          | All buttons, pill-shaped           |
| `.pill-label` | DM Sans 600       | 12px, caps    | Small section labels               |
| Tagline       | Dancing Script    | 15px          | Logo tagline only (logo unchanged) |

## Layout & spacing

- Container: max 1200px with 24px side padding.
- Section rhythm: `.section` = 80 / 96 / 112px vertical; `.section-sm` for compact bands.
- Grids: 12-column split (5/7 or 4/8) for text + content; 2–4 equal columns for features.
- Breakpoints: `sm` 640 · `md` 768 · `lg` 1024 (desktop nav) · `xl` 1280.

## Components

- **Buttons** — `.btn-primary` (Dusty Blue → `#426B83` on hover), `.btn-secondary` (white, Dusty Blue border and text),
  `.btn-accent` (Champagne with navy text), `.btn-light` / `.btn-outline-light` on the blue CTA box. Pill-shaped, 48px min height.
- **Links** — `.text-link` (`#426B83`, underlined, arrow icon optional).
- **Radius** — `rounded-card` 16px (cards), `rounded-media` 20px (photos), `rounded-panel` 24px (CTA box, photo panel), 12px fields.
- **Shadows** — `shadow-soft` (cards, form), `shadow-lift` (photos, hover).
- **Icons** — lucide-react, 1.75 stroke, inside 44–48px tinted circles.
- **Forms** — `.field`, `.field-label`, `.field-error`, `.choice` (radio cards); see `src/components/forms`.

## Motion

| What                     | Timing                     |
| ------------------------ | -------------------------- |
| Hover / UI state         | 200ms, `ease-gentle`       |
| Scroll reveal (`.reveal`) | 700ms fade + 16px rise    |
| Carousel crossfade       | 900ms; autoplay every 4.5–5s; pauses on hover/focus; pause button |
| Image hover zoom         | 700ms to 104%              |
| Mobile menu              | 300ms slide/fade, links stagger 35ms |

All motion is disabled under `prefers-reduced-motion`, and carousels do not autoplay.

## Photography

Every photo on the site is a real photo of the Bina Adult Care home in El Sobrante (44 in the gallery).
No stock photography is used. Add new photos to `src-images/` and run `npm run images`.
