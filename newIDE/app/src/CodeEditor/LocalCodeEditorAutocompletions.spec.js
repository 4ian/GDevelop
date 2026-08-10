// @flow

import { setupAutocompletions } from './LocalCodeEditorAutocompletions';

describe('Local JavaScript event autocompletions', () => {
  test('loads the curated public runtime declaration and script contexts', () => {
    const addExtraLib = jest.fn();
    setupAutocompletions({
      languages: {
        typescript: {
          javascriptDefaults: { addExtraLib },
        },
      },
    });

    expect(addExtraLib).toHaveBeenCalledTimes(3);
    const runtimeDeclaration = addExtraLib.mock.calls[0][0];
    expect(runtimeDeclaration).toContain('class RuntimeScene');
    expect(runtimeDeclaration).toContain('class RuntimeObject');
    expect(runtimeDeclaration).not.toContain('_instances');
    expect(runtimeDeclaration).not.toContain('evtsExt__');
    expect(addExtraLib.mock.calls[0][1]).toBe('gdevelop-runtime-api.d.ts');

    const gameplayTestDeclaration = addExtraLib.mock.calls[2][0];
    expect(gameplayTestDeclaration).toContain('declare const harness');
    expect(gameplayTestDeclaration).toContain('GameplayTestHarness');
    expect(addExtraLib.mock.calls[2][1]).toBe(
      'gdevelop-gameplay-test-context.d.ts'
    );
  });
});
