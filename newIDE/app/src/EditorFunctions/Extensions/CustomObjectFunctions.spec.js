// @flow
import {
  VARIANT_RENAME_REJECTED_MESSAGE,
  changeCustomObject,
  createCustomObject,
} from './CustomObjectFunctions';
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
  reloadProjectEventsFunctionsExtensionMetadata,
  type EventsFunctionCodeWriter,
} from '../../EventsFunctionsExtensionsLoader';
import { EXTENSION_STORE_ORIGIN_NAME } from '../SimplifiedProject/SimplifiedExtensions';

const gd: libGDevelop = global.gd;

const createFakeEventsFunctionCodeWriter = (): EventsFunctionCodeWriter => ({
  getIncludeFileFor: (functionName: string) => `${functionName}.js`,
  writeFunctionCode: () => Promise.resolve(),
  writeBehaviorCode: () => Promise.resolve(),
  writeObjectCode: () => Promise.resolve(),
});

// Objects of a custom object type are only `gdCustomObjectConfiguration` (the
// ones holding a variant name) when the platform knows the type.
const registerFakeExtensionMetadata = (
  project: gdProject,
  extension: gdEventsFunctionsExtension
) => {
  reloadProjectEventsFunctionsExtensionMetadata(
    project,
    extension,
    createFakeEventsFunctionCodeWriter(),
    makeFakeI18n()
  );
};

const setVariantName = (object: gdObject, variantName: string) => {
  gd.asCustomObjectConfiguration(object.getConfiguration()).setVariantName(
    variantName
  );
};

const getVariantName = (object: gdObject): string =>
  gd.asCustomObjectConfiguration(object.getConfiguration()).getVariantName();

/**
 * A project with a custom object used (on its "Dark" variant) by a scene
 * object, a global object and the child of another custom object, plus a
 * custom object installed from the store.
 */
const createFakeProject = () => {
  // $FlowFixMe[invalid-constructor]
  const project = new gd.ProjectHelper.createNewGDJSProject();

  const uiExtension = project.insertNewEventsFunctionsExtension('UI', 0);
  const dialog = uiExtension.getEventsBasedObjects().insertNew('Dialog', 0);
  dialog.setFullName('Dialog');
  dialog.getLayers().insertNewLayer('', 0);
  dialog.getObjects().insertNewObject(project, 'Sprite', 'Back', 0);
  dialog
    .getPropertyDescriptors()
    .insertNew('Title', 0)
    .setType('String')
    .setValue('Hello');
  // No parameter: `ensureObjectEventsFunctionsProperParameters` adds the
  // implicit `Object` one.
  const openFunction = dialog
    .getEventsFunctions()
    .insertNewEventsFunction('Open', 0);
  openFunction.setFunctionType(gd.EventsFunction.Action);
  const darkVariant = dialog.getVariants().insertNewVariant('Dark', 0);
  darkVariant.getLayers().insertNewLayer('', 0);
  darkVariant.setAreaMaxX(120);
  darkVariant.setAssetStoreAssetId('asset-123');
  darkVariant.setAssetStoreOriginalName('Dark dialog');
  registerFakeExtensionMetadata(project, uiExtension);

  const menusExtension = project.insertNewEventsFunctionsExtension('Menus', 1);
  const panel = menusExtension.getEventsBasedObjects().insertNew('Panel', 0);
  panel.getLayers().insertNewLayer('', 0);
  const innerDialog = panel
    .getObjects()
    .insertNewObject(project, 'UI::Dialog', 'InnerDialog', 0);
  setVariantName(innerDialog, 'Dark');
  registerFakeExtensionMetadata(project, menusExtension);

  const scene = project.insertNewLayout('Level', 0);
  const mainDialog = scene
    .getObjects()
    .insertNewObject(project, 'UI::Dialog', 'MainDialog', 0);
  setVariantName(mainDialog, 'Dark');
  const globalDialog = project
    .getObjects()
    .insertNewObject(project, 'UI::Dialog', 'GlobalDialog', 0);
  setVariantName(globalDialog, 'Dark');

  const storeExtension = project.insertNewEventsFunctionsExtension('Health', 2);
  storeExtension.setOrigin(EXTENSION_STORE_ORIGIN_NAME, 'Health');
  storeExtension.getEventsBasedObjects().insertNew('HealthBar', 0);

  return { project };
};

