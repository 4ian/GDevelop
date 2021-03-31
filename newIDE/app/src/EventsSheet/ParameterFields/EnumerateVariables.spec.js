// @flow
import { enumerateVariables } from './EnumerateVariables';
const gd: libGDevelop = global.gd;

describe('EnumerateVariables', () => {
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
    const variable4 = new gd.Variable();
    variable4.pushNew().setString('First item');
    variable4.pushNew().setValue(2);
    const variable4Item3 = variable4.pushNew();
    variable4Item3.pushNew().setString('a');
    variable4Item3.pushNew().setString('b');
    variable4Item3.pushNew().setString('c');
    container.insert('Variable4', variable4, 3);

    const allNames = enumerateVariables(container).map(({ name }) => name);
    expect(allNames).toHaveLength(14);
    expect(allNames).toContain('Variable1');
    expect(allNames).toContain('Variable2');
    expect(allNames).toContain('Variable3');
    expect(allNames).toContain('Variable3.Child1');
    expect(allNames).toContain('Variable3.Child2');
    expect(allNames).toContain('Variable3.Child3');
    expect(allNames).toContain('Variable3.Child3.SubChild1');
    expect(allNames).toContain('Variable4');
    expect(allNames).toContain('Variable4[0]');
    expect(allNames).toContain('Variable4[1]');
    expect(allNames).toContain('Variable4[2]');
    expect(allNames).toContain('Variable4[2][0]');
    expect(allNames).toContain('Variable4[2][1]');
    expect(allNames).toContain('Variable4[2][2]');
  });
  it('can enumerate "invalid" variable names, including children', () => {
    const container = new gd.VariablesContainer();
    container.insert('ValidName', new gd.Variable(), 0);
    container.insert('Invalid!Name', new gd.Variable(), 1);
    const variable3 = new gd.Variable();
    variable3.getChild('Valid name');
    variable3.getChild('Also a \\valid\\ "name"!');
    container.insert('Variable3', variable3, 2);
    const variable4 = new gd.Variable();
    variable4.getChild('ValidName');
    container.insert('==InvalidName==', variable4, 3);

    const enumeratedVariables = enumerateVariables(container);
    expect(enumeratedVariables).toHaveLength(7);
    expect(enumeratedVariables[0].name).toBe('ValidName');
    expect(enumeratedVariables[0].isValidName).toBe(true);
    expect(enumeratedVariables[1].name).toBe('Invalid!Name');
    expect(enumeratedVariables[1].isValidName).toBe(false);
    expect(enumeratedVariables[2].name).toBe('Variable3');
    expect(enumeratedVariables[2].isValidName).toBe(true);
    expect(enumeratedVariables[3].name).toBe(
      'Variable3["Also a \\\\valid\\\\ \\"name\\"!"]'
    );
    expect(enumeratedVariables[3].isValidName).toBe(true);
    expect(enumeratedVariables[4].name).toBe('Variable3["Valid name"]');
    expect(enumeratedVariables[4].isValidName).toBe(true);
    expect(enumeratedVariables[5].name).toBe('==InvalidName==');
    expect(enumeratedVariables[5].isValidName).toBe(false);
    expect(enumeratedVariables[6].name).toBe('==InvalidName==.ValidName');
    expect(enumeratedVariables[6].isValidName).toBe(false);
  });
});
