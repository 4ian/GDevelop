# Plan: External Window Shortcuts & Adaptive Sizing

## Problem

1. **Keyboard shortcuts don't work in popped-out (external) windows.** `useKeyboardShortcuts` (in `KeyboardShortcuts/index.js`) listens on the main window's `document.keydown`. Since `WindowPortal` creates a *separate* browser window via `window.open()`, its `document` is distinct — keydown events there never reach the main window's listener.

2. **On Electron**, shortcuts like Ctrl+S, Ctrl+O are `handledByElectron` — the Electron main menu intercepts them. The menu sends IPC events (e.g. `main-menu-save`) to the renderer. In `ElectronMainMenu.js`, these IPC listeners are gated by `shouldApply: isFocusedOnMainWindow`, so they're ignored when a popped-out window has focus. The popped-out windows are NOT separate Electron BrowserWindows — they're `window.open()` popups from the same renderer process.

3. **Command palette** (`CommandPalette/index.js`) is rendered once in `MainFrame`, referenced via `commandPaletteRef`. There's no instance in the external window, so even if shortcuts worked, `Ctrl+P` would open the palette in the main window, not the external one.

4. **Window sizing** is hardcoded at `width=1024, height=750` regardless of which pane the tab came from.

---

## Part 1: Shortcuts in External Windows

### Approach: Each external window gets its own `useKeyboardShortcuts` instance

Rather than forwarding events between windows, each `ExternalEditorWindow` runs its own keyboard shortcut listener against the external window's `document`. This is clean, independent per window, and works for both web and Electron.

### Step 1a: Modify `useKeyboardShortcuts` to accept a `targetDocument` parameter

**File:** `newIDE/app/src/KeyboardShortcuts/index.js`

Add an optional `targetDocument` parameter to `UseKeyboardShortcutsProps`:

```js
type UseKeyboardShortcutsProps = {|
  onRunCommand: (commandName: CommandName) => void,
  previewDebuggerServer: ?PreviewDebuggerServer,
  targetDocument?: Document,  // NEW — defaults to window.document
  ignoreHandledByElectron?: boolean,  // NEW — for external windows
|};
```

In the effect that adds the `keydown` listener, use `targetDocument || document`:

```js
const doc = targetDocument || document;
doc.addEventListener('keydown', handler);
return () => doc.removeEventListener('keydown', handler);
```

Add the `ignoreHandledByElectron` check:

```js
if (electron && commandsList[commandName].handledByElectron) {
  if (!ignoreHandledByElectron) return;  // Skip only if NOT in external window
}
```

### Step 1b: Expose external window's `document` from `WindowPortal`

**File:** `newIDE/app/src/UI/WindowPortal.js`

Add an `onWindowReady` callback prop:

```js
type Props = {|
  title: string,
  children: React.Node,
  onClose: () => void,
  width?: number,
  height?: number,
  onWindowReady?: (externalWindow: any) => void,  // NEW
|};
```

Call it after the external window is set up:

```js
if (props.onWindowReady) {
  props.onWindowReady(externalWindow);
}
```

Also call a cleanup when the window closes (pass `null`).

### Step 1c: Use `useKeyboardShortcuts` in `ExternalEditorWindow`

**File:** `newIDE/app/src/MainFrame/ExternalEditorWindow.js`

```js
const [externalWindowDocument, setExternalWindowDocument] = React.useState(null);

const onWindowReady = React.useCallback((externalWindow) => {
  setExternalWindowDocument(externalWindow ? externalWindow.document : null);
}, []);

// ... then pass onWindowReady to WindowPortal

useKeyboardShortcuts({
  targetDocument: externalWindowDocument,
  previewDebuggerServer: null,
  ignoreHandledByElectron: true,
  onRunCommand: (commandName) => {
    if (commandName === 'OPEN_COMMAND_PALETTE') {
      localCommandPaletteRef.current?.open();
    } else {
      localCommandPaletteRef.current?.launchCommand(commandName);
    }
  },
});
```

---

## Part 2: Command Palette in External Windows

### Approach: Render a `CommandPalette` per external window

Each `ExternalEditorWindow` already has `<CommandsContextScopedProvider active={true}>` which registers scoped commands. We add a `CommandPalette` instance inside each external window so the dialog renders in the correct window.

### Step 2a: Add `CommandPaletteWithAlgoliaSearch` to `ExternalEditorWindow`

**File:** `newIDE/app/src/MainFrame/ExternalEditorWindow.js`

```jsx
const localCommandPaletteRef = React.useRef(null);

// Inside JSX, within FullThemeProvider:
<CommandPaletteWithAlgoliaSearch ref={localCommandPaletteRef} />
```

The MUI `Dialog` in `CommandPalette` will render into the external window's DOM because `PortalContainerContext` (provided by `WindowPortal`) points to the external window's `document.body`.

### Step 2b: Verify `CommandPaletteWithAlgoliaSearch` exists and is importable

