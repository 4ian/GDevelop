// @flow
import optionalRequire from './OptionalRequire';
const electron = optionalRequire('electron');
const electronClipboard = electron ? electron.clipboard : null;

export type ClipboardKind = string;

let internalClipboard = '';

export const copyTextToClipboard = (text: string) =>
  navigator.clipboard.writeText(text);

const mangleClipboardKind = (kind: ClipboardKind): string => {
  // Mangle the name with GDevelop specific strings and random
  // characters so that the probability that something that is not
  // a valid GDevelop clipboard content is recognized as valid is almost 0.
  return 'GDEVELOP_' + kind + '_CLIPBOARD_KIND-jsBdHbLy912y8Rc';
};

/**
 * Parse clipboard text and return the content if it matches the expected kind.
 * Returns null if the text doesn't match or is not valid JSON.
 */
const parseClipboardText = (text: string, kind: ClipboardKind): ?any => {
  if (text.indexOf(mangleClipboardKind(kind)) !== 12) return null;

  try {
    const parsedText = JSON.parse(text);
    return parsedText.content;
  } catch (e) {
    console.warn('The clipboard content is not valid JSON');
    return null;
  }
};

export default class Clipboard {
  static set(kind: ClipboardKind, object: any) {
    const text = JSON.stringify({
      '000kind': mangleClipboardKind(kind), /// 000 to ensure the key is written first.
      content: object,
    });

    if (electronClipboard) {
      electronClipboard.writeText(text);
    } else {
      internalClipboard = text;

      // Also write to the system clipboard via Web Clipboard API (best-effort).
      // This enables cross-tab copy/paste and clipboard persistence.
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {
            // Silently fail - in-memory clipboard is the fallback.
          });
        }
      } catch (e) {
        // Silently fail if the Web Clipboard API is not available.
      }
    }
  }

  /**
   * Quickly check that the clipboard content *should* be containing valid JSON content
   * of the specified kind.
   *
   * On Electron, this is a synchronous check against the system clipboard.
   * On the web, this checks the in-memory clipboard first. If nothing is found
   * but the Web Clipboard API is available, it optimistically returns true
   * because the system clipboard might contain valid content from another tab.
   * Paste operations use `Clipboard.read` which handles invalid content gracefully.
   */
  static has(kind: ClipboardKind): boolean {
    if (electronClipboard) {
      return (
        electronClipboard.readText().indexOf(mangleClipboardKind(kind)) === 12
      );
    }

    // Check in-memory clipboard first.
    if (internalClipboard.indexOf(mangleClipboardKind(kind)) === 12) {
      return true;
    }

    // If Web Clipboard API is available, the system clipboard might contain
    // valid content from another tab — optimistically return true.
    // Paste operations use Clipboard.read() which handles invalid content gracefully.
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      navigator.clipboard.readText
    ) {
      return true;
    }

    return false;
  }

  /**
   * Synchronously get the content of the clipboard from the in-memory clipboard
   * (or Electron clipboard). Will return null if not valid JSON.
   *
   * Even after parsing, content is **arbitrary** and should be accessed with `SafeExtractor`
   * to ensure everything is accessed without risk of having a wrong type, which could
   * crash the app.
   *
   * Prefer using `Clipboard.read` for paste operations, as it also checks
   * the system clipboard (Web Clipboard API).
   */
  static get(kind: ClipboardKind): ?any {
    if (!Clipboard.has(kind)) return null;

    let text = '';
    if (electronClipboard) {
      text = electronClipboard.readText();
    } else {
      text = internalClipboard;
    }

    return parseClipboardText(text, kind);
  }

  /**
   * Asynchronously read the clipboard content, trying the system clipboard
   * (Web Clipboard API) first, then falling back to the in-memory clipboard.
   *
   * This should be used by paste operations to support cross-tab copy/paste
   * on the web. The system clipboard read may fail due to permissions or
   * browser support, in which case the in-memory clipboard is used.
   *
   * Even after parsing, content is **arbitrary** and should be accessed with `SafeExtractor`.
   */
  static async read(kind: ClipboardKind): Promise<?any> {
    // On Electron, the clipboard is synchronous - just use get().
    if (electronClipboard) {
      return Clipboard.get(kind);
    }

    // Try reading from the system clipboard first (Web Clipboard API).
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const systemText = await navigator.clipboard.readText();
        const content = parseClipboardText(systemText, kind);
        if (content !== null) {
          // Update internal clipboard so that synchronous `has()` checks
          // stay consistent after a successful system clipboard read.
          internalClipboard = systemText;
          return content;
        }
      }
    } catch (e) {
      // Permission denied, not focused, or Web Clipboard API not available.
      // Fall through to the in-memory clipboard.
    }

    // Fallback: read from the in-memory clipboard.
    return Clipboard.get(kind);
  }
}
