// @flow
import { getObjectParameterIndex } from './EnumerateInstructions';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { mapTypeToOperators } from '../EventsSheet/ParameterFields/OperatorField';
import { mapTypeToRelationalOperators } from '../EventsSheet/ParameterFields/RelationalOperatorField';

const gd: libGDevelop = global.gd;

/**
 * After selecting an instruction, this function allows to set up the proper
 * number of parameters, set up the object name (if an object instruction was chosen)
 * and set up the behavior name (if a behavior instruction was chosen).
 */
export const setupInstructionParameters = (
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  instruction: gdInstruction,
  instructionMetadata: gdInstructionMetadata,
  objectName: ?string
): boolean => {
  let hasChangeAnyParameterValue = false;

  instruction.setParametersCount(instructionMetadata.getParametersCount());

  if (objectName) {
    // Set the object name.
    const objectParameterIndex = getObjectParameterIndex(instructionMetadata);
    if (objectParameterIndex === -1) {
      console.error(
        `Instruction "${instructionMetadata.getFullName()}" is used for an object, but does not have an object as first parameter`
      );
      return false;
    }
    instruction.setParameter(objectParameterIndex, objectName);
    hasChangeAnyParameterValue = true;
  }
  const hasFilledAnyBehaviorParameter = gd.BehaviorParameterFiller.fillBehaviorParameters(
    project.getCurrentPlatform(),
    projectScopedContainersAccessor.get(),
    instructionMetadata,
    instruction
  );
  hasChangeAnyParameterValue =
    hasChangeAnyParameterValue || hasFilledAnyBehaviorParameter;

  for (let i = 0; i < instructionMetadata.getParametersCount(); i++) {
    const parameterMetadata = instructionMetadata.getParameter(i);
    if (parameterMetadata.isCodeOnly()) continue;
    const type = parameterMetadata.getType();
    const currentValue = instruction.getParameter(i).getPlainString();
    const extraInfo = parameterMetadata.getExtraInfo();
    if (type === 'operator') {
      const operators =
        mapTypeToOperators[extraInfo] || mapTypeToOperators.unknown;
      if (!currentValue || !operators.includes(currentValue)) {
        instruction.setParameter(i, operators[0]);
        hasChangeAnyParameterValue = true;
      }
    } else if (type === 'relationalOperator') {
      const operators =
        mapTypeToRelationalOperators[extraInfo] ||
        mapTypeToRelationalOperators.unknown;
      if (!currentValue || !operators.includes(currentValue)) {
        instruction.setParameter(i, operators[0]);
        hasChangeAnyParameterValue = true;
      }
    } else if (
      type === 'trueorfalse' &&
      currentValue !== 'True' &&
      currentValue !== 'False'
    ) {
      // Any invalid value (e.g. "=" left by the variable instruction switcher,
      // or "true" from old casing) evaluated as false in the runtime and showed
      // False in the UI, so preserve that behavior.
      // Note: when a real type switch just happened, resetParametersAfterSwitch
      // already set the value to "True" before this runs, so this branch only
      // fires for old saved conditions that were never properly initialized.
      instruction.setParameter(i, 'False');
      hasChangeAnyParameterValue = true;
    }
  }

  return hasChangeAnyParameterValue;
};

/**
 * Describes the "operator" parameter for each switchable variable instruction
 * type — the slot whose valid values differ between instruction variants.
 * Object variants shift the param index to 2 (extra object param at 0).
 * Push variants use 'expression' as the paramType: there are no valid-value
 * constraints, but "True"/"False" left by a PushBoolean switch must be cleared.
 */
const variableInstructionOperatorParam: {
  [string]: {| index: number, paramType: string, extraInfo: string |},
} = {
  // Scene variable conditions
  BooleanVariable: { index: 1, paramType: 'trueorfalse', extraInfo: '' },
  NumberVariable: {
    index: 1,
    paramType: 'relationalOperator',
    extraInfo: 'number',
  },
  StringVariable: {
    index: 1,
    paramType: 'relationalOperator',
    extraInfo: 'string',
  },
  // Scene variable Set actions
  SetBooleanVariable: { index: 1, paramType: 'operator', extraInfo: 'boolean' },
  SetNumberVariable: { index: 1, paramType: 'operator', extraInfo: 'number' },
  SetStringVariable: { index: 1, paramType: 'operator', extraInfo: 'string' },
  // Scene variable Push (array) actions
  PushBoolean: { index: 1, paramType: 'trueorfalse', extraInfo: '' },
  PushNumber: { index: 1, paramType: 'expression', extraInfo: '' },
  PushString: { index: 1, paramType: 'expression', extraInfo: '' },
  // Object variable conditions
  BooleanObjectVariable: { index: 2, paramType: 'trueorfalse', extraInfo: '' },
  NumberObjectVariable: {
    index: 2,
    paramType: 'relationalOperator',
    extraInfo: 'number',
  },
  StringObjectVariable: {
    index: 2,
    paramType: 'relationalOperator',
    extraInfo: 'string',
  },
  // Object variable Set actions
  SetBooleanObjectVariable: {
    index: 2,
    paramType: 'operator',
    extraInfo: 'boolean',
  },
  SetNumberObjectVariable: {
    index: 2,
    paramType: 'operator',
    extraInfo: 'number',
  },
  SetStringObjectVariable: {
    index: 2,
    paramType: 'operator',
    extraInfo: 'string',
  },
  // Object variable Push (array) actions
  PushBooleanToObjectVariable: {
    index: 2,
    paramType: 'trueorfalse',
    extraInfo: '',
  },
  PushNumberToObjectVariable: {
    index: 2,
    paramType: 'expression',
    extraInfo: '',
  },
  PushStringToObjectVariable: {
    index: 2,
    paramType: 'expression',
    extraInfo: '',
  },
};

/**
 * After switchBetweenUnifiedInstructionIfNeeded changes the instruction type,
 * fix the operator parameter if its current value is no longer valid for the
 * new type (e.g. "<" is not a valid string relational operator, "True" is not
 * a valid number operator).
 *
 * Must be called right after switchBetweenUnifiedInstructionIfNeeded, not
 * inside setupInstructionParameters: setupInstructionParameters normalizes
 * invalid trueorfalse values to "False" (backward compat for old saved files),
 * so when switching TO boolean the reset to "True" must happen here first.
 */
export const resetParametersAfterSwitch = (
  instruction: gdInstruction
): void => {
  const newType = instruction.getType();
  const paramInfo = variableInstructionOperatorParam[newType];
  if (!paramInfo) return;

  const { index, paramType, extraInfo } = paramInfo;
  if (instruction.getParametersCount() <= index) return;
  const currentValue = instruction.getParameter(index).getPlainString();

  if (paramType === 'trueorfalse') {
    if (currentValue !== 'True' && currentValue !== 'False') {
      instruction.setParameter(index, 'True');
    }
  } else if (paramType === 'relationalOperator') {
    const operators =
      mapTypeToRelationalOperators[extraInfo] ||
      mapTypeToRelationalOperators.unknown;
    if (!currentValue || !operators.includes(currentValue)) {
      instruction.setParameter(index, operators[0]);
    }
  } else if (paramType === 'operator') {
    const operators =
      mapTypeToOperators[extraInfo] || mapTypeToOperators.unknown;
    if (!currentValue || !operators.includes(currentValue)) {
      instruction.setParameter(index, operators[0]);
    }
  } else if (paramType === 'expression') {
    // "True"/"False" left by a PushBoolean switch are not valid expressions.
    if (currentValue === 'True' || currentValue === 'False') {
      instruction.setParameter(index, '');
    }
  }
};
