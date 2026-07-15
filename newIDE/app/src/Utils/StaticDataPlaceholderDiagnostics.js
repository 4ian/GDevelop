// @flow
import type { ValidationError } from './EventsValidationScanner';

const staticDataPlaceholderRegex = /\{\{[^{}]*\}\}/;
const staticDataPlaceholderCaptureRegex = /\{\{([^{}]*)\}\}/g;
const staticDataDiagnosticExpectedValue = 'A value in the project static data';

type StaticDataPathSegment = string | number;

const parseStaticDataPath = (path: string): Array<StaticDataPathSegment> => {
  const segments: Array<StaticDataPathSegment> = [];
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

const getStaticDataValueAtPath = (
  staticData: any,
  path: string
): {| found: boolean, value: any |} => {
  if (!path) return { found: false, value: undefined };

  let value = staticData;
  for (const segment of parseStaticDataPath(path)) {
    if (value === null || value === undefined) {
      return { found: false, value: undefined };
    }

    if (typeof segment === 'number') {
      if (!Array.isArray(value) || segment >= value.length) {
        return { found: false, value: undefined };
      }
      value = value[segment];
    } else {
      if (
        typeof value !== 'object' ||
        !Object.prototype.hasOwnProperty.call(value, segment)
      ) {
        return { found: false, value: undefined };
      }
      value = value[segment];
    }
  }

  return { found: true, value };
};

const hasStaticDataPath = (staticData: any, path: string): boolean => {
  if (!path) return false;
  return getStaticDataValueAtPath(staticData, path).found;
};

export const isStaticDataPlaceholderDiagnostic = (
  projectDiagnostic: gdProjectDiagnostic
): boolean =>
  projectDiagnostic.getExpectedValue() === staticDataDiagnosticExpectedValue ||
  projectDiagnostic.getMessage().indexOf('Static Data path "{{') === 0;

export const hasStaticDataPlaceholderDiagnostic = (
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
        isStaticDataPlaceholderDiagnostic(diagnosticReport.get(diagnosticIndex))
      ) {
        return true;
      }
    }
  }

  return false;
};

export const isInvalidStaticDataPlaceholderValidationError = (
  error: ValidationError
): boolean =>
  error.type === 'invalid-parameter' &&
  !!error.parameterValue &&
  staticDataPlaceholderRegex.test(error.parameterValue);

export const hasInvalidStaticDataPlaceholderValidationError = (
  validationErrors: Array<ValidationError>
): boolean =>
  validationErrors.some(isInvalidStaticDataPlaceholderValidationError);

export const getMissingStaticDataPlaceholderPath = (
  source: string,
  project: gdProject
): ?string => {
  let staticData;
  try {
    staticData = JSON.parse(project.getStaticDataJson());
  } catch (error) {
    return null;
  }

  staticDataPlaceholderCaptureRegex.lastIndex = 0;
  let match;
  while ((match = staticDataPlaceholderCaptureRegex.exec(source)) !== null) {
    const path = match[1].trim();
    if (!hasStaticDataPath(staticData, path)) {
      return path;
    }
  }

  return null;
};

export const findStaticDataPlaceholderInSerializedData = (
  serializedData: any
): ?string => {
  const findInValue = value => {
    if (typeof value === 'string') {
      staticDataPlaceholderCaptureRegex.lastIndex = 0;
      const match = staticDataPlaceholderCaptureRegex.exec(value);
      return match ? match[1].trim() : null;
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        const placeholderPath = findInValue(child);
        if (placeholderPath !== null) return placeholderPath;
      }
      return null;
    }

    if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        const placeholderPath = findInValue(value[key]);
        if (placeholderPath !== null) return placeholderPath;
      }
    }

    return null;
  };

  return findInValue(serializedData);
};
