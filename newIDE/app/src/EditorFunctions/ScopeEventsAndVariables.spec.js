// @flow
import {
  editorFunctions,
  noEventsInFunctionText,
  noEventsInSceneText,
  type EditorFunctionGenericOutput,
  type RenderForEditorOptions,
} from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import {
  BOTH_GIVEN_DISAGREE_MESSAGE,
  NAMED_VARIANT_REJECTED_MESSAGE,
} from './Scope';
import { EXTENSION_STORE_ORIGIN_NAME } from './SimplifiedProject/SimplifiedExtensions';

const gd: libGDevelop = global.gd;

/**
 * A project with a scene and an extension "UI" holding:
 * - a free function `ShowToast`,
 * - a custom behavior `Blink` (a property, a shared property, a function),
 * - a custom object `Dialog` (children `Back` and `Label`, a property, a
 *   function, and a named variant `Dark` complied to the default one).
 * Plus a read-only extension coming from the extension store.
 */
const createFakeProjectWithCustomObject = (project: gdProject) => {
  project.insertNewLayout('Level', 0);

  const extension = project.insertNewEventsFunctionsExtension('UI', 0);
  extension
    .getGlobalVariables()
    .insertNew('Score', 0)
    .setValue(0);
  extension
    .getSceneVariables()
    .insertNew('Level', 0)
    .setValue(1);
  extension.getEventsFunctions().insertNewEventsFunction('ShowToast', 0);

  const eventsBasedBehavior = extension
    .getEventsBasedBehaviors()
    .insertNew('Blink', 0);
  eventsBasedBehavior.getPropertyDescriptors().insertNew('Speed', 0);
  eventsBasedBehavior.getSharedPropertyDescriptors().insertNew('Sync', 0);
  const toggleFunction = eventsBasedBehavior
    .getEventsFunctions()
    .insertNewEventsFunction('Toggle', 0);
  toggleFunction
    .getParameters()
    .addNewParameter('Object')
    .setType('object');
  toggleFunction
    .getParameters()
    .addNewParameter('Behavior')
    .setType('behavior');

  const eventsBasedObject = extension
    .getEventsBasedObjects()
    .insertNew('Dialog', 0);
  eventsBasedObject.getPropertyDescriptors().insertNew('Title', 0);
  eventsBasedObject.getObjects().insertNewObject(project, 'Sprite', 'Back', 0);
  eventsBasedObject
    .getObjects()
    .insertNewObject(project, 'TextObject::Text', 'Label', 1);
  const openFunction = eventsBasedObject
    .getEventsFunctions()
    .insertNewEventsFunction('Open', 0);
  openFunction
    .getParameters()
    .addNewParameter('Object')
    .setType('object');
  openFunction
    .getParameters()
    .addNewParameter('Duration')
    .setType('number');
  eventsBasedObject.getVariants().insertNewVariant('Dark', 0);
  gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
    project,
    eventsBasedObject
  );

  const storeExtension = project.insertNewEventsFunctionsExtension('Health', 1);
  storeExtension.setOrigin(EXTENSION_STORE_ORIGIN_NAME, 'Health');
  storeExtension
    .getGlobalVariables()
    .insertNew('MaxHealth', 0)
    .setValue(100);

  return {
    extension,
    eventsBasedObject,
    eventsBasedBehavior,
  };
};

const getChildObject = (
  project: gdProject,
  variantName: string,
  objectName: string
): gdObject => {
  const eventsBasedObject = project
    .getEventsFunctionsExtension('UI')
    .getEventsBasedObjects()
    .get('Dialog');
  const variant = variantName
    ? eventsBasedObject.getVariants().getVariant(variantName)
    : eventsBasedObject.getDefaultVariant();
  return variant.getObjects().getObject(objectName);
};

const dialogVariantScope = (variantName: string) => ({
  type: 'custom_object_variant',
  extension_name: 'UI',
  custom_object_name: 'Dialog',
  variant_name: variantName,
});

