// @flow
/* global globalThis */

import {
  getInitialPreferences,
  loadPreferencesFromLocalStorage,
} from './PreferencesProvider';

describe('PreferencesProvider', () => {
  const globalScope: any = globalThis;
  const previousLocalStorage = globalScope.localStorage;

  beforeEach(() => {
    const storedValues: { [string]: string } = {};
    globalScope.localStorage = {
      getItem: (key: string) => storedValues[key] || null,
      setItem: (key: string, value: string) => {
        storedValues[key] = value;
      },
      clear: () => {
        for (const key in storedValues) delete storedValues[key];
      },
    };
  });

  afterEach(() => {
    if (previousLocalStorage) {
      globalScope.localStorage = previousLocalStorage;
    } else {
      delete globalScope.localStorage;
    }
  });

  test('uses the diagnostic and advanced preferences defaults', () => {
    expect(getInitialPreferences()).toMatchObject({
      openDiagnosticReportAutomatically: true,
      blockPreviewAndExportOnDiagnosticErrors: true,
      showExperimentalExtensions: true,
      showDeprecatedInstructionWarning: 'icon-and-deprecated-warning-text',
      showJsTypeError: true,
    });
    expect(getInitialPreferences()).not.toHaveProperty(
      'mcpServerAuthorizationToken'
    );
  });

  test('removes obsolete MCP authorization tokens from stored preferences', () => {
    localStorage.setItem(
      'gd-preferences',
      JSON.stringify({
        ...getInitialPreferences(),
        mcpServerAuthorizationToken: 'obsolete-token',
      })
    );

    expect(loadPreferencesFromLocalStorage()).not.toHaveProperty(
      'mcpServerAuthorizationToken'
    );
  });
});
