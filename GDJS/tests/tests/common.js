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
