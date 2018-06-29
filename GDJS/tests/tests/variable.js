/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.variable', function() {

	it('should parse initial values into strings and numbers', function(){

		var intVar = new gdjs.Variable( {value : "526"} );
		var floatVar = new gdjs.Variable( {value : "10.568"} );
		var strVar = new gdjs.Variable( {value : "testing variables"} );
		var numStrVar = new gdjs.Variable( {value : "5Apples"} );

		expect(intVar.getAsNumber()).to.be(526);
		expect(intVar.getAsString()).to.be("526");
		expect(floatVar.getAsNumber()).to.be(10.568);
		expect(floatVar.getAsString()).to.be("10.568");
		expect(strVar.getAsNumber()).to.be(0);
		expect(strVar.getAsString()).to.be("testing variables");
		expect(numStrVar.getAsNumber()).to.be(5);
		expect(numStrVar.getAsString()).to.be("5Apples");
	});

	it('should do some variable arithmetics', function(){

		var a = new gdjs.Variable( {value : "5"} );

		a.add(3);
		expect(a.getAsNumber()).to.be(8);
		a.sub(10);
		expect(a.getAsNumber()).to.be(-2);
		a.mul(3);
		expect(a.getAsNumber()).to.be(-6);
		a.div(-2);
		expect(a.getAsNumber()).to.be(3);
		a.concatenate("Apples");
		expect(a.getAsString()).to.be("3Apples");

	});

	it('should clear a structure', function(){
		var structure = new gdjs.Variable( {value : "0"} );
		structure.getChild("a").setNumber(5);
		structure.getChild("b").getChild("alpha").setString("Apples");

		expect(structure.hasChild("a")).to.be(true);
		expect(structure.hasChild("b")).to.be(true);
		expect(structure.getChild("b").hasChild("alpha")).to.be(true);

		structure.clearChildren();
		expect(structure.hasChild("a")).to.be(false);
		expect(structure.hasChild("b")).to.be(false);
	})

});
