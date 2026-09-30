// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

// The real runner needs a preview launcher (and a browser): only the call it
// receives matters here, so it is replaced by a fake recording it.
const mockRunProjectGameplayTests = jest.fn<Array<any>, any>();
jest.mock('../GameplayTests/GameplayTestRunner', () => ({
  ...jest.requireActual('../GameplayTests/GameplayTestRunner'),
  runProjectGameplayTests: (...args: Array<any>) =>
    mockRunProjectGameplayTests(...args),
}));

const gd: libGDevelop = global.gd;

const STORED_SOURCE = 'await harness.goToScene("Scene");';

const makePassedResult = (testName: string) => ({
  testName,
  status: 'passed',
  framesExecuted: 10,
  durationMs: 100,
  loadingMs: 10,
  timeoutMs: 30000,
  hiddenStallMs: 0,
  gameTimeMs: 160,
  assertions: [],
  errors: [],
  consoleLogs: [],
  eventLog: [],
  finalState: null,
});

describe('run_gameplay_test', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    mockRunProjectGameplayTests.mockReset();
    mockRunProjectGameplayTests.mockImplementation(({ tests }) =>
      Promise.resolve([makePassedResult(tests[0].testName)])
    );
  });

  afterEach(() => {
    project.delete();
  });

  const addStoredTest = (testName: string) => {
    const testsContainer = project.getTests();
    const test = testsContainer.insertNewTest(
      testName,
      testsContainer.getTestsCount()
    );
    test.setSource(STORED_SOURCE);
    return test;
  };

  const launch = (args: Object): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.run_gameplay_test.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args,
    });

  const getRunTest = () =>
    mockRunProjectGameplayTests.mock.calls[0][0].tests[0];

  it('runs the stored test as-is when `source` is omitted', async () => {
    addStoredTest('MyTest');

    const result = await launch({
      scope: { type: 'project' },
      test_name: 'MyTest',
    });

    expect(result.success).toBe(true);
    expect(getRunTest().source).toBe(undefined);
    expect(
      project
        .getTests()
        .getTest('MyTest')
        .getSource()
    ).toBe(STORED_SOURCE);
    expect(result.meta).toBe(undefined);
  });

  it.each([['an empty string', ''], ['whitespace only', '   \n  ']])(
    'runs the stored test as-is (and keeps its source) when `source` is %s',
    async (_label, source) => {
      addStoredTest('MyTest');

      const result = await launch({
        scope: { type: 'project' },
        test_name: 'MyTest',
        source,
        description: '',
        persist: true,
      });

      expect(result.success).toBe(true);
      // The blank source must never reach the runner nor the project.
      expect(getRunTest().source).toBe(undefined);
      expect(
        project
          .getTests()
          .getTest('MyTest')
          .getSource()
      ).toBe(STORED_SOURCE);
      expect(result.meta).toBe(undefined);
    }
  );

  it('does not create an empty test when `source` is blank and no test exists', async () => {
    const result = await launch({
      scope: { type: 'project' },
      test_name: 'MissingTest',
      source: '',
      persist: true,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('No test named "MissingTest"');
    expect(project.getTests().hasTestNamed('MissingTest')).toBe(false);
    expect(mockRunProjectGameplayTests).not.toHaveBeenCalled();
  });

  it('still creates and runs a test when a real `source` is given', async () => {
    const newSource = 'await harness.stepFrames(5);';

    const result = await launch({
      scope: { type: 'project' },
      test_name: 'NewTest',
      source: newSource,
      description: 'Checks something',
    });

    expect(result.success).toBe(true);
    expect(getRunTest().source).toBe(newSource);
    expect(
      project
        .getTests()
        .getTest('NewTest')
        .getSource()
    ).toBe(newSource);
    expect(
      project
        .getTests()
        .getTest('NewTest')
        .getDescription()
    ).toBe('Checks something');
    expect(result.meta).toEqual({ didModifyProject: true });
  });

  it('still updates an existing test when a real `source` is given', async () => {
    addStoredTest('MyTest');
    const newSource = 'await harness.stepFrames(42);';

    const result = await launch({
      scope: { type: 'project' },
      test_name: 'MyTest',
      source: newSource,
    });

    expect(result.success).toBe(true);
    expect(getRunTest().source).toBe(newSource);
    expect(
      project
        .getTests()
        .getTest('MyTest')
        .getSource()
    ).toBe(newSource);
    expect(result.meta).toEqual({ didModifyProject: true });
  });

  it('runs an unsaved source without touching the stored test when `persist` is false', async () => {
    addStoredTest('MyTest');
    const probeSource = 'await harness.stepFrames(1);';

    const result = await launch({
      scope: { type: 'project' },
      test_name: 'MyTest',
      source: probeSource,
      persist: false,
    });

    expect(result.success).toBe(true);
    expect(getRunTest().source).toBe(probeSource);
    expect(
      project
        .getTests()
        .getTest('MyTest')
        .getSource()
    ).toBe(STORED_SOURCE);
    expect(result.meta).toBe(undefined);
  });

  describe('getModifiesProject', () => {
    it.each([
      ['a blank source does not modify the project', { source: '' }, false],
      [
        'a whitespace source does not modify the project',
        { source: '  ' },
        false,
      ],
      ['no source does not modify the project', {}, false],
      ['a real source modifies the project', { source: STORED_SOURCE }, true],
      [
        'a real source not persisted does not modify the project',
        { source: STORED_SOURCE, persist: false },
        false,
      ],
    ])('%s', (_label, args, expected) => {
      expect(
        editorFunctions.run_gameplay_test.getModifiesProject &&
          editorFunctions.run_gameplay_test.getModifiesProject(args)
      ).toBe(expected);
    });
  });
});
