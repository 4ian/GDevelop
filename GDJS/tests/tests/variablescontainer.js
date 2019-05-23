/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.VariablesContainer', function() {
    it('can be constructed empty, get variables (defined on the fly) and remove them', function() {
      const container = new gdjs.VariablesContainer();

      const myVariable = container.get('MyVariable');
      expect(container.has('MyVariable')).to.be(true);
      expect(myVariable.getAsNumber()).to.be(0);
      expect(myVariable.getAsString()).to.be("0");

      myVariable.setNumber(1);
      const myVariable2 = container.get('MyVariable2');
      const myVariable3 = container.get('MyVariable3');
      container.get('MyVariable3').setNumber(3);
      expect(container.has('MyVariable')).to.be(true);
      expect(container.has('MyVariable2')).to.be(true);
      expect(container.has('MyVariable3')).to.be(true);
      expect(container.get('MyVariable').getAsNumber()).to.be(1);
      expect(container.get('MyVariable2').getAsNumber()).to.be(0);
      expect(container.get('MyVariable3').getAsNumber()).to.be(3);

      container.remove('MyVariable2');
      container.remove('MyVariable');
      expect(container.has('MyVariable')).to.be(false);
      expect(container.has('MyVariable2')).to.be(false);
      expect(container.has('MyVariable3')).to.be(true);

      expect(container.get('MyVariable').getAsNumber()).to.be(0);
      expect(container.get('MyVariable3').getAsNumber()).to.be(3);
      expect(container.has('MyVariable')).to.be(true);
      expect(container.has('MyVariable2')).to.be(false);
      expect(container.has('MyVariable3')).to.be(true);
    });

    it('can be constructed from data', function() {
        const container = new gdjs.VariablesContainer([{
            name: 'Var1',
            value: 123
        },{
            name: 'Var2',
            value: 'Hello World'
        }, {
            name: 'Var3',
            children: [{
                name: 'Var3.1',
                value: 1,
            }]
        }]);

        expect(container.has('Var1')).to.be(true);
        expect(container.get('Var1').getAsNumber()).to.be(123);
        expect(container.has('Var2')).to.be(true);
        expect(container.get('Var2').getAsString()).to.be('Hello World');
        expect(container.has('Var3')).to.be(true);
        expect(container.get('Var3').hasChild('Var3.1')).to.be(true);
        expect(container.get('Var3').getChild('Var3.1').getAsNumber()).to.be(1);

        // Check that getFromIndex works (for faster lookup in case we know
        // the order of variables).
        expect(container.getFromIndex(0).getAsNumber()).to.be(123);
        expect(container.getFromIndex(1).getAsString()).to.be('Hello World');
        expect(container.getFromIndex(2).isStructure()).to.be(true);

        // Call initFrom to add more variables (overriding the existing ones)
        container.initFrom([{
            name: 'Var4',
            value: 456
        },{
            name: 'Var2',
            value: 'Modified Hello World'
        }], true);

        expect(container.has('Var1')).to.be(true);
        expect(container.get('Var1').getAsNumber()).to.be(123);
        expect(container.has('Var2')).to.be(true);
        expect(container.get('Var2').getAsString()).to.be('Modified Hello World');
        expect(container.has('Var3')).to.be(true);
        expect(container.get('Var3').hasChild('Var3.1')).to.be(true);
        expect(container.get('Var3').getChild('Var3.1').getAsNumber()).to.be(1);
        expect(container.has('Var4')).to.be(true);
        expect(container.get('Var4').getAsNumber()).to.be(456);

        // Check that getFromIndex still works (for faster lookup in case we know
        // the order of variables).
        expect(container.getFromIndex(0).getAsNumber()).to.be(123);
        expect(container.getFromIndex(1).getAsString()).to.be('Modified Hello World');
        expect(container.getFromIndex(2).isStructure()).to.be(true);

        // Call initFrom to replace all variables (erasing the existing ones)
        container.initFrom([{
            name: 'Var5',
            value: 789
        },{
            name: 'Var6',
            value: 'The Only Hello World'
        }]);

        expect(container.has('Var1')).to.be(false);
        expect(container.has('Var2')).to.be(false);
        expect(container.has('Var3')).to.be(false);
        expect(container.has('Var4')).to.be(false);
        expect(container.has('Var5')).to.be(true);
        expect(container.get('Var5').getAsNumber()).to.be(789);
        expect(container.has('Var6')).to.be(true);
        expect(container.get('Var6').getAsString()).to.be('The Only Hello World');

    });
  });
