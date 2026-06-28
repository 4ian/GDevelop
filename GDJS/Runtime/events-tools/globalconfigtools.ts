/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    /**
     * Helpers to read and update project-wide global configuration data.
     * @private
     * @namespace
     */
    export namespace globalConfig {
      type GlobalConfigPathSegment = string | number;

      const hasOwn = Object.prototype.hasOwnProperty;
      const exactPlaceholderRegex = /^\s*\{\{\s*([^{}]+?)\s*\}\}\s*$/;

      const isObjectLike = (
        value: GlobalConfigValue | undefined
      ): value is { [key: string]: GlobalConfigValue } =>
        !!value && typeof value === 'object' && !Array.isArray(value);

      const isContainer = (
        value: GlobalConfigValue | undefined
      ): value is { [key: string]: GlobalConfigValue } | GlobalConfigValue[] =>
        !!value && typeof value === 'object';

      export const parsePath = function (
        path: string
      ): GlobalConfigPathSegment[] {
        const segments: GlobalConfigPathSegment[] = [];
        let current = '';
        let index = 0;

        const pushCurrent = () => {
          if (current !== '') {
            segments.push(current);
            current = '';
          }
        };

        while (index < path.length) {
          const character = path[index];

          if (character === '.') {
            pushCurrent();
            index++;
            continue;
          }

          if (character === '[') {
            pushCurrent();
            index++;
            while (index < path.length && /\s/.test(path[index])) index++;

            if (path[index] === '"' || path[index] === "'") {
              const quote = path[index];
              index++;
              let quotedSegment = '';
              while (index < path.length && path[index] !== quote) {
                if (path[index] === '\\' && index + 1 < path.length) {
                  index++;
                }
                quotedSegment += path[index];
                index++;
              }
              if (path[index] === quote) index++;
              while (index < path.length && /\s/.test(path[index])) index++;
              if (path[index] === ']') index++;
              segments.push(quotedSegment);
              continue;
            }

            let bracketSegment = '';
            while (index < path.length && path[index] !== ']') {
              bracketSegment += path[index];
              index++;
            }
            if (path[index] === ']') index++;
            bracketSegment = bracketSegment.trim();
            if (/^\d+$/.test(bracketSegment)) {
              segments.push(parseInt(bracketSegment, 10));
            } else if (bracketSegment !== '') {
              segments.push(bracketSegment);
            }
            continue;
          }

          current += character;
          index++;
        }

        pushCurrent();
        return segments;
      };

      export const getValue = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): GlobalConfigValue | undefined {
        let value: GlobalConfigValue | undefined =
          runtimeGame.getGlobalConfig();
        const segments = parsePath(path);
        for (const segment of segments) {
          if (typeof segment === 'number') {
            if (!Array.isArray(value)) return undefined;
            value = value[segment];
          } else {
            if (!isObjectLike(value)) return undefined;
            if (!hasOwn.call(value, segment)) return undefined;
            value = value[segment];
          }
        }
        return value;
      };

      export const has = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): boolean {
        return getValue(runtimeGame, path) !== undefined;
      };

      export const getNumber = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): number {
        const value = getValue(runtimeGame, path);
        if (typeof value === 'number') return isFinite(value) ? value : 0;
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (typeof value === 'string') {
          const number = parseFloat(value);
          return isFinite(number) ? number : 0;
        }
        return 0;
      };

      export const getString = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): string {
        const value = getValue(runtimeGame, path);
        if (value === undefined || value === null) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') {
          return String(value);
        }

        try {
          return JSON.stringify(value);
        } catch (error) {
          return '';
        }
      };

      export const getBoolean = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): boolean {
        const value = getValue(runtimeGame, path);
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'string') {
          const normalizedValue = value.trim().toLowerCase();
          return (
            normalizedValue === 'true' ||
            normalizedValue === '1' ||
            normalizedValue === 'yes' ||
            normalizedValue === 'on'
          );
        }
        if (Array.isArray(value)) return value.length > 0;
        if (isObjectLike(value)) return Object.keys(value).length > 0;
        return false;
      };

      export const getChildCount = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): number {
        const value = getValue(runtimeGame, path);
        if (Array.isArray(value)) return value.length;
        if (isObjectLike(value)) return Object.keys(value).length;
        return 0;
      };

      export const toJSON = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): string {
        const value = getValue(runtimeGame, path);
        try {
          return JSON.stringify(value === undefined ? null : value);
        } catch (error) {
          return 'null';
        }
      };

      const getWritableParent = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): {
        parent: { [key: string]: GlobalConfigValue } | GlobalConfigValue[];
        segment: GlobalConfigPathSegment;
      } | null {
        const segments = parsePath(path);
        if (segments.length === 0) return null;

        let value: any = runtimeGame.getGlobalConfig();
        for (let index = 0; index < segments.length - 1; index++) {
          const segment = segments[index];
          const nextSegment = segments[index + 1];
          const nextContainer: GlobalConfigValue =
            typeof nextSegment === 'number' ? [] : {};

          if (typeof segment === 'number') {
            if (!Array.isArray(value)) return null;
            if (!isContainer(value[segment])) value[segment] = nextContainer;
            value = value[segment];
          } else {
            if (!isObjectLike(value)) return null;
            if (!isContainer(value[segment])) value[segment] = nextContainer;
            value = value[segment];
          }
        }

        return { parent: value, segment: segments[segments.length - 1] };
      };

      export const setValue = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        value: GlobalConfigValue
      ): void {
        const writableParent = getWritableParent(runtimeGame, path);
        if (!writableParent) return;

        const { parent, segment } = writableParent;
        if (typeof segment === 'number') {
          if (Array.isArray(parent)) parent[segment] = value;
        } else if (isObjectLike(parent)) {
          parent[segment] = value;
        }
      };

      export const setNumber = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        value: number
      ): void {
        setValue(runtimeGame, path, isFinite(value) ? value : 0);
      };

      export const setString = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        value: string
      ): void {
        setValue(runtimeGame, path, value);
      };

      export const setBoolean = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        value: boolean
      ): void {
        setValue(runtimeGame, path, value);
      };

      export const remove = function (
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): void {
        const writableParent = getWritableParent(runtimeGame, path);
        if (!writableParent) return;

        const { parent, segment } = writableParent;
        if (typeof segment === 'number') {
          if (Array.isArray(parent)) parent.splice(segment, 1);
        } else if (isObjectLike(parent)) {
          delete parent[segment];
        }
      };

      export const getExactPlaceholderPath = function (
        text: string
      ): string | null {
        const match = exactPlaceholderRegex.exec(text);
        return match ? match[1] : null;
      };

      export const resolvePlaceholders = function (
        runtimeGame: gdjs.RuntimeGame,
        text: string
      ): string {
        return text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (match, path) => {
          const value = getValue(runtimeGame, path);
          if (value === undefined || value === null) return '';
          if (typeof value === 'string') return value;
          if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
          }
          try {
            return JSON.stringify(value);
          } catch (error) {
            return '';
          }
        });
      };

      export const resolveNumber = function (
        runtimeGame: gdjs.RuntimeGame,
        value: any
      ): number {
        if (typeof value === 'string') {
          const placeholderPath = getExactPlaceholderPath(value);
          if (placeholderPath) return getNumber(runtimeGame, placeholderPath);

          const number = parseFloat(value);
          return isFinite(number) ? number : 0;
        }
        if (typeof value === 'number') return isFinite(value) ? value : 0;
        if (typeof value === 'boolean') return value ? 1 : 0;
        return 0;
      };

      export const resolveString = function (
        runtimeGame: gdjs.RuntimeGame,
        value: any
      ): string {
        if (typeof value === 'string') {
          return resolvePlaceholders(runtimeGame, value);
        }
        if (value === undefined || value === null) return '';
        if (typeof value === 'number' || typeof value === 'boolean') {
          return String(value);
        }
        try {
          return JSON.stringify(value);
        } catch (error) {
          return '';
        }
      };

      export const resolveBoolean = function (
        runtimeGame: gdjs.RuntimeGame,
        value: any
      ): boolean {
        if (typeof value === 'string') {
          const placeholderPath = getExactPlaceholderPath(value);
          if (placeholderPath) return getBoolean(runtimeGame, placeholderPath);

          const normalizedValue = value.trim().toLowerCase();
          return (
            normalizedValue === 'true' ||
            normalizedValue === '1' ||
            normalizedValue === 'yes' ||
            normalizedValue === 'on'
          );
        }
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        if (Array.isArray(value)) return value.length > 0;
        if (isObjectLike(value)) return Object.keys(value).length > 0;
        return false;
      };
    }
  }
}
