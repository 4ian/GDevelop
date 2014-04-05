var gd = require('../../Binaries/Output/WebIDE/Release/libGD.js');
var expect = require('expect.js');

describe('libGD.js - GDCpp related tests', function(){
	//gd.initializePlatforms();

	describe('gd.SpriteObject', function(){

		var obj = new gd.SpriteObject("MySpriteObject");

		it('can add animations', function(){
			obj.addAnimation(new gd.Animation());
		});

	});
});

