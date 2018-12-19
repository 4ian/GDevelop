/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */


describe('gdjs.Force', function() {
	it('can set angle and length', function(){
		var layer = new gdjs.Force();
		layer.setAngle(-45);
		layer.setLength(200);

		expect(layer.getX()).to.be.within(141.42, 141.422);
		expect(layer.getY()).to.be.within(-141.422, -141.42);
	});
});
