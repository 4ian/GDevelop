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
});
