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

	it('should detect circle collisions', function(){
    	var c1 = new gdjs.Polygon();
    	c1.vertices = [[10, 10], [15, 10]]; //center: (10,10), radius: 5;
		
		var c2 = new gdjs.Polygon();
		c2.vertices = [[20, 10], [20, 20]]; //center: (20,10), radius: 10;

		var res;

		res = gdjs.Polygon.circleCircleCollisionTest(c1, c2);
		expect(res.collision).to.be(true);
		expect(res.move_axis).to.eql([-5, 0]);

		c2.vertices = [[30, 0], [30, 5]]; //center: (30,0), radius: 5;
		res = gdjs.Polygon.circleCircleCollisionTest(c1, c2);
		expect(res.collision).to.be(false);

		c2.vertices = [[5, 5], [30, 5]]; //center: (5,5), radius: 25;
		res = gdjs.Polygon.circleCircleCollisionTest(c1, c2);
		expect(res.collision).to.be(true);
		expect(res.move_axis).to.be.within([16.2132034, 16.2132034], [16.2132035, 16.2132035]);
	});

	it('should detect circle-polygon collisions', function(){
    	var circle = new gdjs.Polygon();
    	circle.vertices = [[10, 10], [15, 10]]; //center: (10,10), radius: 5;
		
		var rect = gdjs.Polygon.createRectangle(20, 10);
		rect.move(0, 15);

		var res;

		res = gdjs.Polygon.polygonCircleCollisionTest(rect, circle);
		expect(res.collision).to.be(true);

		rect.move(-20, 0);
		res = gdjs.Polygon.polygonCircleCollisionTest(rect, circle);
		expect(res.collision).to.be(false);

		rect.move(19, 1);
		res = gdjs.Polygon.polygonCircleCollisionTest(rect, circle);
		expect(res.collision).to.be(true);
		expect(res.move_axis).to.be.within([-2.5355339, 2.5355339], [-2.5355340, 2.5355340]);
	});
});
