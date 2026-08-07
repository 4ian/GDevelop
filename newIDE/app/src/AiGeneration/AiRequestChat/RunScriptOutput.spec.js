// @flow
import {
  parseRunScriptArguments,
  parseRunScriptOutput,
  groupScriptRecords,
} from './RunScriptOutput';

describe('parseRunScriptArguments', () => {
  it('reads the title and the code of a script', () => {
    expect(
      parseRunScriptArguments(
        JSON.stringify({ title: 'Place the coins', js_code: 'return 1;' })
      )
    ).toEqual({ title: 'Place the coins', jsCode: 'return 1;' });
  });

  it('tolerates missing, wrongly typed or unparsable arguments', () => {
    expect(parseRunScriptArguments('{}')).toEqual({ title: null, jsCode: '' });
    expect(
      parseRunScriptArguments(JSON.stringify({ title: 42, js_code: [] }))
    ).toEqual({ title: null, jsCode: '' });
    expect(parseRunScriptArguments('not json')).toEqual({
      title: null,
      jsCode: '',
    });
  });
});

describe('parseRunScriptOutput', () => {
  it('reads the calls, logs, result and error of a script', () => {
    const scriptRun = parseRunScriptOutput({
      success: false,
      functionCallRecords: [
        {
          functionName: 'create_or_replace_object',
          args: { scene_name: 'Level1', object_name: 'Coin' },
          success: true,
          output: { message: 'Created object "Coin".' },
        },
        {
          functionName: 'put_2d_instances',
          args: { scene_name: 'Level1', object_name: 'Coni' },
          success: false,
          output: { message: 'Object not found: "Coni".' },
        },
      ],
      consoleLogs: ['Placed 1 coin.'],
      returnValue: 'Stopped early.',
      error: {
        message: 'Function "put_2d_instances" failed.',
        lineNumber: null,
        lastCalledFunctionName: 'put_2d_instances',
      },
    });

    expect(scriptRun.records).toHaveLength(2);
    expect(scriptRun.records[0]).toEqual({
      functionName: 'create_or_replace_object',
      message: 'Created object "Coin".',
      argumentsText: '{\n  "scene_name": "Level1",\n  "object_name": "Coin"\n}',
      argumentsSummary: 'scene_name: "Level1", object_name: "Coin"',
      isFailed: false,
      hasChangedNothing: false,
    });
    expect(scriptRun.records[1].isFailed).toBe(true);
    expect(scriptRun.consoleLogs).toEqual(['Placed 1 coin.']);
    expect(scriptRun.resultText).toBe('Stopped early.');
    expect(scriptRun.isResultTextual).toBe(true);
    expect(scriptRun.error).toEqual({
      message: 'Function "put_2d_instances" failed.',
      lineNumber: null,
      lastCalledFunctionName: 'put_2d_instances',
    });
  });

  it('reads the line number of a script that could not be compiled', () => {
    const scriptRun = parseRunScriptOutput({
      success: false,
      functionCallRecords: [],
      error: { message: 'SyntaxError', lineNumber: 2 },
    });

    expect(scriptRun.records).toEqual([]);
    expect(scriptRun.error).toEqual({
      message: 'SyntaxError',
      lineNumber: 2,
      lastCalledFunctionName: null,
    });
  });

  it('marks a no-op call (nothing changed) as a success', () => {
    const scriptRun = parseRunScriptOutput({
      success: true,
      functionCallRecords: [
        {
          functionName: 'put_2d_instances',
          args: {},
          success: true,
          output: { message: 'Nothing changed.', nothingChanged: true },
        },
      ],
    });

    expect(scriptRun.records[0].isFailed).toBe(false);
    expect(scriptRun.records[0].hasChangedNothing).toBe(true);
  });

  it('shows a non textual result as code', () => {
    expect(parseRunScriptOutput({ returnValue: { count: 2 } })).toMatchObject({
      resultText: '{\n  "count": 2\n}',
      isResultTextual: false,
    });
  });

  it('tolerates a missing, malformed or partial output', () => {
    const emptyScriptRun = {
      records: [],
      consoleLogs: [],
      resultText: null,
      isResultTextual: false,
      error: null,
    };
    expect(parseRunScriptOutput(null)).toEqual(emptyScriptRun);
    expect(parseRunScriptOutput('a string')).toEqual(emptyScriptRun);
    expect(
      parseRunScriptOutput({
        functionCallRecords: 'not an array',
        consoleLogs: [1, 'kept'],
        error: { lineNumber: 3 },
      })
    ).toEqual({ ...emptyScriptRun, consoleLogs: ['kept'] });
  });

  it('names a record made without a function name, and keeps its arguments as text', () => {
    const scriptRun = parseRunScriptOutput({
      functionCallRecords: [
        { args: '…[truncated from 3980 chars]', success: true, output: {} },
      ],
    });

    expect(scriptRun.records[0]).toEqual({
      functionName: '(unknown)',
      message: null,
      argumentsText: '…[truncated from 3980 chars]',
      argumentsSummary: '…[truncated from 3980 chars]',
      isFailed: false,
      hasChangedNothing: false,
    });
  });
});

describe('groupScriptRecords', () => {
  const makeRecord = (functionName: string) =>
    parseRunScriptOutput({
      functionCallRecords: [{ functionName, args: {}, success: true }],
    }).records[0];

  it('gathers the consecutive calls made to the same function', () => {
    const groups = groupScriptRecords([
      makeRecord('create_or_replace_object'),
      makeRecord('put_2d_instances'),
      makeRecord('put_2d_instances'),
      makeRecord('put_2d_instances'),
      makeRecord('add_or_edit_variable'),
      makeRecord('put_2d_instances'),
    ]);

    expect(
      groups.map(group => [group.functionName, group.records.length])
    ).toEqual([
      ['create_or_replace_object', 1],
      ['put_2d_instances', 3],
      ['add_or_edit_variable', 1],
      ['put_2d_instances', 1],
    ]);
  });

  it('returns no group for no record', () => {
    expect(groupScriptRecords([])).toEqual([]);
  });
});
