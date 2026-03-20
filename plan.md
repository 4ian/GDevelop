# Plan: Adapt Popped-Out External Editor Windows for Electron

## Problem

`WindowPortal.js` uses `window.open('')` (line 56) to create pop-out windows. In Electron, this is blocked by `setWindowOpenHandler` in `main.js:265-268` which calls `{ action: 'deny' }` and redirects to the external browser. Pop-out editor windows will silently fail in Electron.

Additionally:
- `setupContextMenu` (in `Window.js:322-355`) attaches a `contextmenu` listener to the **main window only** (`Window.setUpContextMenu()` is called once in `LocalApp.js:38`). Pop-out windows get their own `document` so the context menu won't work there.
- The web version has the same context menu gap — the browser-side `document.addEventListener('contextmenu', ...)` in `Window.js:344` only applies to the main document.

## Approach

Use Electron's `BrowserWindow` for pop-out windows instead of `window.open`. The renderer process can create child `BrowserWindow` instances via `@electron/remote` (already enabled, `main.js:209`). For the web, `window.open` continues to work as-is.

---

## Step 1: Update `WindowPortal.js` to use `BrowserWindow` in Electron

**File:** `newIDE/app/src/UI/WindowPortal.js`

### Changes:
- Import `optionalRequire` and detect Electron:
  ```js
  const electron = optionalRequire('electron');
  const remote = optionalRequire('@electron/remote');
  ```
- In the `useEffect` that opens the window:
  - **Electron path:** Create a `BrowserWindow` via `remote` with:
    - `width`, `height`, centered relative to parent (`remote.getCurrentWindow()`)
    - `webPreferences: { nodeIntegration: true, contextIsolation: false }` (matching main window config from `main.js:150-155`)
    - `parent: undefined` (independent window, not modal)
    - No `titleBarStyle: 'hidden'` — pop-out editors should have a standard title bar with native close button
    - Enable `@electron/remote` on the new window: `require('@electron/remote/main').enable(newWindow.webContents)` — but this must be done from main process. Instead, use IPC (see Step 2).
    - Load a blank page or `about:blank`, then get the container div from `newWindow.webContents` DOM
    - Actually, **simpler approach**: load the same `index.html` but that would create a whole new app instance. Instead:
    - **Best approach**: Use `window.open` but override `setWindowOpenHandler` to allow it. See Step 2.
  - **Web path:** Keep existing `window.open('')` logic unchanged.

### Revised approach — allow `window.open` for pop-outs in Electron:

Rather than creating BrowserWindow directly from the renderer, the cleanest path is:

1. In `main.js`, modify `setWindowOpenHandler` to **allow** blank-URL pop-outs (used by WindowPortal) instead of denying all.
2. Configure the returned child window with appropriate options.
3. Enable `@electron/remote` on the child window's webContents.

This avoids duplicating window creation logic and keeps WindowPortal's portal-based rendering working.

---

## Step 2: Update Electron `main.js` — allow pop-out windows

**File:** `newIDE/electron-app/app/main.js`

### Changes to `setWindowOpenHandler` (line 265-268):

Replace the blanket deny with logic that allows blank-URL pop-outs:

```js
newWindow.webContents.setWindowOpenHandler(details => {
  // Allow blank pop-out windows (used by WindowPortal for editor pop-outs)
  if (details.url === '' || details.url === 'about:blank') {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        // Standard title bar for pop-out editors (not hidden like main window)
        titleBarStyle: 'default',
        titleBarOverlay: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false,
        },
      },
    };
  }

  // All other URLs: open in external browser as before
  console.info('Opening in browser (because of new window): ', details.url);
  electron.shell.openExternal(details.url);
  return { action: 'deny' };
});
```

### Enable `@electron/remote` on child windows:

Listen for child window creation:

```js
newWindow.webContents.on('did-create-window', (childWindow) => {
  require('@electron/remote/main').enable(childWindow.webContents);

  // Also block navigation/external URLs in child windows
  childWindow.webContents.on('will-navigate', (e, url) => {
    if (url !== childWindow.webContents.getURL()) {
      e.preventDefault();
      electron.shell.openExternal(url);
    }
  });

  // Block further nesting of new windows from pop-outs
  childWindow.webContents.setWindowOpenHandler(childDetails => {
    electron.shell.openExternal(childDetails.url);
    return { action: 'deny' };
  });
});
```

