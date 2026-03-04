// @flow
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

  static extractNumberOrStringOrBooleanProperty(
    anything: any,
    propertyName: string
  ): number | string | boolean | null {
    const object = this.extractObject(anything);
    if (!object) return null;

    const property = anything[propertyName];

    if (
      typeof property === 'number' ||
      typeof property === 'string' ||
      typeof property === 'boolean'
    ) {
      return property;
    }

    return null;
  }
}
