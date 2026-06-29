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

      const logger = new gdjs.Logger('Global configuration');
      const hasOwn = Object.prototype.hasOwnProperty;
      const exactPlaceholderRegex = /^\s*\{\{\s*([^{}]+?)\s*\}\}\s*$/;
      const dynamicVariableSegmentRegex = /^\$([A-Za-z_][A-Za-z0-9_]*)$/;
      const warnedMissingPaths = new Set<string>();
      const warnedDynamicPathVariables = new Set<string>();
      const warnedSchemaMismatches = new Set<string>();

      const isObjectLike = (
        value: GlobalConfigValue | undefined
      ): value is { [key: string]: GlobalConfigValue } =>
        !!value && typeof value === 'object' && !Array.isArray(value);

      const isContainer = (
        value: GlobalConfigValue | undefined
      ): value is { [key: string]: GlobalConfigValue } | GlobalConfigValue[] =>
        !!value && typeof value === 'object';

      export const normalizePath = function(path: string): string {
        const match = exactPlaceholderRegex.exec(path);
        return match ? match[1].trim() : path.trim();
      };

      const warnMissingPath = function(path: string): void {
        const normalizedPath = normalizePath(path);
        if (!normalizedPath || warnedMissingPaths.has(normalizedPath)) return;

        warnedMissingPaths.add(normalizedPath);
        logger.warn(
          'Global config path "{{' + normalizedPath + '}}" does not exist.'
        );
      };

      const warnDynamicPathVariable = function(
        path: string,
        variableName: string,
        reason: string
      ): void {
        const normalizedPath = normalizePath(path);
        const warningKey = normalizedPath + '|' + variableName + '|' + reason;
        if (warnedDynamicPathVariables.has(warningKey)) return;

        warnedDynamicPathVariables.add(warningKey);
        logger.warn(
          'Global config path "{{' +
            normalizedPath +
            '}}" uses global variable "$' +
            variableName +
            '" but ' +
            reason +
            '.'
        );
      };

      const getTypeName = function(value: any): string {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
      };

      const validateValueAgainstExample = function(
        value: any,
        example: any,
        path: string
      ): string | null {
        if (example === null) {
          return value === null
            ? null
            : path + ' should be null, got ' + getTypeName(value) + '.';
        }

        if (Array.isArray(example)) {
          if (!Array.isArray(value)) {
            return path + ' should be an array, got ' + getTypeName(value) + '.';
          }
          if (example.length === 0) return null;

          for (let index = 0; index < value.length; index++) {
            const error = validateValueAgainstExample(
              value[index],
              example[0],
              path + '[' + index + ']'
            );
            if (error) return error;
          }
          return null;
        }

        if (typeof example === 'object') {
          if (!isObjectLike(value)) {
            return path + ' should be an object, got ' + getTypeName(value) + '.';
          }

          for (const key in example) {
            if (!hasOwn.call(example, key)) continue;

            if (!hasOwn.call(value, key)) {
              return path + '.' + key + ' is missing.';
            }

            const error = validateValueAgainstExample(
              value[key],
              example[key],
              path + '.' + key
            );
            if (error) return error;
          }
          return null;
        }

        if (typeof value !== typeof example) {
          return (
            path +
            ' should be a ' +
            typeof example +
            ', got ' +
            getTypeName(value) +
            '.'
          );
        }

        return null;
      };

      const getParsedJsonExample = function(
        schemaExample: any,
        propertyName: string
      ): any | null {
        if (schemaExample === undefined || schemaExample === null) {
          return null;
        }

        if (typeof schemaExample !== 'string') {
          return schemaExample;
        }

        const trimmedSchemaExample = schemaExample.trim();
        if (!trimmedSchemaExample) {
          logger.error(
            'JSON example for property "' + propertyName + '" is required.'
          );
          return null;
        }

        try {
          const parsedSchemaExample = JSON.parse(trimmedSchemaExample);
          if (
            !isObjectLike(parsedSchemaExample) ||
            Array.isArray(parsedSchemaExample)
          ) {
            logger.error(
              'JSON example for property "' +
                propertyName +
                '" must be a JSON object.'
            );
            return null;
          }
          return parsedSchemaExample;
        } catch (error) {
          logger.error(
            'JSON example for property "' +
              propertyName +
              '" is not valid JSON: ' +
              error
          );
          return null;
        }
      };

      const validateResolvedVariableValue = function(
        value: any,
        schemaExample?: any,
        propertyName?: string,
        source?: string
      ): void {
        if (schemaExample === undefined || !propertyName) return;

        const parsedSchemaExample = getParsedJsonExample(
          schemaExample,
          propertyName
        );
        if (!parsedSchemaExample) return;

        const error = validateValueAgainstExample(
          value,
          parsedSchemaExample,
          propertyName
        );
        if (!error) return;

        const sourceDescription = source || propertyName;
        const warningKey = propertyName + '|' + sourceDescription + '|' + error;
        if (warnedSchemaMismatches.has(warningKey)) return;
        warnedSchemaMismatches.add(warningKey);

        logger.error(
          'Global config value "' +
            sourceDescription +
            '" does not match the JSON example for property "' +
            propertyName +
            '": ' +
            error
        );
      };

      export const parsePath = function(
        path: string
      ): GlobalConfigPathSegment[] {
        const segments: GlobalConfigPathSegment[] = [];
        let current = '';
        let index = 0;
        path = normalizePath(path);

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

      const resolveDynamicPathSegment = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        segment: GlobalConfigPathSegment
      ): GlobalConfigPathSegment | null {
        if (typeof segment !== 'string') return segment;

        const match = dynamicVariableSegmentRegex.exec(segment);
        if (!match) return segment;

        const variableName = match[1];
        const variables = runtimeGame.getVariables();
        if (!variables.has(variableName)) {
          warnDynamicPathVariable(path, variableName, 'it does not exist');
          return null;
        }

        const variable = variables.get(variableName);
        if (!variable.isPrimitive()) {
          warnDynamicPathVariable(
            path,
            variableName,
            'it is not a primitive value'
          );
          return null;
        }

        return variable.getAsString();
      };

      const resolveDynamicPathSegments = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): GlobalConfigPathSegment[] | null {
        const segments = parsePath(path);
        const resolvedSegments: GlobalConfigPathSegment[] = [];

        for (const segment of segments) {
          const resolvedSegment = resolveDynamicPathSegment(
            runtimeGame,
            path,
            segment
          );
          if (resolvedSegment === null) return null;

          resolvedSegments.push(resolvedSegment);
        }

        return resolvedSegments;
      };

      export const getValue = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        warnIfMissing: boolean = true
      ): GlobalConfigValue | undefined {
        let value:
          | GlobalConfigValue
          | undefined = runtimeGame.getGlobalConfig();
        const segments = resolveDynamicPathSegments(runtimeGame, path);
        if (!segments) {
          if (warnIfMissing) warnMissingPath(path);
          return undefined;
        }

        for (const segment of segments) {
          if (typeof segment === 'number') {
            if (
              !Array.isArray(value) ||
              segment < 0 ||
              segment >= value.length
            ) {
              if (warnIfMissing) warnMissingPath(path);
              return undefined;
            }
            value = value[segment];
          } else {
            if (!isObjectLike(value) || !hasOwn.call(value, segment)) {
              if (warnIfMissing) warnMissingPath(path);
              return undefined;
            }
            value = value[segment];
          }
        }
        return value;
      };

      export const has = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): boolean {
        return getValue(runtimeGame, path, false) !== undefined;
      };

      export const getNumber = function(
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

      export const getString = function(
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

      export const getBoolean = function(
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

      export const getChildCount = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): number {
        const value = getValue(runtimeGame, path);
        if (Array.isArray(value)) return value.length;
        if (isObjectLike(value)) return Object.keys(value).length;
        return 0;
      };

      export const toJSON = function(
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

      const emptyStructureVariable = function(): gdjs.Variable {
        const variable = new gdjs.Variable();
        variable.castTo('structure');
        return variable;
      };

      const toVariable = function(value: any): gdjs.Variable {
        if (value instanceof gdjs.Variable) {
          validateResolvedVariableValue(
            value.toJSObject(),
            schemaExample,
            propertyName
          );
          return value.clone();
        }
        if (value === undefined) return emptyStructureVariable();

        const variable = new gdjs.Variable();
        variable.fromJSObject(value);
        return variable;
      };

      export const getVariable = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        schemaExample?: any,
        propertyName?: string
      ): gdjs.Variable {
        const value = getValue(runtimeGame, path);
        validateResolvedVariableValue(
          value,
          schemaExample,
          propertyName,
          '{{' + normalizePath(path) + '}}'
        );
        return toVariable(value);
      };

      export const resolveVariable = function(
        runtimeGame: gdjs.RuntimeGame,
        value: any,
        schemaExample?: any,
        propertyName?: string
      ): gdjs.Variable {
        if (value instanceof gdjs.Variable) return value.clone();
        if (typeof value === 'string') {
          const placeholderPath = getExactPlaceholderPath(value);
          if (placeholderPath) {
            return getVariable(
              runtimeGame,
              placeholderPath,
              schemaExample,
              propertyName
            );
          }

          const trimmedValue = value.trim();
          if (!trimmedValue) return emptyStructureVariable();

          try {
            const parsedValue = JSON.parse(trimmedValue);
            validateResolvedVariableValue(
              parsedValue,
              schemaExample,
              propertyName
            );
            return toVariable(parsedValue);
          } catch (error) {
            return emptyStructureVariable();
          }
        }
        validateResolvedVariableValue(value, schemaExample, propertyName);
        return toVariable(value);
      };

      const getWritableParent = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): {
        parent: { [key: string]: GlobalConfigValue } | GlobalConfigValue[];
        segment: GlobalConfigPathSegment;
      } | null {
        const segments = resolveDynamicPathSegments(runtimeGame, path);
        if (segments.length === 0) return null;

        let value: any = runtimeGame.getGlobalConfig();
        for (let index = 0; index < segments.length - 1; index++) {
          const segment = segments[index];
          const nextSegment = segments[index + 1];
          const nextContainer: GlobalConfigValue =
            typeof nextSegment === 'number' ? [] : {};

          if (typeof segment === 'number') {
            if (!Array.isArray(value)) {
              warnMissingPath(path);
              return null;
            }
            if (!isContainer(value[segment])) value[segment] = nextContainer;
            value = value[segment];
          } else {
            if (!isObjectLike(value)) {
              warnMissingPath(path);
              return null;
            }
            if (!isContainer(value[segment])) value[segment] = nextContainer;
            value = value[segment];
          }
        }

        return { parent: value, segment: segments[segments.length - 1] };
      };

      export const setValue = function(
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

      export const setNumber = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        value: number
      ): void {
        setValue(runtimeGame, path, isFinite(value) ? value : 0);
      };

      export const setString = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        value: string
      ): void {
        setValue(runtimeGame, path, value);
      };

      export const setBoolean = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string,
        value: boolean
      ): void {
        setValue(runtimeGame, path, value);
      };

      export const remove = function(
        runtimeGame: gdjs.RuntimeGame,
        path: string
      ): void {
        const writableParent = getWritableParent(runtimeGame, path);
        if (!writableParent) return;

        const { parent, segment } = writableParent;
        if (typeof segment === 'number') {
          if (Array.isArray(parent)) {
            if (segment < 0 || segment >= parent.length) {
              warnMissingPath(path);
              return;
            }
            parent.splice(segment, 1);
          }
        } else if (isObjectLike(parent)) {
          if (!hasOwn.call(parent, segment)) {
            warnMissingPath(path);
            return;
          }
          delete parent[segment];
        }
      };

      export const getExactPlaceholderPath = function(
        text: string
      ): string | null {
        const match = exactPlaceholderRegex.exec(text);
        return match ? match[1].trim() : null;
      };

      export const resolvePlaceholders = function(
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

      export const resolveNumber = function(
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

      export const resolveString = function(
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

      export const resolveBoolean = function(
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
