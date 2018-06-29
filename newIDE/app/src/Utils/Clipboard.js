// @flow
import optionalRequire from './OptionalRequire.js';
const electron = optionalRequire('electron');
const electronClipboard = electron ? electron.clipboard : null;

export type ClipboardKind = string;

let internalClipboard = '';

export default class Clipboard {
  static set(kind: ClipboardKind, object: any) {
    const text = JSON.stringify({
      '000kind': kind, /// 000 to ensure the key is written first.
      content: object,
    });

    if (electronClipboard) {
      electronClipboard.writeText(text);
    } else {
      internalClipboard = text;
    }
  }

  static has(kind: ClipboardKind): boolean {
    let text = '';
    if (electronClipboard) {
      text = electronClipboard.readText();
    } else {
      text = internalClipboard;
    }

    return text.indexOf(kind) === 12; /// 12 is the position of '000kind' value
  }

  static get(kind: ClipboardKind): any {
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
