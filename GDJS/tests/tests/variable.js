/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.Variable', function () {
  it('should parse initial values into strings and numbers', function () {
    var intVar = new gdjs.Variable({ value: '526', type: 'number' });
    var floatVar = new gdjs.Variable({ value: '10.568', type: 'number' });
    var strVar = new gdjs.Variable({ value: 'test variable', type: 'string' });
    var numStrVar = new gdjs.Variable({ value: '5Apples', type: 'string' });
    var boolVar = new gdjs.Variable({ value: 'true', type: 'boolean' });

    expect(intVar.getAsNumber()).to.be(526);
    expect(intVar.getAsString()).to.be('526');
    expect(intVar.getAsBoolean()).to.be(true);
    expect(intVar.getType()).to.be('number');

    intVar.setNumber(0);
    expect(intVar.getAsBoolean()).to.be(false);

    expect(floatVar.getAsNumber()).to.be(10.568);
    expect(floatVar.getAsString()).to.be('10.568');
    expect(floatVar.getAsBoolean()).to.be(true);
    expect(floatVar.getType()).to.be('number');

    expect(strVar.getAsNumber()).to.be(0);
    expect(strVar.getAsString()).to.be('test variable');
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
    expect(numStrVar.getType()).to.be('string');

    expect(boolVar.getType()).to.be('boolean');
    expect(boolVar.getAsString()).to.be('true');
    expect(boolVar.getAsNumber()).to.be(1);
    expect(boolVar.getAsBoolean()).to.be(true);
  });

  it('should do some variable arithmetics', function () {
    var a = new gdjs.Variable({ value: '5', type: "number" });

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
  });

  it('should clear a structure', function () {
    var structure = new gdjs.Variable({ value: '0' });
    structure.getChild('a').setNumber(5);
    structure.getChild('b').getChild('alpha').setString('Apples');

    expect(structure.hasChild('a')).to.be(true);
    expect(structure.hasChild('b')).to.be(true);
    expect(structure.getChild('b').hasChild('alpha')).to.be(true);

    structure.clearChildren();
    expect(structure.hasChild('a')).to.be(false);
    expect(structure.hasChild('b')).to.be(false);
  });

  it('can be serialized to JSON', function () {
    var structure = new gdjs.Variable({ value: '0' });
    structure.getChild('a').setNumber(5);
    structure.getChild('b').getChild('alpha').setString('Apples');
    structure
      .getChild('b')
      .getChild('Child with quotes "" and a backlash \\')
      .setString(
        'String with quotes "", and a backslash \\ and new line \\n \\n\\r and brackets {[{}]}!'
      );

    expect(gdjs.evtTools.network.variableStructureToJSON(structure)).to.be(
      '{"a": 5,"b": {"alpha": "Apples","Child with quotes \\"\\" and a backlash \\\\": "String with quotes \\"\\", and a backslash \\\\ and new line \\\\n \\\\n\\\\r and brackets {[{}]}!"}}'
    );
  });

  it('can be unserialized from JSON', function () {
    var structure = new gdjs.Variable({ value: '0' });

    gdjs.evtTools.network.jsonToVariableStructure(
      '{"a": 5,"b": {"alpha": "Apples","Child with quotes \\"\\" and a backlash \\\\": "String with quotes \\"\\", and a backslash \\\\ and new line \\\\n \\\\n\\\\r and brackets {[{}]}!"}}',
      structure
    );

    expect(structure.getChild('a').getAsNumber()).to.be(5);
    expect(structure.getChild('b').getChild('alpha').getAsString()).to.be(
      'Apples'
    );
    expect(
      structure
        .getChild('b')
        .getChild('Child with quotes "" and a backlash \\')
        .getAsString()
    ).to.be(
      'String with quotes "", and a backslash \\ and new line \\n \\n\\r and brackets {[{}]}!'
    );
  });
});
