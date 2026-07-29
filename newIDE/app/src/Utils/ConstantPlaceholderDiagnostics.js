// @flow
import type { ValidationError } from './EventsValidationScanner';

const constantPlaceholderRegex = /\{\{[^{}]*\}\}/;
const constantPlaceholderCaptureRegex = /\{\{([^{}]*)\}\}/g;
const constantsDiagnosticExpectedValue = 'A project constant';

type ConstantPathSegment = string | number;

const parseConstantPath = (path: string): Array<ConstantPathSegment> => {
  const segments: Array<ConstantPathSegment> = [];
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
        while (position < path.length) {
          const quotedCharacter = path[position];
          if (quotedCharacter === quote) break;
          if (
            quotedCharacter.charCodeAt(0) === 92 &&
            position + 1 < path.length
          ) {
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

const getConstantValueAtPath = (
  constants: any,
  path: string
): {| found: boolean, value: any |} => {
  if (!path) return { found: false, value: undefined };

  let value = constants;
  for (const segment of parseConstantPath(path)) {
    if (value === null || value === undefined) {
      return { found: false, value: undefined };
    }

    if (typeof segment === 'number') {
      if (!Array.isArray(value) || segment >= value.length) {
        return { found: false, value: undefined };
      }
      value = value[segment];
    } else {
      const objectValue: any = value;
      if (
        typeof objectValue !== 'object' ||
        // $FlowFixMe[method-unbinding]
        !Object.prototype.hasOwnProperty.call(objectValue, segment)
      ) {
        return { found: false, value: undefined };
      }
      value = objectValue[segment];
    }
  }

  return { found: true, value };
};

const hasConstantPath = (constants: any, path: string): boolean => {
  if (!path) return false;
  return getConstantValueAtPath(constants, path).found;
};

export const isConstantPlaceholderDiagnostic = (
  projectDiagnostic: gdProjectDiagnostic
): boolean =>
  projectDiagnostic.getExpectedValue() === constantsDiagnosticExpectedValue ||
  projectDiagnostic.getMessage().indexOf('Constant path "{{') === 0;

export const hasConstantPlaceholderDiagnostic = (
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
        isConstantPlaceholderDiagnostic(diagnosticReport.get(diagnosticIndex))
      ) {
        return true;
      }
    }
  }

  return false;
};

export const isInvalidConstantPlaceholderValidationError = (
  error: ValidationError
): boolean =>
  error.type === 'invalid-parameter' &&
  !!error.parameterValue &&
  constantPlaceholderRegex.test(error.parameterValue);

export const hasInvalidConstantPlaceholderValidationError = (
  validationErrors: Array<ValidationError>
): boolean =>
  validationErrors.some(isInvalidConstantPlaceholderValidationError);

export const getMissingConstantPlaceholderPath = (
  source: string,
  project: gdProject
): ?string => {
  let constants;
  try {
    constants = JSON.parse(project.getConstantsJson());
  } catch (error) {
    return null;
  }

  constantPlaceholderCaptureRegex.lastIndex = 0;
  while (true) {
    const match = constantPlaceholderCaptureRegex.exec(source);
    if (!match) break;
    const path = match[1].trim();
    if (!hasConstantPath(constants, path)) {
      return path;
    }
  }

  return null;
};

export const findConstantPlaceholderInSerializedData = (
  serializedData: any
): ?string => {
  const findInValue = (value: any): ?string => {
    if (typeof value === 'string') {
      constantPlaceholderCaptureRegex.lastIndex = 0;
      const match = constantPlaceholderCaptureRegex.exec(value);
      return match ? match[1].trim() : null;
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        const placeholderPath = findInValue(child);
        if (placeholderPath != null) return placeholderPath;
      }
      return null;
    }

    if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        const placeholderPath = findInValue(value[key]);
        if (placeholderPath != null) return placeholderPath;
      }
    }

    return null;
  };

  return findInValue(serializedData);
};
