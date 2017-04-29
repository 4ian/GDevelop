import optionalRequire from './OptionalRequire.js';
const electron = optionalRequire('electron');
const electronClipboard = electron ? electron.clipboard : null;

export default class Clipboard {
  static set(kind, object) {
    if (electronClipboard) {
      electronClipboard.writeText(
        JSON.stringify({
          '000kind': kind, /// 000 to ensure the key is written first.
          content: object,
        })
      );
    }
  }

  static has(kind) {
    if (electronClipboard) {
      const text = electronClipboard.readText();
      return text.indexOf(kind) === 12; /// 12 is the position of '000kind' value
    }

    return false;
  }

  static get(kind) {
    if (!Clipboard.has(kind)) return null;

    if (electronClipboard) {
      const text = electronClipboard.readText();
      try {
        const parsedText = JSON.parse(text);
        return parsedText.content;
      } catch (e) {
        console.warn('The clipboard content is not valid JSON');
        return null;
      }
    }

    return null;
  }
}
