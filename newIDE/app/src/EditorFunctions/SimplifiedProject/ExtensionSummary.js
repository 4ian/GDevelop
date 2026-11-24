// @flow
import { mapFor, mapVector } from '../../Utils/MapFor';
import {
  isFunctionCallableInAuthoringScope,
  type FunctionAuthoringScope,
} from '../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';

/**
 * The custom behavior or custom object owning the functions being summarized.
 * Both are null for the free functions of an extension.
 */
type FunctionsOwner = {|
  behaviorMetadata: ?{ name: string, isPrivate: boolean },
  objectMetadata: ?{ name: string, isPrivate: boolean },
|};

const NO_FUNCTIONS_OWNER: FunctionsOwner = {
  behaviorMetadata: null,
  objectMetadata: null,
};

export type ParameterSummary = {|
  isCodeOnly?: boolean,
  name?: string,
  type: string,
  description?: string,
  longDescription?: string,
  isOptional?: boolean,
  extraInfo?: string,
|};

/**
 * A simplified summary of an instruction.
 */
export type InstructionSummary = {|
  type: string,
  description: string,
  parameters: Array<ParameterSummary>,
  hidden?: boolean,
  relevantForSceneEvents?: boolean,
  // Always written (true or false): the backend only refuses `await` on an
  // instruction EXPLICITLY not asynchronous (older summaries have no flag).
  isAsync: boolean,
|};

/**
 * A simplified summary of an expression.
 */
export type ExpressionSummary = {|
  type: string,
  description: string,
  parameters: Array<ParameterSummary>,
  hidden?: boolean,
  relevantForSceneEvents?: boolean,
|};

export type PropertySummary = {|
  name: string,
  description: string,
  type: string,

  label?: string,
  measurementUnit?: {
    name: string,
  },
  extraInfo?: Array<string>,
  group?: string,
  choices?: Array<{
    value: string,
    label: string,
  }>,
  hidden?: boolean,
  deprecated?: boolean,
  advanced?: boolean,
|};

export type ObjectSummary = {|
  name: string,
  fullName: string,
  description: string,
  properties?: Array<PropertySummary>,
  actions: Array<InstructionSummary>,
  conditions: Array<InstructionSummary>,
  expressions: Array<ExpressionSummary>,
|};

export type BehaviorSummary = {|
  name: string,
  fullName: string,
  description: string,
  objectType?: string,
  properties: Array<PropertySummary>,
  sharedProperties: Array<PropertySummary>,
  actions: Array<InstructionSummary>,
  conditions: Array<InstructionSummary>,
  expressions: Array<ExpressionSummary>,
|};

export type EffectSummary = {|
  name: string,
  fullName: string,
  description: string,
  notWorkingForObjects: boolean,
  onlyWorkingFor2D: boolean,
  onlyWorkingFor3D: boolean,
  unique: boolean,
  properties: Array<PropertySummary>,
|};

export type ExtensionSummary = {|
  extensionName: string,
  extensionFullName: string,
  description: string,
  shortDescription: string,
  dimension: string,
  freeActions: Array<InstructionSummary>,
  freeConditions: Array<InstructionSummary>,
  freeExpressions: Array<ExpressionSummary>,
  objects: { [string]: ObjectSummary },
  behaviors: { [string]: BehaviorSummary },
  effects: { [string]: EffectSummary },
|};

const normalizeType = (parameterType: string) => {
  if (parameterType === 'expression') return 'number';

  if (
    parameterType === 'object' ||
    parameterType === 'objectPtr' ||
    parameterType === 'objectList' ||
    parameterType === 'objectListOrEmptyIfJustDeclared' ||
    parameterType === 'objectListOrEmptyWithoutPicking'
  ) {
    return 'object';
  }

  return parameterType;
};

