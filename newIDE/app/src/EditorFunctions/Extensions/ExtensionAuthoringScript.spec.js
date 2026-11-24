// @flow
import { editorFunctions, editorFunctionsWithoutProject } from '..';
import { executeScript } from '../ScriptExecution/ScriptRunner';
import { buildExposedScriptFunctions } from '../ScriptExecution/ExposedFunctions';
import {
  makeFakeI18n,
  makeFakeLaunchFunctionOptionsWithProject,
} from '../TestHelpers';
import {
  reloadProjectEventsFunctionsExtensionMetadata,
  type EventsFunctionCodeWriter,
} from '../../EventsFunctionsExtensionsLoader';

const gd: libGDevelop = global.gd;

const createFakeEventsFunctionCodeWriter = (): EventsFunctionCodeWriter => ({
  getIncludeFileFor: (functionName: string) => `${functionName}.js`,
  writeFunctionCode: () => Promise.resolve(),
  writeBehaviorCode: () => Promise.resolve(),
  writeObjectCode: () => Promise.resolve(),
});

describe('authoring an extension from a script', () => {
  let project: gdProject;
  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    const scene = project.insertNewLayout('Level', 0);
    scene.getObjects().insertNewObject(project, 'Sprite', 'Enemy', 0);
  });
  afterEach(() => {
    project.delete();
  });

  it('creates an extension, a behavior with its properties and functions, then puts the behavior on a scene object', async () => {
    // The regeneration the editor does when a function needs fresh metadata.
    let regenerationsCount = 0;
    let regenerationsBeforeAddBehavior = -1;
    // The collaborators are the launch options without the call itself.
    const {
      args: unusedArgs,
      project: unusedProject,
      ...collaborators
    } = makeFakeLaunchFunctionOptionsWithProject(project);
    const launchOptions = {
      ...collaborators,
      ensureExtensionsUpToDate: () => {
        regenerationsCount++;
        reloadProjectEventsFunctionsExtensionMetadata(
          project,
          project.getEventsFunctionsExtension('Combat'),
          createFakeEventsFunctionCodeWriter(),
          makeFakeI18n()
        );
        return Promise.resolve();
      },
    };
    const addBehavior = editorFunctions.add_behavior;
    const exposedFunctions = buildExposedScriptFunctions({
      editorFunctions: {
        ...editorFunctions,
        add_behavior: {
          ...addBehavior,
          launchFunction: options => {
            regenerationsBeforeAddBehavior = regenerationsCount;
            return addBehavior.launchFunction(options);
          },
        },
      },
      editorFunctionsWithoutProject,
      launchOptions,
      project,
    });

    const result = await executeScript({
      jsCode: [
        `const extension = await create_extension({ extension_name: 'Combat', full_name: 'Combat' });`,
        `const behavior = await create_custom_behavior({ extension_name: extension.extensionName, custom_behavior_name: 'Patrol' });`,
        `await change_custom_behavior({`,
        `  extension_name: 'Combat', custom_behavior_name: 'Patrol',`,
        `  changed_properties: [{ property_name: 'Speed', type: 'Number', default_value: '100' }, { property_name: 'Radius', type: 'Number' }],`,
        `  changed_shared_properties: [{ property_name: 'PathLayer', type: 'Layer' }],`,
        `});`,
        `const scope = { type: 'custom_behavior', extension_name: 'Combat', custom_behavior_name: 'Patrol' };`,
        `await create_custom_function({ scope, function_name: 'doStepPreEvents' });`,
        `const chase = await create_custom_function({`,
        `  scope, function_name: 'Chase', function_type: 'Action',`,
        `  parameters: [`,
        `    { name: 'Target', type: 'objectList' },`,
        `    { name: 'TargetPatrol', type: 'behavior', extra_info: 'Combat::Patrol' },`,
        `    { name: 'TargetOtherPatrol', type: 'behavior', extra_info: 'Combat::Patrol' },`,
        `  ],`,
        `});`,
        `const added = await add_behavior({ scope: { type: 'scene', scene_name: 'Level' }, object_name: 'Enemy', behavior_type: behavior.behaviorType });`,
        `return { behaviorType: behavior.behaviorType, callForms: chase.callForms, added };`,
      ].join('\n'),
      exposedFunctions,
    });

    expect(result.error).toBe(null);
    expect(result.success).toBe(true);
    const { behaviorType, callForms, added } = result.returnValue;
    expect(behaviorType).toBe('Combat::Patrol');
    expect(callForms.join('\n')).toContain('Chase(');
    expect(added.success).toBe(true);

    // The behavior type was regenerated before `add_behavior` validated it.
    expect(regenerationsBeforeAddBehavior).toBeGreaterThan(0);
    expect(
      gd.MetadataProvider.isBadBehaviorMetadata(
        gd.MetadataProvider.getBehaviorMetadata(
          project.getCurrentPlatform(),
          'Combat::Patrol'
        )
      )
    ).toBe(false);
    const enemy = project
      .getLayout('Level')
      .getObjects()
      .getObject('Enemy');
    // Besides its built-in capabilities, the object now has the new behavior.
    const behaviorTypes = enemy
      .getAllBehaviorNames()
      .toJSArray()
      .map(name => enemy.getBehavior(name).getTypeName());
    expect(behaviorTypes).toContain('Combat::Patrol');
    const patrol = project
      .getEventsFunctionsExtension('Combat')
      .getEventsBasedBehaviors()
      .get('Patrol');
    expect(patrol.getPropertyDescriptors().has('Speed')).toBe(true);
    expect(
      patrol
        .getSharedPropertyDescriptors()
        .get('PathLayer')
        .getType()
    ).toBe('Layer');
    expect(patrol.getEventsFunctions().hasEventsFunctionNamed('Chase')).toBe(
      true
    );
  });
});
