# BGA landing page gallery

Design exploration: restyles of the logged-out homepage of https://en.boardgamearena.com/, aimed at getting more visitors to **register and start playing**. Every style is judged by one question: does a first-time visitor want to click the register CTA?

This is a personal concept study, not affiliated with Board Game Arena. Nothing ships to their site.

## Stack

Plain HTML and CSS, with optional vanilla JS for interaction. No frameworks, no build step, no package manager. The page opens straight from the filesystem and deploys as-is.

**Self-contained** is the rule: every file the page loads lives in this folder. That means bundled or system fonts, local or inline SVG, and no CDNs, remote web fonts, analytics or API calls. Links that leave the site go only to Board Game Arena: the register CTA to https://en.boardgamearena.com/account?page=newuser, and "see all games" to https://en.boardgamearena.com/gamelist. Nothing persists: no cookies, `localStorage`, `sessionStorage` or form submissions. Interactive state (a quiz answer, a die roll) lives in memory and resets on reload.

## Layout

```
index.html          landing grid plus one <section> per style, shown one per page
css/gallery.css     page modes, landing grid, gallery bar and shared resets only
css/NN-slug.css     one file per style, e.g. css/01-banner-hall.css
js/gallery.js       page modes, landing cards, gallery bar, per-style interactions
img/games/          licensed game photos, credited in the index.html footer
fonts/<family>/     open-licence (SIL OFL) fonts as Latin-subset .woff2, each folder with its OFL.txt
DIRECTIONS.md       the style briefs and conversion hooks
```

`index.html` is the only HTML file. Style `00-baseline` is a faithful recreation of the current page and acts as the control. The other styles (currently `01`–`10`) follow `DIRECTIONS.md`.

Each style is `<section class="style" id="sNN" data-name="…" data-hook="…">`. Every rule in `css/NN-slug.css` is scoped under `#sNN`, and custom properties are declared on `#sNN` too. That keeps the stylesheets sharing one page from bleeding into each other. Per-style JS gets its own function in `gallery.js`, keyed by section id.

`index.html` has three **page modes**, chosen by query string:

- `index.html`: the landing page, only a grid of cards, one live preview per style. Clicking a card opens that style's page.
- `index.html?view=sNN`: the style's own page. A slim gallery bar on top offers "All styles", prev/next and a jump list, and ←/→ move between styles.
- `index.html?view=sNN&thumb`: the bare style, loaded into a card's iframe and scaled down to make the preview.

`gallery.js` builds the cards from each section's `data-` attributes, so a new section appears on the landing page automatically. Cap hero heights so each preview shows the hero and the start of the content.

## Building a style

1. Read its brief in `DIRECTIONS.md`. A style the user names that isn't listed gets a brief added there first.
2. Keep the **content constant**: use the real facts from the baseline (10,845,000 players, 1,396 games, 8,950,000 games/month, 42 languages, 200+ countries, free, no download, any device). Copy may be rewritten for the hook, but numbers and claims stay true.
3. Show the **top ten**: visitors sign up for games they recognise. Each style shows exactly the ten games in `DIRECTIONS.md` with their photos, presented in its own idiom, plus a "See all 1,396 games" link. Hero mentions stay within those ten. One focused list beats a long wall.
4. Build the section and its stylesheet. The register CTA is the single primary action: it carries more visual weight than anything else and is repeated at the bottom of the section.
5. Run the checklist on this style and on the gallery as a whole.

Done means every checklist item passes for every style touched.

## Fonts

Each style may load up to two families from `fonts/` with `@font-face` at the top of its own stylesheet. Name the family with the style prefix (`font-family: "s01 Cinzel"`) so styles never share or override each other's faces, use `font-display: swap`, and keep a system fallback stack after it. Only fonts actually used are downloaded, because hidden sections don't render. New families must be SIL OFL, subset to Latin, saved as `.woff2` with the family's `OFL.txt`, and listed under **Font credits** in the `index.html` footer.

## Keep it concise

A first-time visitor should be able to scan the page and get three answers fast: why play here, what they can play, and how to join. Everything else is cut.

- Sections, in this order: hero, the style's hook, why play here, how to join, the top ten, closing CTA. Merge sections when the hook already covers one (a three-step hook is "how to join").
- Hero: an h1 of at most 10 words, one supporting sentence, the CTA, and the three big numbers in one row. Nothing else competes with the CTA.
- Why play here: 3 or 4 points, each a short title plus at most 8 words (free, nothing to download, any device, 42 languages and 200+ countries, real friends at the table).
- How to join: 3 steps, each at most 8 words, ending in the register CTA. State only what's true: a free account, then pick a game and play in the browser. No invented details like sign-in providers or timings.
- Top ten: photo, name and tag only. No blurbs.
- One idea per section, no repeated numbers, no decorative paragraphs, no fine print beyond the "example tables" label. Aim for roughly 150 words of body copy per page, game names excluded.
- Give it room: generous section spacing, text measure under about 60ch, and no more than five items in a row.

## Checklist

- Primary CTA visible without scrolling on the style's page at 375×667 and 1440×900, with the gallery bar showing.
- Text and CTA contrast meet WCAG AA.
- Layout holds from 320px to 1920px wide, with no horizontal scroll.
- Motion respects `prefers-reduced-motion`.
- Keyboard focus is visible on every interactive element, the gallery bar, landing cards and sideways-scrolling shelves included.
- Self-contained: the network panel shows only same-origin requests.
- Isolated: each style page and its landing preview look the same, with no style picking up another's rules.

## Assets

Game pictures are freely licensed photos (CC0, CC BY or CC BY-SA) from Wikimedia Commons, saved as `img/games/<slug>.jpg` and about 960px wide. Every photo shown needs a line in the **Photo credits** list in the `index.html` footer: title, author, licence, and a link to the Commons file page. That list is the single record of what's in `img/games/`.

To swap a game in the top ten, find a Commons photo that clearly shows that game, download it locally and add its credit line. Publisher box art is copyrighted, so a photo that is mostly box art needs a licence you trust. Decorative art is CSS shapes, SVG drawn here, or emoji.

## Deploy

The site is hosted on Vercel as a static site, from a GitHub repo whose root is `designBuild/`. The Vercel project's Root Directory is `projects`, with framework preset "Other" and no build command. Use relative paths only (`css/…`, not `/css/…`) so the page works both from the filesystem and on Vercel.
