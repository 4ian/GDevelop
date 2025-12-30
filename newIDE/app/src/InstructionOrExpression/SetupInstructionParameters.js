// @flow
import { getObjectParameterIndex } from './EnumerateInstructions';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

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
  return hasChangeAnyParameterValue;
};
