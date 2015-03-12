describe('gdjs', function() {
	it('should define gdjs', function() {
		expect(gdjs).to.be.ok();
	});
});

describe('gdjs.evtTools.object.TwoListsTest', function() {
	it('should properly pick objects', function(){
		var map1 = new Hashtable();
		var map2 = new Hashtable();

		var runtimeScene = new gdjs.RuntimeScene(null, null);
		var obj1A = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", automatisms: []});
		var obj1B = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", automatisms: []});
		var obj1C = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", automatisms: []});
		var obj2A = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", automatisms: []});
		var obj2B = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", automatisms: []});
		var obj2C = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", automatisms: []});

		var list1 = [obj1A, obj1B, obj1C];
		var list2 = [obj2A, obj2B, obj2C];
		map1.put("obj1", list1);
		map2.put("obj2", list2);

		expect(gdjs.evtTools.object.TwoListsTest(function() {return true;}, map1, map2, false)).to.be.ok();
		expect(gdjs.evtTools.object.TwoListsTest(function() {return false;}, map1, map2, true)).to.be.ok();
		expect(list1).to.have.length(3);
		expect(list2).to.have.length(3);

		expect(gdjs.evtTools.object.TwoListsTest(function(obj1, obj2) {return obj1 === obj1B && obj2 === obj2C;}, map1, map2, true)).to.be.ok();
		expect(list1).to.have.length(2); //obj1B should have been filtered out.
		expect(list2).to.have.length(3); //but not obj2C

		expect(gdjs.evtTools.object.TwoListsTest(function(obj1, obj2) {return obj1 === obj1A && obj2 === obj2C;}, map1, map2, false)).to.be.ok();
		expect(list1).to.have.length(1); //All objects but obj1A and obj2C
		expect(list2).to.have.length(1); //should have been filtered out
		expect(list1[0]).to.be(obj1A);
		expect(list2[0]).to.be(obj2C);
	});
});

describe('gdjs.evtTools.object.PickObjectsIf', function() {
	it('should properly pick objects', function(){
		var map1 = new Hashtable();

		var runtimeScene = new gdjs.RuntimeScene(null, null);
		var obj1A = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", automatisms: []});
		var obj1B = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", automatisms: []});
		var obj1C = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", automatisms: []});

		var list1 = [obj1A, obj1B, obj1C];
		map1.put("obj1", list1);

		expect(gdjs.evtTools.object.PickObjectsIf(function() {return true;}, map1, false)).to.be.ok();
		expect(gdjs.evtTools.object.PickObjectsIf(function() {return false;}, map1, true)).to.be.ok();
		expect(list1).to.have.length(3);

		expect(gdjs.evtTools.object.PickObjectsIf(function(obj) {return obj == obj1A || obj == obj1C;}, map1, false)).to.be.ok();
		expect(list1).to.have.length(2);

		expect(gdjs.evtTools.object.PickObjectsIf(function(obj) {return obj == obj1C;}, map1, true)).to.be.ok();
		expect(list1).to.have.length(1);
		expect(list1[0]).to.be(obj1A);
	});
});

describe('gdjs.InputManager', function() {
	var inputManager = new gdjs.InputManager();

	it('should handle keyboards events', function(){
		expect(inputManager.anyKeyPressed()).to.be(false);

		inputManager.onKeyPressed(32);
		expect(inputManager.getLastPressedKey()).to.be(32);
		inputManager.onKeyPressed(33);
		expect(inputManager.getLastPressedKey()).to.be(33);
		expect(inputManager.isKeyPressed(32)).to.be(true);
		expect(inputManager.isKeyPressed(30)).to.be(false);
		inputManager.onKeyReleased(32);
		expect(inputManager.isKeyPressed(32)).to.be(false);

		expect(inputManager.anyKeyPressed()).to.be(true);
	});

	it('should handle mouse events', function(){
		inputManager.onMouseMove(500, 600);
		expect(inputManager.getMouseX()).to.be(500);
		expect(inputManager.getMouseY()).to.be(600);

		expect(inputManager.isMouseButtonPressed(0)).to.be(false);
		inputManager.onMouseButtonPressed(0);
		expect(inputManager.isMouseButtonPressed(0)).to.be(true);
	});

	it('should handle touch events', function(){
		inputManager.onTouchStart(46, 510, 610);
		inputManager.onTouchStart(10, 510, 610);
		expect(inputManager.getStartedTouchIdentifiers()).to.have.length(2);
		expect(inputManager.getTouchX(46)).to.be(510);
		expect(inputManager.getTouchY(46)).to.be(610);

		expect(inputManager.popStartedTouch()).to.be(46);
		expect(inputManager.popStartedTouch()).to.be(10);
		expect(inputManager.popEndedTouch()).to.be(undefined);

		inputManager.onFrameEnded();
		inputManager.onTouchEnd(10);
		expect(inputManager.getStartedTouchIdentifiers()).to.have.length(0);
		expect(inputManager.popStartedTouch()).to.be(undefined);
		expect(inputManager.popEndedTouch()).to.be(10);
	});
	it('should simulate (or not) mouse events', function(){
		inputManager.touchSimulateMouse();
		expect(inputManager.isMouseButtonPressed(0)).to.be(false);
		inputManager.onTouchStart(46, 510, 610);
		expect(inputManager.isMouseButtonPressed(0)).to.be(true);
		expect(inputManager.getMouseX()).to.be(510);
		expect(inputManager.getMouseY()).to.be(610);
		inputManager.onTouchMove(46, 520, 620);
		expect(inputManager.getMouseX()).to.be(520);
		expect(inputManager.getMouseY()).to.be(620);
		inputManager.onTouchEnd(46);
		expect(inputManager.isMouseButtonPressed(0)).to.be(false);

		inputManager.touchSimulateMouse(false);
		inputManager.onTouchStart(46, 510, 610);
		expect(inputManager.isMouseButtonPressed(0)).to.be(false);
		expect(inputManager.getMouseX()).to.be(520);
		expect(inputManager.getMouseY()).to.be(620);
	});
});


describe('gdjs.RuntimeObject.cursorOnObject', function() {
	var runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}});
	var runtimeScene = new gdjs.RuntimeScene(runtimeGame, null);
	runtimeScene.loadFromScene({
		layers:[{name:"", visibility: true}],
		variables: [],
		automatismsSharedData: [],
		objects: [],
		instances: []
	});

	var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", automatisms: []});
	object.setPosition(450, 500);

	it('should handle mouse', function() {
		runtimeGame.getInputManager().onMouseMove(100, 100);
		expect(object.cursorOnObject(runtimeScene)).to.be(false);
		runtimeGame.getInputManager().onMouseMove(450, 500);
		expect(object.cursorOnObject(runtimeScene)).to.be(true);
	});

	it('should handle touch', function() {
		runtimeGame.getInputManager().onMouseMove(0, 0);
		runtimeGame.getInputManager().touchSimulateMouse(false);

		runtimeGame.getInputManager().onTouchStart(0, 100, 100);
		expect(object.cursorOnObject(runtimeScene)).to.be(false);
		runtimeGame.getInputManager().onTouchStart(1, 450, 500);
		expect(object.cursorOnObject(runtimeScene)).to.be(true);
		runtimeGame.getInputManager().onTouchEnd(1);
		expect(object.cursorOnObject(runtimeScene)).to.be(false);
	});
});
