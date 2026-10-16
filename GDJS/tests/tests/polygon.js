describe('gdjs.Polygon', function() {
	it('should properly projects points', function(){
    var rect = gdjs.Polygon.createRectangle(32, 40);
		var res = [0, 0];

		gdjs.Polygon.project([-1, 0], rect, res)
		expect(res).to.eql([-16, 16]);

		gdjs.Polygon.project([0, 1], rect, res)
		expect(res).to.eql([-20, 20]);

		gdjs.Polygon.project([0, -1], rect, res)
		expect(res).to.eql([-20, 20]);

		gdjs.Polygon.project([1/Math.sqrt(2), 1/Math.sqrt(2)], rect, res)
		expect(res).to.eql([-25.45584412271571, 25.45584412271571]);
	});
	it('can check for collisions, with touching edges', function(){
    	var rect1 = gdjs.Polygon.createRectangle(10, 20);
    	var rect2 = gdjs.Polygon.createRectangle(10, 20);
		rect2.move(10, 0);

		let result = null;
		result = gdjs.Polygon.collisionTest(rect1, rect2, /*ignoreTouchingEdges=*/false);
		expect(result.collision).to.eql(true);
		expect(result.move_axis).to.eql([0, 0]);

		rect2.move(-2, 0);
		result = gdjs.Polygon.collisionTest(rect1, rect2, /*ignoreTouchingEdges=*/false);
		expect(result.collision).to.eql(true);
		expect(result.move_axis).to.eql([-2, 0]);
	});
	it('can check for collisions, with ignored touching edges', function(){
		var rect1 = gdjs.Polygon.createRectangle(10, 20);
		var rect2 = gdjs.Polygon.createRectangle(10, 20);
		rect2.move(10, 0);

		let result = null;
		result = gdjs.Polygon.collisionTest(rect1, rect2, /*ignoreTouchingEdges=*/true);
		expect(result.collision).to.eql(false);
		expect(result.move_axis).to.eql([0, 0]);

		rect2.move(-2, 0);
		result = gdjs.Polygon.collisionTest(rect1, rect2, /*ignoreTouchingEdges=*/true);
		expect(result.collision).to.eql(true);
		expect(result.move_axis).to.eql([-2, 0]);
	});
	it('can check for collisions separated only by the last edge of a polygon', function(){
		// Only the edge from the last vertex to the first one of the triangle
		// separates them.
		var triangle = new gdjs.Polygon();
		triangle.vertices.push([0, 0], [10, 0], [0, 10]);
		var diamond = new gdjs.Polygon();
		diamond.vertices.push([-6, 0], [-1, 5], [-6, 10], [-11, 5]);

		expect(gdjs.Polygon.collisionTest(triangle, diamond, false).collision).to.be(false);
		expect(gdjs.Polygon.collisionTest(diamond, triangle, false).collision).to.be(false);
	});
});