const getParameterSummary = (
  parameterMetadata: gdParameterMetadata
): ParameterSummary => {
  const parameterSummary: ParameterSummary = {
    type: normalizeType(parameterMetadata.getType()),
  };
  if (parameterMetadata.getDescription()) {
    parameterSummary.description = parameterMetadata.getDescription();
  }
  if (parameterMetadata.getLongDescription()) {
    parameterSummary.longDescription = parameterMetadata.getLongDescription();
  }
  if (parameterMetadata.getName()) {
    parameterSummary.name = parameterMetadata.getName();
  }
  if (parameterMetadata.isCodeOnly()) {
    parameterSummary.isCodeOnly = true;
  }
  if (parameterMetadata.isOptional()) {
    parameterSummary.isOptional = true;
  }
  if (parameterMetadata.getExtraInfo()) {
    parameterSummary.extraInfo = parameterMetadata.getExtraInfo();
  }
  return parameterSummary;
};

const getPropertySummary = (
  propertyName: string,
  property: gdPropertyDescriptor | gdNamedPropertyDescriptor
): PropertySummary => {
  const propertySummary: PropertySummary = {
    name: propertyName,
    description: property.getDescription(),
    type: property.getType(),
  };

  if (property.getLabel()) {
    propertySummary.label = property.getLabel();
  }
  if (property.getGroup()) {
    propertySummary.group = property.getGroup();
  }
  if (!property.getMeasurementUnit().isUndefined()) {
    propertySummary.measurementUnit = {
      name: property.getMeasurementUnit().getName(),
    };
  }
  if (property.getChoices().size() > 0) {
    propertySummary.choices = mapVector(property.getChoices(), choice => ({
      value: choice.getValue(),
      label: choice.getLabel(),
    }));
  }
  if (property.isHidden()) {
    propertySummary.hidden = true;
  }
  if (property.isDeprecated()) {
    propertySummary.deprecated = true;
  }
  if (property.isAdvanced()) {
    propertySummary.advanced = true;
  }
  const extraInfo = property.getExtraInfo().toJSArray();
  if (extraInfo.length > 0) {
    propertySummary.extraInfo = extraInfo;
  }

  return propertySummary;
};

const getPropertiesSummary = ({
  propertiesMetadata,
  propertiesContainer,
}: {|
  propertiesMetadata?: gdMapStringPropertyDescriptor,
  propertiesContainer?: gdPropertiesContainer,
|}) => {
  if (propertiesMetadata)
    return propertiesMetadata
      .keys()
      .toJSArray()
      .map(propertyName => {
        const property = propertiesMetadata.get(propertyName);
        return getPropertySummary(propertyName, property);
      });

  if (propertiesContainer)
    return mapVector(propertiesContainer, namedProperty => {
      return getPropertySummary(namedProperty.getName(), namedProperty);
    });

  return [];
};