describe('scope of the events and variables functions', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    createFakeProjectWithCustomObject(project);
  });

  afterEach(() => {
    project.delete();
  });

  const launch = async (
    functionName: string,
    args: any,
    options?: Object
  ): Promise<EditorFunctionGenericOutput> =>
    editorFunctions[functionName].launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      ...options,
      args,
    });

  // `renderForEditor` gets the raw arguments of any version: it must never
  // throw because `scene_name` is not there anymore.
  it('renders a description of every scope', () => {
    const { editorCallbacks } = makeFakeLaunchFunctionOptionsWithProject(
      project
    );
    const render = (functionName: string, args: any) => {
      const { renderForEditor } = editorFunctions[functionName];
      if (!renderForEditor) throw new Error('renderForEditor is not defined.');
      const options: RenderForEditorOptions = {
        project,
        args,
        editorCallbacks,
        shouldShowDetails: true,
        editorFunctionCallResultOutput: null,
        exampleShortHeaders: null,
      };
      return renderForEditor(options).text;
    };

    const customObjectScope = {
      type: 'custom_object',
      extension_name: 'UI',
      custom_object_name: 'Dialog',
    };
    expect(
      render('read_scene_events', {
        scope: { type: 'scene', scene_name: 'Level' },
      })
    ).toBeTruthy();
    expect(
      render('read_events_source', {
        scope: customObjectScope,
        function_name: 'Open',
      })
    ).toBeTruthy();
    expect(
      render('read_events_source', { scope: customObjectScope })
    ).toBeTruthy();
    expect(
      render('add_scene_events', {
        scope: customObjectScope,
        events_description: 'Open the dialog',
      })
    ).toBeTruthy();
    expect(
      render('add_scene_events', {
        scope: customObjectScope,
        function_name: 'Open',
        events_description: 'Open the dialog',
      })
    ).toBeTruthy();
    expect(
      render('add_or_edit_variable', {
        scope: dialogVariantScope(''),
        variable_scope: 'object',
        object_name: 'Back',
        variable_name_or_path: 'Hp',
        value: '3',
      })
    ).toBeTruthy();
    expect(
      render('inspect_variables', {
        scope: { type: 'extension', extension_name: 'UI' },
        variable_scope: 'global',
      })
    ).toBeTruthy();
  });

  describe('add_or_edit_variable', () => {
    it('refuses to add a child object variable on a named variant, and propagates it from the default variant', async () => {
      const rejected = await launch('add_or_edit_variable', {
        scope: dialogVariantScope('Dark'),
        variable_scope: 'object',
        object_name: 'Back',
        variable_name_or_path: 'Hp',
        value: '3',
      });

      expect(rejected.success).toBe(false);
      expect(rejected.message).toBe(NAMED_VARIANT_REJECTED_MESSAGE);
      expect(
        getChildObject(project, 'Dark', 'Back')
          .getVariables()
          .has('Hp')
      ).toBe(false);

      const accepted = await launch('add_or_edit_variable', {
        scope: dialogVariantScope(''),
        variable_scope: 'object',
        object_name: 'Back',
        variable_name_or_path: 'Hp',
        value: '3',
      });

      expect(accepted.success).toBe(true);
      expect(accepted.message).toBe(
        'Added custom object "UI::Dialog" (default variant) object "Back" variable "Hp" (Number) = 3'
      );
      expect(
        getChildObject(project, '', 'Back')
          .getVariables()
          .get('Hp')
          .getValue()
      ).toBe(3);
      // The named variants inherit the variables of the default variant.
      expect(
        getChildObject(project, 'Dark', 'Back')
          .getVariables()
          .get('Hp')
          .getValue()
      ).toBe(3);
    });

    it('allows editing the value of an existing child variable on a named variant', async () => {
      await launch('add_or_edit_variable', {
        scope: dialogVariantScope(''),
        variable_scope: 'object',
        object_name: 'Back',
        variable_name_or_path: 'Hp',
        value: '3',
      });

      const result = await launch('add_or_edit_variable', {
        scope: dialogVariantScope('Dark'),
        variable_scope: 'object',
        object_name: 'Back',
        variable_name_or_path: 'Hp',
        value: '7',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Edited custom object "UI::Dialog" (variant "Dark") object "Back" variable "Hp" = 7'
      );
      expect(
        getChildObject(project, 'Dark', 'Back')
          .getVariables()
          .get('Hp')
          .getValue()
      ).toBe(7);
      // The default variant keeps its own value.
      expect(
        getChildObject(project, '', 'Back')
          .getVariables()
          .get('Hp')
          .getValue()
      ).toBe(3);
    });

    it('refuses to delete a child object variable on a named variant', async () => {
      await launch('add_or_edit_variable', {
        scope: dialogVariantScope(''),
        variable_scope: 'object',
        object_name: 'Back',
        variable_name_or_path: 'Hp',
        value: '3',
      });

      const result = await launch('add_or_edit_variable', {
        scope: dialogVariantScope('Dark'),
        variable_scope: 'object',
        variables: [
          { variable_name_or_path: 'Hp', delete_this_variable: true },
        ],
        object_name: 'Back',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(NAMED_VARIANT_REJECTED_MESSAGE);
      expect(
        getChildObject(project, 'Dark', 'Back')
          .getVariables()
          .has('Hp')
      ).toBe(true);
    });

    it('adds a global variable with a project scope', async () => {
      const result = await launch('add_or_edit_variable', {
        scope: { type: 'project' },
        variable_scope: 'global',
        variable_name_or_path: 'HighScore',
        value: '42',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Added global variable "HighScore" (Number) = 42'
      );
      expect(
        project
          .getVariables()
          .get('HighScore')
          .getValue()
      ).toBe(42);
    });

    it('fails on a scene variable with a project scope', async () => {
      const result = await launch('add_or_edit_variable', {
        scope: { type: 'project' },
        variable_scope: 'scene',
        variable_name_or_path: 'Lives',
        value: '3',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Missing "scene_name" (required for scene variable).'
      );
    });

    it('fails on an object not found globally with a project scope', async () => {
      const result = await launch('add_or_edit_variable', {
        scope: { type: 'project' },
        variable_scope: 'object',
        object_name: 'Ghost',
        variable_name_or_path: 'Hp',
        value: '3',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Object or group "Ghost" not found globally. Did you forget to specify scene_name?'
      );
    });

    it('adds a variable to the scene variables of an extension', async () => {
      const result = await launch('add_or_edit_variable', {
        scope: { type: 'extension', extension_name: 'UI' },
        variable_scope: 'scene',
        variable_name_or_path: 'Opened',
        value: 'true',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Added extension "UI" scene variables variable "Opened" (Boolean) = true'
      );
      expect(
        project
          .getEventsFunctionsExtension('UI')
          .getSceneVariables()
          .get('Opened')
          .getBool()
      ).toBe(true);
    });

    it('fails on a variable scope an extension has no container for', async () => {
      const result = await launch('add_or_edit_variable', {
        scope: { type: 'extension', extension_name: 'UI' },
        variable_scope: 'object',
        object_name: 'Back',
        variable_name_or_path: 'Hp',
        value: '3',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'variable_scope "object" is not available in extension "UI": use "scene" or "global" (the extension variables).'
      );
    });

    it('fails on a scene or global variable inside a custom object variant', async () => {
      const result = await launch('add_or_edit_variable', {
        scope: dialogVariantScope(''),
        variable_scope: 'global',
        variable_name_or_path: 'Score',
        value: '3',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'variable_scope "global" is not available in custom object "UI::Dialog" (default variant): use "object", "group" or "instance" (for the variables of the project, use scope { type: "project" } with variable_scope "global").'
      );
    });

    it('refuses to change the variables of an extension installed from the store', async () => {
      const result = await launch('add_or_edit_variable', {
        scope: { type: 'extension', extension_name: 'Health' },
        variable_scope: 'global',
        variable_name_or_path: 'MaxHealth',
        value: '200',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        '"Health" comes from the GDevelop extension store'
      );
      expect(
        project
          .getEventsFunctionsExtension('Health')
          .getGlobalVariables()
          .get('MaxHealth')
          .getValue()
      ).toBe(100);
    });
  });

  describe('inspect_variables', () => {
    it('reads the global and scene variables of an extension', async () => {
      const globalResult = await launch('inspect_variables', {
        scope: { type: 'extension', extension_name: 'UI' },
        variable_scope: 'global',
      });

      expect(globalResult.success).toBe(true);
      expect(globalResult.message).toBe(
        'Variables of extension "UI" global variables.'
      );
      expect(globalResult.variables).toEqual([
        { variableName: 'Score', type: 'Number', value: '0' },
      ]);

      const sceneResult = await launch('inspect_variables', {
        scope: { type: 'extension', extension_name: 'UI' },
        variable_scope: 'scene',
      });

      expect(sceneResult.success).toBe(true);
      expect(sceneResult.message).toBe(
        'Variables of extension "UI" scene variables.'
      );
      expect(sceneResult.variables).toEqual([
        { variableName: 'Level', type: 'Number', value: '1' },
      ]);
    });

    it('reads the variables of a child object of a variant', async () => {
      getChildObject(project, 'Dark', 'Back')
        .getVariables()
        .insertNew('Hp', 0)
        .setValue(12);

      const result = await launch('inspect_variables', {
        scope: dialogVariantScope('Dark'),
        variable_scope: 'object',
        object_name: 'Back',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Variables of custom object "UI::Dialog" (variant "Dark") object "Back".'
      );
      expect(result.variables).toEqual([
        { variableName: 'Hp', type: 'Number', value: '12' },
      ]);
    });

    it('fails on a child object that does not exist', async () => {
      const result = await launch('inspect_variables', {
        scope: dialogVariantScope(''),
        variable_scope: 'object',
        object_name: 'Ghost',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Object or group "Ghost" not found in custom object "UI::Dialog" (default variant). Existing child objects: "Back", "Label".'
      );
    });

    it('reads the variables of an extension installed from the store (reads are allowed)', async () => {
      const result = await launch('inspect_variables', {
        scope: { type: 'extension', extension_name: 'Health' },
        variable_scope: 'global',
      });

      expect(result.success).toBe(true);
      expect(result.variables).toEqual([
        { variableName: 'MaxHealth', type: 'Number', value: '100' },
      ]);
    });
  });

  describe('read_events_source', () => {
    it('reads a function of a custom object, with the summary of what it can use', async () => {
      const result = await launch('read_events_source', {
        scope: {
          type: 'custom_object',
          extension_name: 'UI',
          custom_object_name: 'Dialog',
        },
        function_name: 'Open',
      });

      expect(result.success).toBe(true);
      expect(result.eventsForScopeLabel).toBe('custom object "UI::Dialog"');
      expect(result.functionName).toBe('Open');
      // What the function can use is also written at the top of the source as
      // `#` comments (ignored by the EventScript parser).
      expect(result.eventScript).toBe(
        [
          '# parameters: Object (object), Duration (number)',
          '# properties: Title',
          '# child objects: Back, Label',
          '# extension variables: global Score; scene Level',
          noEventsInFunctionText,
        ].join('\n')
      );
      expect(result.eventsForSceneNamed).toBeUndefined();
      expect(result.scopeSummary).toEqual({
        parameters: [
          { name: 'Object', type: 'object' },
          { name: 'Duration', type: 'number' },
        ],
        properties: ['Title'],
        childObjects: ['Back', 'Label'],
        extensionVariables: { global: ['Score'], scene: ['Level'] },
      });
    });

    it('reads a function of a custom behavior, with its shared properties', async () => {
      const result = await launch('read_events_source', {
        scope: {
          type: 'custom_behavior',
          extension_name: 'UI',
          custom_behavior_name: 'Blink',
        },
        function_name: 'Toggle',
      });

      expect(result.success).toBe(true);
      expect(result.eventsForScopeLabel).toBe('custom behavior "UI::Blink"');
      expect(result.scopeSummary).toEqual({
        parameters: [
          { name: 'Object', type: 'object' },
          { name: 'Behavior', type: 'behavior' },
        ],
        properties: ['Speed', 'Sync'],
        extensionVariables: { global: ['Score'], scene: ['Level'] },
      });
    });

    it('lists the functions when function_name is missing', async () => {
      const result = await launch('read_events_source', {
        scope: {
          type: 'custom_object',
          extension_name: 'UI',
          custom_object_name: 'Dialog',
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        '`function_name` is required for custom object "UI::Dialog". Existing functions: "Open".'
      );
    });

    it('lists the functions when the function does not exist', async () => {
      const result = await launch('read_events_source', {
        scope: { type: 'extension', extension_name: 'UI' },
        function_name: 'Missing',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Function "Missing" not found in extension "UI". Existing functions: "ShowToast".'
      );
    });

    it('reads a scene given as a scope, with the scene output', async () => {
      project
        .getLayout('Level')
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

      const result = await launch('read_events_source', {
        scope: { type: 'scene', scene_name: 'Level' },
      });

      expect(result.success).toBe(true);
      expect(result.eventsForSceneNamed).toBe('Level');
      expect(result.eventsForScopeLabel).toBeUndefined();
      expect(result.scopeSummary).toBeUndefined();
      expect(result.eventScript).not.toBe(noEventsInSceneText);
    });

    it('fails when scene_name and scope disagree', async () => {
      const result = await launch('read_events_source', {
        scene_name: 'Level',
        scope: {
          type: 'custom_object',
          extension_name: 'UI',
          custom_object_name: 'Dialog',
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(BOTH_GIVEN_DISAGREE_MESSAGE);
    });
  });

  describe('read_scene_events', () => {
    it('reads a scene given as a scope', async () => {
      const result = await launch('read_scene_events', {
        scope: { type: 'scene', scene_name: 'Level' },
      });

      expect(result.success).toBe(true);
      expect(result.eventsForSceneNamed).toBe('Level');
      expect(result.eventsAsText).toBe(noEventsInSceneText);
    });

    it('refuses a scope that is not a scene', async () => {
      const result = await launch('read_scene_events', {
        scope: { type: 'extension', extension_name: 'UI' },
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        '`scope.type` "extension" is not accepted here: use one of "scene".'
      );
    });
  });

  describe('add_scene_events', () => {
    const makeArgs = (scope: any) => ({
      scope,
      events_description: 'Open the dialog when the player presses space',
      extension_names_list: '',
      objects_list: '',
    });

    it('requires a function_name in a custom object, listing its functions', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const generateEvents = jest.fn();

      const result = await launch(
        'add_scene_events',
        makeArgs({
          type: 'custom_object',
          extension_name: 'UI',
          custom_object_name: 'Dialog',
        }),
        { generateEvents }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        '`function_name` is required for custom object "UI::Dialog". Existing functions: "Open".'
      );
      expect(generateEvents).not.toHaveBeenCalled();
    });

    it('requires a function_name in an extension, listing its functions', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const generateEvents = jest.fn();

      const result = await launch(
        'add_scene_events',
        makeArgs({ type: 'extension', extension_name: 'UI' }),
        { generateEvents }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        '`function_name` is required for extension "UI". Existing functions: "ShowToast".'
      );
      expect(generateEvents).not.toHaveBeenCalled();
    });

    // `append_to_scene` is the legacy spelling of `append_to_end`: both are
    // accepted and sent to the generation backend unchanged.
    it.each(['append_to_scene', 'append_to_end'])(
      'sends the placement relation "%s" unchanged',
      async placementRelation => {
        // $FlowFixMe[underconstrained-implicit-instantiation]
        const generateEvents = jest.fn().mockResolvedValue({
          generationAborted: true,
        });

        await launch(
          'add_scene_events',
          {
            scope: { type: 'scene', scene_name: 'Level' },
            extension_names_list: '',
            objects_list: '',
            event_batches: [
              {
                events_description: 'Open the dialog',
                placement_relation: placementRelation,
              },
            ],
          },
          { generateEvents }
        );

        expect(generateEvents).toHaveBeenCalledWith(
          expect.objectContaining({
            eventBatches: [
              expect.objectContaining({ placementRelation: placementRelation }),
            ],
          })
        );
      }
    );

    it('generates events of the scene named by the scope', async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const generateEvents = jest.fn().mockResolvedValue({
        generationAborted: true,
      });

      const result = await launch(
        'add_scene_events',
        makeArgs({ type: 'scene', scene_name: 'Level' }),
        { generateEvents }
      );

      expect(result.success).toBe(false);
      expect(result.aborted).toBe(true);
      expect(generateEvents).toHaveBeenCalledWith(
        expect.objectContaining({ sceneName: 'Level' })
      );
    });
  });
});
