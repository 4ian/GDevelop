// @flow
import {
  runScript,
  type ExposedScriptFunction,
  type ScriptFunctionCallRecord,
  type ScriptExecutionResult,
  type ScriptExecutionError,
} from './ScriptRunner';
import { type EditorFunctionGenericOutput } from '..';

// The runner is deliberately independent from `gd` and from the real editor
// functions: it only needs functions following the `launchFunction` contract.
// This lets these tests run with fakes, like the runner will be wired to the
// real `editorFunctions` registry later.

const makeFakeFunction = ({
  name,
  modifiesProject,
  launch,
}: {|
  name: string,
  modifiesProject?: boolean,
  // Fakes return arbitrary output fields, like the real tools do.
  launch?: (args: any) => Promise<Object>,
|}): ExposedScriptFunction => ({
  name,
  modifiesProject: !!modifiesProject,
  launch: (args: any): Promise<EditorFunctionGenericOutput> => {
    const launchOrDefault =
      launch ||
      (async (ignoredArgs: any) => ({
        success: true,
        message: `${name} done`,
      }));
    // Fake outputs carry arbitrary fields, like the real tools outputs.
    return (launchOrDefault(args): any);
  },
});

const getErrorOrThrow = (
  result: ScriptExecutionResult
): ScriptExecutionError => {
  const { error } = result;
  if (!error) throw new Error('Expected the script to have an error.');
  return error;
};

