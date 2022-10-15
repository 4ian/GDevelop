/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */
describe('gdjs', function() {
	it('should define gdjs', function() {
		expect(gdjs).to.be.ok();
	});

	it('should allow to register scene callbacks (and unregister them)', () => {
		const fakeCb = () => {};
		const fakeCb2 = () => {};
		gdjs.registerFirstRuntimeSceneLoadedCallback(fakeCb);
		gdjs.registerRuntimeScenePreEventsCallback(fakeCb2);

		expect(gdjs.callbacksFirstRuntimeSceneLoaded).to.contain(fakeCb);
		expect(gdjs.callbacksRuntimeScenePreEvents).to.contain(fakeCb2);

		gdjs._unregisterCallback(fakeCb);
		expect(gdjs.callbacksFirstRuntimeSceneLoaded).not.to.contain(fakeCb);

		gdjs._unregisterCallback(fakeCb2);
		expect(gdjs.callbacksRuntimeScenePreEvents).not.to.contain(fakeCb2);
	});
});

describe('gdjs.evtTools.object.twoListsTest', function() {
	it('should properly pick objects', function(){
		var map1 = new Hashtable();
		var map2 = new Hashtable();

		var runtimeScene = new gdjs.RuntimeScene(null);
		var obj1A = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj1B = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj1C = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj2A = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [], effects: []});
		var obj2B = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [], effects: []});
		var obj2C = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [], effects: []});

		var list1 = [obj1A, obj1B, obj1C];
		var list2 = [obj2A, obj2B, obj2C];
		map1.put("obj1", list1);
		map2.put("obj2", list2);

		expect(gdjs.evtTools.object.twoListsTest(function() {return true;}, map1, map2, false)).to.be.ok();
		expect(gdjs.evtTools.object.twoListsTest(function() {return false;}, map1, map2, true)).to.be.ok();
		expect(gdjs.evtTools.object.twoListsTest(function(obj1, obj2, value) {return value;}, map1, map2, false, true)).to.be.ok();
		expect(list1).to.have.length(3);
		expect(list2).to.have.length(3);

		expect(gdjs.evtTools.object.twoListsTest(function(obj1, obj2) {return obj1 === obj1B && obj2 === obj2C;}, map1, map2, true)).to.be.ok();
		expect(list1).to.have.length(2); //obj1B should have been filtered out.
		expect(list2).to.have.length(3); //but not obj2C

		expect(gdjs.evtTools.object.twoListsTest(function(obj1, obj2) {return obj1 === obj1A && obj2 === obj2C;}, map1, map2, false)).to.be.ok();
		expect(list1).to.have.length(1); //All objects but obj1A and obj2C
		expect(list2).to.have.length(1); //should have been filtered out
		expect(list1[0]).to.be(obj1A);
		expect(list2[0]).to.be(obj2C);
	});
});

describe('gdjs.evtTools.object.pickObjectsIf', function() {
	it('should properly pick objects', function(){
		var map1 = new Hashtable();

		var runtimeScene = new gdjs.RuntimeScene(null);
		var obj1A = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj1B = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj1C = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});

		var list1 = [obj1A, obj1B, obj1C];
		map1.put("obj1", list1);

		expect(gdjs.evtTools.object.pickObjectsIf(function() {return true;}, map1, false)).to.be.ok();
		expect(gdjs.evtTools.object.pickObjectsIf(function() {return false;}, map1, true)).to.be.ok();
		expect(gdjs.evtTools.object.pickObjectsIf(function(obj, value) {return value;}, map1, false, true)).to.be.ok();
		expect(list1).to.have.length(3);

		expect(gdjs.evtTools.object.pickObjectsIf(function(obj) {return obj == obj1A || obj == obj1C;}, map1, false)).to.be.ok();
		expect(list1).to.have.length(2);

		expect(gdjs.evtTools.object.pickObjectsIf(function(obj) {return obj == obj1C;}, map1, true)).to.be.ok();
		expect(list1).to.have.length(1);
		expect(list1[0]).to.be(obj1A);
	});
});

describe('gdjs.evtTools.object.pickRandomObject', function() {
	it('should pick only one object', function(){
		var runtimeScene = new gdjs.RuntimeScene(null);
		var obj1A = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj1B = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj1C = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj2A = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [], effects: []});
		var obj2B = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [], effects: []});

		var map1 = new Hashtable();
		var list1 = [obj1A, obj1B, obj1C];
		map1.put("obj1", list1);

		expect(gdjs.evtTools.object.pickRandomObject(runtimeScene, map1)).to.be.ok();
		expect(list1).to.have.length(1);
		expect(gdjs.evtTools.object.pickRandomObject(runtimeScene, map1)).to.be.ok();
		expect(list1).to.have.length(1);

		list1.length = 0;
		expect(gdjs.evtTools.object.pickRandomObject(runtimeScene, map1)).to.not.be.ok();

		var map2 = new Hashtable();
		map2.put("obj1", [obj1A, obj1B, obj1C]);
		map2.put("obj2", [obj2A, obj2B]);
		expect(gdjs.evtTools.object.pickRandomObject(runtimeScene, map2)).to.be.ok();
		expect(map2.get("obj1").length + map2.get("obj2").length).to.be(1);
	});
});


describe('gdjs.evtTools.object.pickOnly', function() {
	it('picks only the object passed as parameter', function(){
		var runtimeScene = new gdjs.RuntimeScene(null);
		var obj1A = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj1B = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj1C = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
		var obj2A = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [], effects: []});
		var obj2B = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [], effects: []});

		var map1 = new Hashtable();
		map1.put("obj1", [obj1A, obj1B, obj1C]);

		gdjs.evtTools.object.pickOnly(map1, obj1B);
		expect(map1.get("obj1")).to.have.length(1);
		expect(map1.get("obj1")[0]).to.be(obj1B);

		var map2 = new Hashtable();
		map2.put("obj1", [obj1A, obj1B, obj1C]);
		map2.put("obj2", [obj2A, obj2B]);

		gdjs.evtTools.object.pickOnly(map2, obj2A);
		expect(map2.get("obj1")).to.have.length(0);
		expect(map2.get("obj2")).to.have.length(1);
		expect(map2.get("obj2")[0]).to.be(obj2A);

		var map3 = new Hashtable();
		map3.put("obj1", [obj1A, obj1B, obj1C]);
		map3.put("obj2", [obj2A, obj2B]);

		gdjs.evtTools.object.pickOnly(map3, null);
		expect(map3.get("obj1")).to.have.length(0);
		expect(map3.get("obj2")).to.have.length(0);
	});
});

describe('gdjs.evtTools.object.pickNearestObject', function() {
	var map1 = new Hashtable();

	var runtimeScene = new gdjs.RuntimeScene(null);
	var obj1A = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
	var obj1B = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
	var obj1C = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [], effects: []});
	obj1A.setPosition(50, 50);
	obj1B.setPosition(160, 160);
	obj1C.setPosition(100, 300);

	it('should pick nearest object', function(){
		var list1 = [obj1A, obj1B, obj1C];
		map1.put("obj1", list1);

		expect(gdjs.evtTools.object.pickNearestObject(map1, 100, 90, false)).to.be(true);
		expect(list1).to.have.length(1);
		expect(list1[0]).to.be(obj1A);
	});

	it('should pick furthest object when inverted', function(){
		var list1 = [obj1A, obj1B, obj1C];
		map1.put("obj1", list1);

		expect(gdjs.evtTools.object.pickNearestObject(map1, 100, 90, true)).to.be(true);
		expect(list1).to.have.length(1);
		expect(list1[0]).to.be(obj1C);
	});
});
