//@flow
const gd: libGDevelop = global.gd;

export const ensureSingleOnceInstructions = (
  instructionsList: gdInstructionsList
) => {
  let hasEndingOnceInstruction = false;
  let hasInvalidOnce = false;
  for (let i = instructionsList.size() - 1; i >= 0; --i) {
    const instruction = instructionsList.get(i);
    if (i === instructionsList.size() - 1) {
      if (instruction.getType() === 'BuiltinCommonInstructions::Once') {
        hasEndingOnceInstruction = true;
      }
    } else {
      if (instruction.getType() === 'BuiltinCommonInstructions::Once') {
        instructionsList.removeAt(i);
        hasInvalidOnce = true;
      }
    }
  }

  if (hasInvalidOnce && !hasEndingOnceInstruction) {
    const onceInstruction = new gd.Instruction();
    onceInstruction.setType('BuiltinCommonInstructions::Once');
    instructionsList.insert(onceInstruction, instructionsList.size());
    onceInstruction.delete();
  }

  return hasInvalidOnce;
};
