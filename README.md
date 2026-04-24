# Swift Selection Search — Chromium (Manifest V3)

**Swift Selection Search (SSS)** is a browser extension that appears when you **select text** on a page: a compact **popup** of your search engines sits near the selection (or cursor), and you can also search from the **right‑click context menu**. One click opens your query in Google, DuckDuckGo, a custom URL, groups of engines, clipboard actions, and more.

This fork targets **Chromium-based browsers** (including **Brave**, **Google Chrome**, and **Microsoft Edge**) on **Manifest V3**.

Repository: [github.com/AlexRabbit/Swift-Selection-Search-Chromium](https://github.com/AlexRabbit/Swift-Selection-Search-Chromium)

---

## Features at a glance

| Feature | Description |
|--------|-------------|
| **Selection popup** | Choose how it opens: automatic on select, keyboard shortcut, Alt‑hold, middle‑click margin, or off with shortcuts only. |
| **Engine grid** | Custom icons, rows, spacing, hover effects, dark/light styling, optional inline CSS. |
| **Context menu** | Search selected text with any engine; configurable mouse button behaviour. |
| **URL variables** | `{searchTerms}`, `{hostname}`, `{href}`, slices, regex replacements, and custom encodings (via iconv-lite in the background). |
| **Groups** | Fire several engines in one action with sensible tab ordering. |
| **Blocklist** | Optional **Tabs** permission: skip the popup on URLs matching your patterns. |
| **Import / export** | JSON backup; optional **Downloads** permission for export. |

---

## Requirements

- **Node.js 18+** (includes `npm`) — [nodejs.org](https://nodejs.org)
- A **Chromium MV3** browser (Brave, Chrome 102+, Edge 102+)

---

## Quick start (Brave / Chrome)

1. **Clone and install**

   ```bash
   git clone https://github.com/AlexRabbit/Swift-Selection-Search-Chromium.git
   cd Swift-Selection-Search-Chromium
   npm install
   ```

2. **Compile TypeScript → JavaScript**

   ```bash
   npm run build
   ```

3. **Load unpacked**

   - Open `brave://extensions` or `chrome://extensions`
   - Enable **Developer mode**
   - **Load unpacked** → select the **`src`** folder inside this repo  
     (`…/Swift-Selection-Search-Chromium/src` — the folder that contains `manifest.json`)

4. **Open options**

   - Extensions page → **Swift Selection Search** → **Details** → **Extension options**  
   - Or right‑click the extension icon → **Options**

---

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run build` | TypeScript compile for `src/`, then **esbuild** emits `tests/tests-browser-bundle.js` for the browser test page. |
| `npm run build:tests` | Rebuild only the browser test bundle (esbuild). |
| `npm run watch` | Recompile `src/**/*.ts` on save (run `npm run build` after changing tests so the bundle stays fresh). |
| `npm test` | Runs URL-variable / `SearchVariables` tests via **tsx** (loads `tests/browser-entry.ts`; no browser needed). |
| `npm run check` | `build` then `test` — good before a commit or zip. |

### Browser-based test harness

After `npm run build`, open **`tests/tests.html`** in a normal tab. It loads compiled `search-variable-modifications.js` and `tests/tests.js` and prints results on the page.

---

## Architecture (MV3)

| Piece | Role |
|-------|------|
| **`service-worker-bootstrap.js`** | Sets `window`/`global` for **iconv-lite**, then `importScripts` loads the polyfill, iconv bundle, `search-variable-modifications.js`, and `swift-selection-search.js`. |
| **`libs/browser-polyfill.min.js`** | Mozilla **webextension-polyfill** — exposes the `browser.*` promise API on top of `chrome.*`. |
| **Content scripts** | `selectionchange.js` + `page-script.js` — selection UI, shadow popup, messaging to the service worker. |
| **`settings/`** | Full options UI (`settings.html` + `settings.ts`). |

### CSP and strict sites (MV3 note)

Manifest V3 **does not allow** the old **blocking `webRequest`** CSP rewrite. The popup uses a **closed Shadow DOM** with injected `<style>` nodes, which works on most sites. On pages with an extremely strict **Content Security Policy**, styling or behaviour might be limited compared to the legacy Firefox MV2 build.

---

## Permissions

Declared in `manifest.json`:

- **`storage`** — settings and icon cache  
- **`contextMenus`** — “Search for …” submenu  
- **`search`** — import the browser’s search providers (where supported)  
- **`scripting`** — inject content scripts at document start  
- **`webNavigation`** — inject when frames load  
- **`clipboardWrite`** — copy helpers from the background context  
- **`<all_urls>`** (host permission) — run on any page you visit  

Optional (requested when you use the feature):

- **`tabs`** — full tab URLs for the website blocklist  
- **`downloads`** — save settings export to disk  

---

## Development tips

- **Watch mode:** `npm run watch` keeps `.js` in sync beside `.ts` under `src/`. Reload the extension after changes.  
- **Brave:** same workflow as Chrome; extension IDs differ per profile.  
- **Version bump:** edit `"version"` in `src/manifest.json` when you ship a build.

---

## Credits & license

Original **Swift Selection Search** by **Daniel Lobo** (CanisLupus) — MIT License.  
This Chromium MV3 fork and README are maintained in the AlexRabbit fork.

See **`LICENSE`** in the repository root.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Extension does not load | Confirm you picked the **`src`** folder (contains `manifest.json` + `service-worker-bootstrap.js`). |
| “Could not load JavaScript” | Run `npm run build` so every `*.ts` has a matching `*.js`. |
| `npm` not found | Install Node from [nodejs.org](https://nodejs.org) and reopen the terminal. |
| Popup never appears | Check options: popup mode not **Off**; site not blocklisted; try a normal `https://` page. |
| Tests fail after edits | Run `npm test` — failures show `FAIL` with expected vs actual. |

---

**Enjoy faster searches from selected text.**
