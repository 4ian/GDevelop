// @flow

import { setupAutocompletions } from './LocalCodeEditorAutocompletions';

describe('Local JavaScript event autocompletions', () => {
  test('loads only the curated public runtime declaration and event context', () => {
    const addExtraLib = jest.fn();
    setupAutocompletions({
      languages: {
        typescript: {
          javascriptDefaults: { addExtraLib },
        },
      },
    });

    expect(addExtraLib).toHaveBeenCalledTimes(2);
    const runtimeDeclaration = addExtraLib.mock.calls[0][0];
    expect(runtimeDeclaration).toContain('class RuntimeScene');
    expect(runtimeDeclaration).toContain('class RuntimeObject');
    expect(runtimeDeclaration).not.toContain('_instances');
    expect(runtimeDeclaration).not.toContain('evtsExt__');
    expect(addExtraLib.mock.calls[0][1]).toBe('gdevelop-runtime-api.d.ts');
  });
});
