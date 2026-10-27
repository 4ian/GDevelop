/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * @category Core Engine > Game
   */
  export class NamedEasingsManager {
    /** Map from extension name ('' for the project) to name to cubic-bezier identifier. */
    private _identifiersByScope: Map<string, Map<string, string>>;

    constructor(projectData: ProjectData) {
      this._identifiersByScope = new Map();
      this._addNamedEasingsForScope('', projectData.namedEasings);
      if (projectData.eventsFunctionsExtensions) {
        for (const extensionData of projectData.eventsFunctionsExtensions) {
          this._addNamedEasingsForScope(
            extensionData.name,
            extensionData.namedEasings
          );
        }
      }
    }

    /**
     * Return the cubic-bezier identifier of the named easing in scope,
     * or the easing unchanged if it is not a named easing.
     */
    resolve(easing: string, extensionName: string): string {
      const identifiers = this._identifiersByScope.get(extensionName);
      if (!identifiers) {
        return easing;
      }
      const identifier = identifiers.get(easing);
      return identifier !== undefined ? identifier : easing;
    }

    private _addNamedEasingsForScope(
      scopeName: string,
      namedEasings: NamedEasingData[] | undefined
    ): void {
      if (!namedEasings || namedEasings.length === 0) {
        return;
      }
      const identifiers = new Map<string, string>();
      for (const namedEasing of namedEasings) {
        const cubicBezier = namedEasing.cubicBezier;
        if (!cubicBezier || cubicBezier.length !== 4) {
          continue;
        }
        identifiers.set(
          namedEasing.name,
          `cubic-bezier(${cubicBezier[0]},${cubicBezier[1]},${cubicBezier[2]},${cubicBezier[3]})`
        );
      }
      if (identifiers.size > 0) {
        this._identifiersByScope.set(scopeName, identifiers);
      }
    }
  }
}
