# electron-liquid-glass

> macOS "glass" / vibrancy wrapper for an Electron `BrowserWindow`.

`electron-liquid-glass` inserts a native `NSGlassEffectView` (or a perfect
`NSVisualEffectView` fallback) behind your window's web-content, giving you the
modern frosted-glass look found in Finder, sidebars, etc.

- **Native** Objective-C++ under the hood – zero CSS hacks
- Corner-radius & tint **customisable** from JavaScript
- Pre-built `.node` binaries provided (Node & Electron)
- Single-line API – works with any Electron ≥ 22 on macOS 11+

---

## Install

```bash
npm i electron-liquid-glass          # or yarn / pnpm / bun
```

Pre-built binaries are downloaded automatically. If you run a custom Electron
version just rebuild:

```bash
npx electron-rebuild -f -w electron-liquid-glass
```

## Quick start

```js
const { app, BrowserWindow } = require("electron");
const glass = require("electron-liquid-glass");

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile("index.html");

  win.webContents.once("did-finish-load", () => {
    glass.addView(win.getNativeWindowHandle(), {
      cornerRadius: 12,
      tintColor: "#88FFFFFF", // 50 % white
    });
  });
});
```

### API

```ts
addView(handle: Buffer, options?: {
  cornerRadius?: number;   // default 0
  tintColor?: string;      // any #RRGGBB[AA] string
}): number          // returns a view-id (future APIs)
```

| Option         | Description                                        |
| -------------- | -------------------------------------------------- |
| `cornerRadius` | Rounds all corners of the effect view.             |
| `tintColor`    | Tints the glass towards the given sRGB hex colour. |

> **macOS only** – calling on Windows / Linux throws an error at runtime.

## How it works

1. JavaScript passes the native `NSView*` (from
   `BrowserWindow.getNativeWindowHandle()`) to the addon.
2. Objective-C++ grabs the view's superview, creates an `NSGlassEffectView`
   (private) or a public `NSVisualEffectView` if unavailable, and inserts it
   **below** your web-content.
3. Corner-radius is applied via CALayer; tint via `-setTintColor:` when
   available.
4. Listens for `NSAppearanceDidChangeNotification` to keep the effect in sync
   with light/dark mode.

## Rebuilding manually

```bash
npm run clean        # removes build/
npm run build:native # generates prebuild under prebuilds/
```

## Roadmap

- Remove / update the glass view (currently only add).
- Extra materials (`fullscreen-ui`, `sidebar`, …).
- Support colour-dynamic tints.

## Contributing

PRs & issues welcome. Make sure `npm test` passes and follow the
[Code of Conduct](CODE_OF_CONDUCT.md) when interacting.

## Licence

MIT © Your Name 2025
