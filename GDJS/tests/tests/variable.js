//@ts-check
/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.Variable', function () {
  it('should parse primitives', function () {
    const intVar = new gdjs.Variable({ value: '526', type: 'number' });
    const floatVar = new gdjs.Variable({ value: '10.568', type: 'number' });
    const strVar = new gdjs.Variable({
      value: 'test variable',
      type: 'string',
    });
    const numStrVar = new gdjs.Variable({ value: '5Apples', type: 'string' });
    const boolVar = new gdjs.Variable({ value: 'true', type: 'boolean' });

    expect(intVar.getAsNumber()).to.be(526);
    expect(intVar.getAsString()).to.be('526');
    expect(intVar.getAsNumberOrString()).to.be(526);
    expect(intVar.getAsBoolean()).to.be(true);
    expect(intVar.getType()).to.be('number');

    intVar.setNumber(0);
    expect(intVar.getAsBoolean()).to.be(false);

    expect(floatVar.getAsNumber()).to.be(10.568);
    expect(floatVar.getAsString()).to.be('10.568');
    expect(floatVar.getAsNumberOrString()).to.be(10.568);
    expect(floatVar.getAsBoolean()).to.be(true);
    expect(floatVar.getType()).to.be('number');

    expect(strVar.getAsNumber()).to.be(0);
    expect(strVar.getAsString()).to.be('test variable');
    expect(strVar.getAsNumberOrString()).to.be('test variable');
    expect(strVar.getAsBoolean()).to.be(true);
    expect(strVar.getType()).to.be('string');

    strVar.setString('0');
    expect(strVar.getAsBoolean()).to.be(false);
    strVar.setString('');
    expect(strVar.getAsBoolean()).to.be(false);
    strVar.setString('false');
    expect(strVar.getAsBoolean()).to.be(false);
    strVar.setString('1');
    expect(strVar.getAsBoolean()).to.be(true);

    expect(numStrVar.getAsNumber()).to.be(5);
    expect(numStrVar.getAsString()).to.be('5Apples');
    expect(numStrVar.getAsBoolean()).to.be(true);
    expect(numStrVar.getAsNumberOrString()).to.be('5Apples');
    expect(numStrVar.getType()).to.be('string');

    expect(boolVar.getType()).to.be('boolean');
    expect(boolVar.getAsString()).to.be('true');
    expect(boolVar.getAsNumber()).to.be(1);
    expect(boolVar.getAsBoolean()).to.be(true);
    expect(boolVar.getAsNumberOrString()).to.be('true');
  });

  it('should do some variable arithmetics', function () {
    const a = new gdjs.Variable({ value: '5', type: 'number' });

    a.add(3);
    expect(a.getAsNumber()).to.be(8);
    a.sub(10);
    expect(a.getAsNumber()).to.be(-2);
    a.mul(3);
    expect(a.getAsNumber()).to.be(-6);
    a.div(-2);
    expect(a.getAsNumber()).to.be(3);
    a.concatenateString('Apples');
    expect(a.getAsString()).to.be('3Apples');
    expect(a.getAsNumberOrString()).to.be('3Apples');
  });

  it('should clear a collection', function () {
    const structure = new gdjs.Variable();
    structure.getChild('a').setNumber(5);
    structure.getChild('b').getChild('alpha').setString('Apples');

    const array = new gdjs.Variable();
    array.getChildAt(1).setNumber(5);
    array.getChildAt(0).getChild('alpha').setString('Apples');

    expect(structure.hasChild('a')).to.be(true);
    expect(structure.hasChild('b')).to.be(true);
    expect(structure.getChild('b').hasChild('alpha')).to.be(true);

    expect(array.getChildrenCount()).to.be(2);
    expect(array.getChildAt(0).hasChild('alpha')).to.be(true);
    expect(array.getChildAt(0).getChild('alpha').getValue()).to.be('Apples');

    structure.clearChildren();
    array.clearChildren();

    expect(structure.hasChild('a')).to.be(false);
    expect(structure.hasChild('b')).to.be(false);

    expect(array.getChildrenCount()).to.be(0);
    expect(array.getChildAt(0).getChild('alpha').getAsString()).to.be('0');
  });

  it('should parse collections', function () {
    const structure = new gdjs.Variable({
      type: 'structure',
      children: [
        { name: 'foo', value: 'Hello', type: 'string' },
        { name: 'bar', value: 'World', type: 'string' },
      ],
    });
    const array = new gdjs.Variable({
      type: 'array',
      children: [
        { value: 'Hello', type: 'string' },
        { value: 'World', type: 'string' },
      ],
    });

    expect(structure.getType()).to.be('structure');
    expect(array.getType()).to.be('array');

    expect(structure.getChild('foo').getAsString()).to.be('Hello');
    expect(structure.getAllChildren().bar.getAsString()).to.be('World');
    expect(array.getAllChildren()[0].getAsString()).to.be('Hello');

    expect(array.getChild('0').getAsString()).to.be('Hello');
    expect(array.getChildAt(0).getAsString()).to.be('Hello');
    expect(array.getAllChildrenArray()[1].getAsString()).to.be('World');
    expect(structure.getAllChildrenArray()[0].getAsString()).to.be('Hello');
  });

  it('can be serialized to JSON', function () {
    var structure = new gdjs.Variable({ value: '0' });

    // Verify numbers serialization
    structure.getChild('a').setNumber(5);

    // Verify structures serialization
    structure.getChild('b').getChild('alpha').setString('Apples');
    structure.getChild('b').getChild('beta').setBoolean(true);
    structure
      .getChild('b')
      .getChild('Child with quotes "" and a backlash \\')
      .setString(
        'String with quotes "", and a backslash \\ and new line \\n \\n\\r and brackets {[{}]}!'
      );

    // Verify array serialization
    const array = structure.getChild('c');
    array.castTo('array');
    array.pushValue(49);
    array.pushVariableCopy(structure.getChild('b'));

    // Verify empty string serialization
    structure.getChild('d').setString('');

    // Verify boolean serialization
    structure.getChild('e').setBoolean(false);
    structure.getChild('f').setBoolean(true);

    const b =
      '{"alpha":"Apples","beta":true,"Child with quotes \\"\\" and a backlash \\\\":"String with quotes \\"\\", and a backslash \\\\ and new line \\\\n \\\\n\\\\r and brackets {[{}]}!"}';
    expect(gdjs.evtTools.network.variableStructureToJSON(structure)).to.be(
      `{"a":5,"b":${b},"c":[49,${b}],"d":"","e":false,"f":true}`
    );
  });

  it('can be unserialized from JSON', function () {
    var structure = new gdjs.Variable({ value: '0' });
    const b =
      '{"alpha":"Apples","beta":true,"Child with quotes \\"\\" and a backlash \\\\": "String with quotes \\"\\", and a backslash \\\\ and new line \\\\n \\\\n\\\\r and brackets {[{}]}!"}';

    gdjs.evtTools.network.jsonToVariableStructure(
      `{"a":5,"b":${b},"c":[49,${b}],"d":"","e": false,"f":true}`,
      structure
    );

    expect(structure.getChild('a').getType()).to.be('number');
    expect(structure.getChild('a').getAsNumber()).to.be(5);
    expect(structure.getChild('b').getChild('alpha').getType()).to.be('string');
    expect(structure.getChild('b').getChild('alpha').getAsString()).to.be(
      'Apples'
    );
    expect(structure.getChild('b').getChild('beta').getType()).to.be('boolean');
    expect(structure.getChild('b').getChild('beta').getAsBoolean()).to.be(true);
    expect(structure.getChild('b').getType()).to.be('structure');
    expect(
      structure
        .getChild('b')
        .getChild('Child with quotes "" and a backlash \\')
        .getAsString()
    ).to.be(
      'String with quotes "", and a backslash \\ and new line \\n \\n\\r and brackets {[{}]}!'
    );
    expect(structure.getChild('c').getType()).to.be('array');
    expect(structure.getChild('c').getChild('0').getType()).to.be('number');
    expect(structure.getChild('c').getChild('0').getAsNumber()).to.be(49);
    expect(structure.getChild('c').getChild('1').getType()).to.be('structure');
    expect(
      structure
        .getChild('c')
        .getChild('1')
        .getChild('Child with quotes "" and a backlash \\')
        .getAsString()
    ).to.be(
      'String with quotes "", and a backslash \\ and new line \\n \\n\\r and brackets {[{}]}!'
    );

    expect(structure.getChild('d').getType()).to.be('string');
    expect(structure.getChild('d').getAsString()).to.be('');

    expect(structure.getChild('e').getType()).to.be('boolean');
    expect(structure.getChild('e').getAsBoolean()).to.be(false);

    expect(structure.getChild('f').getType()).to.be('boolean');
    expect(structure.getChild('f').getAsBoolean()).to.be(true);
  });
  it('exposes a badVariable that is neutral for all operations', function () {
    expect(gdjs.VariablesContainer.badVariable.getValue()).to.be(0);

    expect(gdjs.VariablesContainer.badVariable.getAsNumber()).to.be(0);
    gdjs.VariablesContainer.badVariable.setBoolean(true);
    expect(gdjs.VariablesContainer.badVariable.getAsBoolean()).to.be(false);
    gdjs.VariablesContainer.badVariable.setString('123');
    expect(gdjs.VariablesContainer.badVariable.getAsString()).to.be('0');
    expect(gdjs.VariablesContainer.badVariable.getType()).to.be('number');
    expect(gdjs.VariablesContainer.badVariable.getChild('')).to.be(
      gdjs.VariablesContainer.badVariable
    );
    expect(gdjs.VariablesContainer.badVariable.getChildAt(0)).to.be(
      gdjs.VariablesContainer.badVariable
    );
    expect(gdjs.VariablesContainer.badVariable.getChildrenCount()).to.be(0);
    expect(gdjs.VariablesContainer.badVariable.isUndefinedInContainer()).to.be(
      true
    );
    gdjs.VariablesContainer.badVariable.add(1);
    gdjs.VariablesContainer.badVariable.mul(2);
    gdjs.VariablesContainer.badVariable.div(1);
    gdjs.VariablesContainer.badVariable.sub(-1);
    expect(gdjs.VariablesContainer.badVariable.getValue()).to.be(0);
    gdjs.VariablesContainer.badVariable.clearChildren();
    gdjs.VariablesContainer.badVariable.reinitialize();
    gdjs.VariablesContainer.badVariable.replaceChildren({});
    gdjs.VariablesContainer.badVariable.replaceChildrenArray([]);
    gdjs.VariablesContainer.badVariable.castTo('string');
    gdjs.VariablesContainer.badVariable.castTo('boolean');
    expect(gdjs.VariablesContainer.badVariable.getType()).to.be('number');
    expect(gdjs.VariablesContainer.badVariable.getValue()).to.be(0);
  });
});
