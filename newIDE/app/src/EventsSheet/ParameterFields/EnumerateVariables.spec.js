// @flow
import { enumerateVariables } from './EnumerateVariables';
const gd: libGDevelop = global.gd;

describe('EnumerateObjects', () => {
  it('can enumerate variables, including children', () => {
    const container = new gd.VariablesContainer();
    container
      .insert('Variable1', new gd.Variable(), 0)
      .setString('A multiline\nstr value');
    container.insert('Variable2', new gd.Variable(), 1).setString('123456');
    const variable3 = new gd.Variable();
    variable3.getChild('Child1').setString('Child1 str value');
    variable3.getChild('Child2').setString('7891011');
    variable3
      .getChild('Child3')
      .getChild('SubChild1')
      .setString('Hello\nMultiline\nWorld');
    container.insert('Variable3', variable3, 2);

    const allNames = enumerateVariables(container);
    expect(allNames).toHaveLength(7);
    expect(allNames).toContain('Variable1');
    expect(allNames).toContain('Variable2');
    expect(allNames).toContain('Variable3');
    expect(allNames).toContain('Variable3.Child1');
    expect(allNames).toContain('Variable3.Child2');
    expect(allNames).toContain('Variable3.Child3');
    expect(allNames).toContain('Variable3.Child3.SubChild1');
  });
});
