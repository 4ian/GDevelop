describe('gdjs.RuntimeObject', function() {
    const runtimeScene = new gdjs.RuntimeScene(null);
    
	it('benchmark getAABB of rotated vs non rotated objects', function(){
    this.timeout(20000);
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		object.getWidth = function() { return 10; };
		object.getHeight = function() { return 20; };
		object.setPosition(15, 20);

        const benchmarkSuite = makeBenchmarkSuite({
            benchmarksCount: 60,
            iterationsCount: 60000,
        });
        benchmarkSuite
          .add('getAABB of a non rotated, default center', (i) => {
            object.setX(i);
            object.getAABB();
          })
          .add('getAABB of a rotated, default center', (i) => {
            object.setX(i);
            object.getAABB();
          });
    
        console.log(benchmarkSuite.run());
	});

	it('benchmark getAABB of rotated vs non rotated objects, with non default center', function(){
    this.timeout(20000);
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		object.getWidth = function() { return 10; };
		object.getHeight = function() { return 20; };
		object.getCenterX = function() { return 0 };
		object.getCenterY = function() { return 0 };
		object.setPosition(15, 20);

        const benchmarkSuite = makeBenchmarkSuite({
            benchmarksCount: 60,
            iterationsCount: 60000,
        });
        benchmarkSuite
          .add('getAABB of a non rotated, non default center', (i) => {
            object.setAngle(0);
            object.setX(i);
            object.getAABB();
          })
          .add('getAABB of a rotated, non default center', (i) => {
            object.setAngle(90);
            object.setX(i);
            object.getAABB();
          });
    
        console.log(benchmarkSuite.run());
    });
});
