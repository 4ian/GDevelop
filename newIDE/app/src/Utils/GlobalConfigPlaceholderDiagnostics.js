// @flow
import type { ValidationError } from './EventsValidationScanner';

const globalConfigPlaceholderRegex = /\{\{[^{}]*\}\}/;
const globalConfigDiagnosticExpectedValue =
  'A value in the project global config';

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
