import { ensureSingleOnceInstructions } from './OnceInstructionSanitizer';
const gd: libGDevelop = global.gd;

describe('OnceInstructionSanitizer', () => {
  const insertInstruction = (list, type) => {
    const instruction = new gd.Instruction();
    instruction.setType(type);
    list.insert(instruction, list.size());
    instruction.delete();
  };

  it('does not change anything when there is no "once" instructions', () => {
    const list = new gd.InstructionsList();

    insertInstruction(list, 'Type1');
    insertInstruction(list, 'Type2');
    insertInstruction(list, 'Type3');
    expect(ensureSingleOnceInstructions(list)).toBe(false);
    expect(list.get(0).getType()).toBe('Type1');
    expect(list.get(1).getType()).toBe('Type2');
    expect(list.get(2).getType()).toBe('Type3');

    list.delete();
  });

  it('does not change anything when there is a "once" instruction at the end', () => {
    const list = new gd.InstructionsList();

    insertInstruction(list, 'Type1');
    insertInstruction(list, 'Type2');
    insertInstruction(list, 'BuiltinCommonInstructions::Once');
    expect(ensureSingleOnceInstructions(list)).toBe(false);
    expect(list.get(0).getType()).toBe('Type1');
    expect(list.get(1).getType()).toBe('Type2');
    expect(list.get(2).getType()).toBe('BuiltinCommonInstructions::Once');

    list.delete();
  });

  it('moves one "once" instruction to the end', () => {
    const list = new gd.InstructionsList();

    insertInstruction(list, 'Type1');
    insertInstruction(list, 'BuiltinCommonInstructions::Once');
    insertInstruction(list, 'Type3');
    expect(ensureSingleOnceInstructions(list)).toBe(true);
    expect(list.size()).toBe(3);
    expect(list.get(0).getType()).toBe('Type1');
    expect(list.get(1).getType()).toBe('Type3');
    expect(list.get(2).getType()).toBe('BuiltinCommonInstructions::Once');

    list.delete();
  });

  it('moves multiple "once" instruction to the end', () => {
    const list = new gd.InstructionsList();

    insertInstruction(list, 'BuiltinCommonInstructions::Once');
    insertInstruction(list, 'BuiltinCommonInstructions::Once');
    insertInstruction(list, 'Type3');
    expect(ensureSingleOnceInstructions(list)).toBe(true);
    expect(list.size()).toBe(2);
    expect(list.get(0).getType()).toBe('Type3');
    expect(list.get(1).getType()).toBe('BuiltinCommonInstructions::Once');

    list.delete();
  });

  it('moves reduce "once" instruction to one', () => {
    const list = new gd.InstructionsList();

    insertInstruction(list, 'BuiltinCommonInstructions::Once');
    insertInstruction(list, 'BuiltinCommonInstructions::Once');
    insertInstruction(list, 'BuiltinCommonInstructions::Once');
    expect(ensureSingleOnceInstructions(list)).toBe(true);
    expect(list.size()).toBe(1);
    expect(list.get(0).getType()).toBe('BuiltinCommonInstructions::Once');

    list.delete();
  });

  it('does nothing for empty list', () => {
    const list = new gd.InstructionsList();

    expect(ensureSingleOnceInstructions(list)).toBe(false);
    expect(list.size()).toBe(0);

    list.delete();
  });
});
