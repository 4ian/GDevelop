/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.runtimeObject', function() {
	var runtimeScene = new gdjs.RuntimeScene(null);

	it('should compute distances properly', function(){
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
		object.setPosition(15, 20);

		expect(object.getSqDistanceTo(-110, 200)).to.be(48025);
	});

	it('should compute AABB properly', function(){
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
		object.getWidth = function() { return 10; };
		object.getHeight = function() { return 20; };

		expect(object.getAABB()).to.eql({
			min: [0,0],
			max: [10,20]
		});

		object.setPosition(15, 20);
		expect(object.getAABB()).to.eql({
			min: [15,20],
			max: [25,40]
		});
		
		object.setAngle(90);
		expect(object.getAABB()).to.eql({
			min: [10,25],
			max: [30,35]
		});
		
		object.setAngle(0);
		object.getCenterX = function() { return 0 };
		object.getCenterY = function() { return 0 };
		expect(object.getAABB()).to.eql({
			min: [15,20],
			max: [25,40]
		});

		object.setPosition(15, 20);
		object.setAngle(90);
		expect(object.getAABB()).to.eql({
			min: [-5,20],
			max: [15,30]
		});
	});

	it('benchmark getAABB of rotated vs non rotated objects', function(){ //TODO: Run in firefox too
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
		object.getWidth = function() { return 10; };
		object.getHeight = function() { return 20; };
		object.setPosition(15, 20);

		var benchmarkTiming = {};
		var benchmarkCount = 60;
		var repeatInBenchmark = 60000;
		for(var benchmarkIndex = 0;benchmarkIndex < benchmarkCount;benchmarkIndex++) {
			
			{
				var title = repeatInBenchmark + 'x getAABB of a non rotated, default center';
				object.setAngle(0);
				var start = performance.now();
				for(var i = 0;i<repeatInBenchmark;i++) {
					object.setX(i);
					object.getAABB();
				}
				benchmarkTiming[title] = benchmarkTiming[title] || [];
				benchmarkTiming[title].push(performance.now() - start);
			}

			{
				var title = repeatInBenchmark + 'x getAABB of a rotated, default center';
				object.setAngle(90);
				var start = performance.now();
				for(var i = 0;i<repeatInBenchmark;i++) {
					object.setX(i);
					object.getAABB();
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

	it('benchmark getAABB of rotated vs non rotated objects, with non default center', function(){ //TODO: Run in firefox too
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
		object.getWidth = function() { return 10; };
		object.getHeight = function() { return 20; };
		object.getCenterX = function() { return 0 };
		object.getCenterY = function() { return 0 };
		object.setPosition(15, 20);

		//TODO: Factor benchmark/use benchmark.js
		var benchmarkTiming = {};
		var benchmarkCount = 60;
		var repeatInBenchmark = 60000;
		for(var benchmarkIndex = 0;benchmarkIndex < benchmarkCount;benchmarkIndex++) {
			
			{
				var title = repeatInBenchmark + 'x getAABB of a non rotated, non default center';
				object.setAngle(0);
				var start = performance.now();
				for(var i = 0;i<repeatInBenchmark;i++) {
					object.setX(i);
					object.getAABB();
				}
				benchmarkTiming[title] = benchmarkTiming[title] || [];
				benchmarkTiming[title].push(performance.now() - start);
			}

			{
				var title = repeatInBenchmark + 'x getAABB of a rotated, non default center';
				object.setAngle(90);
				var start = performance.now();
				for(var i = 0;i<repeatInBenchmark;i++) {
					object.setX(i);
					object.getAABB();
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
