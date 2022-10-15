// @flow
import optionalRequire from './OptionalRequire';
const electron = optionalRequire('electron');
const electronClipboard = electron ? electron.clipboard : null;

export type ClipboardKind = string;

let internalClipboard = '';

const mangleClipboardKind = (kind: ClipboardKind): string => {
  // Mangle the name with GDevelop specific strings and random
  // characters so that the probability that something that is not
  // a valid GDevelop clipboard content is recognized as valid is almost 0.
  return 'GDEVELOP_' + kind + '_CLIPBOARD_KIND-jsBdHbLy912y8Rc';
};

/**
 * Access to properties and type objects safely (ensuring no crash and no exception
 * in case the expected type is not the one found or totally different than assumed).
 *
 * Each method returns null if the expected type is not found.
 *
 * Useful to deal with arbitrary content coming from the Clipboard.
 */
export class SafeExtractor {
  static extractNumberProperty(
    anything: any,
    propertyName: string
  ): number | null {
    const object = this.extractObject(anything);
    if (!object) return null;

    const property = anything[propertyName];

    if (typeof property !== 'number') return null;

    return property;
  }

  static extractStringProperty(
    anything: any,
    propertyName: string
  ): string | null {
    const object = this.extractObject(anything);
    if (!object) return null;

    const property = anything[propertyName];

    if (typeof property !== 'string') return null;

    return property;
  }

  static extractBooleanProperty(
    anything: any,
    propertyName: string
  ): boolean | null {
    const object = this.extractObject(anything);
    if (!object) return null;

    const property = anything[propertyName];

    if (typeof property !== 'boolean') return null;

    return property;
  }

  static extractObjectProperty(
    anything: any,
    propertyName: string
  ): Object | null {
    const object = this.extractObject(anything);
    if (!object) return null;

    const property = anything[propertyName];

    return this.extractObject(property);
  }

  static extractArrayProperty(
    anything: any,
    propertyName: string
  ): Array<any> | null {
    const object = this.extractObject(anything);
    if (!object) return null;

    const property = anything[propertyName];

    return this.extractArray(property);
  }

  static extractObject(anything: any): Object | null {
    if (
      anything === null ||
      anything === undefined ||
      typeof anything !== 'object' ||
      Array.isArray(anything)
    )
      return null;

    return anything;
  }

  static extractArray(anything: any): Array<any> | null {
    if (
      anything === null ||
      anything === undefined ||
      typeof anything !== 'object' ||
      !Array.isArray(anything)
    )
      return null;

    return anything;
  }
}

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