describe('CustomObjectFunctions', () => {
  let project: gdProject;
  let options: LaunchFunctionOptionsWithProject;

  beforeEach(() => {
    ({ project } = createFakeProject());
    options = makeFakeLaunchFunctionOptionsWithProject(project);
  });

  afterEach(() => {
    project.delete();
  });

  const launchCreateCustomObject = (
    args: Object
  ): Promise<EditorFunctionGenericOutput> =>
    createCustomObject.launchFunction({ ...options, args });

  const launchChangeCustomObject = (
    args: Object
  ): Promise<EditorFunctionGenericOutput> =>
    changeCustomObject.launchFunction({ ...options, args });

  const getEventsBasedObject = (
    extensionName: string,
    objectName: string
  ): gdEventsBasedObject =>
    project
      .getEventsFunctionsExtension(extensionName)
      .getEventsBasedObjects()
      .get(objectName);

  describe('create_custom_object', () => {
    it('creates a custom object with a base layer, its settings and its type', async () => {
      const result = await launchCreateCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Tool bar',
        full_name: 'Tool bar',
        description: 'A bar of tools',
        default_name: 'ToolBar',
        is_3d: true,
        is_private: true,
        area: { minX: 0, minY: 0, maxX: 100, maxY: 40 },
      });

      expect(result.success).toBe(true);
      expect(result.extensionName).toBe('UI');
      expect(result.customObjectName).toBe('Tool_bar');
      expect(result.objectType).toBe('UI::Tool_bar');

      const eventsBasedObject = getEventsBasedObject('UI', 'Tool_bar');
      expect(eventsBasedObject.getFullName()).toBe('Tool bar');
      expect(eventsBasedObject.getDescription()).toBe('A bar of tools');
      expect(eventsBasedObject.getDefaultName()).toBe('ToolBar');
      expect(eventsBasedObject.isRenderedIn3D()).toBe(true);
      expect(eventsBasedObject.isPrivate()).toBe(true);
      expect(eventsBasedObject.getAreaMaxX()).toBe(100);
      expect(eventsBasedObject.getAreaMaxY()).toBe(40);
      // Children are always put on a layer.
      expect(eventsBasedObject.getLayers().getLayersCount()).toBe(1);
      expect(eventsBasedObject.getLayers().hasLayerNamed('')).toBe(true);

      expect(options.onExtensionsModifiedOutsideEditor).toHaveBeenCalledWith({
        extensionNames: ['UI'],
        needsCodeRegeneration: true,
      });
    });

    it('makes the name unique and says which name to use', async () => {
      const result = await launchCreateCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
      });

      expect(result.success).toBe(true);
      expect(result.customObjectName).toBe('Dialog2');
      expect(result.message).toContain('use "Dialog2" from now on');
    });

    it('duplicates a custom object of another extension, with the implicit Object parameter of its functions', async () => {
      const result = await launchCreateCustomObject({
        extension_name: 'Menus',
        custom_object_name: 'CopiedDialog',
        duplicated_custom_object_name: 'Dialog',
        duplicated_from_extension_name: 'UI',
      });

      expect(result.success).toBe(true);
      expect(result.objectType).toBe('Menus::CopiedDialog');

      const copy = getEventsBasedObject('Menus', 'CopiedDialog');
      expect(copy.getObjects().hasObjectNamed('Back')).toBe(true);
      expect(copy.getVariants().hasVariantNamed('Dark')).toBe(true);

      const openFunction = copy.getEventsFunctions().getEventsFunction('Open');
      const firstParameter = openFunction.getParameters().getParameterAt(0);
      expect(firstParameter.getName()).toBe('Object');
      expect(firstParameter.getType()).toBe('object');
      expect(firstParameter.getExtraInfo()).toBe('Menus::CopiedDialog');
    });

    it('lists the existing custom objects when the one to duplicate is unknown', async () => {
      const result = await launchCreateCustomObject({
        extension_name: 'Menus',
        custom_object_name: 'CopiedDialog',
        duplicated_custom_object_name: 'Unknown',
        duplicated_from_extension_name: 'UI',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('"Dialog"');
    });

    it('refuses to create a custom object in an extension installed from the store', async () => {
      const result = await launchCreateCustomObject({
        extension_name: 'Health',
        custom_object_name: 'MyBar',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'is installed from the GDevelop extension store'
      );
    });
  });

  describe('change_custom_object', () => {
    it('changes the settings of a custom object', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        changed_settings: [
          { setting_name: 'fullName', new_value: 'A dialog box' },
          { setting_name: 'isAnimatable', new_value: 'true' },
          { setting_name: 'isInnerAreaFollowingParentSize', new_value: true },
          { setting_name: 'areaMaxX', new_value: '200' },
          { setting_name: 'assetStoreTag', new_value: 'ui' },
        ],
      });

      expect(result.success).toBe(true);
      const dialog = getEventsBasedObject('UI', 'Dialog');
      expect(dialog.getFullName()).toBe('A dialog box');
      expect(dialog.isAnimatable()).toBe(true);
      expect(dialog.isInnerAreaFollowingParentSize()).toBe(true);
      expect(dialog.getAreaMaxX()).toBe(200);
      expect(dialog.getAssetStoreTag()).toBe('ui');
      expect(result.variantNames).toEqual(['Dark']);
    });

    it('regenerates nothing but the metadata when only the labels changed', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        changed_settings: [
          { setting_name: 'description', new_value: 'A dialog' },
        ],
      });

      expect(result.success).toBe(true);
      expect(options.onExtensionsModifiedOutsideEditor).toHaveBeenCalledWith({
        extensionNames: ['UI'],
        needsCodeRegeneration: false,
      });
    });

    it('lists the allowed settings when one is unknown, and changes nothing', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        changed_settings: [
          { setting_name: 'fullName', new_value: 'Changed' },
          { setting_name: 'isRenderedIn2D', new_value: 'true' },
        ],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown custom object setting');
      expect(result.message).toContain('"isRenderedIn3D"');
      expect(getEventsBasedObject('UI', 'Dialog').getFullName()).toBe('Dialog');
    });

    it('refuses a setting value of the wrong kind', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        changed_settings: [{ setting_name: 'areaMaxX', new_value: 'wide' }],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('`areaMaxX` must be a number');
    });

    it('is a success that changed nothing when there is nothing to change', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
      });

      expect(result.success).toBe(true);
      expect(result.nothingChanged).toBe(true);
      expect(options.onExtensionsModifiedOutsideEditor).not.toHaveBeenCalled();
    });

    it('renames a custom object used by a scene object and by a child of another custom object', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        new_name: 'Popup',
      });

      expect(result.success).toBe(true);
      expect(result.customObjectName).toBe('Popup');
      expect(result.objectType).toBe('UI::Popup');

      expect(
        project
          .getLayout('Level')
          .getObjects()
          .getObject('MainDialog')
          .getType()
      ).toBe('UI::Popup');
      expect(
        getEventsBasedObject('Menus', 'Panel')
          .getObjects()
          .getObject('InnerDialog')
          .getType()
      ).toBe('UI::Popup');

      expect(options.onProjectItemRenamedOutsideEditor).toHaveBeenCalledWith({
        kind: 'custom-object',
        extensionName: 'UI',
        oldName: 'Dialog',
        newName: 'Popup',
      });
    });

    it('refuses a new name already used by another custom object', async () => {
      const uiExtension = project.getEventsFunctionsExtension('UI');
      uiExtension.getEventsBasedObjects().insertNew('Popup', 1);

      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        new_name: 'Popup',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('already used by another custom object');
    });

    it('creates, edits and deletes properties through the shared property changes', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        changed_properties: [
          { property_name: 'Title', new_name: 'Caption', label: 'Caption' },
          { property_name: 'Speed', type: 'Number', default_value: '10' },
        ],
      });

      expect(result.success).toBe(true);
      const properties = getEventsBasedObject(
        'UI',
        'Dialog'
      ).getPropertyDescriptors();
      expect(properties.has('Caption')).toBe(true);
      expect(properties.get('Caption').getLabel()).toBe('Caption');
      expect(properties.get('Speed').getType()).toBe('Number');
      expect(properties.get('Speed').getValue()).toBe('10');
    });

    it('refuses a property type that is not allowed on a custom object', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        changed_properties: [{ property_name: 'Ground', type: 'Layer' }],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('is not allowed');
      expect(
        getEventsBasedObject('UI', 'Dialog')
          .getPropertyDescriptors()
          .has('Ground')
      ).toBe(false);
    });

    describe('fit_area_to_children', () => {
      // A child with an instance of a known size, so the expected area is
      // exact (the size is set on the instance: the fake platform of the
      // tests gives no default size to a 3D object).
      const addChildWithInstanceAt = (
        eventsBasedObject: gdEventsBasedObject,
        objectName: string,
        position: { x: number, y: number, z: number },
        size: number
      ) => {
        eventsBasedObject
          .getObjects()
          .insertNewObject(
            project,
            'Sprite',
            objectName,
            eventsBasedObject.getObjects().getObjectsCount()
          );

        const instance = eventsBasedObject
          .getInitialInstances()
          .insertNewInitialInstance();
        instance.setObjectName(objectName);
        instance.setLayer('');
        instance.setX(position.x);
        instance.setY(position.y);
        instance.setZ(position.z);
        instance.setHasCustomSize(true);
        instance.setCustomWidth(size);
        instance.setCustomHeight(size);
        instance.setHasCustomDepth(true);
        instance.setCustomDepth(size);
        return instance;
      };

      const getArea = (eventsBasedObject: gdEventsBasedObject) => {
        const variant = eventsBasedObject.getDefaultVariant();
        return {
          minX: variant.getAreaMinX(),
          minY: variant.getAreaMinY(),
          minZ: variant.getAreaMinZ(),
          maxX: variant.getAreaMaxX(),
          maxY: variant.getAreaMaxY(),
          maxZ: variant.getAreaMaxZ(),
        };
      };

      it('sets the area from the children, with their minimum corner at the origin', async () => {
        const dialog = getEventsBasedObject('UI', 'Dialog');
        dialog.markAsRenderedIn3D(true);
        addChildWithInstanceAt(dialog, 'Body', { x: 10, y: 10, z: 0 }, 40);
        addChildWithInstanceAt(dialog, 'Top', { x: 20, y: 20, z: 40 }, 20);

        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          fit_area_to_children: 'min_at_origin',
        });

        expect(result.success).toBe(true);
        // The area, where the object turns and where its children ended up:
        // "Top" is not centered on "Body", which only the boxes tell.
        expect(result.message).toContain(
          'Fitted the area of the default variant to its children: 0;0;0 to 40;40;60 (children moved so (0;0;0) is their minimum corner).'
        );
        expect(result.message).toContain(
          'Its center of rotation, the center of that area unless its events set another one, is at 20;20;30 from its own position'
        );
        expect(result.message).toContain(
          'Children: "Body" X 0 to 40, Y 0 to 40, Z 0 to 40, middle 20;20;20; "Top" X 10 to 30, Y 10 to 30, Z 40 to 60, middle 20;20;50.'
        );
        // Children spanning 10..50 on X and Y, 0..60 on Z, moved to start at 0.
        expect(getArea(dialog)).toEqual({
          minX: 0,
          minY: 0,
          minZ: 0,
          maxX: 40,
          maxY: 40,
          maxZ: 60,
        });
      });

      it('centers the children on the origin, so the object turns around its own position', async () => {
        const dialog = getEventsBasedObject('UI', 'Dialog');
        dialog.markAsRenderedIn3D(true);
        addChildWithInstanceAt(dialog, 'Body', { x: 10, y: 10, z: 0 }, 40);

        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          fit_area_to_children: 'centered_on_origin',
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain(
          'Its center of rotation, the center of that area unless its events set another one, is now its own position (0;0;0).'
        );
        // A symmetric area: its center (the center of rotation) is the origin.
        expect(getArea(dialog)).toEqual({
          minX: -20,
          minY: -20,
          minZ: -20,
          maxX: 20,
          maxY: 20,
          maxZ: 20,
        });
      });

      it('takes the rotation of an instance into account', async () => {
        const dialog = getEventsBasedObject('UI', 'Dialog');
        // A 100x20 child turned by 90 degrees occupies 20x100.
        const instance = addChildWithInstanceAt(
          dialog,
          'Bar',
          { x: 0, y: 0, z: 0 },
          100
        );
        instance.setCustomHeight(20);
        instance.setAngle(90);

        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          fit_area_to_children: 'min_at_origin',
        });

        expect(result.success).toBe(true);
        expect(getArea(dialog)).toEqual({
          minX: 0,
          minY: 0,
          minZ: 0,
          maxX: 20,
          maxY: 100,
          maxZ: 0,
        });
        // It turns around its middle (50;10 from its corner), so its corner
        // goes to (-40;40) for the box it occupies to start at the origin.
        expect(instance.getX()).toBe(-40);
        expect(instance.getY()).toBe(40);
      });

      it('refuses to fit when the size of a child is unknown, and moves nothing', async () => {
        const dialog = getEventsBasedObject('UI', 'Dialog');
        // A text has no size of its own until an instance gives it one.
        dialog
          .getObjects()
          .insertNewObject(
            project,
            'TextObject::Text',
            'Label',
            dialog.getObjects().getObjectsCount()
          );
        const instance = dialog
          .getInitialInstances()
          .insertNewInitialInstance();
        instance.setObjectName('Label');
        instance.setLayer('');
        instance.setX(30);
        instance.setY(40);

        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          fit_area_to_children: 'min_at_origin',
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain('was NOT fitted');
        expect(result.message).toContain('"Label"');
        // Neither the area nor the children were touched.
        expect(getArea(dialog)).toEqual({
          minX: 0,
          minY: 0,
          minZ: 0,
          maxX: 64,
          maxY: 64,
          maxZ: 64,
        });
        expect(instance.getX()).toBe(30);
        expect(instance.getY()).toBe(40);
      });

      it('refuses an unknown mode', async () => {
        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          fit_area_to_children: 'around_the_origin',
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain('around_the_origin');
        expect(result.message).toContain('min_at_origin');
      });

      it('says when there is no child instance to fit the area to', async () => {
        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          fit_area_to_children: 'min_at_origin',
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain('no variant of this custom object');
      });
    });

    describe('changed_variants', () => {
      it('creates a variant as a copy of the default variant', async () => {
        // A copy brings the instances and the layers of its source.
        const defaultVariant = getEventsBasedObject(
          'UI',
          'Dialog'
        ).getDefaultVariant();
        defaultVariant
          .getInitialInstances()
          .insertNewInitialInstance()
          .setObjectName('Back');
        defaultVariant.getLayers().insertNewLayer('Front', 1);

        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          changed_variants: [
            { variant_name: 'Light', duplicated_from_variant_name: '' },
          ],
        });

        expect(result.success).toBe(true);
        expect(result.variantNames).toEqual(['Dark', 'Light']);
        const light = getEventsBasedObject('UI', 'Dialog')
          .getVariants()
          .getVariant('Light');
        expect(light.getObjects().hasObjectNamed('Back')).toBe(true);
        expect(light.getLayers().hasLayerNamed('')).toBe(true);
        expect(light.getLayers().hasLayerNamed('Front')).toBe(true);
        expect(light.getInitialInstances().getInstancesCount()).toBe(1);
      });

      it('refuses to duplicate a variant deleted earlier in the same call, changing nothing', async () => {
        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          changed_variants: [
            { variant_name: 'Dark', delete_this_variant: true },
            { variant_name: 'Dark2', duplicated_from_variant_name: 'Dark' },
          ],
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain('Variant to duplicate not found');
        const variants = getEventsBasedObject('UI', 'Dialog').getVariants();
        expect(variants.hasVariantNamed('Dark')).toBe(true);
        expect(variants.hasVariantNamed('Dark2')).toBe(false);
      });

      it('clears the asset store ids of a variant copied from a named one', async () => {
        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          changed_variants: [
            { variant_name: 'Darker', duplicated_from_variant_name: 'Dark' },
          ],
        });

        expect(result.success).toBe(true);
        const darker = getEventsBasedObject('UI', 'Dialog')
          .getVariants()
          .getVariant('Darker');
        expect(darker.getName()).toBe('Darker');
        expect(darker.getAreaMaxX()).toBe(120);
        expect(darker.getAssetStoreAssetId()).toBe('');
        expect(darker.getAssetStoreOriginalName()).toBe('');
      });

      it('creates an empty variant with the area of the default variant and the same children', async () => {
        getEventsBasedObject('UI', 'Dialog')
          .getDefaultVariant()
          .setAreaMaxY(64);

        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          changed_variants: [{ variant_name: 'Empty' }],
        });

        expect(result.success).toBe(true);
        const empty = getEventsBasedObject('UI', 'Dialog')
          .getVariants()
          .getVariant('Empty');
        expect(empty.getAreaMaxY()).toBe(64);
        expect(empty.getLayers().getLayersCount()).toBe(1);
        expect(empty.getInitialInstances().getInstancesCount()).toBe(0);
        // The variants always hold the children of the custom object.
        expect(empty.getObjects().hasObjectNamed('Back')).toBe(true);
      });

      it('makes the name of a new variant unique', async () => {
        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          changed_variants: [{ variant_name: 'Dark' }],
        });

        expect(result.success).toBe(true);
        expect(result.variantNames).toEqual(['Dark', 'Dark2']);
      });

      it('refuses to rename a variant and applies nothing else of the call', async () => {
        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          changed_settings: [
            { setting_name: 'fullName', new_value: 'Changed' },
          ],
          changed_variants: [{ variant_name: 'Dark', new_name: 'Darkest' }],
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe(VARIANT_RENAME_REJECTED_MESSAGE);
        expect(result.message).toContain(
          'Renaming a variant is not supported yet'
        );
        const dialog = getEventsBasedObject('UI', 'Dialog');
        expect(dialog.getFullName()).toBe('Dialog');
        expect(dialog.getVariants().hasVariantNamed('Dark')).toBe(true);
        expect(dialog.getVariants().hasVariantNamed('Darkest')).toBe(false);
      });

      it('refuses to delete the default variant', async () => {
        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          changed_variants: [{ variant_name: '', delete_this_variant: true }],
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain(
          'The default variant cannot be deleted'
        );
      });

      it('lists the existing variants when the one to delete is unknown', async () => {
        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          changed_variants: [
            { variant_name: 'Unknown', delete_this_variant: true },
          ],
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain('"Dark"');
      });

      it('deletes a variant and puts back on the default variant everything using it', async () => {
        const result = await launchChangeCustomObject({
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          changed_variants: [
            { variant_name: 'Dark', delete_this_variant: true },
          ],
        });

        expect(result.success).toBe(true);
        expect(result.variantNames).toEqual([]);
        expect(options.onWillDeleteExtensionItem).toHaveBeenCalledWith({
          kind: 'custom-object-variant',
          extensionName: 'UI',
          objectName: 'Dialog',
          variantName: 'Dark',
        });

        expect(
          getVariantName(
            project
              .getLayout('Level')
              .getObjects()
              .getObject('MainDialog')
          )
        ).toBe('');
        expect(
          getVariantName(project.getObjects().getObject('GlobalDialog'))
        ).toBe('');
        expect(
          getVariantName(
            getEventsBasedObject('Menus', 'Panel')
              .getObjects()
              .getObject('InnerDialog')
          )
        ).toBe('');
        expect(
          getEventsBasedObject('UI', 'Dialog')
            .getVariants()
            .hasVariantNamed('Dark')
        ).toBe(false);
      });
    });

    it('creates the functions forwarding the ones of a child object', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'Menus',
        custom_object_name: 'Panel',
        forward_child_object_functions: ['InnerDialog'],
      });

      expect(result.success).toBe(true);
      expect(
        getEventsBasedObject('Menus', 'Panel')
          .getEventsFunctions()
          .hasEventsFunctionNamed('Open')
      ).toBe(true);
    });

    it('lists the child objects when the one to forward is unknown', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'Menus',
        custom_object_name: 'Panel',
        forward_child_object_functions: ['Unknown'],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('"InnerDialog"');
    });

    it('refuses to delete a custom object that is still used', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        delete_this_custom_object: true,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('is still used');
      expect(result.message).toContain('delete_even_if_used');
      expect(
        project
          .getEventsFunctionsExtension('UI')
          .getEventsBasedObjects()
          .has('Dialog')
      ).toBe(true);
      expect(options.onWillDeleteExtensionItem).not.toHaveBeenCalled();
    });

    it('deletes a custom object in use when it is forced to', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        delete_this_custom_object: true,
        delete_even_if_used: true,
      });

      expect(result.success).toBe(true);
      expect(options.onWillDeleteExtensionItem).toHaveBeenCalledWith({
        kind: 'custom-object',
        extensionName: 'UI',
        objectName: 'Dialog',
      });
      expect(
        project
          .getEventsFunctionsExtension('UI')
          .getEventsBasedObjects()
          .has('Dialog')
      ).toBe(false);
      expect(options.onExtensionsModifiedOutsideEditor).toHaveBeenCalledWith({
        extensionNames: ['UI'],
        needsCodeRegeneration: true,
      });
    });

    it('refuses every mutation of a custom object of a store extension', async () => {
      const changeResult = await launchChangeCustomObject({
        extension_name: 'Health',
        custom_object_name: 'HealthBar',
        changed_settings: [{ setting_name: 'fullName', new_value: 'Changed' }],
      });
      expect(changeResult.success).toBe(false);
      expect(changeResult.message).toContain(
        'is installed from the GDevelop extension store'
      );

      const deleteResult = await launchChangeCustomObject({
        extension_name: 'Health',
        custom_object_name: 'HealthBar',
        delete_this_custom_object: true,
      });
      expect(deleteResult.success).toBe(false);
      expect(
        project
          .getEventsFunctionsExtension('Health')
          .getEventsBasedObjects()
          .has('HealthBar')
      ).toBe(true);
    });

    it('lists the existing custom objects when the custom object is unknown', async () => {
      const result = await launchChangeCustomObject({
        extension_name: 'UI',
        custom_object_name: 'Unknown',
        new_name: 'Whatever',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Custom object "Unknown" not found');
      expect(result.message).toContain('"Dialog"');
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
      const args = { extension_name: 'UI', custom_object_name: 'Dialog' };
      expect(renderText(createCustomObject, args)).toBeTruthy();
      expect(renderText(changeCustomObject, args)).toBeTruthy();
      expect(
        renderText(changeCustomObject, {
          ...args,
          delete_this_custom_object: true,
        })
      ).toBeTruthy();
    });
  });
});
