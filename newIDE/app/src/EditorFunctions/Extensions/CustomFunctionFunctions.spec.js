// @flow
import { mapFor } from '../../Utils/MapFor';
import {
  reloadProjectEventsFunctionsExtensionMetadata,
  type EventsFunctionCodeWriter,
} from '../../EventsFunctionsExtensionsLoader';
import {
  type EditorFunction,
  type EditorFunctionGenericOutput,
  type LaunchFunctionOptionsWithProject,
  type RenderForEditorOptions,
} from '../index';
import {
  makeFakeI18n,
  makeFakeLaunchFunctionOptionsWithProject,
} from '../TestHelpers';
import {
  changeCustomFunction,
  createCustomFunction,
} from './CustomFunctionFunctions';

const gd: libGDevelop = global.gd;

const extensionScope = { type: 'extension', extension_name: 'MyExt' };
const behaviorScope = {
  type: 'custom_behavior',
  extension_name: 'MyExt',
  custom_behavior_name: 'MyBehavior',
};
const objectScope = {
  type: 'custom_object',
  extension_name: 'MyExt',
  custom_object_name: 'MyButton',
};

/** An extension with a behavior and a custom object, and a scene using them. */
const createFakeProject = () => {
  // $FlowFixMe[invalid-constructor]
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
  extension.setFullName('My extension');
  const eventsBasedBehavior = extension
    .getEventsBasedBehaviors()
    .insertNew('MyBehavior', 0);
  eventsBasedBehavior.setObjectType('Sprite');
  extension.getEventsBasedObjects().insertNew('MyButton', 0);

  const layout = project.insertNewLayout('Level', 0);
  const object = layout
    .getObjects()
    .insertNewObject(project, 'Sprite', 'Player', 0);
  object.addNewBehavior(project, 'MyExt::MyBehavior', 'MyBehavior');
  return { project, extension, layout, object };
};

const createFakeEventsFunctionCodeWriter = (): EventsFunctionCodeWriter => ({
  getIncludeFileFor: (functionName: string) => `${functionName}.js`,
  writeFunctionCode: () => Promise.resolve(),
  writeBehaviorCode: () => Promise.resolve(),
  writeObjectCode: () => Promise.resolve(),
});

const launchFunction = async (
  editorFunction: EditorFunction,
  project: gdProject,
  args: Object
): Promise<{|
  output: EditorFunctionGenericOutput,
  fakeOptions: LaunchFunctionOptionsWithProject,
|}> => {
  const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
  const output = await editorFunction.launchFunction({ ...fakeOptions, args });
  return { output, fakeOptions };
};

/**
 * Like `launchFunction`, but the editor really regenerates the extension when
 * the function asks for it: the call forms then come from the platform
 * metadata instead of the declaration. The platform keeps the generated
 * extension for the whole test file: only use it on its own extension.
 */
const launchFunctionWithGeneratedMetadata = async (
  editorFunction: EditorFunction,
  project: gdProject,
  extensionName: string,
  args: Object
): Promise<EditorFunctionGenericOutput> => {
  const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
  return editorFunction.launchFunction({
    ...fakeOptions,
    args,
    ensureExtensionsUpToDate: () => {
      reloadProjectEventsFunctionsExtensionMetadata(
        project,
        project.getEventsFunctionsExtension(extensionName),
        createFakeEventsFunctionCodeWriter(),
        makeFakeI18n()
      );
      return Promise.resolve();
    },
  });
};

const getParameterNames = (eventsFunction: gdEventsFunction): Array<string> => {
  const parameters = eventsFunction.getParameters();
  return mapFor(0, parameters.getParametersCount(), index =>
    parameters.getParameterAt(index).getName()
  );
};

const getParameterTypes = (eventsFunction: gdEventsFunction): Array<string> => {
  const parameters = eventsFunction.getParameters();
  return mapFor(0, parameters.getParametersCount(), index =>
    parameters.getParameterAt(index).getType()
  );
};

