// @flow
// $FlowFixMe[cannot-resolve-module]
import fs from 'fs';
// $FlowFixMe[cannot-resolve-module]
import path from 'path';
import { getPublicApi, PUBLIC_API_TOOLS_VERSION } from '.';
import { editorFunctions } from '..';

describe('PublicApi', () => {
  const publicApi = getPublicApi();

  it('is the version the editor functions are pinned to', () => {
    expect(publicApi.toolsVersion).toBe(PUBLIC_API_TOOLS_VERSION);
  });

  it('describes functions the editor implements, with their argument schemas', () => {
    expect(publicApi.functions.length).toBeGreaterThan(20);
    for (const publicApiFunction of publicApi.functions) {
      expect(editorFunctions[publicApiFunction.name]).toBeDefined();
      expect(publicApiFunction.description).toBeTruthy();
      expect(publicApiFunction.inputSchema.type).toBe('object');
    }
  });

  it('includes the events generation and the script runner', () => {
    const functionNames = publicApi.functions.map(
      publicApiFunction => publicApiFunction.name
    );
    expect(functionNames).toContain('generate_events');
    expect(functionNames).toContain('run_script');
  });

  it('has a script API definition declaring every function a script can call', () => {
    for (const publicApiFunction of publicApi.functions) {
      if (publicApiFunction.name === 'run_script') continue;
      expect(publicApi.scriptApiDefinition).toContain(
        `declare function ${publicApiFunction.name}(`
      );
    }
  });

  it('has the EventScript guide', () => {
    expect(publicApi.eventScriptGuide).toContain('always:');
    expect(publicApi.eventScriptGuide).toContain('js """');
  });

  it('has the gameplay test harness guide', () => {
    expect(publicApi.gameplayHarnessGuide).toContain('interface Harness');
    expect(publicApi.gameplayHarnessGuide).toContain('stepFrames(');
    expect(publicApi.gameplayHarnessGuide).toContain('setRenderingMode(');
    expect(publicApi.gameplayHarnessGuide).not.toContain(
      'GAMEPLAY_HARNESS_EXTENSIONS_DEFINITION'
    );
  });

  it('has the helpers added to the harness by every extension', () => {
    // $FlowFixMe[cannot-resolve-name]
    const extensionsPath = path.join(__dirname, '../../../../../Extensions');
    const documentations = fs
      .readdirSync(extensionsPath)
      .map(folderName =>
        path.join(extensionsPath, folderName, 'gameplay-tests.md')
      )
      .filter(documentationPath => fs.existsSync(documentationPath))
      .map(documentationPath => fs.readFileSync(documentationPath, 'utf8'));

    expect(documentations.length).toBeGreaterThan(0);
    for (const documentation of documentations) {
      // Headings are one level lower in the guide.
      expect(publicApi.gameplayHarnessGuide).toContain(
        documentation.replace(/^## /gm, '### ').trim()
      );
    }
  });
});