**File:** `newIDE/app/src/CommandPalette/CommandPalette/index.js`

Check where `CommandPaletteWithAlgoliaSearch` is defined — it's likely a wrapper around `CommandPalette` + `InstantSearch`. Each external window instance needs its own `InstantSearch` provider, which is fine since the wrapper already includes it.

### Edge cases
- **`isUserTyping()` check**: This function checks `document.activeElement`. In the external window, `document` refers to the main window's document. Need to modify `isUserTyping` to accept an optional `targetDocument`, or check the external window's document. The external window's `useKeyboardShortcuts` should pass its `targetDocument` to `isUserTyping`.
- **`isDialogOpen()` check**: Similarly checks the main document for open dialogs. Need to either pass the target document, or have the external window's instance check its own document.

### Step 2c: Update `isUserTyping` and `isDialogOpen` for external windows

**File:** `newIDE/app/src/KeyboardShortcuts/IsUserTyping.js`

Modify to accept an optional `targetDocument` parameter:

```js
const isUserTyping = (targetDocument?: Document): boolean => {
  const doc = targetDocument || document;
  const activeElement = doc.activeElement;
  // ... existing logic using activeElement
};
```

**File:** `newIDE/app/src/UI/OpenedDialogChecker.js`

Similarly, modify to accept optional `targetDocument`:

```js
const isDialogOpen = (targetDocument?: Document): boolean => {
  const doc = targetDocument || document;
  // ... check for open MUI dialogs in the doc
};
```

Then in `useKeyboardShortcuts`, pass `targetDocument` to both functions.

---

## Part 3: Adaptive Window Sizing

### Current state
`ExternalEditorWindow` passes hardcoded `width={1024} height={750}` to `WindowPortal`.

### Step 3a: Compute size based on `originalPaneIdentifier`

**File:** `newIDE/app/src/MainFrame/ExternalEditorWindow.js`

```js
const getPopOutDimensions = (originalPaneIdentifier: ?string) => {
  const screenWidth = window.outerWidth;
  const screenHeight = window.outerHeight;

  if (originalPaneIdentifier === 'left' || originalPaneIdentifier === 'right') {
    return {
      width: Math.round(screenWidth / 3),
      height: screenHeight,
    };
  }
  // 'center' or fallback: same size as main window
  return {
    width: screenWidth,
    height: screenHeight,
  };
};
```

### Step 3b: Pass to WindowPortal

```jsx
const { width, height } = getPopOutDimensions(editorTab.originalPaneIdentifier);

<WindowPortal
  width={width}
  height={height}
  ...
>
```

---

## Summary of all file changes

| File | Change |
|------|--------|
| `newIDE/app/src/KeyboardShortcuts/index.js` | Add `targetDocument` and `ignoreHandledByElectron` params to `useKeyboardShortcuts`; pass `targetDocument` to `isUserTyping` and `isDialogOpen` |
| `newIDE/app/src/KeyboardShortcuts/IsUserTyping.js` | Accept optional `targetDocument` param |
| `newIDE/app/src/UI/OpenedDialogChecker.js` | Accept optional `targetDocument` param |
| `newIDE/app/src/UI/WindowPortal.js` | Add `onWindowReady` callback prop to expose external window reference |
| `newIDE/app/src/MainFrame/ExternalEditorWindow.js` | Add local `useKeyboardShortcuts` + local `CommandPaletteWithAlgoliaSearch`, compute adaptive window size from `originalPaneIdentifier` |

## Edge cases to consider

- **Multiple external windows**: Each gets its own shortcut listener and command palette — works naturally since each `ExternalEditorWindow` is independent.
- **Algolia search in CommandPalette**: The `CommandPaletteWithAlgoliaSearch` wraps `CommandPalette` in `<InstantSearch>`. Each external window instance gets its own provider, which is fine.
- **Command registration scope**: `CommandsContextScopedProvider` in the external window registers editor-specific commands when active. The global commands (save, open, etc.) are registered in the main `CommandManager`. The local `CommandPalette`'s `launchCommand` looks up commands in the context's `CommandManager` — needs to verify it sees both global and scoped commands.
- **Dialog check in external windows**: MUI Dialogs in external windows render into `PortalContainerContext` (the external window's body). `isDialogOpen` needs to check the correct document.

## Verification steps

1. **Web:** Pop out a tab → press Ctrl+S → verify project saves
2. **Web:** Pop out a tab → press Ctrl+P → verify command palette opens **in the external window**
3. **Web:** Pop out a tab → use command palette to save → verify it works
4. **Electron:** Same tests as above
5. **Electron:** Verify Ctrl+S works in external window (despite being `handledByElectron`)
6. **Sizing:** Pop out from center pane → verify window is same size as main window
7. **Sizing:** Pop out from left/right pane → verify window is 1/3 width, full height
8. **Multiple pop-outs:** Pop out 2 tabs → verify shortcuts and palette work independently in each
