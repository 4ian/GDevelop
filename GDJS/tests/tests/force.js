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

	it('benchmark setting angle and length', function(){ //TODO: Run in firefox too
		this.timeout(6000);
		var layer = new gdjs.Force();

		//TODO: Factor benchmark/use benchmark.js
		var benchmarkTiming = {};
		var benchmarkCount = 1000;
		var repeatInBenchmark = 1000000;
		for(var benchmarkIndex = 0;benchmarkIndex < benchmarkCount;benchmarkIndex++) {
			{
				var title = repeatInBenchmark + 'x setAngle and setLength';
				var start = performance.now();
				for(var i = 0;i<repeatInBenchmark;i++) {
					layer.setAngle(-45);
					layer.setLength(200);
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
