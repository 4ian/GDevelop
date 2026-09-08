// @flow
import { mapFor, mapVector } from '../../Utils/MapFor';
import type {
  SimplifiedObject,
  SimplifiedObjectGroup,
  SimplifiedLayer,
  SimplifiedVariable,
  SimplifiedTest,
} from './SimplifiedProject';

// The declarations of the events-based extensions of a project (never their
// events), as sent to the AI in the simplified project. This is a contract with
// the backend (`gdevelop-simplified-project.js`, `getScopeContents`): keep both
// in sync.

export type SimplifiedParameter = {|
  name: string,
  type: string,
  label?: string,
  extraInfo?: string,
  optional?: boolean,
  // The `Object` (and `Behavior`) parameters every behavior/object function
  // has: not declared by the author, offsetting the `_PARAMn_` sentence indexes.
  isImplicit?: boolean,
|};

export type SimplifiedFunction = {|
  functionName: string,
  functionType: string,
  fullName?: string,
  description?: string,
  sentence?: string,
  isPrivate?: boolean,
  isAsync?: boolean,
  isDeprecated?: boolean,
  isLifecycle?: boolean,
  expressionType?: string,
  getterName?: string,
  parameters: Array<SimplifiedParameter>,
  eventsCount: number,
|};

export type SimplifiedProperty = {|
  propertyName: string,
  type: string,
  label?: string,
  description?: string,
  defaultValue?: string,
  group?: string,
  choices?: Array<{| value: string, label: string |}>,
  extraInfo?: Array<string>,
  hidden?: boolean,
  advanced?: boolean,
  deprecated?: boolean,
  measurementUnit?: string,
|};

export type SimplifiedCustomBehavior = {|
  behaviorName: string,
  fullName?: string,
  description?: string,
  objectType?: string,
  isPrivate?: boolean,
  properties: Array<SimplifiedProperty>,
  sharedProperties?: Array<SimplifiedProperty>,
  functions: Array<SimplifiedFunction>,
|};

export type SimplifiedArea = {|
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
|};

export type SimplifiedCustomObjectVariant = {|
  variantName: string,
  assetStoreAssetId?: string,
  assetStoreOriginalName?: string,
  area: SimplifiedArea,
  layers: Array<SimplifiedLayer>,
  // Same names and types as the default variant; behaviors and variables
  // carry this variant's values.
  childObjects: Array<SimplifiedObject>,
  instancesDescription: string,
|};

export type SimplifiedCustomObject = {|
  objectName: string,
  fullName?: string,
  description?: string,
  defaultName?: string,
  isRenderedIn3D?: boolean,
  isAnimatable?: boolean,
  isTextContainer?: boolean,
  isInnerAreaFollowingParentSize?: boolean,
  isPrivate?: boolean,
  area: SimplifiedArea,
  properties: Array<SimplifiedProperty>,
  functions: Array<SimplifiedFunction>,
  childObjects: Array<SimplifiedObject>,
  objectGroups?: Array<SimplifiedObjectGroup>,
  layers: Array<SimplifiedLayer>,
  instancesDescription: string,
  variants?: Array<SimplifiedCustomObjectVariant>,
|};

export type SimplifiedExtensionDependency = {|
  dependencyName: string,
  type: string,
  exportName?: string,
  version?: string,
|};

export type SimplifiedExtension = {|
  extensionName: string,
  fullName: string,
  shortDescription: string,
  description?: string,
  category?: string,
  tags?: string,
  version?: string,
  author?: string,
  isFromStore?: true,
  originIdentifier?: string,
  globalVariables?: Array<SimplifiedVariable>,
  sceneVariables?: Array<SimplifiedVariable>,
  freeFunctions?: Array<SimplifiedFunction>,
  customBehaviors?: Array<SimplifiedCustomBehavior>,
  customObjects?: Array<SimplifiedCustomObject>,
  tests?: Array<SimplifiedTest>,
  dependencies?: Array<SimplifiedExtensionDependency>,
|};

export const EXTENSION_STORE_ORIGIN_NAME = 'gdevelop-extension-store';

export const isExtensionFromStore = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): boolean =>
  eventsFunctionsExtension.getOriginName() === EXTENSION_STORE_ORIGIN_NAME;

export type FunctionOwner = 'extension' | 'behavior' | 'object';

