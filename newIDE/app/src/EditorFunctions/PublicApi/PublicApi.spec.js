// @flow
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
  });
});
