describe('Inventory', function() {
	var runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}, resources: {resources: []}});
	var runtimeScene = new gdjs.RuntimeScene(runtimeGame);

	gdjs.evtTools.inventory.add(runtimeScene, "MyInventory", "sword");
	gdjs.evtTools.inventory.add(runtimeScene, "MyInventory", "sword");
	gdjs.evtTools.inventory.equip(runtimeScene, "MyInventory", "sword", true);
	gdjs.evtTools.inventory.add(runtimeScene, "MyInventory", "armor");
	gdjs.evtTools.inventory.setMaximum(runtimeScene, "MyInventory", "armor", 1);

	var variable = new gdjs.Variable();
	gdjs.evtTools.inventory.serializeToVariable(runtimeScene, "MyInventory", variable);
	gdjs.evtTools.inventory.unserializeFromVariable(runtimeScene, "MyInventory2", variable);

	expect(gdjs.evtTools.inventory.count(runtimeScene, "MyInventory2", "sword")).to.be(2);
	expect(gdjs.evtTools.inventory.isEquipped(runtimeScene, "MyInventory2", "sword")).to.be(true);
	expect(gdjs.evtTools.inventory.count(runtimeScene, "MyInventory2", "armor")).to.be(1);
	expect(gdjs.evtTools.inventory.add(runtimeScene, "MyInventory2", "armor")).to.be(false);
});
