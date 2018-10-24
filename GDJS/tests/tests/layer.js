/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */


describe('gdjs.Layer', function() {
	var runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}});
	var runtimeScene = new gdjs.RuntimeScene(runtimeGame);

	it('can convert coordinates', function(){
		var layer = new gdjs.Layer({name: 'My layer', visibility: true, effects:[]}, runtimeScene)
		layer.setCameraX(100, 0);
		layer.setCameraY(200, 0);
		layer.setCameraRotation(90, 0);

		expect(layer.convertCoords(350, 450, 0)[0]).to.be.within(-50.001, -49.99999);
		expect(layer.convertCoords(350, 450, 0)[1]).to.be.within(149.9999, 150.001);
	});
	it('can convert inverse coordinates', function(){
		var layer = new gdjs.Layer({name: 'My layer', visibility: true, effects:[]}, runtimeScene)
		layer.setCameraX(100, 0);
		layer.setCameraY(200, 0);
		layer.setCameraRotation(90, 0);

		expect(layer.convertInverseCoords(350, 450, 0)[0]).to.be.within(649.999, 650.001);
		expect(layer.convertInverseCoords(350, 450, 0)[1]).to.be.within(49.9999, 50.001);
	});

	it('benchmark convertCoords and convertInverseCoords', function(){ //TODO: Run in firefox too
		this.timeout(6000);
		var layer = new gdjs.Layer({name: 'My layer', visibility: true, effects:[]}, runtimeScene)
		layer.setCameraX(100, 0);
		layer.setCameraY(200, 0);
		layer.setCameraRotation(90, 0);

		//TODO: Factor benchmark/use benchmark.js
		var benchmarkTiming = {};
		var benchmarkCount = 1000;
		var repeatInBenchmark = 100000;
		for(var benchmarkIndex = 0;benchmarkIndex < benchmarkCount;benchmarkIndex++) {
			{
				var title = repeatInBenchmark + 'x convertCoords';
				var start = performance.now();
				for(var i = 0;i<repeatInBenchmark;i++) {
					layer.convertCoords(350, 450, 0);
				}
				benchmarkTiming[title] = benchmarkTiming[title] || [];
				benchmarkTiming[title].push(performance.now() - start);
			}
			{
				var title = repeatInBenchmark + 'x convertInverseCoords';
				var start = performance.now();
				for(var i = 0;i<repeatInBenchmark;i++) {
					layer.convertInverseCoords(350, 450, 0);
				}
				benchmarkTiming[title] = benchmarkTiming[title] || [];
				benchmarkTiming[title].push(performance.now() - start);
			}
		}

		var results = {};
		for(var benchmarkName in benchmarkTiming) {
			results[benchmarkName] = benchmarkTiming[benchmarkName].reduce((sum, value) => sum+value, 0) / benchmarkCount;
		}
		console.log(results);
		// console.log(benchmarkTiming);
	});
});
