# BEXA.LONDON Link Hub

A static link-in-bio site for Bexa — retro pixel OS aesthetic, plain HTML, CSS, and JavaScript. No build step or framework required.

**Repository:** [github.com/LoveBexa/bexa-link-tree](https://github.com/LoveBexa/bexa-link-tree)

## Pages

| File | Description |
|------|-------------|
| `index.html` | Link hub — **BEXA.LOG** window with main links |
| `about.html` | About page — RPG-style profile windows (stats, bio, active quests) |

Both pages share a fixed bottom **taskbar** with social icons and a Windows-style **START_BEXA** menu (desktop only).

## Project structure

```
index.html      — home / link hub
about.html      — about me page
styles.css      — shared design system (colors, windows, taskbar, responsive layout)
script.js       — star field, START menu, window minimize / maximize / close
images/me.png   — profile photo (about page)
package.json    — optional local dev server script
```

## Features

- **Retro OS windows** — minimize (title bar only), maximize (centered overlay), close
- **BEXA.LOG** — About Me, House Ninety Two, Madhatgirls, The Fantasy Roster, AIYA
- **About page windows** — BEXA.EXE, CHARACTER_STATS.DAT, ABOUT.LOG, ACTIVE_QUESTS.LOG
- **Taskbar** — home icon, X, Medium, LinkedIn, Instagram, CodeWars
- **Mobile** — centered social icons in taskbar; START menu and status text hidden on small screens
- **Fonts** — [VT323](https://fonts.google.com/specimen/VT323) (body), [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) (titles)

## Local preview

Open `index.html` in a browser, or run:

```bash
npm start
# visit http://localhost:3000
```

## Editing content

### Main links (`index.html`)

Update `<a class="bx-link">` entries inside the **BEXA.LOG** window. Copy an existing link block and change the `href`, labels, and emoji/SVG icon.

### Social links (both pages)

Social URLs live in the **taskbar** at the bottom of each HTML file — look for `<div class="bx-taskbar-social">`. The home icon links to `index.html`.

### START menu (both pages)

Quick links are in `<nav class="bx-start-menu">` inside the taskbar.

### About page

- **Bio text** — `ABOUT.LOG` window, inside `.bx-prose`
- **Stats** — `CHARACTER_STATS.DAT` — edit labels, percentages, and bar widths (`style="width: …"`) plus heat classes (`bx-stat-heat-low`, `bx-stat-heat-mid`, `bx-stat-heat-high`, `bx-stat-heat-max`)
- **Profile photo** — replace `images/me.png`
- **Quest links** — `ACTIVE_QUESTS.LOG` window, `<a class="bx-quest">` entries

External links should use `target="_blank"` and `rel="noopener noreferrer"`.

### Colors & typography

CSS variables at the top of `styles.css` (`:root`) control the palette, window chrome, and fonts.

## Deploy

Upload the project folder to any static host — GitHub Pages, Netlify, Cloudflare Pages, etc. No build command needed.

Ensure `images/me.png` is included if you use the about page.

### GitHub Pages (this repo)

1. Push to `main` on `LoveBexa/bexa-link-tree`
2. In repo **Settings → Pages**, set source to deploy from the `main` branch (root)
3. Site will be available at `https://lovebexa.github.io/bexa-link-tree/`
