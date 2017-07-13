/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.variable', function() {

	it('should parse initial values into strings and numbers', function(){

		var int_var = new gdjs.Variable( {value : "526"} );
		var float_var = new gdjs.Variable( {value : "10.568"} );
		var str_var = new gdjs.Variable( {value : "testing variables"} );
		var num_str_var = new gdjs.Variable( {value : "5Apples"} );

		expect(int_var.getAsNumber()).to.be(526);
		expect(int_var.getAsString()).to.be("526");
		expect(float_var.getAsNumber()).to.be(10.568);
		expect(float_var.getAsString()).to.be("10.568");
		expect(str_var.getAsNumber()).to.be(0);
		expect(str_var.getAsString()).to.be("testing variables");
		expect(num_str_var.getAsNumber()).to.be(5);
		expect(num_str_var.getAsString()).to.be("5Apples");
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

});
