// @flow
import type { ValidationError } from './EventsValidationScanner';

const globalConfigPlaceholderRegex = /\{\{[^{}]*\}\}/;
const globalConfigPlaceholderCaptureRegex = /\{\{([^{}]*)\}\}/g;
const globalConfigDiagnosticExpectedValue =
  'A value in the project global config';

type GlobalConfigPathSegment = string | number;

const parseGlobalConfigPath = (
  path: string
): Array<GlobalConfigPathSegment> => {
  const segments: Array<GlobalConfigPathSegment> = [];
  let current = '';
  let position = 0;
  const pushCurrent = () => {
    if (current) {
      segments.push(current);
      current = '';
    }
  };

  while (position < path.length) {
    const character = path[position];

    if (character === '.') {
      pushCurrent();
      position++;
      continue;
    }

    if (character === '[') {
      pushCurrent();
      position++;
      while (position < path.length && /\s/.test(path[position])) position++;

      if (path[position] === '"' || path[position] === "'") {
        const quote = path[position];
        position++;
        let quotedSegment = '';
        while (position < path.length && path[position] !== quote) {
          if (path[position] === '\\' && position + 1 < path.length) {
            position++;
          }
          quotedSegment += path[position];
          position++;
        }
        if (position < path.length && path[position] === quote) position++;
        while (position < path.length && /\s/.test(path[position])) position++;
        if (position < path.length && path[position] === ']') position++;
        segments.push(quotedSegment);
        continue;
      }

      let bracketSegment = '';
      while (position < path.length && path[position] !== ']') {
        bracketSegment += path[position];
        position++;
      }
      if (position < path.length && path[position] === ']') position++;
      bracketSegment = bracketSegment.trim();
      if (bracketSegment) {
        segments.push(
          /^\d+$/.test(bracketSegment)
            ? parseInt(bracketSegment, 10)
            : bracketSegment
        );
      }
      continue;
    }

    current += character;
    position++;
  }

  pushCurrent();
  return segments;
};

const hasGlobalConfigPath = (globalConfig: any, path: string): boolean => {
  if (!path) return false;

  let value = globalConfig;
  for (const segment of parseGlobalConfigPath(path)) {
    if (value === null || value === undefined) return false;

    if (typeof segment === 'number') {
      if (!Array.isArray(value) || segment >= value.length) return false;
      value = value[segment];
    } else {
      if (
        typeof value !== 'object' ||
        !Object.prototype.hasOwnProperty.call(value, segment)
      ) {
        return false;
      }
      value = value[segment];
    }
  }

  return true;
};

export const isGlobalConfigPlaceholderDiagnostic = (
  projectDiagnostic: gdProjectDiagnostic
): boolean =>
  projectDiagnostic.getExpectedValue() ===
    globalConfigDiagnosticExpectedValue ||
  projectDiagnostic.getMessage().indexOf('Global config path "{{') === 0;

export const hasGlobalConfigPlaceholderDiagnostic = (
  wholeProjectDiagnosticReport: gdWholeProjectDiagnosticReport
): boolean => {
  for (
    let reportIndex = 0;
    reportIndex < wholeProjectDiagnosticReport.count();
    reportIndex++
  ) {
    const diagnosticReport = wholeProjectDiagnosticReport.get(reportIndex);
    for (
      let diagnosticIndex = 0;
      diagnosticIndex < diagnosticReport.count();
      diagnosticIndex++
    ) {
      if (
        isGlobalConfigPlaceholderDiagnostic(
          diagnosticReport.get(diagnosticIndex)
        )
      ) {
        return true;
      }
    }
  }

  return false;
};

export const isInvalidGlobalConfigPlaceholderValidationError = (
  error: ValidationError
): boolean =>
  error.type === 'invalid-parameter' &&
  !!error.parameterValue &&
  globalConfigPlaceholderRegex.test(error.parameterValue);

export const hasInvalidGlobalConfigPlaceholderValidationError = (
  validationErrors: Array<ValidationError>
): boolean =>
  validationErrors.some(isInvalidGlobalConfigPlaceholderValidationError);

export const getMissingGlobalConfigPlaceholderPath = (
  source: string,
  project: gdProject
): ?string => {
  let globalConfig;
  try {
    globalConfig = JSON.parse(project.getGlobalConfigJson());
  } catch (error) {
    return null;
  }

  globalConfigPlaceholderCaptureRegex.lastIndex = 0;
  let match;
  while ((match = globalConfigPlaceholderCaptureRegex.exec(source)) !== null) {
    const path = match[1].trim();
    if (!hasGlobalConfigPath(globalConfig, path)) {
      return path;
    }
  }

  return null;
};
