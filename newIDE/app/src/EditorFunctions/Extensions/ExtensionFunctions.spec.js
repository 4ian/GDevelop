// @flow
import {
  changeExtensionProperties,
  createExtension,
} from './ExtensionFunctions';
import {
  type EditorFunction,
  type EditorFunctionGenericOutput,
  type LaunchFunctionOptionsWithProject,
  type RenderForEditorOptions,
} from '../index';
import { makeFakeLaunchFunctionOptionsWithProject } from '../TestHelpers';
import { EXTENSION_STORE_ORIGIN_NAME } from '../SimplifiedProject/SimplifiedExtensions';

const gd: libGDevelop = global.gd;

/** An action calling `Ext::Fn` in the events of a function. */
const addActionCallingFunction = (
  project: gdProject,
  eventsFunction: gdEventsFunction,
  instructionType: string
) => {
  const event = eventsFunction
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
  const action = new gd.Instruction();
  action.setType(instructionType);
  gd.asStandardEvent(event)
    .getActions()
    .insert(action, 0);
  action.delete();
};

const getFirstActionType = (eventsFunction: gdEventsFunction): string => {
  const events = eventsFunction.getEvents();
  return gd
    .asStandardEvent(events.getEventAt(0))
    .getActions()
    .get(0)
    .getType();
};

/**
 * A project with an authored extension used by a scene and by another
 * extension, plus an extension installed from the store.
 */
const createFakeProject = () => {
  // $FlowFixMe[invalid-constructor]
  const project = new gd.ProjectHelper.createNewGDJSProject();

  const uiExtension = project.insertNewEventsFunctionsExtension('UI', 0);
  uiExtension.setFullName('User interface');
  uiExtension.getEventsBasedObjects().insertNew('Dialog', 0);
  const blinkBehavior = uiExtension
    .getEventsBasedBehaviors()
    .insertNew('Blink', 0);
  blinkBehavior.setObjectType('');

  // Another extension holding a custom object with a `UI::Dialog` child.
  const menusExtension = project.insertNewEventsFunctionsExtension('Menus', 1);
  const panel = menusExtension.getEventsBasedObjects().insertNew('Panel', 0);
  panel.getObjects().insertNewObject(project, 'UI::Dialog', 'InnerDialog', 0);

  const scene = project.insertNewLayout('Level', 0);
  scene.getObjects().insertNewObject(project, 'UI::Dialog', 'MainDialog', 0);
  const player = scene
    .getObjects()
    .insertNewObject(project, 'Sprite', 'Player', 1);
  player.addNewBehavior(project, 'UI::Blink', 'Blink');

  // A store extension whose events call one of its own actions.
  const storeExtension = project.insertNewEventsFunctionsExtension('Health', 2);
  storeExtension.setOrigin(EXTENSION_STORE_ORIGIN_NAME, 'Health');
  const healFunction = storeExtension
    .getEventsFunctions()
    .insertNewEventsFunction('Heal', 0);
  healFunction.setFunctionType(gd.EventsFunction.Action);
  const castFunction = storeExtension
    .getEventsFunctions()
    .insertNewEventsFunction('Cast', 1);
  castFunction.setFunctionType(gd.EventsFunction.Action);
  addActionCallingFunction(project, castFunction, 'Health::Heal');

  return { project, uiExtension, menusExtension, storeExtension };
};