export const buildExtensionSummary = ({
  gd,
  eventsFunctionsExtension,
  extension,
  authoringScope,
}: {
  gd: libGDevelop,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  extension: gdPlatformExtension,
  // Where the events being written are authored: only the private members
  // callable from there are described. Null when the events are written outside
  // of any extension (a scene): no private member is then described.
  authoringScope: FunctionAuthoringScope | null,
}): ExtensionSummary => {
  const objects: { [string]: ObjectSummary } = {};
  const behaviors: { [string]: BehaviorSummary } = {};
  const effects: { [string]: EffectSummary } = {};
  const extensionName = extension.getName();
  // A private behavior or object is only described while authoring its own
  // extension: its public functions are callable from there.
  const isAuthoringThisExtension =
    !!authoringScope && authoringScope.extensionName === extensionName;

  const generateInstructionsSummaries = ({
    instructionsMetadata,
    functionsOwner,
  }: {
    instructionsMetadata: gdMapStringInstructionMetadata,
    functionsOwner: FunctionsOwner,
  }) => {
    const instructionTypes = instructionsMetadata.keys().toJSArray();
    return instructionTypes
      .map(instructionType => {
        const instructionMetadata = instructionsMetadata.get(instructionType);

        if (
          !isFunctionCallableInAuthoringScope(
            {
              extensionName,
              isPrivate: instructionMetadata.isPrivate(),
              behaviorMetadata: functionsOwner.behaviorMetadata,
              objectMetadata: functionsOwner.objectMetadata,
            },
            authoringScope
          )
        ) {
          return null;
        }

        const instructionSummary: InstructionSummary = {
          type: instructionType,
          description: instructionMetadata.getDescription(),
          parameters: mapFor(
            0,
            instructionMetadata.getParameters().getParametersCount(),
            index => {
              const parameterMetadata = instructionMetadata.getParameter(index);
              return getParameterSummary(parameterMetadata);
            }
          ),
          isAsync: instructionMetadata.isAsync(),
        };
        if (instructionMetadata.isHidden()) {
          instructionSummary.hidden = true;
        }
        if (!instructionMetadata.isRelevantForLayoutEvents()) {
          instructionSummary.relevantForSceneEvents = false;
        }

        return instructionSummary;
      })
      .filter(Boolean);
  };

  const generateExpressionSummaries = ({
    expressionsMetadata,
    functionsOwner,
  }: {
    expressionsMetadata: gdMapStringExpressionMetadata,
    functionsOwner: FunctionsOwner,
  }) => {
    const expressionTypes = expressionsMetadata.keys().toJSArray();
    return expressionTypes
      .map(expressionType => {
        const expressionMetadata = expressionsMetadata.get(expressionType);

        if (
          !isFunctionCallableInAuthoringScope(
            {
              extensionName,
              isPrivate: expressionMetadata.isPrivate(),
              behaviorMetadata: functionsOwner.behaviorMetadata,
              objectMetadata: functionsOwner.objectMetadata,
            },
            authoringScope
          )
        ) {
          return null;
        }

        const expressionSummary: ExpressionSummary = {
          type: expressionType,
          description: expressionMetadata.getDescription(),
          parameters: mapFor(
            0,
            expressionMetadata.getParameters().getParametersCount(),
            index => {
              const parameterMetadata = expressionMetadata.getParameter(index);
              return getParameterSummary(parameterMetadata);
            }
          ),
        };
        if (!expressionMetadata.isShown()) {
          expressionSummary.hidden = true;
        }
        if (!expressionMetadata.isRelevantForLayoutEvents()) {
          expressionSummary.relevantForSceneEvents = false;
        }

        return expressionSummary;
      })
      .filter(Boolean);
  };

  extension
    .getExtensionObjectsTypes()
    .toJSArray()
    .forEach(objectType => {
      const objectMetadata = extension.getObjectMetadata(objectType);
      if (
        gd.MetadataProvider.isBadObjectMetadata(objectMetadata) ||
        (objectMetadata.isPrivate() && !isAuthoringThisExtension)
      ) {
        return;
      }
      const functionsOwner: FunctionsOwner = {
        behaviorMetadata: null,
        objectMetadata: {
          name: objectMetadata.getName(),
          isPrivate: objectMetadata.isPrivate(),
        },
      };

      const objectName =
        objectType.split('::').pop() || 'Unrecognized object type format';

      const eventsBasedObjects = eventsFunctionsExtension
        ? eventsFunctionsExtension.getEventsBasedObjects()
        : null;

      const eventsBasedObject =
        eventsBasedObjects && eventsBasedObjects.has(objectName)
          ? eventsBasedObjects.get(objectName)
          : null;

      objects[objectType] = {
        name: objectMetadata.getName(),
        fullName: objectMetadata.getFullName(),
        description: objectMetadata.getDescription(),
        properties: eventsBasedObject
          ? // $FlowFixMe[incompatible-type]
            getPropertiesSummary({
              propertiesContainer: eventsBasedObject.getPropertyDescriptors(),
            })
          : undefined,
        actions: generateInstructionsSummaries({
          instructionsMetadata: objectMetadata.getAllActions(),
          functionsOwner,
        }),
        conditions: generateInstructionsSummaries({
          instructionsMetadata: objectMetadata.getAllConditions(),
          functionsOwner,
        }),
        expressions: [
          ...generateExpressionSummaries({
            expressionsMetadata: objectMetadata.getAllExpressions(),
            functionsOwner,
          }),
          ...generateExpressionSummaries({
            expressionsMetadata: objectMetadata.getAllStrExpressions(),
            functionsOwner,
          }),
        ],
      };
    });
  extension
    .getBehaviorsTypes()
    .toJSArray()
    .forEach(behaviorType => {
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      if (
        gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata) ||
        (behaviorMetadata.isPrivate() && !isAuthoringThisExtension)
      ) {
        return;
      }
      const functionsOwner: FunctionsOwner = {
        behaviorMetadata: {
          name: behaviorMetadata.getName(),
          isPrivate: behaviorMetadata.isPrivate(),
        },
        objectMetadata: null,
      };

      const behaviorSummary: BehaviorSummary = {
        name: behaviorMetadata.getName(),
        fullName: behaviorMetadata.getFullName(),
        description: behaviorMetadata.getDescription(),
        // $FlowFixMe[incompatible-type]
        properties: getPropertiesSummary({
          propertiesMetadata: behaviorMetadata.getProperties(),
        }),
        // $FlowFixMe[incompatible-type]
        sharedProperties: getPropertiesSummary({
          propertiesMetadata: behaviorMetadata.getSharedProperties(),
        }),
        actions: generateInstructionsSummaries({
          instructionsMetadata: behaviorMetadata.getAllActions(),
          functionsOwner,
        }),
        conditions: generateInstructionsSummaries({
          instructionsMetadata: behaviorMetadata.getAllConditions(),
          functionsOwner,
        }),
        expressions: [
          ...generateExpressionSummaries({
            expressionsMetadata: behaviorMetadata.getAllExpressions(),
            functionsOwner,
          }),
          ...generateExpressionSummaries({
            expressionsMetadata: behaviorMetadata.getAllStrExpressions(),
            functionsOwner,
          }),
        ],
      };

      if (behaviorMetadata.getObjectType()) {
        behaviorSummary.objectType = behaviorMetadata.getObjectType();
      }

      behaviors[behaviorType] = behaviorSummary;
    });
  extension
    .getExtensionEffectTypes()
    .toJSArray()
    .forEach(effectType => {
      const effectMetadata = extension.getEffectMetadata(effectType);
      if (gd.MetadataProvider.isBadEffectMetadata(effectMetadata)) {
        return;
      }
      const effectSummary: EffectSummary = {
        name: effectMetadata.getType(),
        fullName: effectMetadata.getFullName(),
        description: effectMetadata.getDescription(),
        notWorkingForObjects: effectMetadata.isMarkedAsNotWorkingForObjects(),
        onlyWorkingFor2D: effectMetadata.isMarkedAsOnlyWorkingFor2D(),
        onlyWorkingFor3D: effectMetadata.isMarkedAsOnlyWorkingFor3D(),
        unique: effectMetadata.isMarkedAsUnique(),
        // $FlowFixMe[incompatible-type]
        properties: getPropertiesSummary({
          propertiesMetadata: effectMetadata.getProperties(),
        }),
      };

      effects[effectType] = effectSummary;
    });

  return {
    extensionName,
    extensionFullName: extension.getFullName(),
    description: extension.getDescription(),
    shortDescription: extension.getShortDescription(),
    dimension: extension.getDimension(),
    freeActions: generateInstructionsSummaries({
      instructionsMetadata: extension.getAllActions(),
      functionsOwner: NO_FUNCTIONS_OWNER,
    }),
    freeConditions: generateInstructionsSummaries({
      instructionsMetadata: extension.getAllConditions(),
      functionsOwner: NO_FUNCTIONS_OWNER,
    }),
    freeExpressions: [
      ...generateExpressionSummaries({
        expressionsMetadata: extension.getAllExpressions(),
        functionsOwner: NO_FUNCTIONS_OWNER,
      }),
      ...generateExpressionSummaries({
        expressionsMetadata: extension.getAllStrExpressions(),
        functionsOwner: NO_FUNCTIONS_OWNER,
      }),
    ],
    objects,
    behaviors,
    effects,
  };
};
