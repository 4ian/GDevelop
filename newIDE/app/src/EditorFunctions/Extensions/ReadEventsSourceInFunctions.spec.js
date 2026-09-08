// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from '../index';
import {
  makeFakeI18n,
  makeFakeLaunchFunctionOptionsWithProject,
} from '../TestHelpers';
import { unserializeFromJSObject } from '../../Utils/Serializer';
import {
  reloadProjectEventsFunctionsExtensionMetadata,
  type EventsFunctionCodeWriter,
} from '../../EventsFunctionsExtensionsLoader';
import healthExtensionJson from '../../fixtures/HealthExtension.json';
import tankConfigurationExtensionJson from '../../fixtures/TankConfigurationExtension.json';

const gd: libGDevelop = global.gd;

const createFakeEventsFunctionCodeWriter = (): EventsFunctionCodeWriter => ({
  getIncludeFileFor: (functionName: string) => `${functionName}.js`,
  writeFunctionCode: () => Promise.resolve(),
  writeBehaviorCode: () => Promise.resolve(),
  writeObjectCode: () => Promise.resolve(),
});

// The events of a function are rendered with the generated metadata of the
// extensions: register it like the editor does after any change.
const createFakeExtensionFromJson = (
  project: gdProject,
  extensionName: string,
  extensionJson: Object
): gdEventsFunctionsExtension => {
  const extension = project.insertNewEventsFunctionsExtension(
    extensionName,
    project.getEventsFunctionsExtensionsCount()
  );
  unserializeFromJSObject(extension, extensionJson, 'unserializeFrom', project);
  reloadProjectEventsFunctionsExtensionMetadata(
    project,
    extension,
    createFakeEventsFunctionCodeWriter(),
    makeFakeI18n()
  );
  return extension;
};

describe('read_events_source in a function of an extension', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
  });

  afterEach(() => {
    project.delete();
  });

  const launch = async (args: any): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.read_events_source.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args,
    });

  it('shows the parameters and properties of a behavior function as comments', async () => {
    createFakeExtensionFromJson(project, 'Health', healthExtensionJson);

    const result = await launch({
      scope: {
        type: 'custom_behavior',
        extension_name: 'Health',
        custom_behavior_name: 'Health',
      },
      function_name: 'TriggerDamageCooldown',
    });

    expect(result.success).toBe(true);
    expect(result.eventsForScopeLabel).toBe('custom behavior "Health::Health"');
    expect(result.functionName).toBe('TriggerDamageCooldown');

    const eventScript = result.eventScript || '';
    const headerLines = eventScript
      .split('\n')
      .filter(line => line.startsWith('#'));
    // What the events can use, as `#` comments (ignored by the EventScript
    // parser, so the source stays valid if it is sent back as is).
    expect(headerLines[0]).toBe(
      '# parameters: Object (object), Behavior (behavior)'
    );
    expect(headerLines[1]).toContain(
      '# properties: Health, CurrentHealth, MaxHealth, DamageCooldown'
    );
    // A behavior has no child object, and this extension has no variables of
    // its own: no line for them.
    expect(eventScript).not.toContain('# child objects:');
    expect(eventScript).not.toContain('# extension variables:');
    // The events themselves follow the comments (a property name would also
    // appear in the header, so the body is checked without the comments).
    const body = eventScript
      .split('\n')
      .filter(line => !line.startsWith('#'))
      .join('\n');
    expect(body).toContain(
      'Mark that the object was hit at least once (used for initial state of damage cooldown)'
    );

    // The structured summary is still returned next to the source.
    const scopeSummary = result.scopeSummary;
    if (!scopeSummary) throw new Error('Expected a scope summary.');
    expect(scopeSummary.parameters).toEqual([
      { name: 'Object', type: 'object' },
      { name: 'Behavior', type: 'behavior' },
    ]);
    expect(scopeSummary.properties).toContain('MaxHealth');
    expect(scopeSummary.childObjects).toBeUndefined();
  });

  it('shows the child objects and extension variables of a custom object function as comments', async () => {
    createFakeExtensionFromJson(
      project,
      'TankConfiguration',
      tankConfigurationExtensionJson
    );

    const result = await launch({
      scope: {
        type: 'custom_object',
        extension_name: 'TankConfiguration',
        custom_object_name: 'CombinedTank',
      },
      function_name: 'SetTopRotation',
    });

    expect(result.success).toBe(true);
    const eventScript = result.eventScript || '';
    const headerLines = eventScript
      .split('\n')
      .filter(line => line.startsWith('#'));
    expect(headerLines).toEqual([
      // `SetTopRotation` is an "action with operator": the value it sets is
      // not a declared parameter of the function.
      '# parameters: Object (object)',
      '# properties: CannonAngle, TopRotation',
      '# child objects: TankBase, TankTop_Combined',
      '# extension variables: scene CannonWidth',
    ]);
    const body = eventScript
      .split('\n')
      .filter(line => !line.startsWith('#'))
      .join('\n');
    // The action of the function: the top follows the rotation.
    expect(body).toContain('RotateTowardAngle(TankTop_Combined, TopRotation');
  });

  it('does not add any comment when reading the events of a scene', async () => {
    const scene = project.insertNewLayout('Level', 0);
    scene
      .getEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

    const result = await launch({
      scope: { type: 'scene', scene_name: 'Level' },
    });

    expect(result.success).toBe(true);
    expect(result.eventScript || '').not.toContain('# parameters:');
    expect(result.scopeSummary).toBeUndefined();
  });
});