describe('ExtensionFunctions', () => {
  let project: gdProject;
  let options: LaunchFunctionOptionsWithProject;

  beforeEach(() => {
    ({ project } = createFakeProject());
    options = makeFakeLaunchFunctionOptionsWithProject(project);
  });

  afterEach(() => {
    project.delete();
  });

  const launchCreateExtension = (
    args: Object
  ): Promise<EditorFunctionGenericOutput> =>
    createExtension.launchFunction({ ...options, args });

  const launchChangeExtensionProperties = (
    args: Object
  ): Promise<EditorFunctionGenericOutput> =>
    changeExtensionProperties.launchFunction({ ...options, args });

  describe('create_extension', () => {
    it('creates an extension with its settings and notifies the editor', async () => {
      const result = await launchCreateExtension({
        extension_name: 'LootBags',
        full_name: 'Loot bags',
        short_description: 'Items and slots',
        description: 'A longer description',
        category: 'Game mechanic',
        tags: 'inventory, items , ',
        author: 'Someone',
      });

      expect(result.success).toBe(true);
      expect(result.extensionName).toBe('LootBags');
      expect(project.hasEventsFunctionsExtensionNamed('LootBags')).toBe(true);

      const extension = project.getEventsFunctionsExtension('LootBags');
      expect(extension.getFullName()).toBe('Loot bags');
      expect(extension.getShortDescription()).toBe('Items and slots');
      expect(extension.getDescription()).toBe('A longer description');
      expect(extension.getCategory()).toBe('Game mechanic');
      expect(extension.getAuthor()).toBe('Someone');
      expect(extension.getTags().toJSArray()).toEqual(['inventory', 'items']);
      expect(extension.getOriginName()).toBe('');

      expect(options.onExtensionsModifiedOutsideEditor).toHaveBeenCalledWith({
        extensionNames: ['LootBags'],
        needsCodeRegeneration: true,
      });
    });

    it('makes the name safe and unique, and says which name to use', async () => {
      const result = await launchCreateExtension({ extension_name: 'UI' });

      expect(result.success).toBe(true);
      expect(result.extensionName).toBe('UI2');
      expect(result.message).toContain('use "UI2" from now on');
    });

    it('lists the existing extensions when the one to duplicate is unknown', async () => {
      const result = await launchCreateExtension({
        extension_name: 'Copy',
        duplicated_extension_name: 'Unknown',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('"UI"');
      expect(result.message).toContain('"Health"');
    });

    it('duplicates a store extension into an editable copy with renamed references', async () => {
      const result = await launchCreateExtension({
        extension_name: 'MyHealth',
        duplicated_extension_name: 'Health',
      });

      expect(result.success).toBe(true);
      expect(result.extensionName).toBe('MyHealth');

      const copy = project.getEventsFunctionsExtension('MyHealth');
      expect(copy.getOriginName()).toBe('');
      expect(copy.getEventsFunctions().hasEventsFunctionNamed('Heal')).toBe(
        true
      );
      // The events of the copy call the function of the copy, not the original.
      expect(
        getFirstActionType(copy.getEventsFunctions().getEventsFunction('Cast'))
      ).toBe('MyHealth::Heal');
      // The store extension itself is untouched.
      expect(
        getFirstActionType(
          project
            .getEventsFunctionsExtension('Health')
            .getEventsFunctions()
            .getEventsFunction('Cast')
        )
      ).toBe('Health::Heal');
    });

    it('lets the explicit settings win over the duplicated ones', async () => {
      const result = await launchCreateExtension({
        extension_name: 'MyHealth',
        duplicated_extension_name: 'Health',
        full_name: 'My own health',
      });

      expect(result.success).toBe(true);
      expect(
        project.getEventsFunctionsExtension('MyHealth').getFullName()
      ).toBe('My own health');
    });
  });

  describe('change_extension_properties', () => {
    it('changes the settings of an extension', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_properties: [
          { property_name: 'fullName', new_value: 'The user interface' },
          { property_name: 'tags', new_value: 'ui,hud' },
          { property_name: 'version', new_value: '1.2.0' },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.extensionName).toBe('UI');
      const extension = project.getEventsFunctionsExtension('UI');
      expect(extension.getFullName()).toBe('The user interface');
      expect(extension.getTags().toJSArray()).toEqual(['ui', 'hud']);
      expect(extension.getVersion()).toBe('1.2.0');
      // Settings alone don't change the generated code.
      expect(options.onExtensionsModifiedOutsideEditor).toHaveBeenCalledWith({
        extensionNames: ['UI'],
        needsCodeRegeneration: false,
      });
    });

    it('lists the allowed properties when one is unknown, and changes nothing', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_properties: [
          { property_name: 'fullName', new_value: 'Changed' },
          { property_name: 'namespace', new_value: 'Nope' },
        ],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'Unknown extension property: "namespace"'
      );
      expect(result.message).toContain('"shortDescription"');
      expect(project.getEventsFunctionsExtension('UI').getFullName()).toBe(
        'User interface'
      );
    });

    it('is a success that changed nothing when there is nothing to change', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'UI',
      });

      expect(result.success).toBe(true);
      expect(result.nothingChanged).toBe(true);
      expect(options.onExtensionsModifiedOutsideEditor).not.toHaveBeenCalled();
    });

    it('renames an extension and the objects and behaviors using it', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'UI',
        new_name: 'Interface',
      });

      expect(result.success).toBe(true);
      expect(result.extensionName).toBe('Interface');
      expect(project.hasEventsFunctionsExtensionNamed('Interface')).toBe(true);
      expect(project.hasEventsFunctionsExtensionNamed('UI')).toBe(false);

      // A scene object of the renamed type follows.
      expect(
        project
          .getLayout('Level')
          .getObjects()
          .getObject('MainDialog')
          .getType()
      ).toBe('Interface::Dialog');
      // So does a child object of another custom object.
      expect(
        project
          .getEventsFunctionsExtension('Menus')
          .getEventsBasedObjects()
          .get('Panel')
          .getObjects()
          .getObject('InnerDialog')
          .getType()
      ).toBe('Interface::Dialog');
      // And a behavior put on a scene object.
      expect(
        project
          .getLayout('Level')
          .getObjects()
          .getObject('Player')
          .getBehavior('Blink')
          .getTypeName()
      ).toBe('Interface::Blink');

      expect(options.onProjectItemRenamedOutsideEditor).toHaveBeenCalledWith({
        kind: 'extension',
        oldName: 'UI',
        newName: 'Interface',
      });
      expect(options.onExtensionsModifiedOutsideEditor).toHaveBeenCalledWith({
        extensionNames: ['Interface'],
        needsCodeRegeneration: true,
      });
    });

    it('refuses a new name already used by another extension', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'UI',
        new_name: 'Menus',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('already used by another extension');
      expect(project.hasEventsFunctionsExtensionNamed('UI')).toBe(true);
    });

    it('adds, edits and deletes dependencies', async () => {
      const addResult = await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_dependencies: [
          {
            dependency_name: 'firebase',
            type: 'npm',
            export_name: 'firebase',
            version: '9.0.0',
            extra_settings: { apiKey: 'abcd' },
          },
        ],
      });

      expect(addResult.success).toBe(true);
      const extension = project.getEventsFunctionsExtension('UI');
      expect(extension.getAllDependencies().size()).toBe(1);
      const dependency = extension.getAllDependencies().at(0);
      expect(dependency.getName()).toBe('firebase');
      expect(dependency.getDependencyType()).toBe('npm');
      expect(dependency.getExportName()).toBe('firebase');
      expect(dependency.getVersion()).toBe('9.0.0');
      expect(
        dependency
          .getAllExtraSettings()
          .get('apiKey')
          .getValue()
      ).toBe('abcd');
      // A dependency changes what is exported: the code is regenerated.
      expect(options.onExtensionsModifiedOutsideEditor).toHaveBeenCalledWith({
        extensionNames: ['UI'],
        needsCodeRegeneration: true,
      });

      const editResult = await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_dependencies: [
          { dependency_name: 'firebase', version: '10.0.0' },
        ],
      });
      expect(editResult.success).toBe(true);
      expect(
        extension
          .getAllDependencies()
          .at(0)
          .getVersion()
      ).toBe('10.0.0');

      const deleteResult = await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_dependencies: [
          { dependency_name: 'firebase', delete_this_dependency: true },
        ],
      });
      expect(deleteResult.success).toBe(true);
      expect(extension.getAllDependencies().size()).toBe(0);
    });

    it('refuses to edit a dependency deleted earlier in the same call, changing nothing', async () => {
      await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_dependencies: [{ dependency_name: 'axios', type: 'npm' }],
      });
      const result = await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_dependencies: [
          { dependency_name: 'axios', delete_this_dependency: true },
          { dependency_name: 'axios', version: '1.0.0' },
        ],
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('needs a `type`');
      const dependencies = project
        .getEventsFunctionsExtension('UI')
        .getAllDependencies();
      expect(dependencies.size()).toBe(1);
      expect(dependencies.at(0).getVersion()).toBe('');
    });

    it('treats an empty new_name as no rename', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'UI',
        new_name: '',
        changed_properties: [{ property_name: 'author', new_value: 'Me' }],
      });
      expect(result.success).toBe(true);
      expect(project.hasEventsFunctionsExtensionNamed('UI')).toBe(true);
      expect(project.getEventsFunctionsExtension('UI').getAuthor()).toBe('Me');
    });

    it('asks for the type of a new dependency and lists the existing ones on a bad delete', async () => {
      const missingTypeResult = await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_dependencies: [{ dependency_name: 'firebase' }],
      });
      expect(missingTypeResult.success).toBe(false);
      expect(missingTypeResult.message).toContain('"npm"');
      expect(missingTypeResult.message).toContain('"cordova"');

      const badTypeResult = await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_dependencies: [{ dependency_name: 'firebase', type: 'yarn' }],
      });
      expect(badTypeResult.success).toBe(false);

      const badDeleteResult = await launchChangeExtensionProperties({
        extension_name: 'UI',
        changed_dependencies: [
          { dependency_name: 'unknown', delete_this_dependency: true },
        ],
      });
      expect(badDeleteResult.success).toBe(false);
      expect(badDeleteResult.message).toContain('Existing dependencies: none');
      expect(
        project
          .getEventsFunctionsExtension('UI')
          .getAllDependencies()
          .size()
      ).toBe(0);
    });

    it('refuses to delete an extension that is still used, listing the usages', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'UI',
        delete_this_extension: true,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('objects of type "UI::Dialog" exist');
      expect(result.message).toContain('behavior "UI::Blink" is on objects');
      expect(result.message).toContain('delete_even_if_used');
      expect(project.hasEventsFunctionsExtensionNamed('UI')).toBe(true);
      expect(options.onWillDeleteExtensionItem).not.toHaveBeenCalled();
    });

    it('deletes an extension in use when it is forced to', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'UI',
        delete_this_extension: true,
        delete_even_if_used: true,
      });

      expect(result.success).toBe(true);
      expect(options.onWillDeleteExtensionItem).toHaveBeenCalledWith({
        kind: 'extension',
        extensionName: 'UI',
      });
      expect(project.hasEventsFunctionsExtensionNamed('UI')).toBe(false);
      expect(options.onExtensionsModifiedOutsideEditor).toHaveBeenCalledWith({
        extensionNames: ['UI'],
        needsCodeRegeneration: true,
        deleted: true,
      });
    });

    it('deletes an unused extension without asking anything', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'Menus',
        delete_this_extension: true,
      });

      expect(result.success).toBe(true);
      expect(project.hasEventsFunctionsExtensionNamed('Menus')).toBe(false);
    });

    it('refuses every mutation of an extension installed from the store', async () => {
      const changeResult = await launchChangeExtensionProperties({
        extension_name: 'Health',
        changed_properties: [
          { property_name: 'fullName', new_value: 'Changed' },
        ],
      });
      expect(changeResult.success).toBe(false);
      expect(changeResult.message).toContain(
        'is installed from the GDevelop extension store'
      );
      expect(changeResult.message).toContain(
        'create_extension({ duplicated_extension_name: "Health" })'
      );

      const renameResult = await launchChangeExtensionProperties({
        extension_name: 'Health',
        new_name: 'MyHealth',
      });
      expect(renameResult.success).toBe(false);

      const deleteResult = await launchChangeExtensionProperties({
        extension_name: 'Health',
        delete_this_extension: true,
      });
      expect(deleteResult.success).toBe(false);
      expect(project.hasEventsFunctionsExtensionNamed('Health')).toBe(true);
    });

    it('lists the existing extensions when the extension is unknown', async () => {
      const result = await launchChangeExtensionProperties({
        extension_name: 'Unknown',
        new_name: 'Whatever',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Extension "Unknown" not found');
      expect(result.message).toContain('"UI"');
    });
  });

  describe('renderForEditor', () => {
    const renderText = (editorFunction: EditorFunction, args: Object) => {
      const { renderForEditor } = editorFunction;
      if (!renderForEditor) throw new Error('renderForEditor is not defined.');
      const renderOptions: RenderForEditorOptions = {
        project,
        args,
        editorCallbacks: options.editorCallbacks,
        shouldShowDetails: false,
        editorFunctionCallResultOutput: null,
        exampleShortHeaders: null,
      };
      return renderForEditor(renderOptions).text;
    };

    it('describes a creation, a change and a deletion', () => {
      expect(
        renderText(createExtension, { extension_name: 'LootBags' })
      ).toBeTruthy();
      expect(
        renderText(changeExtensionProperties, { extension_name: 'UI' })
      ).toBeTruthy();
      expect(
        renderText(changeExtensionProperties, {
          extension_name: 'UI',
          delete_this_extension: true,
        })
      ).toBeTruthy();
    });
  });
});
