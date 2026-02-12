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
    }
  }

  /**
   * Quickly check that the clipboard content *should* be containing valid JSON content
   * of the specified kind.
   *
   * This is only a quick check and not a guarantee. Use `Clipboard.get` to get the value.
   */
  static has(kind: ClipboardKind): boolean {
    let text = '';
    if (electronClipboard) {
      text = electronClipboard.readText();
    } else {
      text = internalClipboard;
    }

    return text.indexOf(mangleClipboardKind(kind)) === 12; /// 12 is the position of '000kind' value
  }

  /**
   * Get the content of the clipboard. Will return null if not valid JSON.
   *
   * Even after parsing, content is **arbitrary** and should be accessed with `SafeExtractor`
   * to ensure everything is accessed without risk of having a wrong type, which could
   * crash the app.
   */
  static get(kind: ClipboardKind): ?any {
    if (!Clipboard.has(kind)) return null;

    let text = '';
    if (electronClipboard) {
      text = electronClipboard.readText();
    } else {
      text = internalClipboard;
    }

    try {
      const parsedText = JSON.parse(text);
      return parsedText.content;
    } catch (e) {
      console.warn('The clipboard content is not valid JSON');
      return null;
    }
  }
}
