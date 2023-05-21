/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */


describe('gdjs.Layer', () => {
	const runtimeGame = gdjs.getPixiRuntimeGame();
	const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

	it('can convert coordinates', () => {
		const layer = new gdjs.Layer({name: 'My layer', visibility: true, effects:[]}, runtimeScene)
		layer.setCameraX(100, 0);
		layer.setCameraY(200, 0);
		layer.setCameraRotation(90, 0);

		expect(layer.convertCoords(350, 450, 0)[0]).to.be.within(-50.001, -49.99999);
		expect(layer.convertCoords(350, 450, 0)[1]).to.be.within(149.9999, 150.001);
	});
	it('can convert inverse coordinates', () => {
		const layer = new gdjs.Layer({name: 'My layer', visibility: true, effects:[]}, runtimeScene)
		layer.setCameraX(100, 0);
		layer.setCameraY(200, 0);
		layer.setCameraRotation(90, 0);

		expect(layer.convertInverseCoords(350, 450, 0)[0]).to.be.within(649.999, 650.001);
		expect(layer.convertInverseCoords(350, 450, 0)[1]).to.be.within(49.9999, 50.001);
	});
	it('can get the camera Z position', () => {
		const layer = new gdjs.Layer({name: 'My layer', visibility: true, effects:[]}, runtimeScene)
		expect(layer.getCameraZoom()).to.be(1);
		expect(layer.getWidth()).to.be(800);
		expect(layer.getHeight()).to.be(600);

		expect(layer.getCameraZ(45)).to.be.within(724.264, 724.265);
	});
	it('can update the camera Z position', () => {
		const layer = new gdjs.Layer({name: 'My layer', visibility: true, effects:[]}, runtimeScene)
		layer.setCameraZ(400, 45);

		expect(layer.getCameraZ(45)).to.be(400);
		expect(layer.getCameraZoom()).to.be.within(1.81066, 1.81067);
	});
	it('can get the camera Z position after a zoom update', () => {
		const layer = new gdjs.Layer({name: 'My layer', visibility: true, effects:[]}, runtimeScene)
		layer.setCameraZoom(2);

		expect(layer.getCameraZoom()).to.be(2);
		expect(layer.getCameraZ(45)).to.be.within(362.132, 362.133);
	});
	it('can set the camera Z position to 0', () => {
		const layer = new gdjs.Layer({name: 'My layer', visibility: true, effects:[]}, runtimeScene)
		expect(layer.getCameraZoom()).to.be(1);
		expect(layer.getCameraZ(45)).to.be.within(724.264, 724.265);
		
		layer.setCameraZ(0, 45);

		// The zoom factor is capped to avoid infinity.
		expect(layer.getCameraZoom()).to.be(Number.MAX_SAFE_INTEGER);
		// The camera Z is still 0, it's not evaluated from the zoom factor.
		expect(layer.getCameraZ(45)).to.be(0);
	});
});
