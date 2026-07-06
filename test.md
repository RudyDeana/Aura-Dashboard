# AURA

A small, quiet new-tab dashboard I keep open in front of whatever boring tab the browser would otherwise show me.

It's the kind of page you glance at thirty times a day: a clock that isn't lying to you, today's weather, a todo list you actually use, a Pomodoro when you want to disappear into something for 25 minutes, and a Notepad that doesn't ask you to sign in. Everything else is decoration, and there's intentionally not much of it.

I made it because I was tired of opening a new tab and immediately being bored by it.

---

## What it actually does

- **A clock, a date, and a greeting** that updates in your local timezone. The seconds blink softly in the accent colour.
- **Weather** for wherever you tell it (city name) or wherever you are (geolocation). Backed by the Open-Meteo API — no key required.
- **Tasks** that you check off and that persist between visits.
- **Speed Dial** with up to ~24 quick links. Drag nothing, just add a name + URL. Favicons are pulled automatically.
- **Pomodoro / Focus** in three flavours: 25 minute work, 5 minute short break, 15 minute long break. It chimes when it's done.
- **Quick Notes** that auto-save as you type (about 400 ms after you stop).
- **Spotify** integration with the Web Playback SDK. You can search, queue next, scrub, control volume. Needs a free Client ID and a Premium account.
- **Lo-fi particle background.** Soft, monochrome, mouse-reactive. You can turn it down or off entirely.
- **Daily Signal** with a different quote-of-the-day and your streak stats (days active, tasks done, visits today).
- **Drag-to-reorder** widgets. Layout is saved per-browser.
- **Command bar (⌘K)** to jump-focus a widget, search the web, or open settings.
- **Three accent themes** (cyan, violet, rose). Press `T` to cycle.

## What's new in this version

I reworked a few things while I was in there:

- **An honest CSS pass.** Stripped out the glassmorphism. Replaced gradient cards with hairline borders. Big monochrome type. The dashboard now leans closer to an editorial layout than a marketed SaaS one. Less bling, more hierarchy.
- **Habit Tracker (new widget).** Add a habit, tap the day, see your streak. Days live on the same calendar week so things stay simple.
- **Export / Import.** One click in the topbar dumps every localStorage key to a JSON file. Drop that file back into the page on a different machine and your whole setup is restored — theme, layout, todos, notes, shortcuts, weather city, habits, the lot.
- **Keyboard shortcuts.** Press `?` (or click the `?` button) for the cheatsheet. `⌘K` command bar, `⌘,` options, `⌘E` export, `T` cycle accent.

## How I made it

This is a static project. There is no build step, no framework, no bundler, no package manager. Three files do all the work:

```
index.html   markup and structure
style.css    one stylesheet, hand-rolled, no preprocessor
script.js    one IIFE, vanilla, no dependencies
callback.html Spotify OAuth landing page
server.js    optional local server for testing the OAuth flow
```

A few decisions I made early and stuck with:

- **No frameworks.** React + Vite would have been faster to scaffold and slower to ship. Three small files you can read in ten minutes beats a node_modules graph none of us can fully explain.
- **All state in localStorage.** Eight keys, defined in one place at the top of `script.js` so the export/import feature can dump the lot in one pass. No backend, no database, no sign-in. The price is that your data dies with your browser profile — the feature above lets you move it.
- **One font, two weights.** Plus Jakarta Sans for prose (200, 400, 600), JetBrains Mono for anything tabular (times, numbers, the Pomodoro display). Drop-shoulder two-font pairs like this cost nothing and read consistently.
- **Background is HTML canvas.** A few dozen particles twinkle against a flat canvas. Mouse proximity nudges them out of the way. Three palette modes (`pulse`, `nordic`, `cyber`) just swap the gradient. None of them depend on each other — change one and the rest keep working.
- **Spotify uses PKCE.** No server-side secret. Per Spotify docs, this is the right shape for a static client.

The audio chime on the Pomodoro is a little Web Audio `sine` blip that can't be cooler. That's intentional.

## Screenshots

The dashboard rendered on a desktop window, with command bar focused:

```
        09  :  24
        Good morning.

        ┌────────────────────────────────┐
        │  ⌕ Search the web ── ⌘K        │
        └────────────────────────────────┘
```

(Real screenshots in this repo are coming — placeholders above show the visible region of the rendered hero block. Drop them into `/screenshots/` when you have them.)

## Running it

The simplest thing:

```bash
python3 -m http.server 5500
# open http://localhost:5500
```

Or with the bundled node server:

```bash
node server.js
# open http://localhost:3000
```

You don't strictly need a server — opening `index.html` directly works for everything except the Spotify OAuth callback, which needs an http(s) origin.

## Making it your new tab

### Chrome
Settings → On startup → *Open a specific page* → `http://localhost:5500`

### Firefox
`about:home` has a "New Tab" tile; install an extension like *New Tab Override* to point it at AURA.

### Safari
Settings → General → *Homepage* and/or *New windows open with*.

## Spotify setup (optional)

The Spotify widget is light grey until you connect it. To make it work:

1. Create an app at <https://developer.spotify.com/dashboard>.
2. Copy the **Client ID**.
3. In `script.js`, replace `YOUR_SPOTIFY_CLIENT_ID` with your Client ID.
4. Add `http://localhost:5500/callback.html` as a redirect URI in the Spotify dashboard.
5. Click "Connect Spotify" in the widget.

You'll need Spotify **Premium** for the playback SDK to work; without it you can search but not play.

## Storage keys, for the curious

These are the eight keys AURA writes to `localStorage`. Refactoring or backing up by hand? These are all you need:

| Key              | What it holds                              |
|------------------|--------------------------------------------|
| `aura-density`   | particle count (0–150)                     |
| `aura-speed`     | particle drift multiplier                  |
| `aura-noise`     | noise overlay enabled / disabled           |
| `aura-bg-style`  | `pulse` / `nordic` / `cyber`               |
| `aura-theme-idx` | 0 cyan, 1 violet, 2 rose                   |
| `aura-grid-layout` | JSON array of widget names in current order |
| `aura-todos`     | your task list                             |
| `aura-notes`     | the body of notes                          |
| `aura-shortcuts` | your speed-dial links                      |
| `aura-weather-location` | the city name you last searched      |
| `aura-habits`    | habit tracker state                        |
| `aura-first-visit` / `aura-visit-count` / `aura-visit-date` | streak stats    |
| `aura-pomo-done` | focus sessions completed                   |
| `spotify_access_token` / `spotify_refresh_token` | OAuth tokens |

## Credits

- [Open-Meteo](https://open-meteo.com) for the weather (no key, no ads, thank you).
- [Hack Club](https://hackclub.com) for the original "Give Your Website a Pulse" prompt that prompted the first version.
- [Spotify for Developers](https://developer.spotify.com) for the Playback SDK.
- Icons are inline SVG. No icon library used.

## Licence

Do whatever you want with it.
