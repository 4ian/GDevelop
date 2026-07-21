// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('add_or_edit_variable', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('TestScene', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('forces a numeric-looking value to be stored as a string', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'code',
          variable_scope: 'global',
          value: '123',
          variable_type: 'string',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe('Added global variable "code" (String) = 123');
    const variable = project.getVariables().get('code');
    expect(variable.getType()).toBe(gd.Variable.String);
    expect(variable.getString()).toBe('123');
  });

  it('infers a boolean variable from a "true" value', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'isPaused',
          variable_scope: 'global',
          value: 'true',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'Added global variable "isPaused" (Boolean) = true'
    );
    const variable = project.getVariables().get('isPaused');
    expect(variable.getType()).toBe(gd.Variable.Boolean);
    expect(variable.getBool()).toBe(true);
  });

  // A malformed path used to throw out of the whole call, losing the report
  // of the variables already applied earlier in the batch.
  it('applies the valid items of a batch and warns about the malformed ones', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'global',
          variables: [
            { variable_name_or_path: 'score', value: '100' },
            // Malformed array index: this item alone must fail.
            { variable_name_or_path: 'items[x]', value: '1' },
            { variable_name_or_path: 'playerName', value: 'Alex' },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toEqual(
      expect.stringContaining('Added global variable "score" (Number) = 100')
    );
    expect(result.message).toEqual(
      expect.stringContaining(
        'Added global variable "playerName" (String) = Alex'
      )
    );
    expect(result.message).toEqual(
      expect.stringContaining(
        'Could not change global variable "items[x]": Content of the index is invalid ("x") - it should be a number.'
      )
    );
    // Both valid items were really applied, the malformed one was not.
    expect(
      project
        .getVariables()
        .get('score')
        .getValue()
    ).toBe(100);
    expect(
      project
        .getVariables()
        .get('playerName')
        .getString()
    ).toBe('Alex');
    expect(project.getVariables().has('items')).toBe(false);
  });

  it('warns (and stores nothing) when a forced number has a non-numeric value', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'score',
          variable_scope: 'global',
          value: 'lots',
          variable_type: 'number',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining(
        'Could not change global variable "score": Value "lots" is not a valid number'
      )
    );
    // No NaN variable was created.
    expect(project.getVariables().has('score')).toBe(false);
  });

  it('fails on an invalid variable_scope', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'score',
          variable_scope: 'world',
          value: '1',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Invalid "variable_scope": "world". Use `scene`, `object`, `group` or `global`.'
    );
  });

  it('fails when scene_name is missing for a scene variable', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'lives',
          variable_scope: 'scene',
          value: '3',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Missing "scene_name" (required for scene variable).'
    );
  });

  it('fails when object_name is missing for an object variable', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'health',
          variable_scope: 'object',
          scene_name: 'TestScene',
          value: '100',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Missing "object_name" (required for an object or group variable).'
    );
  });

  it('fails when the object is not found in the scene', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'health',
          variable_scope: 'object',
          scene_name: 'TestScene',
          object_name: 'Ghost',
          value: '100',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Object or group "Ghost" not in scene "TestScene". For a global object, omit scene_name.'
    );
  });

  it('fails when the object is not found globally (no scene_name)', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_name_or_path: 'health',
          variable_scope: 'object',
          object_name: 'Ghost',
          value: '100',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Object or group "Ghost" not found globally. Did you forget to specify scene_name?'
    );
  });

  it('fails when the "variables" list is empty', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'global',
          variables: [],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No variable to change (the "variables" list is empty).'
    );
  });

  it('fails when every variable item is skipped (no value, not a deletion)', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'global',
          variables: [{ variable_name_or_path: 'orphan' }],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Variable "orphan" was skipped: no "value" provided and it was not marked for deletion.'
    );
    expect(project.getVariables().has('orphan')).toBe(false);
  });

  it('still succeeds when only some variable items are skipped', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_or_edit_variable.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          variable_scope: 'global',
          variables: [
            { variable_name_or_path: 'score', value: '10' },
            { variable_name_or_path: 'orphan' },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Added global variable "score" (Number) = 10'
    );
    expect(result.message).toContain(
      'Variable "orphan" was skipped: no "value" provided and it was not marked for deletion.'
    );
    expect(
      project
        .getVariables()
        .get('score')
        .getValue()
    ).toBe(10);
    expect(project.getVariables().has('orphan')).toBe(false);
  });
});
