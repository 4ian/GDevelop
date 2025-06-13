// @flow
import { mapFor } from '../../Utils/MapFor';

export type ParameterSummary = {|
  isCodeOnly?: boolean,
  name?: string,
  type: string,
  description?: string,
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

export type ObjectSummary = {|
  name: string,
  fullName: string,
  description: string,
  actions: Array<InstructionSummary>,
  conditions: Array<InstructionSummary>,
  expressions: Array<ExpressionSummary>,
|};

export type BehaviorSummary = {|
  name: string,
  fullName: string,
  description: string,
  objectType?: string,
  actions: Array<InstructionSummary>,
  conditions: Array<InstructionSummary>,
  expressions: Array<ExpressionSummary>,
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

export const buildExtensionSummary = ({
  gd,
  extension,
}: {
  gd: libGDevelop,
  extension: gdPlatformExtension,
}): ExtensionSummary => {
  const objects: { [string]: ObjectSummary } = {};
  const behaviors: { [string]: BehaviorSummary } = {};

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

      objects[objectType] = {
        name: objectMetadata.getName(),
        fullName: objectMetadata.getFullName(),
        description: objectMetadata.getDescription(),
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
  };
};