// The number of implicit parameters (`Object`, then `Behavior`) at the start of
// the parameters of a function, per owner.
export const getImplicitParametersCount = (owner: FunctionOwner): number =>
  owner === 'behavior' ? 2 : owner === 'object' ? 1 : 0;

export const isLifecycleFunction = (
  gd: libGDevelop,
  owner: FunctionOwner,
  functionName: string
): boolean =>
  owner === 'behavior'
    ? gd.MetadataDeclarationHelper.isBehaviorLifecycleEventsFunction(
        functionName
      )
    : owner === 'object'
    ? gd.MetadataDeclarationHelper.isObjectLifecycleEventsFunction(functionName)
    : gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(
        functionName
      );

export const getFunctionTypeAsString = (
  gd: libGDevelop,
  eventsFunction: gdEventsFunction
): string => {
  const functionType = eventsFunction.getFunctionType();
  return functionType === gd.EventsFunction.Action
    ? 'Action'
    : functionType === gd.EventsFunction.Condition
    ? 'Condition'
    : functionType === gd.EventsFunction.Expression
    ? 'Expression'
    : functionType === gd.EventsFunction.ExpressionAndCondition
    ? 'ExpressionAndCondition'
    : functionType === gd.EventsFunction.ActionWithOperator
    ? 'ActionWithOperator'
    : 'unknown';
};

export const getSimplifiedParameter = (
  parameterMetadata: gdParameterMetadata,
  isImplicit: boolean
): SimplifiedParameter => {
  const parameter: SimplifiedParameter = {
    name: parameterMetadata.getName(),
    type: parameterMetadata.getType(),
  };
  if (parameterMetadata.getDescription())
    parameter.label = parameterMetadata.getDescription();
  if (parameterMetadata.getExtraInfo())
    parameter.extraInfo = parameterMetadata.getExtraInfo();
  if (parameterMetadata.isOptional()) parameter.optional = true;
  if (isImplicit) parameter.isImplicit = true;
  return parameter;
};

export const getSimplifiedFunction = (
  gd: libGDevelop,
  eventsFunction: gdEventsFunction,
  owner: FunctionOwner
): SimplifiedFunction => {
  const functionName = eventsFunction.getName();
  const implicitParametersCount = getImplicitParametersCount(owner);
  const parameters = eventsFunction.getParameters();
  const simplifiedFunction: SimplifiedFunction = {
    functionName,
    functionType: getFunctionTypeAsString(gd, eventsFunction),
    parameters: mapFor(0, parameters.getParametersCount(), index =>
      getSimplifiedParameter(
        parameters.getParameterAt(index),
        index < implicitParametersCount
      )
    ),
    eventsCount: eventsFunction.getEvents().getEventsCount(),
  };
  if (eventsFunction.getFullName())
    simplifiedFunction.fullName = eventsFunction.getFullName();
  if (eventsFunction.getDescription())
    simplifiedFunction.description = eventsFunction.getDescription();
  if (eventsFunction.getSentence())
    simplifiedFunction.sentence = eventsFunction.getSentence();
  if (eventsFunction.isPrivate()) simplifiedFunction.isPrivate = true;
  if (eventsFunction.isAsync()) simplifiedFunction.isAsync = true;
  if (eventsFunction.isDeprecated()) simplifiedFunction.isDeprecated = true;
  if (isLifecycleFunction(gd, owner, functionName))
    simplifiedFunction.isLifecycle = true;
  if (
    eventsFunction.isExpression() &&
    eventsFunction.getExpressionType().getName()
  ) {
    simplifiedFunction.expressionType = eventsFunction
      .getExpressionType()
      .getName();
  }
  if (eventsFunction.getGetterName())
    simplifiedFunction.getterName = eventsFunction.getGetterName();
  return simplifiedFunction;
};

export const getSimplifiedFunctions = (
  gd: libGDevelop,
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  owner: FunctionOwner
): Array<SimplifiedFunction> =>
  mapFor(0, eventsFunctionsContainer.getEventsFunctionsCount(), index =>
    getSimplifiedFunction(
      gd,
      eventsFunctionsContainer.getEventsFunctionAt(index),
      owner
    )
  );

