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
import { makeTestExtensions } from '../../fixtures/TestExtensions';
import tankConfigurationExtensionJson from '../../fixtures/TankConfigurationExtension.json';
import leaderboardDialogExtensionJson from '../../fixtures/LeaderboardDialogExtension.json';

const gd: libGDevelop = global.gd;

const createFakeEventsFunctionCodeWriter = (): EventsFunctionCodeWriter => ({
  getIncludeFileFor: (functionName: string) => `${functionName}.js`,
  writeFunctionCode: () => Promise.resolve(),
  writeBehaviorCode: () => Promise.resolve(),
  writeObjectCode: () => Promise.resolve(),
});

// Registers the generated metadata of an extension in the platform, as the
// editor does after any change: this is what the call forms are read from.
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

const createFakeExtensionFromJson = (
  project: gdProject,
  extensionName: string,
  extensionJson: Object,
  position: number
): gdEventsFunctionsExtension => {
  const extension = project.insertNewEventsFunctionsExtension(
    extensionName,
    position
  );
  unserializeFromJSObject(extension, extensionJson, 'unserializeFrom', project);
  registerFakeExtensionMetadata(project, extension);
  return extension;
};

/**
 * An authored extension with a behavior (properties, a shared property, a
 * lifecycle function, a private function) and a custom object with a named
 * variant: everything the fixtures don't have.
 */
const createFakeAuthoredExtension = (
  project: gdProject
): gdEventsFunctionsExtension => {
  const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
  extension.setFullName('My extension');
  extension.setShortDescription('An extension made for tests');
  extension
    .getGlobalVariables()
    .insertNew('HighScore', 0)
    .setValue(100);

  const behavior = extension
    .getEventsBasedBehaviors()
    .insertNew('MyBehavior', 0);
  behavior.setFullName('My behavior');
  behavior
    .getPropertyDescriptors()
    .insertNew('Health', 0)
    .setType('Number')
    .setValue('100');
  behavior
    .getSharedPropertyDescriptors()
    .insertNew('Gravity', 0)
    .setType('Number')
    .setValue('9.8');

  behavior.getEventsFunctions().insertNewEventsFunction('doStepPreEvents', 0);
  const hitFunction = behavior
    .getEventsFunctions()
    .insertNewEventsFunction('Hit', 1);
  hitFunction.setFunctionType(gd.EventsFunction.Action);
  hitFunction.setSentence('Hit _PARAM0_ for _PARAM2_ damage');
  const isDeadFunction = behavior
    .getEventsFunctions()
    .insertNewEventsFunction('IsDead', 2);
  isDeadFunction.setFunctionType(gd.EventsFunction.Condition);
  const privateFunction = behavior
    .getEventsFunctions()
    .insertNewEventsFunction('ResetInternalState', 3);
  privateFunction.setFunctionType(gd.EventsFunction.Action);
  privateFunction.setPrivate(true);
  gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
    extension,
    behavior
  );
  hitFunction
    .getParameters()
    .insertNewParameter('Damage', 2)
    .setType('expression')
    .setDescription('Damage');

  const eventsBasedObject = extension
    .getEventsBasedObjects()
    .insertNew('MyButton', 0);
  eventsBasedObject.setFullName('My button');
  eventsBasedObject.getObjects().insertNewObject(project, 'Sprite', 'Back', 0);
  eventsBasedObject
    .getObjects()
    .insertNewObject(project, 'TextObject::Text', 'Label', 1);
  // Object groups belong to the events-based object (shared by its variants).
  const visualsGroup = eventsBasedObject
    .getObjects()
    .getObjectGroups()
    .insertNew('Visuals', 0);
  visualsGroup.addObject('Back');
  visualsGroup.addObject('Label');
  const pressedVariant = eventsBasedObject
    .getVariants()
    .insertNewVariant('Pressed', 0);
  pressedVariant.getObjects().insertNewObject(project, 'Sprite', 'Back', 0);
  const pressedLabel = pressedVariant
    .getObjects()
    .insertNewObject(project, 'TextObject::Text', 'Label', 1);
  pressedLabel.getConfiguration().updateProperty('text', 'Pressed!');
  pressedLabel
    .getVariables()
    .insertNew('Blink', 0)
    .setBool(true);
  pressedVariant.setAreaMaxX(64);
  pressedVariant.setAssetStoreAssetId('asset-123');
  pressedVariant.setAssetStoreOriginalName('Blue button');
  const pressedEffect = pressedVariant
    .getLayers()
    .getLayer('')
    .getEffects()
    .insertNewEffect('Glow', 0);
  pressedEffect.setEffectType('Glow');
  const pressedInstance = pressedVariant
    .getInitialInstances()
    .insertNewInitialInstance();
  pressedInstance.setObjectName('Back');
  pressedInstance.setX(4);
  pressedInstance.setY(8);

  registerFakeExtensionMetadata(project, extension);
  return extension;
};

