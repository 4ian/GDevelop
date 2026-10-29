// @flow
import Window from '../Utils/Window';
import { shouldBlockOnDiagnosticErrorsForCli } from './LocalCliCommandRunner';

// Transitively imported, but shipped as untransformed ESM that Jest cannot
// load.
jest.mock('three/src/math/MathUtils', () => ({
  generateUUID: () => 'mock-uuid',
}));
// The real PixiResourcesLoader transitively imports ESM-only packages that
// Jest cannot parse: replace it with the test mock.
jest.mock('../ObjectsRendering/PixiResourcesLoader', () => {
  const {
    PixiResourcesLoaderMock,
  } = require('../fixtures/TestPixiResourcesLoader');
  return { __esModule: true, default: PixiResourcesLoaderMock };
});

jest.mock('../Utils/Window', () => {
  const originalModule = jest.requireActual<any>('../Utils/Window');
  originalModule.default.getArguments = jest.fn(() => ({}));
  return originalModule;
});

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const preferencesWith = (blockPreviewAndExportOnDiagnosticErrors: boolean) => ({
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