export const getSimplifiedProperty = (
  property: gdNamedPropertyDescriptor
): SimplifiedProperty => {
  const simplifiedProperty: SimplifiedProperty = {
    propertyName: property.getName(),
    type: property.getType(),
  };
  if (property.getLabel()) simplifiedProperty.label = property.getLabel();
  if (property.getDescription())
    simplifiedProperty.description = property.getDescription();
  if (property.getValue())
    simplifiedProperty.defaultValue = property.getValue();
  if (property.getGroup()) simplifiedProperty.group = property.getGroup();
  if (property.getChoices().size() > 0) {
    simplifiedProperty.choices = mapVector(property.getChoices(), choice => ({
      value: choice.getValue(),
      label: choice.getLabel(),
    }));
  }
  const extraInfo = property.getExtraInfo().toJSArray();
  if (extraInfo.length > 0) simplifiedProperty.extraInfo = extraInfo;
  if (property.isHidden()) simplifiedProperty.hidden = true;
  if (property.isAdvanced()) simplifiedProperty.advanced = true;
  if (property.isDeprecated()) simplifiedProperty.deprecated = true;
  if (!property.getMeasurementUnit().isUndefined()) {
    simplifiedProperty.measurementUnit = property
      .getMeasurementUnit()
      .getName();
  }
  return simplifiedProperty;
};

export const getSimplifiedProperties = (
  propertiesContainer: gdPropertiesContainer
): Array<SimplifiedProperty> =>
  mapFor(0, propertiesContainer.getCount(), index =>
    getSimplifiedProperty(propertiesContainer.getAt(index))
  );

export const getSimplifiedArea = (
  container: gdEventsBasedObject | gdEventsBasedObjectVariant
): SimplifiedArea => ({
  minX: container.getAreaMinX(),
  minY: container.getAreaMinY(),
  minZ: container.getAreaMinZ(),
  maxX: container.getAreaMaxX(),
  maxY: container.getAreaMaxY(),
  maxZ: container.getAreaMaxZ(),
});

export const getSimplifiedDependencies = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): Array<SimplifiedExtensionDependency> => {
  const dependencies = eventsFunctionsExtension.getAllDependencies();
  return mapFor(0, dependencies.size(), i => {
    const dependency = dependencies.at(i);
    const simplifiedDependency: SimplifiedExtensionDependency = {
      dependencyName: dependency.getName(),
      type: dependency.getDependencyType(),
    };
    if (dependency.getExportName())
      simplifiedDependency.exportName = dependency.getExportName();
    if (dependency.getVersion())
      simplifiedDependency.version = dependency.getVersion();
    return simplifiedDependency;
  });
};

export const getSimplifiedTests = (
  testsContainer: gdTestsContainer
): Array<SimplifiedTest> =>
  mapFor(0, testsContainer.getTestsCount(), i => {
    const test = testsContainer.getTestAt(i);
    const simplifiedTest: SimplifiedTest = {
      testName: test.getName(),
      type: test.getType(),
    };
    if (test.getDescription())
      simplifiedTest.description = test.getDescription();
    if (test.getSource()) simplifiedTest.source = test.getSource();
    if (test.getLastRunStatus()) {
      simplifiedTest.lastRunStatus = test.getLastRunStatus();
      simplifiedTest.lastRunAt = test.getLastRunAt();
    }
    return simplifiedTest;
  });

// The scene-level builders of `SimplifiedProject.js`, reused for the children
// of custom objects (passed in to avoid a circular import).
export type SimplifiedContainersBuilders = {|
  getSimplifiedObjectsJson: (
    objects: gdObjectsContainer
  ) => Array<SimplifiedObject>,
  getSimplifiedObjectGroups: (
    objectGroups: gdObjectGroupsContainer,
    objectsContainersList: gdObjectsContainersList
  ) => Array<SimplifiedObjectGroup>,
  getSimplifiedLayers: (layers: gdLayersContainer) => Array<SimplifiedLayer>,
  getInstancesDescription: (
    initialInstances: gdInitialInstancesContainer,
    layers: gdLayersContainer,
    containerKind: 'scene' | 'custom-object'
  ) => string,
  getSimplifiedVariablesContainer: (
    container: gdVariablesContainer
  ) => Array<SimplifiedVariable>,
|};