describe('CustomFunctionFunctions', () => {
  let project: gdProject;
  let extension: gdEventsFunctionsExtension;
  let layout: gdLayout;

  beforeEach(() => {
    ({ project, extension, layout } = createFakeProject());
  });

  afterEach(() => {
    project.delete();
  });

  const getFreeFunction = (name: string): gdEventsFunction =>
    extension.getEventsFunctions().getEventsFunction(name);
  const getBehaviorFunction = (name: string): gdEventsFunction =>
    extension
      .getEventsBasedBehaviors()
      .get('MyBehavior')
      .getEventsFunctions()
      .getEventsFunction(name);
  const getObjectFunction = (name: string): gdEventsFunction =>
    extension
      .getEventsBasedObjects()
      .get('MyButton')
      .getEventsFunctions()
      .getEventsFunction(name);

  it('renders a description of each call in the chat', () => {
    const { editorCallbacks } = makeFakeLaunchFunctionOptionsWithProject(
      project
    );
    const makeOptions = (args: Object): RenderForEditorOptions => ({
      project,
      args,
      editorCallbacks,
      shouldShowDetails: false,
      editorFunctionCallResultOutput: null,
      exampleShortHeaders: null,
    });
    const args = { scope: behaviorScope, function_name: 'Hit' };

    const { renderForEditor: renderCreate } = createCustomFunction;
    const { renderForEditor: renderChange } = changeCustomFunction;
    if (!renderCreate || !renderChange)
      throw new Error('renderForEditor is not defined.');
    expect(renderCreate(makeOptions(args)).text).toBeTruthy();
    expect(renderChange(makeOptions(args)).text).toBeTruthy();
    expect(
      renderChange(makeOptions({ ...args, delete_this_function: true })).text
    ).toBeTruthy();
    // A free function has no behavior nor custom object in its scope.
    expect(
      renderCreate(
        makeOptions({ scope: extensionScope, function_name: 'Explode' })
      ).text
    ).toBeTruthy();
  });

  describe('create_custom_function', () => {
    it('creates a free function with an object and two behavior parameters', async () => {
      const { output, fakeOptions } = await launchFunction(
        createCustomFunction,
        project,
        {
          scope: extensionScope,
          function_name: 'Explode',
          function_type: 'Action',
          full_name: 'Explode',
          parameters: [
            { name: 'Target', type: 'objectList', extra_info: 'Sprite' },
            {
              name: 'Physics',
              type: 'behavior',
              extra_info: 'MyExt::MyBehavior',
            },
            {
              name: 'Damageable',
              type: 'behavior',
              extra_info: 'MyExt::MyBehavior',
            },
          ],
        }
      );

      expect(output.success).toBe(true);
      expect(output.extensionName).toBe('MyExt');
      expect(output.functionName).toBe('Explode');
      expect(output.functionType).toBe('Action');
      // Both behaviors are picked on the object parameter before them.
      expect(getParameterNames(getFreeFunction('Explode'))).toEqual([
        'Target',
        'Physics',
        'Damageable',
      ]);
      expect(output.callForms).toEqual([
        'MyExt::Explode(Target, Physics, Damageable)',
      ]);
      expect(
        fakeOptions.onExtensionsModifiedOutsideEditor
      ).toHaveBeenCalledWith({
        extensionNames: ['MyExt'],
        needsCodeRegeneration: true,
      });
      // No regeneration per call: the flush at the end of the batch does it.
      expect(fakeOptions.ensureExtensionsUpToDate).not.toHaveBeenCalled();
    });

    it('creates a behavior function after its implicit parameters', async () => {
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        function_type: 'Action',
        parameters: [
          { name: 'Target', type: 'object', extra_info: 'Sprite' },
          { name: 'Damage', type: 'expression' },
        ],
      });

      expect(output.success).toBe(true);
      const eventsFunction = getBehaviorFunction('Hit');
      expect(getParameterNames(eventsFunction)).toEqual([
        'Object',
        'Behavior',
        'Target',
        'Damage',
      ]);
      // `object` is normalized to the parameter type of the function editor.
      expect(getParameterTypes(eventsFunction)).toEqual([
        'object',
        'behavior',
        'objectList',
        'expression',
      ]);
      expect(output.callForms).toEqual([
        'MyExt::MyBehavior::Hit(Object, Behavior, Target, Damage)',
      ]);
    });

    it('creates a custom object function after its implicit parameter', async () => {
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: objectScope,
        function_name: 'Press',
        function_type: 'Action',
        parameters: [{ name: 'Force', type: 'expression' }],
      });

      expect(output.success).toBe(true);
      expect(getParameterNames(getObjectFunction('Press'))).toEqual([
        'Object',
        'Force',
      ]);
      expect(output.callForms).toEqual([
        'MyExt::MyButton::Press(Object, Force)',
      ]);
    });

    it('reads the call forms from the generated metadata when the editor has it', async () => {
      // Its own extension: the generated metadata stays registered in the
      // platform and would be read by the other tests.
      const generatedExtension = project.insertNewEventsFunctionsExtension(
        'GeneratedExt',
        1
      );
      generatedExtension
        .getEventsBasedBehaviors()
        .insertNew('GeneratedBehavior', 0)
        .setObjectType('Sprite');

      const output = await launchFunctionWithGeneratedMetadata(
        createCustomFunction,
        project,
        'GeneratedExt',
        {
          scope: {
            type: 'custom_behavior',
            extension_name: 'GeneratedExt',
            custom_behavior_name: 'GeneratedBehavior',
          },
          function_name: 'Hit',
          function_type: 'Action',
          parameters: [
            { name: 'Target', type: 'objectList', extra_info: 'Sprite' },
            { name: 'Damage', type: 'expression' },
          ],
        }
      );

      expect(output.success).toBe(true);
      // Same call form as the one rendered from the declaration.
      expect(output.callForms).toEqual([
        'GeneratedExt::GeneratedBehavior::Hit(Object, Behavior, Target, Damage)',
      ]);
    });

    it('writes the default sentence of an action with the right parameter indexes', async () => {
      await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        function_type: 'Action',
        parameters: [{ name: 'Damage', type: 'expression' }],
      });
      await launchFunction(createCustomFunction, project, {
        scope: extensionScope,
        function_name: 'Explode',
        function_type: 'Action',
        parameters: [{ name: 'Power', type: 'expression' }],
      });
      await launchFunction(createCustomFunction, project, {
        scope: objectScope,
        function_name: 'Press',
        function_type: 'Action',
        parameters: [{ name: 'Force', type: 'expression' }],
      });

      // The first parameter the author declared is `_PARAM2_` on a behavior
      // (after `Object` and `Behavior`), `_PARAM1_` everywhere else.
      expect(getBehaviorFunction('Hit').getSentence()).toBe(
        'Hit _PARAM0_ _PARAM2_'
      );
      expect(getFreeFunction('Explode').getSentence()).toBe('Explode _PARAM1_');
      expect(getObjectFunction('Press').getSentence()).toBe(
        'Press _PARAM0_ _PARAM1_'
      );
    });

    it('keeps the sentence given by the caller', async () => {
      await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        function_type: 'Action',
        sentence: 'Hit _PARAM0_ for _PARAM2_ damage',
        parameters: [{ name: 'Damage', type: 'expression' }],
      });

      expect(getBehaviorFunction('Hit').getSentence()).toBe(
        'Hit _PARAM0_ for _PARAM2_ damage'
      );
    });

    it('creates a string expression returning a string', async () => {
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: extensionScope,
        function_name: 'Label',
        function_type: 'StringExpression',
      });

      expect(output.success).toBe(true);
      expect(output.functionType).toBe('StringExpression');
      const eventsFunction = getFreeFunction('Label');
      expect(eventsFunction.isExpression()).toBe(true);
      expect(eventsFunction.getExpressionType().getName()).toBe('string');
      // The skeleton returns a string, not a number.
      expect(
        gd
          .asStandardEvent(eventsFunction.getEvents().getEventAt(0))
          .getActions()
          .get(0)
          .getType()
      ).toBe('SetReturnString');
      expect(output.callForms).toEqual(['MyExt::Label()']);
    });

    it('creates a condition with the skeleton returning a boolean', async () => {
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: extensionScope,
        function_name: 'IsReady',
        function_type: 'Condition',
      });

      expect(output.success).toBe(true);
      expect(
        gd
          .asStandardEvent(
            getFreeFunction('IsReady')
              .getEvents()
              .getEventAt(0)
          )
          .getActions()
          .get(0)
          .getType()
      ).toBe('SetReturnBoolean');
    });

    it('creates an action with operator changing the value of its getter', async () => {
      await launchFunction(createCustomFunction, project, {
        scope: objectScope,
        function_name: 'Score',
        function_type: 'Expression',
      });

      const { output } = await launchFunction(createCustomFunction, project, {
        scope: objectScope,
        function_name: 'SetScore',
        function_type: 'ActionWithOperator',
        getter_name: 'Score',
      });

      expect(output.success).toBe(true);
      expect(getObjectFunction('SetScore').getGetterName()).toBe('Score');
      expect(output.callForms).toEqual([
        'MyExt::MyButton::SetScore(Object, =, Value)',
        'read the value with Object.Score()',
      ]);
    });

    it('refuses an action with operator whose getter does not exist', async () => {
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: objectScope,
        function_name: 'SetScore',
        function_type: 'ActionWithOperator',
        getter_name: 'Unknown',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('"Unknown" is not an "Expression"');
      expect(
        extension
          .getEventsBasedObjects()
          .get('MyButton')
          .getEventsFunctions()
          .hasEventsFunctionNamed('SetScore')
      ).toBe(false);
    });

    it('accepts a lifecycle function on the owner that calls it', async () => {
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'doStepPreEvents',
      });

      expect(output.success).toBe(true);
      expect(output.callForms).toEqual([]);
      expect(output.message).toContain('GDevelop calls it by itself');
      // A lifecycle function is never shown in an events sheet.
      expect(getBehaviorFunction('doStepPreEvents').getSentence()).toBe('');
    });

    it('refuses a lifecycle function on another owner, listing the right names', async () => {
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: extensionScope,
        function_name: 'doStepPreEvents',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('lifecycle function name');
      expect(output.message).toContain('"onFirstSceneLoaded"');
      expect(output.message).toContain('"custom_behavior"');
      expect(
        extension.getEventsFunctions().hasEventsFunctionNamed('doStepPreEvents')
      ).toBe(false);
    });

    it('refuses a lifecycle function with parameters or another type', async () => {
      const { output: withParametersOutput } = await launchFunction(
        createCustomFunction,
        project,
        {
          scope: extensionScope,
          function_name: 'onSceneLoaded',
          parameters: [{ name: 'Power', type: 'expression' }],
        }
      );
      expect(withParametersOutput.success).toBe(false);
      expect(withParametersOutput.message).toContain('takes no parameter');

      const { output: withTypeOutput } = await launchFunction(
        createCustomFunction,
        project,
        {
          scope: extensionScope,
          function_name: 'onSceneLoaded',
          function_type: 'Condition',
        }
      );
      expect(withTypeOutput.success).toBe(false);
      expect(withTypeOutput.message).toContain('always an Action');
    });

    it('duplicates a function with its events', async () => {
      await launchFunction(createCustomFunction, project, {
        scope: extensionScope,
        function_name: 'IsReady',
        function_type: 'Condition',
      });

      const { output } = await launchFunction(createCustomFunction, project, {
        scope: extensionScope,
        function_name: 'IsAlmostReady',
        duplicated_function_name: 'IsReady',
      });

      expect(output.success).toBe(true);
      expect(output.functionType).toBe('Condition');
      expect(
        getFreeFunction('IsAlmostReady')
          .getEvents()
          .getEventsCount()
      ).toBe(
        getFreeFunction('IsReady')
          .getEvents()
          .getEventsCount()
      );
      expect(
        getFreeFunction('IsAlmostReady')
          .getEvents()
          .getEventsCount()
      ).toBe(1);
    });

    it('refuses a function name already used', async () => {
      await launchFunction(createCustomFunction, project, {
        scope: extensionScope,
        function_name: 'Explode',
        function_type: 'Action',
      });

      const { output } = await launchFunction(createCustomFunction, project, {
        scope: extensionScope,
        function_name: 'Explode',
        function_type: 'Action',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('already exists');
      expect(output.message).toContain('change_custom_function');
    });

    it('refuses a behavior parameter with no object parameter before it', async () => {
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: extensionScope,
        function_name: 'Explode',
        function_type: 'Action',
        parameters: [
          {
            name: 'Physics',
            type: 'behavior',
            extra_info: 'MyExt::MyBehavior',
          },
        ],
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('must come after an object parameter');
      // Nothing is left behind when the parameters are refused.
      expect(
        extension.getEventsFunctions().hasEventsFunctionNamed('Explode')
      ).toBe(false);
    });

    it('refuses to create a function in an extension of the store', async () => {
      extension.setOrigin('gdevelop-extension-store', 'MyExt');

      const { output } = await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        function_type: 'Action',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('read-only');
    });
  });

  describe('change_custom_function', () => {
    beforeEach(async () => {
      await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        function_type: 'Action',
        parameters: [{ name: 'Damage', type: 'expression' }],
      });
    });

    // An event of the scene calling `Player.MyBehavior::Hit(...)`.
    const addSceneEventCallingHit = () => {
      const event = layout
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
      const action = new gd.Instruction();
      action.setType('MyExt::MyBehavior::Hit');
      action.setParametersCount(3);
      action.setParameter(0, 'Player');
      action.setParameter(1, 'MyBehavior');
      action.setParameter(2, '10');
      gd.asStandardEvent(event)
        .getActions()
        .insert(action, 0);
      action.delete();
    };
    const getSceneActionType = (): string =>
      gd
        .asStandardEvent(layout.getEvents().getEventAt(0))
        .getActions()
        .get(0)
        .getType();

    it('renames the function and the events calling it', async () => {
      addSceneEventCallingHit();

      const { output, fakeOptions } = await launchFunction(
        changeCustomFunction,
        project,
        {
          scope: behaviorScope,
          function_name: 'Hit',
          new_name: 'Damage',
        }
      );

      expect(output.success).toBe(true);
      expect(output.functionName).toBe('Damage');
      expect(getSceneActionType()).toBe('MyExt::MyBehavior::Damage');
      expect(
        fakeOptions.onProjectItemRenamedOutsideEditor
      ).toHaveBeenCalledWith({
        kind: 'function',
        oldName: 'Hit',
        newName: 'Damage',
        extensionName: 'MyExt',
        behaviorName: 'MyBehavior',
      });
    });

    it('renames a parameterless behavior action to a lifecycle name, but not one with parameters', async () => {
      await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Step',
      });
      const { output } = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Step',
        new_name: 'doStepPreEvents',
      });
      expect(output.success).toBe(true);
      // The implicit parameters stay, they are not "declared" ones.
      expect(
        getBehaviorFunction('doStepPreEvents')
          .getParameters()
          .getParametersCount()
      ).toBe(2);

      await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Push',
        parameters: [{ name: 'Force', type: 'expression' }],
      });
      const refused = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Push',
        new_name: 'doStepPostEvents',
      });
      expect(refused.output.success).toBe(false);
      expect(refused.output.message).toContain('takes no parameter');
    });

    it('refuses to duplicate a function with parameters under a lifecycle name', async () => {
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'onDestroy',
        duplicated_function_name: 'Hit',
      });
      expect(output.success).toBe(false);
      expect(output.message).toContain('takes no parameter');
      expect(
        extension
          .getEventsBasedBehaviors()
          .get('MyBehavior')
          .getEventsFunctions()
          .hasEventsFunctionNamed('onDestroy')
      ).toBe(false);
    });

    it('refuses to rename a lifecycle function', async () => {
      await launchFunction(createCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'doStepPreEvents',
      });

      const { output } = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'doStepPreEvents',
        new_name: 'Step',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('cannot be renamed');
      expect(
        extension
          .getEventsBasedBehaviors()
          .get('MyBehavior')
          .getEventsFunctions()
          .hasEventsFunctionNamed('doStepPreEvents')
      ).toBe(true);
    });

    it('changes the parameters, leaving the implicit ones alone', async () => {
      const { output } = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        changed_parameters: [
          { parameter_name: 'Damage', new_name: 'Amount', label: 'Amount' },
          { parameter_name: 'Knockback', type: 'expression' },
        ],
      });

      expect(output.success).toBe(true);
      expect(getParameterNames(getBehaviorFunction('Hit'))).toEqual([
        'Object',
        'Behavior',
        'Amount',
        'Knockback',
      ]);
    });

    it('refuses to change an implicit parameter', async () => {
      const { output } = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        changed_parameters: [{ parameter_name: 'Object', new_name: 'Target' }],
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('given to every function');
      expect(getParameterNames(getBehaviorFunction('Hit'))).toEqual([
        'Object',
        'Behavior',
        'Damage',
      ]);
    });

    it('changes the settings of the function', async () => {
      const { output } = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        changed_settings: [
          { setting_name: 'fullName', new_value: 'Hit the object' },
          { setting_name: 'sentence', new_value: 'Hit _PARAM0_' },
          { setting_name: 'isAsync', new_value: true },
          { setting_name: 'isPrivate', new_value: 'true' },
        ],
      });

      expect(output.success).toBe(true);
      const eventsFunction = getBehaviorFunction('Hit');
      expect(eventsFunction.getFullName()).toBe('Hit the object');
      expect(eventsFunction.getSentence()).toBe('Hit _PARAM0_');
      expect(eventsFunction.isAsync()).toBe(true);
      expect(eventsFunction.isPrivate()).toBe(true);
      // An asynchronous action is awaited in the events.
      expect(output.callForms).toEqual([
        'await MyExt::MyBehavior::Hit(Object, Behavior, Damage)',
      ]);
    });

    it('only regenerates the code when more than the metadata changed', async () => {
      const { fakeOptions } = await launchFunction(
        changeCustomFunction,
        project,
        {
          scope: behaviorScope,
          function_name: 'Hit',
          changed_settings: [
            {
              setting_name: 'sentence',
              new_value: 'Hit _PARAM0_ for _PARAM2_ damage',
            },
          ],
        }
      );

      expect(
        fakeOptions.onExtensionsModifiedOutsideEditor
      ).toHaveBeenCalledWith({
        extensionNames: ['MyExt'],
        needsCodeRegeneration: false,
      });
    });

    it('changes the type of the function', async () => {
      const { output } = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        changed_settings: [
          { setting_name: 'functionType', new_value: 'Condition' },
        ],
      });

      expect(output.success).toBe(true);
      expect(getBehaviorFunction('Hit').isCondition()).toBe(true);
    });

    it('lists the settings that exist on an unknown one', async () => {
      const { output } = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        changed_settings: [{ setting_name: 'isFast', new_value: 'true' }],
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('"isFast" does not exist');
      expect(output.message).toContain('"functionType"');
    });

    it('reports a call that changed nothing as a success', async () => {
      const { output, fakeOptions } = await launchFunction(
        changeCustomFunction,
        project,
        {
          scope: behaviorScope,
          function_name: 'Hit',
          changed_settings: [
            { setting_name: 'functionType', new_value: 'Action' },
          ],
        }
      );

      expect(output.success).toBe(true);
      expect(output.nothingChanged).toBe(true);
      expect(
        fakeOptions.onExtensionsModifiedOutsideEditor
      ).not.toHaveBeenCalled();
    });

    it('deletes a function after warning the editor', async () => {
      const { output, fakeOptions } = await launchFunction(
        changeCustomFunction,
        project,
        {
          scope: behaviorScope,
          function_name: 'Hit',
          delete_this_function: true,
        }
      );

      expect(output.success).toBe(true);
      expect(output.message).toContain('now invalid');
      expect(
        extension
          .getEventsBasedBehaviors()
          .get('MyBehavior')
          .getEventsFunctions()
          .hasEventsFunctionNamed('Hit')
      ).toBe(false);
      expect(fakeOptions.onWillDeleteExtensionItem).toHaveBeenCalledWith({
        kind: 'function',
        extensionName: 'MyExt',
        behaviorName: 'MyBehavior',
        functionName: 'Hit',
      });
    });

    it('teaches what exists when the function is not found', async () => {
      const { output } = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Unknown',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('Existing functions: "Hit"');
      expect(output.message).toContain('create_custom_function');
    });

    it('refuses every change on an extension of the store', async () => {
      extension.setOrigin('gdevelop-extension-store', 'MyExt');

      const { output } = await launchFunction(changeCustomFunction, project, {
        scope: behaviorScope,
        function_name: 'Hit',
        new_name: 'Damage',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('read-only');
      expect(
        extension
          .getEventsBasedBehaviors()
          .get('MyBehavior')
          .getEventsFunctions()
          .hasEventsFunctionNamed('Hit')
      ).toBe(true);
    });
  });
});
