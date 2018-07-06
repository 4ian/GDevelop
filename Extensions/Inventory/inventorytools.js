gdjs.InventoryManager = function() {
};

gdjs.InventoryManager.get = function(runtimeScene, name) {
	var game = runtimeScene.getGame();
	if (!game.inventories) {
		game.inventories = {};
	}

	var inventory = game.inventories[name];
	if (!inventory) {
		inventory = game.inventories[name] = new Inventory();
	}

	return inventory;
}

/**
 * @memberof gdjs.evtTools
 * @class inventory
 * @static
 * @private
 */
gdjs.evtTools.inventory = {};

gdjs.evtTools.inventory.add = function(runtimeScene, inventoryName, name) {
	return gdjs.InventoryManager.get(runtimeScene, inventoryName).add(name);
};

gdjs.evtTools.inventory.remove = function(runtimeScene, inventoryName, name) {
	return gdjs.InventoryManager.get(runtimeScene, inventoryName).remove(name);
};

gdjs.evtTools.inventory.count = function(runtimeScene, inventoryName, name) {
	return gdjs.InventoryManager.get(runtimeScene, inventoryName).count(name);
};

gdjs.evtTools.inventory.has = function(runtimeScene, inventoryName, name) {
	return gdjs.InventoryManager.get(runtimeScene, inventoryName).has(name);
};

gdjs.evtTools.inventory.setMaximum = function(runtimeScene, inventoryName, name, maxCount) {
	return gdjs.InventoryManager.get(runtimeScene, inventoryName).setMaximum(name, maxCount);
};

gdjs.evtTools.inventory.setUnlimited = function(runtimeScene, inventoryName, name, enable) {
	return gdjs.InventoryManager.get(runtimeScene, inventoryName).setUnlimited(name, enable);
};

gdjs.evtTools.inventory.isFull = function(runtimeScene, inventoryName, name) {
	return gdjs.InventoryManager.get(runtimeScene, inventoryName).isFull(name);
};

gdjs.evtTools.inventory.equip = function(runtimeScene, inventoryName, name, equip) {
	return gdjs.InventoryManager.get(runtimeScene, inventoryName).equip(name, equip);
};

gdjs.evtTools.inventory.isEquipped = function(runtimeScene, inventoryName, name) {
	return gdjs.InventoryManager.get(runtimeScene, inventoryName).isEquipped(name);
};

gdjs.evtTools.inventory.serializeToVariable = function(runtimeScene, inventoryName, variable) {
	var allItems = gdjs.InventoryManager.get(runtimeScene, inventoryName).getAllItems();
	for(var name in allItems) {
		var item = allItems[name];
		var serializedItem = variable.getChild(name);
		serializedItem.getChild("count").setNumber(item.count);
		serializedItem.getChild("maxCount").setNumber(item.maxCount);
		serializedItem.getChild("unlimited").setNumber(item.unlimited ? "true" : "false");
		serializedItem.getChild("equipped").setNumber(item.equipped ? "true" : "false");
	}
};

gdjs.evtTools.inventory.unserializeFromVariable = function(runtimeScene, inventoryName, variable) {
	var inventory = gdjs.InventoryManager.get(runtimeScene, inventoryName);
	inventory.clear();

	var children = variable.getAllChildren();
	for(var name in children) {
		var serializedItem = children[name];
		inventory.setMaximum(name, serializedItem.getChild('maxCount').getAsNumber());
		inventory.setUnlimited(name, serializedItem.getChild('unlimited').getAsString() == "true");
		inventory.setCount(name, serializedItem.getChild('count').getAsNumber());
		inventory.equip(name, serializedItem.getChild('equipped').getAsString() == "true");
	}
};
