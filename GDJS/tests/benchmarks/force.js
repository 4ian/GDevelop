describe('gdjs.Force', function() {
	it('benchmark setting angle and length', function(){
		this.timeout(20000);
        var layer = new gdjs.Force();
        
        const benchmarkSuite = makeBenchmarkSuite();
        benchmarkSuite.add('setAngle and setLength', (i) => {
            layer.setAngle(i);
            layer.setLength(200);
        });

        console.log(benchmarkSuite.run());
	});
});
