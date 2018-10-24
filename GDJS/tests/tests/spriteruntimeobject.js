/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

 const makeSpriteRuntimeObjectWithCustomHitBox = (runtimeScene) => new gdjs.SpriteRuntimeObject(runtimeScene, {
	"name": "obj1",
	"type": "Sprite",
	"updateIfNotVisible": false,
	"variables": [],
	"behaviors": [],
	"animations": [
		{
		"name": "NewObject2",
		"useMultipleDirections": false,
		"directions": [
			{
			"looping": false,
			"timeBetweenFrames": 1,
			"sprites": [
				{
				"hasCustomCollisionMask": true,
				"image": "NewObject2-2.png",
				"points": [],
				"originPoint": {
					"name": "origine",
					"x": 32,
					"y": 16
				},
				"centerPoint": {
					"automatic": false,
					"name": "centre",
					"x": 64,
					"y": 31
				},
				"customCollisionMask": [
					[
					{
						"x": 12.5,
						"y": 1
					},
					{
						"x": 41.5,
						"y": 2
					},
					{
						"x": 55.5,
						"y": 31
					},
					{
						"x": 24.5,
						"y": 30
					}
					]
				]
				}
			]
			}
		]
		}
	]
});

describe('gdjs.SpriteRuntimeObject', function() {
	var runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}});
	var runtimeScene = new gdjs.RuntimeScene(runtimeGame);

	it('should handle scaling properly', function(){
		var object = new gdjs.SpriteRuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], animations: []});

		expect(object.getScaleX()).to.be(1);
		object.flipX(true);
		expect(object.getScaleX()).to.be(1);
		object.setScaleX(0.42);
		expect(object.getScaleX()).to.be(0.42);
		expect(object.isFlippedX()).to.be(true);
		object.flipX(false);
		expect(object.isFlippedX()).to.be(false);
		expect(object.getScaleX()).to.be(0.42);
	});

	describe('Animations', function() {
		var object = new gdjs.SpriteRuntimeObject(runtimeScene, {
			name: "obj1",
			type: "",
			behaviors: [],
			animations: [{
				name: 'firstAnimation',
				directions: []
			}, {
				name: 'secondAnimation',
				directions: []
			}, {
				name: '',
				directions: []
			}],
		});

		it('can change animation using animation name', function() {
			expect(object.getAnimationName()).to.be('firstAnimation');
			object.setAnimationName('secondAnimation');
			expect(object.getAnimationName()).to.be('secondAnimation');
			expect(object.getAnimation()).to.be(1);
			expect(object.isCurrentAnimationName('secondAnimation')).to.be(true);
			expect(object.isCurrentAnimationName('firstAnimation')).to.be(false);
		});

		it('keeps the same animation when using an invalid/empty name', function() {
			object.setAnimationName('unexisting animation');
			expect(object.getAnimation()).to.be(1);
			object.setAnimationName('');
			expect(object.getAnimation()).to.be(1);
		});

		it('can change animation using animation index', function(){
			object.setAnimation(2);
			expect(object.getAnimationName()).to.be('');
			object.setAnimation(0);
			expect(object.getAnimationName()).to.be('firstAnimation');
		});
	});

	it('should properly compute hitboxes', function(){
		// Create an object with a custom hitbox
		const object = makeSpriteRuntimeObjectWithCustomHitBox(runtimeScene);

		// Check the hitboxes without any rotation (only the non default origin
		// which is at 32;16 is to be used).
		expect(object.getHitBoxes()[0].vertices[0]).to.eql([12.5 - 32, 1 - 16]);
		expect(object.getHitBoxes()[0].vertices[1]).to.eql([41.5 - 32, 2 - 16]);
		expect(object.getHitBoxes()[0].vertices[2]).to.eql([55.5 - 32, 31 - 16]);
		expect(object.getHitBoxes()[0].vertices[3]).to.eql([24.5 - 32, 30 - 16]);

		object.setAngle(90);
		expect(object.getHitBoxes()[0].vertices[0][0]).to.be.within(61.9999, 62.0001);
		expect(object.getHitBoxes()[0].vertices[0][1]).to.be.within(-36.5001, -36.49999);
		expect(object.getHitBoxes()[0].vertices[2][0]).to.be.within(31.999, 32.0001);
		expect(object.getHitBoxes()[0].vertices[2][1]).to.be.within(6.4999, 6.5001);
	});

	it('benchmark getAABB of rotated vs non rotated sprite, with custom hitboxes, origin and center', function(){ //TODO: Run in firefox too
		this.timeout(6000);
		const object = makeSpriteRuntimeObjectWithCustomHitBox(runtimeScene);

		//TODO: Factor benchmark/use benchmark.js
		var benchmarkTiming = {};
		var benchmarkCount = 60;
		var repeatInBenchmark = 60000;
		for(var benchmarkIndex = 0;benchmarkIndex < benchmarkCount;benchmarkIndex++) {
			
			{
				var title = repeatInBenchmark + 'x getAABB of a non rotated sprite, with custom hitboxes, origin and center';
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
				var title = repeatInBenchmark + 'x getAABB of a rotated sprite, with custom hitboxes, origin and center';
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
