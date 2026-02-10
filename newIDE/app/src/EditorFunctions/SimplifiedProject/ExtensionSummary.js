// @flow
import { mapFor, mapVector } from '../../Utils/MapFor';

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
}: {
  gd: libGDevelop,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  extension: gdPlatformExtension,
}): ExtensionSummary => {
  const objects: { [string]: ObjectSummary } = {};
  const behaviors: { [string]: BehaviorSummary } = {};
  const effects: { [string]: EffectSummary } = {};

  const generateInstructionsSummaries = ({
    instructionsMetadata,
  }: {
    instructionsMetadata: gdMapStringInstructionMetadata,
  }) => {
    const instructionTypes = instructionsMetadata.keys().toJSArray();
    return instructionTypes
      .map(instructionType => {
        const instructionMetadata = instructionsMetadata.get(instructionType);

        if (instructionMetadata.isPrivate()) return null;

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
  }: {
    expressionsMetadata: gdMapStringExpressionMetadata,
  }) => {
    const expressionTypes = expressionsMetadata.keys().toJSArray();
    return expressionTypes
      .map(expressionType => {
        const expressionMetadata = expressionsMetadata.get(expressionType);

        if (expressionMetadata.isPrivate()) return null;

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
        objectMetadata.isPrivate()
      ) {
        return;
      }

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
          ? getPropertiesSummary({
              propertiesContainer: eventsBasedObject.getPropertyDescriptors(),
            })
          : undefined,
        actions: generateInstructionsSummaries({
          instructionsMetadata: objectMetadata.getAllActions(),
        }),
        conditions: generateInstructionsSummaries({
          instructionsMetadata: objectMetadata.getAllConditions(),
        }),
        expressions: [
          ...generateExpressionSummaries({
            expressionsMetadata: objectMetadata.getAllExpressions(),
          }),
          ...generateExpressionSummaries({
            expressionsMetadata: objectMetadata.getAllStrExpressions(),
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
        behaviorMetadata.isPrivate()
      ) {
        return;
      }

      const behaviorSummary: BehaviorSummary = {
        name: behaviorMetadata.getName(),
        fullName: behaviorMetadata.getFullName(),
        description: behaviorMetadata.getDescription(),
        properties: getPropertiesSummary({
          propertiesMetadata: behaviorMetadata.getProperties(),
        }),
        sharedProperties: getPropertiesSummary({
          propertiesMetadata: behaviorMetadata.getSharedProperties(),
        }),
        actions: generateInstructionsSummaries({
          instructionsMetadata: behaviorMetadata.getAllActions(),
        }),
        conditions: generateInstructionsSummaries({
          instructionsMetadata: behaviorMetadata.getAllConditions(),
        }),
        expressions: [
          ...generateExpressionSummaries({
            expressionsMetadata: behaviorMetadata.getAllExpressions(),
          }),
          ...generateExpressionSummaries({
            expressionsMetadata: behaviorMetadata.getAllStrExpressions(),
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
        properties: getPropertiesSummary({
          propertiesMetadata: effectMetadata.getProperties(),
        }),
      };

      effects[effectType] = effectSummary;
    });

  return {
    extensionName: extension.getName(),
    extensionFullName: extension.getFullName(),
    description: extension.getDescription(),
    freeActions: generateInstructionsSummaries({
      instructionsMetadata: extension.getAllActions(),
    }),
    freeConditions: generateInstructionsSummaries({
      instructionsMetadata: extension.getAllConditions(),
    }),
    freeExpressions: [
      ...generateExpressionSummaries({
        expressionsMetadata: extension.getAllExpressions(),
      }),
      ...generateExpressionSummaries({
        expressionsMetadata: extension.getAllStrExpressions(),
      }),
    ],
    objects,
    behaviors,
    effects,
  };
};
