
describe('gdjs.LinksManager', function() {
	var runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}, resources: {resources: []}});
	var runtimeScene = new gdjs.RuntimeScene(runtimeGame);
	runtimeScene.loadFromScene({
		layers:[{name:"", visibility: true}],
		variables: [],
		behaviorsSharedData: [],
		objects: [],
		instances: []
	});

	var manager = gdjs.LinksManager.getManager(runtimeScene);

	var object1A = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
	var object1B = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
	var object1C = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});

	var object2A = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
	var object2B = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
	var object2C = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});

	runtimeScene.addObject(object1A);
	runtimeScene.addObject(object1B);
	runtimeScene.addObject(object1C);

	runtimeScene.addObject(object2A);
	runtimeScene.addObject(object2B);
	runtimeScene.addObject(object2C);

	it('can link two objects', function() {
		manager.linkObjects(object1A, object2A);

		var linkedObjects = manager.getObjectsLinkedWith(object1A);
		expect(linkedObjects.length).to.be(1);
		expect(linkedObjects[0]).to.be(object2A);

		linkedObjects = manager.getObjectsLinkedWith(object2A);
		expect(linkedObjects.length).to.be(1);
		expect(linkedObjects[0]).to.be(object1A);
	});
	it('can link more objects', function() {
		manager.linkObjects(object1A, object2A); //Including the same objects as before
		manager.linkObjects(object1A, object2B);
		manager.linkObjects(object1A, object2C);

		var linkedObjects = manager.getObjectsLinkedWith(object1A);
		expect(linkedObjects.length).to.be(3);

		linkedObjects = manager.getObjectsLinkedWith(object2C);
		expect(linkedObjects.length).to.be(1);
		expect(linkedObjects[0]).to.be(object1A);
	});
	it('supports removing links', function() {
		manager.removeLinkBetween(object1A, object2B);
		var linkedObjects = manager.getObjectsLinkedWith(object1A);
		expect(linkedObjects.length).to.be(2);

		manager.linkObjects(object2B, object2C);
		manager.removeAllLinksOf(object1A);
		manager.removeAllLinksOf(object1A);

		linkedObjects = manager.getObjectsLinkedWith(object1A);
		expect(linkedObjects.length).to.be(0);

		linkedObjects = manager.getObjectsLinkedWith(object2A);
		expect(linkedObjects.length).to.be(0);

		linkedObjects = manager.getObjectsLinkedWith(object2C);
		expect(linkedObjects.length).to.be(1);
		expect(linkedObjects[0]).to.be(object2B);
	});
});
