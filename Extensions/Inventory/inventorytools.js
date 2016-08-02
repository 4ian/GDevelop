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
 * @namespace gdjs.evtTools
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
