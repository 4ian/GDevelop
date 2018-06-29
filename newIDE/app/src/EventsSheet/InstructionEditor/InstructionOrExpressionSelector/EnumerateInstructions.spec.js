import { createTree } from './CreateTree';
import { enumerateInstructions } from './EnumerateInstructions';

describe('EnumerateInstructions', () => {
  it('can enumerate instructions being conditions', () => {
    const instructions = enumerateInstructions(true);
    expect(instructions).toMatchSnapshot();
  });

  it('can enumerate instructions being actions', () => {
    const instructions = enumerateInstructions(false);
    expect(instructions).toMatchSnapshot();
  });

  it('can create the tree of instructions', () => {
    const instructions = enumerateInstructions('number');
    expect(createTree(instructions)).toMatchSnapshot();
  });
});
