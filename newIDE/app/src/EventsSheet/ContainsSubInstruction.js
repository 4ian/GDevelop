// @flow
const gd: libGDevelop = global.gd;

export const containsSubInstructions = (
  instruction: gdInstruction,
  instructionsList: gdInstructionsList
) => {
  const subInstructionsList = instruction.getSubInstructions();
  if (gd.compare(subInstructionsList, instructionsList)) return true;

  for (let i = 0; i < subInstructionsList.size(); ++i) {
    const subInstruction = subInstructionsList.get(i);
    if (containsSubInstructions(subInstruction, instructionsList)) return true;
  }

  return false;
};
