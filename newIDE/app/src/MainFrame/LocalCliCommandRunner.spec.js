// @flow
import { initialPreferences } from './Preferences/PreferencesContext';
import Window from '../Utils/Window';
import { shouldBlockOnDiagnosticErrorsForCli } from './LocalCliCommandRunner';

jest.mock('../Utils/Window', () => {
  // $FlowFixMe[unsupported-syntax]
  const originalModule = jest.requireActual('../Utils/Window');
  originalModule.default.getArguments = jest.fn(() => ({}));
  return originalModule;
});

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const preferencesWith = (blockPreviewAndExportOnDiagnosticErrors: boolean) => ({
  ...initialPreferences,
  getBlockPreviewAndExportOnDiagnosticErrors: () =>
    blockPreviewAndExportOnDiagnosticErrors,
});

describe('shouldBlockOnDiagnosticErrorsForCli', () => {
  beforeEach(() => {
    mockFn(Window.getArguments).mockReset();
  });

  test('uses the yaml preference when the CLI flag is absent (null)', () => {
    mockFn(Window.getArguments).mockReturnValue({
      'block-on-diagnostic-errors': null,
    });

    expect(shouldBlockOnDiagnosticErrorsForCli(preferencesWith(true))).toBe(
      true
    );
    expect(shouldBlockOnDiagnosticErrorsForCli(preferencesWith(false))).toBe(
      false
    );
  });

  test('uses the yaml preference when the CLI flag key is missing', () => {
    mockFn(Window.getArguments).mockReturnValue({});

    expect(shouldBlockOnDiagnosticErrorsForCli(preferencesWith(true))).toBe(
      true
    );
  });

  test('an explicit --block-on-diagnostic-errors overrides a disabled preference', () => {
    mockFn(Window.getArguments).mockReturnValue({
      'block-on-diagnostic-errors': true,
    });

    expect(shouldBlockOnDiagnosticErrorsForCli(preferencesWith(false))).toBe(
      true
    );
  });

  test('an explicit --no-block-on-diagnostic-errors overrides an enabled preference', () => {
    mockFn(Window.getArguments).mockReturnValue({
      'block-on-diagnostic-errors': false,
    });

    expect(shouldBlockOnDiagnosticErrorsForCli(preferencesWith(true))).toBe(
      false
    );
  });
});
