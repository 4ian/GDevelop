// @flow
/* global globalThis */

import {
  generateMcpServerAuthorizationToken,
  getInitialPreferences,
} from './PreferencesProvider';

describe('PreferencesProvider', () => {
  test('uses the diagnostic and advanced preferences defaults', () => {
    expect(getInitialPreferences()).toMatchObject({
      openDiagnosticReportAutomatically: true,
      blockPreviewAndExportOnDiagnosticErrors: true,
      showExperimentalExtensions: true,
      showDeprecatedInstructionWarning: 'icon-and-deprecated-warning-text',
      showJsTypeError: true,
    });
  });

  describe('generateMcpServerAuthorizationToken', () => {
    const globalScope: any = globalThis;
    const previousWindow = globalScope.window;

    afterEach(() => {
      if (previousWindow) {
        globalScope.window = previousWindow;
      } else {
        delete globalScope.window;
      }
    });

    test('generates a compact base64url token from crypto bytes', () => {
      const getRandomValues = jest.fn((bytes: Uint8Array) => {
        for (let index = 0; index < bytes.length; index++) {
          bytes[index] = index;
        }
        return bytes;
      });

      globalScope.window = {
        crypto: {
          getRandomValues,
        },
      };

      const token = generateMcpServerAuthorizationToken();

      expect(getRandomValues).toHaveBeenCalledTimes(1);
      expect(token).toBe('mcp-AAECAwQFBgcICQoLDA0ODw');
      expect(token).toHaveLength(26);
    });
  });
});