export const makeSimplifiedExtensionsBuilder = (
  gd: libGDevelop,
  builders: SimplifiedContainersBuilders
): {|
  getSimplifiedExtension: (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => SimplifiedExtension,
  getSimplifiedExtensions: (project: gdProject) => Array<SimplifiedExtension>,
  getSimplifiedCustomObject: (
    eventsBasedObject: gdEventsBasedObject
  ) => SimplifiedCustomObject,
  getSimplifiedCustomBehavior: (
    eventsBasedBehavior: gdEventsBasedBehavior
  ) => SimplifiedCustomBehavior,
  getSimplifiedCustomObjectVariant: (
    variant: gdEventsBasedObjectVariant
  ) => SimplifiedCustomObjectVariant,
|} => {
  const getSimplifiedCustomBehavior = (
    eventsBasedBehavior: gdEventsBasedBehavior
  ): SimplifiedCustomBehavior => {
    const simplifiedBehavior: SimplifiedCustomBehavior = {
      behaviorName: eventsBasedBehavior.getName(),
      properties: getSimplifiedProperties(
        eventsBasedBehavior.getPropertyDescriptors()
      ),
      functions: getSimplifiedFunctions(
        gd,
        eventsBasedBehavior.getEventsFunctions(),
        'behavior'
      ),
    };
    if (eventsBasedBehavior.getFullName())
      simplifiedBehavior.fullName = eventsBasedBehavior.getFullName();
    if (eventsBasedBehavior.getDescription())
      simplifiedBehavior.description = eventsBasedBehavior.getDescription();
    if (eventsBasedBehavior.getObjectType())
      simplifiedBehavior.objectType = eventsBasedBehavior.getObjectType();
    if (eventsBasedBehavior.isPrivate()) simplifiedBehavior.isPrivate = true;
    const sharedProperties = getSimplifiedProperties(
      eventsBasedBehavior.getSharedPropertyDescriptors()
    );
    if (sharedProperties.length > 0)
      simplifiedBehavior.sharedProperties = sharedProperties;
    return simplifiedBehavior;
  };

  const getSimplifiedCustomObjectVariant = (
    variant: gdEventsBasedObjectVariant
  ): SimplifiedCustomObjectVariant => {
    const simplifiedVariant: SimplifiedCustomObjectVariant = {
      variantName: variant.getName(),
      area: getSimplifiedArea(variant),
      layers: builders.getSimplifiedLayers(variant.getLayers()),
      childObjects: builders.getSimplifiedObjectsJson(variant.getObjects()),
      instancesDescription: builders.getInstancesDescription(
        variant.getInitialInstances(),
        variant.getLayers(),
        'custom-object'
      ),
    };
    if (variant.getAssetStoreAssetId())
      simplifiedVariant.assetStoreAssetId = variant.getAssetStoreAssetId();
    if (variant.getAssetStoreOriginalName())
      simplifiedVariant.assetStoreOriginalName = variant.getAssetStoreOriginalName();
    return simplifiedVariant;
  };

  const getSimplifiedCustomObject = (
    eventsBasedObject: gdEventsBasedObject
  ): SimplifiedCustomObject => {
    // The default variant is the events-based object itself.
    const simplifiedObject: SimplifiedCustomObject = {
      objectName: eventsBasedObject.getName(),
      area: getSimplifiedArea(eventsBasedObject),
      properties: getSimplifiedProperties(
        eventsBasedObject.getPropertyDescriptors()
      ),
      functions: getSimplifiedFunctions(
        gd,
        eventsBasedObject.getEventsFunctions(),
        'object'
      ),
      childObjects: builders.getSimplifiedObjectsJson(
        eventsBasedObject.getObjects()
      ),
      layers: builders.getSimplifiedLayers(eventsBasedObject.getLayers()),
      instancesDescription: builders.getInstancesDescription(
        eventsBasedObject.getInitialInstances(),
        eventsBasedObject.getLayers(),
        'custom-object'
      ),
    };
    if (eventsBasedObject.getFullName())
      simplifiedObject.fullName = eventsBasedObject.getFullName();
    if (eventsBasedObject.getDescription())
      simplifiedObject.description = eventsBasedObject.getDescription();
    if (eventsBasedObject.getDefaultName())
      simplifiedObject.defaultName = eventsBasedObject.getDefaultName();
    if (eventsBasedObject.isRenderedIn3D())
      simplifiedObject.isRenderedIn3D = true;
    if (eventsBasedObject.isAnimatable()) simplifiedObject.isAnimatable = true;
    if (eventsBasedObject.isTextContainer())
      simplifiedObject.isTextContainer = true;
    if (eventsBasedObject.isInnerAreaFollowingParentSize())
      simplifiedObject.isInnerAreaFollowingParentSize = true;
    if (eventsBasedObject.isPrivate()) simplifiedObject.isPrivate = true;

    const objectGroups = eventsBasedObject.getObjects().getObjectGroups();
    if (objectGroups.count() > 0) {
      // Child objects only see each other: no global objects inside a custom object.
      const emptyGlobalObjectsContainer = new gd.ObjectsContainer(
        gd.ObjectsContainer.Unknown
      );
      const objectsContainersList = gd.ObjectsContainersList.makeNewObjectsContainersListForContainers(
        emptyGlobalObjectsContainer,
        eventsBasedObject.getObjects()
      );
      simplifiedObject.objectGroups = builders.getSimplifiedObjectGroups(
        objectGroups,
        objectsContainersList
      );
      objectsContainersList.delete();
      emptyGlobalObjectsContainer.delete();
    }

    const variants = eventsBasedObject.getVariants();
    if (variants.getVariantsCount() > 0) {
      simplifiedObject.variants = mapFor(0, variants.getVariantsCount(), i =>
        getSimplifiedCustomObjectVariant(variants.getVariantAt(i))
      );
    }
    return simplifiedObject;
  };

  const getSimplifiedExtension = (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ): SimplifiedExtension => {
    const simplifiedExtension: SimplifiedExtension = {
      extensionName: eventsFunctionsExtension.getName(),
      fullName: eventsFunctionsExtension.getFullName(),
      shortDescription: eventsFunctionsExtension.getShortDescription(),
    };
    if (eventsFunctionsExtension.getDescription())
      simplifiedExtension.description = eventsFunctionsExtension.getDescription();
    if (eventsFunctionsExtension.getCategory())
      simplifiedExtension.category = eventsFunctionsExtension.getCategory();
    const tags = eventsFunctionsExtension.getTags().toJSArray();
    if (tags.length > 0) simplifiedExtension.tags = tags.join(', ');
    if (eventsFunctionsExtension.getVersion())
      simplifiedExtension.version = eventsFunctionsExtension.getVersion();
    if (eventsFunctionsExtension.getAuthor())
      simplifiedExtension.author = eventsFunctionsExtension.getAuthor();
    if (isExtensionFromStore(eventsFunctionsExtension)) {
      simplifiedExtension.isFromStore = true;
      if (eventsFunctionsExtension.getOriginIdentifier())
        simplifiedExtension.originIdentifier = eventsFunctionsExtension.getOriginIdentifier();
    }

    const globalVariables = builders.getSimplifiedVariablesContainer(
      eventsFunctionsExtension.getGlobalVariables()
    );
    if (globalVariables.length > 0)
      simplifiedExtension.globalVariables = globalVariables;
    const sceneVariables = builders.getSimplifiedVariablesContainer(
      eventsFunctionsExtension.getSceneVariables()
    );
    if (sceneVariables.length > 0)
      simplifiedExtension.sceneVariables = sceneVariables;

    const freeFunctions = getSimplifiedFunctions(
      gd,
      eventsFunctionsExtension.getEventsFunctions(),
      'extension'
    );
    if (freeFunctions.length > 0)
      simplifiedExtension.freeFunctions = freeFunctions;

    const behaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
    if (behaviors.getCount() > 0) {
      simplifiedExtension.customBehaviors = mapFor(0, behaviors.getCount(), i =>
        getSimplifiedCustomBehavior(behaviors.getAt(i))
      );
    }
    const objects = eventsFunctionsExtension.getEventsBasedObjects();
    if (objects.getCount() > 0) {
      simplifiedExtension.customObjects = mapFor(0, objects.getCount(), i =>
        getSimplifiedCustomObject(objects.getAt(i))
      );
    }

    const tests = getSimplifiedTests(eventsFunctionsExtension.getTests());
    if (tests.length > 0) simplifiedExtension.tests = tests;

    const dependencies = getSimplifiedDependencies(eventsFunctionsExtension);
    if (dependencies.length > 0)
      simplifiedExtension.dependencies = dependencies;
    return simplifiedExtension;
  };

  const getSimplifiedExtensions = (
    project: gdProject
  ): Array<SimplifiedExtension> =>
    mapFor(0, project.getEventsFunctionsExtensionsCount(), i =>
      getSimplifiedExtension(project.getEventsFunctionsExtensionAt(i))
    );

  return {
    getSimplifiedExtension,
    getSimplifiedExtensions,
    getSimplifiedCustomObject,
    getSimplifiedCustomBehavior,
    getSimplifiedCustomObjectVariant,
  };
};
