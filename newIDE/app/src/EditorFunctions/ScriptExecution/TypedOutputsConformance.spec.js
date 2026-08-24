// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from '..';
import { makeFakeLaunchFunctionOptionsWithProject } from '../TestHelpers';
import schemasFixture from './TypedOutputsSchemas.fixture.json';

const gd: libGDevelop = global.gd;

/**
 * Conformance test for the "typed reads" whose output shapes the generation-api
 * declares (so scripts can iterate/filter them without guessing field names).
 * It validates the REAL outputs of the typed functions against the vendored
 * schema fixture (a copy of the backend `script-api/output-types.js`). If a
 * shape drifts, this fails — keep the fixture in sync with the backend.
 */

// Every function declared in the fixture must have a test below: a newly typed
// read whose real output is never checked would let the backend promise a shape
// the editor does not return.
const TESTED_TYPED_FUNCTION_NAMES = [
  'describe_instances',
  'inspect_variables',
  'inspect_object_properties_effects',
  'inspect_behavior_properties',
  'inspect_scene_properties_layers_effects',
  'inspect_project_properties_resources',
  'read_events_source',
  'read_game_project_json',
  'add_behavior',
];

const sharedTypes = schemasFixture.sharedOutputTypes;
const toolSchemas = schemasFixture.toolOutputSchemas;

const resolve = (schema: any): any =>
  schema && schema.$namedType ? sharedTypes[schema.$namedType] : schema;

// Validates a value against a (possibly $namedType) schema. `$rawType` fields
// (e.g. `number | null`) are not strictly checked. Only declared fields are
// checked; extra fields are allowed (all these types are open-ended).
const validateValue = (value: any, schema: any, path: string): void => {
  if (!schema || schema.$rawType) return;
  const resolved = resolve(schema);
  if (!resolved) throw new Error(`Unresolved schema at ${path}`);

  if (resolved.type === 'string') {
    expect(typeof value).toBe('string');
    return;
  }
  if (resolved.type === 'number') {
    expect(typeof value).toBe('number');
    return;
  }
  if (resolved.type === 'boolean') {
    expect(typeof value).toBe('boolean');
    return;
  }
  if (resolved.type === 'array') {
    expect(Array.isArray(value)).toBe(true);
    (value || []).forEach((item, index) =>
      validateValue(item, resolved.items, `${path}[${index}]`)
    );
    return;
  }
  if (resolved.type === 'object') {
    expect(value && typeof value === 'object').toBeTruthy();
    const required = resolved.required || [];
    for (const requiredKey of required) {
      // Required field must be present (not undefined) on every item.
      expect({ path, requiredKey, has: requiredKey in value }).toEqual({
        path,
        requiredKey,
        has: true,
      });
    }
    for (const [key, propSchema] of Object.entries(resolved.properties || {})) {
      if (value[key] !== undefined && value[key] !== null) {
        validateValue(value[key], propSchema, `${path}.${key}`);
      }
    }
  }
};

const validateResultAgainstSchema = (result: any, toolName: string) => {
  const schema = toolSchemas[toolName];
  expect(schema).toBeTruthy();
  validateValue(result, schema, toolName);
};

describe('typed outputs conformance (script API declared reads)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    // An instance so describe_instances returns at least one SimplifiedInstance.
    const instance = testScene.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('Player');
    instance.setX(10);
    instance.setY(20);
    // A scene variable so inspect_variables returns at least one.
    testScene
      .getVariables()
      .insertNew('Score', 0)
      .setValue(0);
  });

  afterEach(() => {
    project.delete();
  });

  it('has a conformance test for every typed function declared by the backend', () => {
    expect(Object.keys(toolSchemas).sort()).toEqual(
      [...TESTED_TYPED_FUNCTION_NAMES].sort()
    );
  });

  it('describe_instances output conforms to DescribeInstancesResult', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(result, 'describe_instances');
    expect((result.instances || []).length).toBeGreaterThan(0);
  });

  it('inspect_variables output conforms to InspectVariablesResult', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_variables.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { variable_scope: 'scene', scene_name: 'TestScene' },
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(result, 'inspect_variables');
  });

  it('inspect_object_properties_effects output conforms', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene', object_name: 'Player' },
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(result, 'inspect_object_properties_effects');
  });

  it('inspect_scene_properties_layers_effects output conforms', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(
      result,
      'inspect_scene_properties_layers_effects'
    );
    // The base layer is always there, so a script can always read a layer name.
    expect((result.layers || []).length).toBeGreaterThan(0);
  });

  it('inspect_project_properties_resources output conforms', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {},
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(result, 'inspect_project_properties_resources');
    expect(result.sceneNames || []).toContain('TestScene');
  });

  it('inspect_project_properties_resources output conforms when listing resources', async () => {
    // `resources` is only returned when asked for: check that shape too.
    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_project_properties_resources.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { list_all_resources: true },
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(result, 'inspect_project_properties_resources');
  });

  // The only declared WRITE: `add_behavior` picks the behavior name, so a script
  // can only chain on it if the call reports it.
  it('add_behavior output conforms and reports the name it assigned', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          behavior_type: 'DestroyOutsideBehavior::DestroyOutside',
        },
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(result, 'add_behavior');
    // The reported name is the one the behavior really got on the object, so it
    // can be passed straight to `change_behavior_property`.
    const [added] = result.addedBehaviors || [];
    expect(added.objectName).toBe('Player');
    expect(added.behaviorType).toBe('DestroyOutsideBehavior::DestroyOutside');
    expect(
      testScene
        .getObjects()
        .getObject('Player')
        .hasBehaviorNamed(added.behaviorName)
    ).toBe(true);
  });

  it('add_behavior reports the name of a behavior that was already there', async () => {
    const args = {
      scene_name: 'TestScene',
      object_name: 'Player',
      behavior_type: 'DestroyOutsideBehavior::DestroyOutside',
    };
    const first: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
      { ...makeFakeLaunchFunctionOptionsWithProject(project), args }
    );
    const second: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
      { ...makeFakeLaunchFunctionOptionsWithProject(project), args }
    );

    expect(second.success).toBe(true);
    validateResultAgainstSchema(second, 'add_behavior');
    // Re-running a script must give the same usable name, not an empty list.
    expect(second.addedBehaviors).toEqual(first.addedBehaviors);
  });

  it('read_game_project_json output conforms', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.read_game_project_json.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { path: 'scenes[*].sceneName' },
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(result, 'read_game_project_json');
    expect(result.result).toEqual(['TestScene']);
  });

  it('read_events_source output conforms', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.read_events_source.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(result, 'read_events_source');
    expect(typeof result.eventScript).toBe('string');
  });

  it('inspect_behavior_properties output conforms', async () => {
    // Add a behavior so there are properties to inspect.
    const playerObject = testScene.getObjects().getObject('Player');
    playerObject.addNewBehavior(
      project,
      'DestroyOutsideBehavior::DestroyOutside',
      'DestroyOutside'
    );
    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_behavior_properties.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          behavior_name: 'DestroyOutside',
        },
      }
    );
    expect(result.success).toBe(true);
    validateResultAgainstSchema(result, 'inspect_behavior_properties');
  });
});
