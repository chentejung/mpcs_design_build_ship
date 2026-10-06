# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static concept gallery of restyles of the Board Game Arena logged-out homepage, each judged by whether a first-time visitor wants to click the register CTA. Everything lives under `projects/` (the repo root holds only a stub README). Fifteen styles are planned: `01` Hall of Banners, `02` Comic Crew, `03` Board Path, `04`–`10` each drawn from one top-ten game, `11`–`13` Board Path variants with a pick-your-vibe hook, and `14`–`15` crossroads-plus-newspaper-comics takes; `00-baseline` is not yet present.

The full rules are in `projects/AGENTS.md` (stack, layout, how to build a style, checklist, assets, deploy) and the style briefs, game list and conversion hooks are in `projects/DIRECTIONS.md`. Read both before adding or changing a style.

@projects/AGENTS.md

## Commands

There is no build, lint or test tooling, and no package manager. Open `projects/index.html` straight from the filesystem, or serve it with `python3 -m http.server -d projects`. Verification is the manual checklist in `AGENTS.md` (viewport sizes, contrast, reduced motion, focus, same-origin requests only).

## Architecture notes that span files

- `projects/index.html` is the only HTML file. It holds the gallery shell plus one `<section class="style" id="sNN" data-name data-hook>` per style, and a `<link>` per `css/NN-slug.css` in `<head>`.
- Page mode (landing grid, `?view=sNN`, `?view=sNN&thumb`) is set by a tiny inline script in `<head>` that adds `is-home`, `is-solo` or `is-thumb` to `<html>`. `js/gallery.js` then builds landing cards from the sections' `data-` attributes, each card an iframe of the `&thumb` URL, so a new section appears on the landing page automatically.
- Style isolation relies on every selector and custom property in `css/NN-slug.css` being scoped under `#sNN`. Class names are prefixed `sNN-`. `css/gallery.css` holds only shell rules.
- Stylesheet links use `?v=N` cache-busting (e.g. `gallery.css?v=5`). Bump it when editing that file.
- `PLANNED = 15` in `gallery.js` drives the "N of 15 built" label.
- Game photos in `img/games/` must each have a credit line in the `index.html` footer.