const inspectExtension = async (
  project: gdProject,
  args: Object
): Promise<EditorFunctionGenericOutput> =>
  editorFunctions.inspect_extension.launchFunction({
    ...makeFakeLaunchFunctionOptionsWithProject(project),
    args,
  });

describe('inspect_extension', () => {
  let project: gdProject;

  beforeAll(() => {
    makeTestExtensions(gd);
  });

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
  });

  afterEach(() => {
    project.delete();
  });

  describe('extension level', () => {
    it('lists custom objects, behaviors and free functions with one-line signatures', async () => {
      createFakeExtensionFromJson(
        project,
        'TankConfiguration',
        tankConfigurationExtensionJson,
        0
      );

      const result = await inspectExtension(project, {
        extension_name: 'TankConfiguration',
      });

      expect(result.success).toBe(true);
      const extension = result.extension;
      if (!extension) throw new Error('Expected an extension in the output.');
      expect(extension.extensionName).toBe('TankConfiguration');
      expect(extension.isReadOnly).toBe(false);
      expect(extension.readOnlyReason).toBeUndefined();
      // Always arrays, so a script can iterate without checking for undefined.
      expect(extension.globalVariables).toEqual([]);
      expect(extension.sceneVariables).toEqual([
        { variableName: 'CannonWidth', type: 'Number', value: '0' },
      ]);
      expect(extension.dependencies).toEqual([]);
      expect(extension.tests).toEqual([]);
      expect(extension.freeFunctions).toEqual([]);

      expect(extension.customObjects.map(object => object.objectName)).toEqual([
        'CombinedTank',
        'TankTop',
      ]);
      expect(extension.customObjects[0]).toEqual({
        objectName: 'CombinedTank',
        objectType: 'TankConfiguration::CombinedTank',
        fullName: 'Combined Tank',
        signature:
          '2 child objects (TankBase, TankTop_Combined), 5 functions, 2 properties, variants: none',
      });
      expect(extension.customObjects[1].signature).toBe(
        '2 child objects (TankTop, TankCanon), 2 functions, 0 properties, variants: none'
      );
      expect(extension.customBehaviors).toEqual([]);
    });

    it('describes behaviors and free functions of an authored extension', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
      });

      expect(result.success).toBe(true);
      const extension = result.extension;
      if (!extension) throw new Error('Expected an extension in the output.');
      expect(extension.globalVariables).toEqual([
        { variableName: 'HighScore', type: 'Number', value: '100' },
      ]);
      expect(extension.customBehaviors).toEqual([
        {
          behaviorName: 'MyBehavior',
          behaviorType: 'MyExt::MyBehavior',
          fullName: 'My behavior',
          signature: 'for any object - 1 properties, 4 functions',
        },
      ]);
      expect(extension.customObjects[0].signature).toBe(
        '2 child objects (Back, Label), 0 functions, 0 properties, variants: Pressed'
      );
    });

    it('reports a store extension as read-only', async () => {
      const extension = createFakeExtensionFromJson(
        project,
        'LeaderboardDialog',
        leaderboardDialogExtensionJson,
        0
      );
      extension.setOrigin('gdevelop-extension-store', 'LeaderboardDialog');

      const result = await inspectExtension(project, {
        extension_name: 'LeaderboardDialog',
      });

      expect(result.success).toBe(true);
      const inspectedExtension = result.extension;
      if (!inspectedExtension)
        throw new Error('Expected an extension in the output.');
      expect(inspectedExtension.isReadOnly).toBe(true);
      expect(inspectedExtension.readOnlyReason).toBe(
        '"LeaderboardDialog" comes from the GDevelop extension store and is updated from there: it is read-only.'
      );
      expect(inspectedExtension.originIdentifier).toBe('LeaderboardDialog');
    });

    it('says so when the extension has no generated metadata yet', async () => {
      // Not registered in the platform: no call form can be computed.
      const extension = project.insertNewEventsFunctionsExtension(
        'NeverGenerated',
        0
      );
      extension.getEventsFunctions().insertNewEventsFunction('DoSomething', 0);

      const result = await inspectExtension(project, {
        extension_name: 'NeverGenerated',
        function_name: 'DoSomething',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('no generated metadata');
      const inspectedFunction = result.functionDeclaration;
      if (!inspectedFunction) throw new Error('Expected a function.');
      expect(inspectedFunction.callForm).toBeUndefined();
      expect(inspectedFunction.callFormUnavailableReason).toContain(
        'No generated metadata for this function yet'
      );
    });

    it('includes private functions (the caller is authoring the extension)', async () => {
      createFakeExtensionFromJson(
        project,
        'LeaderboardDialog',
        leaderboardDialogExtensionJson,
        0
      );

      const result = await inspectExtension(project, {
        extension_name: 'LeaderboardDialog',
      });

      expect(result.success).toBe(true);
      const extension = result.extension;
      if (!extension) throw new Error('Expected an extension in the output.');
      const privateFunction = extension.freeFunctions.find(
        freeFunction => freeFunction.functionName === 'IsInGameEdition'
      );
      expect(privateFunction).toBeDefined();
      if (!privateFunction) throw new Error('Expected the private function.');
      expect(privateFunction.isPrivate).toBe(true);
      expect(privateFunction.signature).toContain('[private]');
    });
  });

  describe('custom object level', () => {
    it('returns the custom object with its type, variants and call forms', async () => {
      createFakeExtensionFromJson(
        project,
        'TankConfiguration',
        tankConfigurationExtensionJson,
        0
      );

      const result = await inspectExtension(project, {
        extension_name: 'TankConfiguration',
        custom_object_name: 'CombinedTank',
      });

      expect(result.success).toBe(true);
      const customObject = result.customObject;
      if (!customObject) throw new Error('Expected a custom object.');
      expect(customObject.objectName).toBe('CombinedTank');
      expect(customObject.objectType).toBe('TankConfiguration::CombinedTank');
      expect(customObject.variantNames).toEqual([]);
      // Variants are listed by name only: their content is read with `variant_name`.
      expect(customObject).not.toHaveProperty('variants');
      expect(customObject.childObjects.map(child => child.objectName)).toEqual([
        'TankBase',
        'TankTop_Combined',
      ]);
      expect(
        customObject.properties.map(property => property.propertyName)
      ).toEqual(['CannonAngle', 'TopRotation']);

      // An `ActionWithOperator` is called with an operator and mentions its getter.
      const setTopRotation = customObject.functions.find(
        someFunction => someFunction.functionName === 'SetTopRotation'
      );
      if (!setTopRotation) throw new Error('Expected SetTopRotation.');
      expect(setTopRotation.callForm).toBe(
        'TankConfiguration::CombinedTank::SetTopRotation(Object, =, Value) | read the value with Object.TopRotation()'
      );
      expect(setTopRotation.instructionType).toBe(
        'TankConfiguration::CombinedTank::SetTopRotation'
      );

      // An `ExpressionAndCondition` has both call forms.
      const topRotation = customObject.functions.find(
        someFunction => someFunction.functionName === 'TopRotation'
      );
      if (!topRotation) throw new Error('Expected TopRotation.');
      expect(topRotation.callForm).toBe(
        'Object.TopRotation() | TankConfiguration::CombinedTank::TopRotation(Object, >, Value)'
      );

      expect(result.message).toContain('replace `Object`');
    });

    it('returns the call form of a store extension function (from the generated metadata)', async () => {
      const extension = createFakeExtensionFromJson(
        project,
        'LeaderboardDialog',
        leaderboardDialogExtensionJson,
        0
      );
      extension.setOrigin('gdevelop-extension-store', 'LeaderboardDialog');

      const result = await inspectExtension(project, {
        extension_name: 'LeaderboardDialog',
        custom_object_name: 'LeaderboardDialog',
        function_name: 'SetScore',
      });

      expect(result.success).toBe(true);
      const inspectedFunction = result.functionDeclaration;
      if (!inspectedFunction) throw new Error('Expected a function.');
      expect(inspectedFunction.owner).toBe('object');
      expect(inspectedFunction.callForm).toBe(
        'LeaderboardDialog::LeaderboardDialog::SetScore(Object, =, Value) | read the value with Object.Score()'
      );
      expect(inspectedFunction.instructionType).toBe(
        'LeaderboardDialog::LeaderboardDialog::SetScore'
      );
      const inspectedExtension = result.extension;
      if (!inspectedExtension) throw new Error('Expected an extension.');
      expect(inspectedExtension.isReadOnly).toBe(true);
    });
  });

  describe('custom object level with variants', () => {
    it('lists the named variants by name only', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_object_name: 'MyButton',
      });

      expect(result.success).toBe(true);
      const customObject = result.customObject;
      if (!customObject) throw new Error('Expected a custom object.');
      expect(customObject.variantNames).toEqual(['Pressed']);
      expect(customObject).not.toHaveProperty('variants');
      // The default variant's child objects are still described.
      expect(customObject.childObjects.map(child => child.objectName)).toEqual([
        'Back',
        'Label',
      ]);
      // The groups carry the behaviors shared by their objects, like scene groups.
      const objectGroup = (customObject.objectGroups || [])[0];
      if (!objectGroup) throw new Error('Expected the Visuals object group.');
      expect(objectGroup.objectGroupName).toBe('Visuals');
      expect(objectGroup.objectNames).toEqual(['Back', 'Label']);
      expect(
        (objectGroup.behaviors || []).map(behavior => behavior.behaviorName)
      ).toEqual(['Effect', 'Opacity', 'Scale']);
    });
  });

  describe('custom behavior level', () => {
    it('returns properties, shared properties and call forms', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
      });

      expect(result.success).toBe(true);
      const customBehavior = result.customBehavior;
      if (!customBehavior) throw new Error('Expected a custom behavior.');
      expect(customBehavior.behaviorType).toBe('MyExt::MyBehavior');
      expect(
        customBehavior.properties.map(property => property.propertyName)
      ).toEqual(['Health']);
      expect(
        customBehavior.sharedProperties.map(property => property.propertyName)
      ).toEqual(['Gravity']);

      const hitFunction = customBehavior.functions.find(
        someFunction => someFunction.functionName === 'Hit'
      );
      if (!hitFunction) throw new Error('Expected the Hit function.');
      expect(hitFunction.callForm).toBe(
        'MyExt::MyBehavior::Hit(Object, Behavior, Damage)'
      );
      // A private function is listed like any other one.
      expect(
        customBehavior.functions.map(someFunction => someFunction.functionName)
      ).toContain('ResetInternalState');
    });

    it('always returns `sharedProperties` as an array', async () => {
      const extension = project.insertNewEventsFunctionsExtension('Empty', 0);
      extension.getEventsBasedBehaviors().insertNew('Plain', 0);
      registerFakeExtensionMetadata(project, extension);

      const result = await inspectExtension(project, {
        extension_name: 'Empty',
        custom_behavior_name: 'Plain',
      });

      expect(result.success).toBe(true);
      const customBehavior = result.customBehavior;
      if (!customBehavior) throw new Error('Expected a custom behavior.');
      expect(customBehavior.sharedProperties).toEqual([]);
    });
  });

  describe('function level', () => {
    it('describes a lifecycle function instead of giving it a call form', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        function_name: 'doStepPreEvents',
      });

      expect(result.success).toBe(true);
      const inspectedFunction = result.functionDeclaration;
      if (!inspectedFunction) throw new Error('Expected a function.');
      expect(inspectedFunction.owner).toBe('behavior');
      expect(inspectedFunction.isLifecycle).toBe(true);
      expect(inspectedFunction.lifecycleDescription).toBe(
        'every frame before the scene events'
      );
      expect(inspectedFunction.callForm).toBeUndefined();
      expect(inspectedFunction.instructionType).toBeUndefined();
    });

    it('returns a free function with its call form', async () => {
      createFakeExtensionFromJson(
        project,
        'LeaderboardDialog',
        leaderboardDialogExtensionJson,
        0
      );

      const result = await inspectExtension(project, {
        extension_name: 'LeaderboardDialog',
        function_name: 'FormatTime',
      });

      expect(result.success).toBe(true);
      const inspectedFunction = result.functionDeclaration;
      if (!inspectedFunction) throw new Error('Expected a function.');
      expect(inspectedFunction.owner).toBe('extension');
      // The generated metadata has a code-only `currentScene` first: the
      // declared names must still land on the right arguments.
      expect(inspectedFunction.callForm).toBe(
        'LeaderboardDialog::FormatTime(Time, Format)'
      );
      expect(
        inspectedFunction.parameters.map(parameter => parameter.name)
      ).toEqual(['Time', 'Format']);
    });
  });

  describe('variant level', () => {
    it('returns the default variant with its child objects and instances', async () => {
      createFakeExtensionFromJson(
        project,
        'TankConfiguration',
        tankConfigurationExtensionJson,
        0
      );

      const result = await inspectExtension(project, {
        extension_name: 'TankConfiguration',
        custom_object_name: 'CombinedTank',
        variant_name: '',
      });

      expect(result.success).toBe(true);
      const variant = result.variant;
      if (!variant) throw new Error('Expected a variant.');
      expect(variant.variantName).toBe('');
      expect(variant.isDefaultVariant).toBe(true);
      expect(variant.area).toEqual({
        minX: 0,
        minY: 0,
        minZ: 0,
        maxX: 95,
        maxY: 65,
        maxZ: 69,
      });
      expect(variant.childObjects.map(child => child.objectName)).toEqual([
        'TankBase',
        'TankTop_Combined',
      ]);
      expect(variant.layers).toEqual([
        {
          layerName: '',
          position: 0,
          isBaseLayer: true,
          visible: true,
          effects: [],
        },
      ]);
      expect(variant.objectGroups).toEqual([]);
      expect(variant.instances.length).toBe(2);
      // Instances are rendered exactly like `describe_instances` renders them.
      expect(variant.instances.map(instance => instance.name).sort()).toEqual([
        'TankBase',
        'TankTop_Combined',
      ]);
      variant.instances.forEach(instance => {
        expect(typeof instance.id).toBe('string');
        expect(typeof instance.x).toBe('number');
        expect(typeof instance.y).toBe('number');
      });
    });

    it('returns a named variant with its child object configurations', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_object_name: 'MyButton',
        variant_name: 'Pressed',
      });

      expect(result.success).toBe(true);
      const variant = result.variant;
      if (!variant) throw new Error('Expected a variant.');
      expect(variant.variantName).toBe('Pressed');
      expect(variant.isDefaultVariant).toBe(false);
      expect(variant.area.maxX).toBe(64);
      expect(variant.assetStoreAssetId).toBe('asset-123');
      expect(variant.assetStoreOriginalName).toBe('Blue button');
      expect(variant.childObjects.map(child => child.objectName)).toEqual([
        'Back',
        'Label',
      ]);
      // This variant's own child configuration and variables, not the default ones.
      expect(variant.childObjects[1].configuration).toContain('text: Pressed!');
      expect(variant.childObjects[1].objectVariables).toEqual([
        { variableName: 'Blink', type: 'Boolean', value: 'True' },
      ]);
      expect(variant.layers).toEqual([
        {
          layerName: '',
          position: 0,
          isBaseLayer: true,
          visible: true,
          effects: [{ effectName: 'Glow', effectType: 'Glow' }],
        },
      ]);
      // Object groups are shared by all the variants.
      expect(variant.objectGroups).toEqual([
        { objectGroupName: 'Visuals', objectNames: ['Back', 'Label'] },
      ]);
      expect(variant.instances).toHaveLength(1);
      expect(variant.instances[0].x).toBe(4);
    });

    it('lists the configuration of a child object', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_object_name: 'MyButton',
        variant_name: '',
      });

      expect(result.success).toBe(true);
      const variant = result.variant;
      if (!variant) throw new Error('Expected a variant.');
      const label = variant.childObjects.find(
        child => child.objectName === 'Label'
      );
      if (!label) throw new Error('Expected the Label child object.');
      expect(label.objectType).toBe('TextObject::Text');
      expect(label.configuration).toContain('text: Text');
      expect(label.objectVariables).toEqual([]);
      // The default variant sees the shared object groups too.
      expect(variant.objectGroups).toEqual([
        { objectGroupName: 'Visuals', objectNames: ['Back', 'Label'] },
      ]);
    });
  });

  describe('failures', () => {
    it('lists the existing extensions when the extension is unknown', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'Unknown',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Extension "Unknown" not found. Existing extensions: MyExt.'
      );
    });

    it('lists the existing custom objects when the custom object is unknown', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_object_name: 'Unknown',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Custom object "Unknown" not found in extension "MyExt". Existing custom objects: MyButton.'
      );
    });

    it('lists the existing custom behaviors when the custom behavior is unknown', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'Unknown',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Custom behavior "Unknown" not found in extension "MyExt". Existing custom behaviors: MyBehavior.'
      );
    });

    it('lists the existing functions when the function is unknown', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_behavior_name: 'MyBehavior',
        function_name: 'Unknown',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Function "Unknown" not found in custom behavior "MyBehavior". Existing functions: doStepPreEvents, Hit, IsDead, ResetInternalState.'
      );
    });

    it('lists the existing variants when the variant is unknown', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_object_name: 'MyButton',
        variant_name: 'Unknown',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Variant "Unknown" not found on custom object "MyButton" ("" is the default variant). Existing variants: Pressed.'
      );
    });

    it('refuses a custom object and a custom behavior at the same time', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        custom_object_name: 'MyButton',
        custom_behavior_name: 'MyBehavior',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('not both');
    });

    it('refuses a variant without a custom object', async () => {
      createFakeAuthoredExtension(project);

      const result = await inspectExtension(project, {
        extension_name: 'MyExt',
        variant_name: '',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('`variant_name` requires');
    });
  });
});