---

## Step 3: Context menu support in pop-out windows

**File:** `newIDE/app/src/Utils/Window.js`

### Problem:
`setUpContextMenu()` attaches a listener to the main `window`'s `contextmenu` event. Pop-out windows have a different `window`/`document`, so the listener doesn't fire there.

### Solution — call `setUpContextMenu` from within the pop-out window:

**File:** `newIDE/app/src/UI/WindowPortal.js`

After the external window is created and the container is ready, call the context menu setup on the new window. Two options:

**Option A (Recommended):** Extract the context menu setup logic into a function that accepts a `window` parameter, then call it for each pop-out window:

In `Window.js`, refactor `setUpContextMenu()`:
```js
static setUpContextMenu(targetWindow?: typeof window) {
  const win = targetWindow || window;
  const doc = win.document;
  const textEditorSelectors = 'textarea, input, [contenteditable="true"]';

  if (electron) {
    var buildEditorContextMenu = remote.require('electron-editor-context-menu');
    win.addEventListener('contextmenu', function(e) {
      if (!e.target.closest(textEditorSelectors)) return;
      var menu = buildEditorContextMenu();
      setTimeout(function() {
        menu.popup({ window: remote.getCurrentWindow() });
      }, 30);
    });
  } else if (doc) {
    doc.addEventListener('contextmenu', function(e: any) {
      if (!e.target.closest(textEditorSelectors)) {
        e.preventDefault();
        return false;
      }
      return true;
    });
  }
}
```

In `WindowPortal.js`, after the external window is created:
```js
// Set up context menu for the new window (both Electron and web)
Window.setUpContextMenu(externalWindow);
```

This works for both Electron and web — on web it prevents the default context menu outside text editors (same as main window behavior), and on Electron it sets up the electron-editor-context-menu.

---

## Step 4: Handle Electron window closing

**File:** No changes needed to `ExternalEditorWindow.js`

The existing logic already handles this correctly:
- `WindowPortal.onClose` fires when the window is closed (via `beforeunload` or polling `externalWindow.closed`)
- `ExternalEditorWindow` calls `props.onEditorTabClosing(editorTab)` then `onClose(editorTab)` which runs `closeEditorTab`
- The "Pop back in" button calls `onPopIn(editorTab)` which runs `popInTab`, and the WindowPortal unmounts (closing the Electron child window via the cleanup in `WindowPortal`'s useEffect return)

The only consideration: in Electron, when the **main window** is closed, child windows created via `setWindowOpenHandler` with `action: 'allow'` are automatically closed by Electron. The `beforeunload` / polling mechanism in WindowPortal will detect this and trigger `onClose`. No additional handling needed.

---

## Summary of files to modify

| File | Change |
|------|--------|
| `newIDE/electron-app/app/main.js` | Allow blank-URL pop-outs in `setWindowOpenHandler`, enable `@electron/remote` on child windows via `did-create-window`, block navigation/nesting in child windows |
| `newIDE/app/src/Utils/Window.js` | Make `setUpContextMenu` accept a `targetWindow` parameter |
| `newIDE/app/src/UI/WindowPortal.js` | Call `Window.setUpContextMenu(externalWindow)` after window creation |

## What does NOT need to change

- `ExternalEditorWindow.js` — already handles close/pop-in correctly
- `ExternalEditorWindows.js` — pure container, no changes
- `EditorTabsHandler.js` — state management is platform-agnostic
- `EditorTabsPane.js` — no pop-out logic remaining
- `MainFrame/index.js` — callbacks are platform-agnostic

## Verification steps

1. **Electron:** Right-click a non-scene tab → "Pop out in a separate window" → verify a native Electron child window opens with the editor content, toolbar, and pop-back-in button
2. **Electron:** Right-click in a text field in the pop-out → verify the context menu (Cut/Copy/Paste) works
3. **Electron:** Close the pop-out window via the native close button → verify the tab is removed
4. **Electron:** Click "Pop back in" → verify the pop-out window closes and the tab returns to its original pane
5. **Electron:** Close the main window while a pop-out is open → verify clean shutdown (no crashes)
6. **Web:** Verify all existing pop-out behavior still works unchanged
7. **Web:** Verify context menu behavior in pop-out windows (right-click suppressed outside text editors)