describe('runScript', () => {
  it('runs a script calling several functions sequentially and reports everything', async () => {
    const calls: Array<{ name: string, args: any }> = [];
    const createScene = makeFakeFunction({
      name: 'create_scene',
      modifiesProject: true,
      launch: async args => {
        calls.push({ name: 'create_scene', args });
        return { success: true, message: 'Scene created.' };
      },
    });
    const inspectVariables = makeFakeFunction({
      name: 'inspect_variables',
      launch: async args => {
        calls.push({ name: 'inspect_variables', args });
        return {
          success: true,
          variables: [{ name: 'Score', value: 42 }],
        };
      },
    });

    const result = await runScript({
      jsCode: [
        `const inspection = await inspect_variables({ scene_name: 'Level' });`,
        `console.log('Found variables:', inspection.variables.length);`,
        `for (let i = 0; i < 2; i++) {`,
        `  await create_scene({ scene_name: 'Level' + i });`,
        `}`,
        `return inspection.variables[0].value;`,
      ].join('\n'),
      exposedFunctions: [createScene, inspectVariables],
    });

    expect(result.success).toBe(true);
    expect(result.returnValue).toBe(42);
    expect(result.consoleLogs).toEqual(['Found variables: 1']);
    expect(result.error).toBe(null);
    expect(calls).toEqual([
      { name: 'inspect_variables', args: { scene_name: 'Level' } },
      { name: 'create_scene', args: { scene_name: 'Level0' } },
      { name: 'create_scene', args: { scene_name: 'Level1' } },
    ]);
    expect(
      result.functionCallRecords.map(
        (record: ScriptFunctionCallRecord) => record.functionName
      )
    ).toEqual(['inspect_variables', 'create_scene', 'create_scene']);
    expect(result.functionCallRecords[1].didModifyProject).toBe(true);
    expect(result.functionCallRecords[0].didModifyProject).toBeUndefined();
  });

  it('stops at the first function call returning success: false, keeping previous results', async () => {
    let secondFunctionCalled = false;
    const failing = makeFakeFunction({
      name: 'failing_function',
      launch: async () => ({
        success: false,
        message: 'Object not found.',
      }),
    });
    const neverReached = makeFakeFunction({
      name: 'never_reached',
      launch: async () => {
        secondFunctionCalled = true;
        return { success: true };
      },
    });
    const working = makeFakeFunction({ name: 'working_function' });

    const result = await runScript({
      jsCode: [
        `await working_function({});`,
        `await failing_function({ object_name: 'Ghost' });`,
        `await never_reached({});`,
      ].join('\n'),
      exposedFunctions: [failing, neverReached, working],
    });

    expect(result.success).toBe(false);
    expect(secondFunctionCalled).toBe(false);
    expect(result.functionCallRecords).toHaveLength(2);
    expect(result.functionCallRecords[0].success).toBe(true);
    expect(result.functionCallRecords[1]).toEqual({
      functionName: 'failing_function',
      args: { object_name: 'Ghost' },
      success: false,
      output: { message: 'Object not found.' },
      didModifyProject: undefined,
    });
    const error = getErrorOrThrow(result);
    expect(error.message).toContain('failing_function');
    expect(error.message).toContain('Object not found.');
    expect(error.lastCalledFunctionName).toBe('failing_function');
  });

  it('records a thrown error in a function as a failed call and stops the script', async () => {
    const throwing = makeFakeFunction({
      name: 'throwing_function',
      launch: async () => {
        throw new Error('Missing required argument scene_name.');
      },
    });

    const result = await runScript({
      jsCode: `await throwing_function({});`,
      exposedFunctions: [throwing],
    });

    expect(result.success).toBe(false);
    expect(result.functionCallRecords).toHaveLength(1);
    expect(result.functionCallRecords[0].success).toBe(false);
    expect(result.functionCallRecords[0].output.message).toBe(
      'Missing required argument scene_name.'
    );
  });

  it('reports the line number of a script error (not tied to a function call)', async () => {
    const result = await runScript({
      jsCode: [
        `const value = 1;`,
        `console.log('before the error');`,
        `null.someProperty; // line 3`,
      ].join('\n'),
      exposedFunctions: [],
    });

    expect(result.success).toBe(false);
    expect(result.consoleLogs).toEqual(['before the error']);
    const error = getErrorOrThrow(result);
    expect(error.lineNumber).toBe(3);
    expect(error.lastCalledFunctionName).toBe(null);
  });

  it('reports syntax errors without crashing', async () => {
    const result = await runScript({
      jsCode: `const oops = {;`,
      exposedFunctions: [],
    });

    expect(result.success).toBe(false);
    const error = getErrorOrThrow(result);
    expect(error.message.length).toBeGreaterThan(0);
  });

  it('refuses concurrent function calls (missing await, Promise.all)', async () => {
    const slow = makeFakeFunction({
      name: 'slow_function',
      launch: async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { success: true };
      },
    });

    const result = await runScript({
      jsCode: [
        `const first = slow_function({}); // no await`,
        `await slow_function({});`,
        `await first;`,
      ].join('\n'),
      exposedFunctions: [slow],
    });

    expect(result.success).toBe(false);
    const error = getErrorOrThrow(result);
    expect(error.message).toContain('sequentially');
  });

  it('stops runaway loops after the maximum number of function calls', async () => {
    const counting = makeFakeFunction({ name: 'counting_function' });

    const result = await runScript({
      jsCode: [`while (true) {`, `  await counting_function({});`, `}`].join(
        '\n'
      ),
      exposedFunctions: [counting],
      maxFunctionCallsCount: 5,
    });

    expect(result.success).toBe(false);
    expect(result.functionCallRecords).toHaveLength(5);
    const error = getErrorOrThrow(result);
    expect(error.message).toContain('5');
  });

  it('shadows the browser globals inside the script', async () => {
    const result = await runScript({
      jsCode: [
        `return {`,
        `  windowType: typeof window,`,
        `  documentType: typeof document,`,
        `  fetchType: typeof fetch,`,
        `  processType: typeof process,`,
        `};`,
      ].join('\n'),
      exposedFunctions: [],
    });

    expect(result.success).toBe(true);
    expect(result.returnValue).toEqual({
      windowType: 'undefined',
      documentType: 'undefined',
      fetchType: 'undefined',
      processType: 'undefined',
    });
  });

  it('captures console logs of all levels, formatting objects', async () => {
    const result = await runScript({
      jsCode: [
        `console.log('a string', { key: 'value' }, 42);`,
        `console.warn('careful');`,
        `console.error('failed');`,
      ].join('\n'),
      exposedFunctions: [],
    });

    expect(result.success).toBe(true);
    expect(result.consoleLogs).toEqual([
      'a string {"key":"value"} 42',
      '[warning] careful',
      '[error] failed',
    ]);
  });

  it('gives the function result back to the script, so it can branch on it', async () => {
    const inspect = makeFakeFunction({
      name: 'inspect_something',
      launch: async () => ({
        success: true,
        instances: [{ id: 'instance-1' }, { id: 'instance-2' }],
      }),
    });
    const act = makeFakeFunction({
      name: 'act_on_instance',
      modifiesProject: true,
    });

    const result = await runScript({
      jsCode: [
        `const inspection = await inspect_something({});`,
        `for (const instance of inspection.instances) {`,
        `  await act_on_instance({ id: instance.id });`,
        `}`,
        `return inspection.instances.length;`,
      ].join('\n'),
      exposedFunctions: [inspect, act],
    });

    expect(result.success).toBe(true);
    expect(result.returnValue).toBe(2);
    expect(result.functionCallRecords).toHaveLength(3);
    expect(result.functionCallRecords[1].args).toEqual({ id: 'instance-1' });
    expect(result.functionCallRecords[2].args).toEqual({ id: 'instance-2' });
  });
});
