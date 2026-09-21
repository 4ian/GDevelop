// @flow
import {
  type EditorFunction,
  type EditorFunctionGenericOutput,
  type LaunchFunctionOptionsWithProject,
  type RenderForEditorOptions,
} from '../index';
import { makeFakeLaunchFunctionOptionsWithProject } from '../TestHelpers';
import {
  changeCustomBehavior,
  createCustomBehavior,
} from './CustomBehaviorFunctions';
import { createCustomFunction } from './CustomFunctionFunctions';

const gd: libGDevelop = global.gd;

const createFakeProject = () => {
  // $FlowFixMe[invalid-constructor]
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
  extension.setFullName('My extension');
  const layout = project.insertNewLayout('Level', 0);
  const object = layout
    .getObjects()
    .insertNewObject(project, 'Sprite', 'Player', 0);
  return { project, extension, layout, object };
};

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

const getParameterInfo = (
  eventsFunction: gdEventsFunction,
  index: number
): {| name: string, type: string, extraInfo: string |} => {
  const parameter = eventsFunction.getParameters().getParameterAt(index);
  return {
    name: parameter.getName(),
    type: parameter.getType(),
    extraInfo: parameter.getExtraInfo(),
  };
};

describe('CustomBehaviorFunctions', () => {
  let project: gdProject;
  let extension: gdEventsFunctionsExtension;
  let object: gdObject;

  beforeEach(() => {
    ({ project, extension, object } = createFakeProject());
  });

  afterEach(() => {
    project.delete();
  });

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
    const args = {
      extension_name: 'MyExt',
      custom_behavior_name: 'MyBehavior',
    };

    const { renderForEditor: renderCreate } = createCustomBehavior;
    const { renderForEditor: renderChange } = changeCustomBehavior;
    if (!renderCreate || !renderChange)
      throw new Error('renderForEditor is not defined.');
    expect(renderCreate(makeOptions(args)).text).toBeTruthy();
    expect(renderChange(makeOptions(args)).text).toBeTruthy();
    expect(
      renderChange(makeOptions({ ...args, delete_this_custom_behavior: true }))
        .text
    ).toBeTruthy();
  });

  describe('create_custom_behavior', () => {
    it('creates a behavior, returns its type and notifies the editor', async () => {
      const { output, fakeOptions } = await launchFunction(
        createCustomBehavior,
        project,
        {
          extension_name: 'MyExt',
          custom_behavior_name: 'MyBehavior',
          full_name: 'My behavior',
          description: 'Does something',
          object_type: 'Sprite',
        }
      );

      expect(output.success).toBe(true);
      expect(output.extensionName).toBe('MyExt');
      expect(output.customBehaviorName).toBe('MyBehavior');
      expect(output.behaviorType).toBe('MyExt::MyBehavior');
      expect(output.message).toContain('add_behavior');

      const eventsBasedBehavior = extension
        .getEventsBasedBehaviors()
        .get('MyBehavior');
      expect(eventsBasedBehavior.getFullName()).toBe('My behavior');
      expect(eventsBasedBehavior.getObjectType()).toBe('Sprite');
      expect(
        fakeOptions.onExtensionsModifiedOutsideEditor
      ).toHaveBeenCalledWith({
        extensionNames: ['MyExt'],
        needsCodeRegeneration: true,
      });
    });

    it('makes the requested name safe and unique', async () => {
      await launchFunction(createCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
      });
      const { output } = await launchFunction(createCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'My Behavior!',
      });

      expect(output.success).toBe(true);
      // "My Behavior!" is not a valid name for a behavior.
      expect(output.customBehaviorName).toBe('My_Behavior_');

      const { output: takenNameOutput } = await launchFunction(
        createCustomBehavior,
        project,
        { extension_name: 'MyExt', custom_behavior_name: 'MyBehavior' }
      );
      expect(takenNameOutput.customBehaviorName).toBe('MyBehavior2');
      expect(takenNameOutput.message).toContain('MyBehavior2');
    });

    it('gives every function of the behavior its implicit parameters', async () => {
      await launchFunction(createCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        object_type: 'Sprite',
      });
      const { output } = await launchFunction(createCustomFunction, project, {
        scope: {
          type: 'custom_behavior',
          extension_name: 'MyExt',
          custom_behavior_name: 'MyBehavior',
        },
        function_name: 'Hit',
        function_type: 'Action',
      });

      expect(output.success).toBe(true);
      const eventsFunction = extension
        .getEventsBasedBehaviors()
        .get('MyBehavior')
        .getEventsFunctions()
        .getEventsFunction('Hit');
      expect(getParameterInfo(eventsFunction, 0)).toEqual({
        name: 'Object',
        type: 'object',
        extraInfo: 'Sprite',
      });
      expect(getParameterInfo(eventsFunction, 1)).toEqual({
        name: 'Behavior',
        type: 'behavior',
        extraInfo: 'MyExt::MyBehavior',
      });
    });

    it('duplicates a behavior of another extension into this one', async () => {
      const otherExtension = project.insertNewEventsFunctionsExtension(
        'OtherExt',
        1
      );
      const sourceBehavior = otherExtension
        .getEventsBasedBehaviors()
        .insertNew('SourceBehavior', 0);
      sourceBehavior.setObjectType('Sprite');
      sourceBehavior
        .getPropertyDescriptors()
        .insertNew('Health', 0)
        .setType('Number')
        .setValue('100');
      sourceBehavior.getEventsFunctions().insertNewEventsFunction('Hit', 0);
      gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
        otherExtension,
        sourceBehavior
      );

      const { output } = await launchFunction(createCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'CopiedBehavior',
        duplicated_custom_behavior_name: 'SourceBehavior',
        duplicated_from_extension_name: 'OtherExt',
      });

      expect(output.success).toBe(true);
      expect(output.behaviorType).toBe('MyExt::CopiedBehavior');
      const copiedBehavior = extension
        .getEventsBasedBehaviors()
        .get('CopiedBehavior');
      expect(copiedBehavior.getObjectType()).toBe('Sprite');
      expect(copiedBehavior.getPropertyDescriptors().has('Health')).toBe(true);
      const copiedFunction = copiedBehavior
        .getEventsFunctions()
        .getEventsFunction('Hit');
      // The implicit `Behavior` parameter now requires the copy, not the source.
      expect(getParameterInfo(copiedFunction, 1).extraInfo).toBe(
        'MyExt::CopiedBehavior'
      );
    });

    it('teaches what to pass when the copied behavior does not exist', async () => {
      const { output } = await launchFunction(createCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'CopiedBehavior',
        duplicated_custom_behavior_name: 'Unknown',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('"Unknown" not found in extension');
      expect(output.message).toContain('Existing custom behaviors there: none');
    });

    it('refuses to create a behavior in an extension of the store', async () => {
      extension.setOrigin('gdevelop-extension-store', 'MyExt');

      const { output } = await launchFunction(createCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('read-only');
      expect(extension.getEventsBasedBehaviors().getCount()).toBe(0);
    });
  });

  describe('change_custom_behavior', () => {
    beforeEach(async () => {
      await launchFunction(createCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        object_type: 'Sprite',
      });
    });

    const getBehavior = (): gdEventsBasedBehavior =>
      extension.getEventsBasedBehaviors().get('MyBehavior');

    it('changes the settings of the behavior', async () => {
      const { output } = await launchFunction(changeCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        changed_settings: [
          { setting_name: 'fullName', new_value: 'A behavior' },
          { setting_name: 'description', new_value: 'What it does' },
          { setting_name: 'objectType', new_value: '' },
          { setting_name: 'isPrivate', new_value: true },
          { setting_name: 'quickCustomizationVisibility', new_value: 'hidden' },
        ],
      });

      expect(output.success).toBe(true);
      const eventsBasedBehavior = getBehavior();
      expect(eventsBasedBehavior.getFullName()).toBe('A behavior');
      expect(eventsBasedBehavior.getDescription()).toBe('What it does');
      expect(eventsBasedBehavior.getObjectType()).toBe('');
      expect(eventsBasedBehavior.isPrivate()).toBe(true);
      expect(eventsBasedBehavior.getQuickCustomizationVisibility()).toBe(
        gd.QuickCustomization.Hidden
      );
    });

    it('reports a call that changed nothing as a success', async () => {
      const { output, fakeOptions } = await launchFunction(
        changeCustomBehavior,
        project,
        {
          extension_name: 'MyExt',
          custom_behavior_name: 'MyBehavior',
          changed_settings: [
            { setting_name: 'objectType', new_value: 'Sprite' },
          ],
        }
      );

      expect(output.success).toBe(true);
      expect(output.nothingChanged).toBe(true);
      expect(
        fakeOptions.onExtensionsModifiedOutsideEditor
      ).not.toHaveBeenCalled();
    });

    it('lists the settings that exist on an unknown one', async () => {
      const { output } = await launchFunction(changeCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        changed_settings: [{ setting_name: 'isAwesome', new_value: 'true' }],
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('"isAwesome" does not exist');
      expect(output.message).toContain('"quickCustomizationVisibility"');
    });

    it('lists the values of quickCustomizationVisibility on a wrong one', async () => {
      const { output } = await launchFunction(changeCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        changed_settings: [
          { setting_name: 'quickCustomizationVisibility', new_value: 'maybe' },
        ],
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('"default", "visible", "hidden"');
    });

    it('renames the behavior and the objects using it', async () => {
      object.addNewBehavior(project, 'MyExt::MyBehavior', 'MyBehavior');

      const { output, fakeOptions } = await launchFunction(
        changeCustomBehavior,
        project,
        {
          extension_name: 'MyExt',
          custom_behavior_name: 'MyBehavior',
          new_name: 'Damageable',
        }
      );

      expect(output.success).toBe(true);
      expect(output.customBehaviorName).toBe('Damageable');
      expect(output.behaviorType).toBe('MyExt::Damageable');
      expect(object.getBehavior('MyBehavior').getTypeName()).toBe(
        'MyExt::Damageable'
      );
      expect(
        fakeOptions.onProjectItemRenamedOutsideEditor
      ).toHaveBeenCalledWith({
        kind: 'custom-behavior',
        oldName: 'MyBehavior',
        newName: 'Damageable',
        extensionName: 'MyExt',
      });
    });

    it('refuses a name already used by another behavior', async () => {
      await launchFunction(createCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'Other',
      });

      const { output } = await launchFunction(changeCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        new_name: 'Other',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('already used');
      expect(extension.getEventsBasedBehaviors().has('MyBehavior')).toBe(true);
    });

    it('only regenerates the code when more than the metadata changed', async () => {
      const { fakeOptions } = await launchFunction(
        changeCustomBehavior,
        project,
        {
          extension_name: 'MyExt',
          custom_behavior_name: 'MyBehavior',
          changed_settings: [
            { setting_name: 'fullName', new_value: 'A behavior' },
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

    it('changes the properties and the shared properties', async () => {
      const { output, fakeOptions } = await launchFunction(
        changeCustomBehavior,
        project,
        {
          extension_name: 'MyExt',
          custom_behavior_name: 'MyBehavior',
          changed_properties: [
            {
              property_name: 'Health',
              type: 'Number',
              default_value: '100',
              label: 'Health points',
            },
          ],
          changed_shared_properties: [
            { property_name: 'FrontLayer', type: 'Layer' },
          ],
        }
      );

      expect(output.success).toBe(true);
      const eventsBasedBehavior = getBehavior();
      const property = eventsBasedBehavior
        .getPropertyDescriptors()
        .get('Health');
      expect(property.getType()).toBe('Number');
      expect(property.getValue()).toBe('100');
      expect(property.getLabel()).toBe('Health points');
      expect(
        eventsBasedBehavior
          .getSharedPropertyDescriptors()
          .get('FrontLayer')
          .getType()
      ).toBe('Layer');
      // The objects using the behavior may need new required behaviors: the
      // extension has to be regenerated before they can be fixed.
      expect(fakeOptions.ensureExtensionsUpToDate).toHaveBeenCalled();
    });

    it('refuses a Behavior shared property, which only a property can be', async () => {
      const { output } = await launchFunction(changeCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        changed_shared_properties: [
          {
            property_name: 'Required',
            type: 'Behavior',
            extra_info: 'MyExt::Other',
          },
        ],
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain(
        'not allowed for a custom behavior shared property'
      );
      expect(
        getBehavior()
          .getSharedPropertyDescriptors()
          .has('Required')
      ).toBe(false);
    });

    it('refuses to delete a behavior in use and lists the object types', async () => {
      object.addNewBehavior(project, 'MyExt::MyBehavior', 'MyBehavior');

      const { output, fakeOptions } = await launchFunction(
        changeCustomBehavior,
        project,
        {
          extension_name: 'MyExt',
          custom_behavior_name: 'MyBehavior',
          delete_this_custom_behavior: true,
        }
      );

      expect(output.success).toBe(false);
      expect(output.message).toContain('"Sprite"');
      expect(output.message).toContain('delete_even_if_used');
      expect(extension.getEventsBasedBehaviors().has('MyBehavior')).toBe(true);
      expect(fakeOptions.onWillDeleteExtensionItem).not.toHaveBeenCalled();
    });

    it('deletes a behavior in use when forced, removing it from the objects', async () => {
      object.addNewBehavior(project, 'MyExt::MyBehavior', 'MyBehavior');
      const eventsBasedObject = extension
        .getEventsBasedObjects()
        .insertNew('MyButton', 0);
      const childObject = eventsBasedObject
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Back', 0);
      childObject.addNewBehavior(project, 'MyExt::MyBehavior', 'MyBehavior');

      const { output, fakeOptions } = await launchFunction(
        changeCustomBehavior,
        project,
        {
          extension_name: 'MyExt',
          custom_behavior_name: 'MyBehavior',
          delete_this_custom_behavior: true,
          delete_even_if_used: true,
        }
      );

      expect(output.success).toBe(true);
      expect(extension.getEventsBasedBehaviors().has('MyBehavior')).toBe(false);
      expect(object.hasBehaviorNamed('MyBehavior')).toBe(false);
      expect(childObject.hasBehaviorNamed('MyBehavior')).toBe(false);
      expect(fakeOptions.onWillDeleteExtensionItem).toHaveBeenCalledWith({
        kind: 'custom-behavior',
        extensionName: 'MyExt',
        behaviorName: 'MyBehavior',
      });
    });

    it('teaches what exists when the behavior is not found', async () => {
      const { output } = await launchFunction(changeCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'Unknown',
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain(
        'Existing custom behaviors: "MyBehavior"'
      );
    });

    it('refuses every change on an extension of the store', async () => {
      extension.setOrigin('gdevelop-extension-store', 'MyExt');

      const { output } = await launchFunction(changeCustomBehavior, project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        changed_settings: [{ setting_name: 'fullName', new_value: 'Changed' }],
      });

      expect(output.success).toBe(false);
      expect(output.message).toContain('read-only');
      expect(
        extension
          .getEventsBasedBehaviors()
          .get('MyBehavior')
          .getFullName()
      ).toBe('');
    });
  });
});
