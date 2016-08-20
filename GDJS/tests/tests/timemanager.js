describe('gdjs.TimeManager', function() {
	var timeManager = new gdjs.TimeManager(0);

	it('should handle timers', function(){
		timeManager.addTimer("timer1");
		timeManager.update(16, 1);
		expect(timeManager.hasTimer('timer1')).to.be(true);
		expect(timeManager.hasTimer('timer2')).to.be(false);
		expect(timeManager.getTimer('timer1').getTime()).to.be(16);

		timeManager.addTimer("timer2");
		timeManager.update(15, 1);
		expect(timeManager.hasTimer('timer1')).to.be(true);
		expect(timeManager.hasTimer('timer2')).to.be(true);
		expect(timeManager.getTimer('timer1').getTime()).to.be(31);
		expect(timeManager.getTimer('timer2').getTime()).to.be(15);
	});
});
