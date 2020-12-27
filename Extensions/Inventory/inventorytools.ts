namespace gdjs {
  class InventoryManager {
    static get(runtimeScene, name) {
      const game = runtimeScene.getGame();
      if (!game.inventories) {
        game.inventories = {};
      }
      let inventory = game.inventories[name];
      if (!inventory) {
        inventory = game.inventories[name] = new Inventory();
      }
      return inventory;
    }
  }

  /**
   * @memberof gdjs.evtTools
   * @class inventory
   * @static
   */
  gdjs.evtTools.inventory = {};
  gdjs.evtTools.inventory.add = function (runtimeScene, inventoryName, name) {
    return InventoryManager.get(runtimeScene, inventoryName).add(name);
  };
  gdjs.evtTools.inventory.remove = function (
    runtimeScene,
    inventoryName,
    name
  ) {
    return InventoryManager.get(runtimeScene, inventoryName).remove(name);
  };
  gdjs.evtTools.inventory.count = function (runtimeScene, inventoryName, name) {
    return InventoryManager.get(runtimeScene, inventoryName).count(name);
  };
  gdjs.evtTools.inventory.has = function (runtimeScene, inventoryName, name) {
    return InventoryManager.get(runtimeScene, inventoryName).has(name);
  };
  gdjs.evtTools.inventory.setMaximum = function (
    runtimeScene,
    inventoryName,
    name,
    maxCount
  ) {
    return InventoryManager.get(runtimeScene, inventoryName).setMaximum(
      name,
      maxCount
    );
  };
  gdjs.evtTools.inventory.setUnlimited = function (
    runtimeScene,
    inventoryName,
    name,
    enable
  ) {
    return InventoryManager.get(runtimeScene, inventoryName).setUnlimited(
      name,
      enable
    );
  };
  gdjs.evtTools.inventory.isFull = function (
    runtimeScene,
    inventoryName,
    name
  ) {
    return InventoryManager.get(runtimeScene, inventoryName).isFull(name);
  };
  gdjs.evtTools.inventory.equip = function (
    runtimeScene,
    inventoryName,
    name,
    equip
  ) {
    return InventoryManager.get(runtimeScene, inventoryName).equip(name, equip);
  };
  gdjs.evtTools.inventory.isEquipped = function (
    runtimeScene,
    inventoryName,
    name
  ) {
    return InventoryManager.get(runtimeScene, inventoryName).isEquipped(name);
  };
  gdjs.evtTools.inventory.serializeToVariable = function (
    runtimeScene,
    inventoryName,
    variable
  ) {
    const allItems = InventoryManager.get(
      runtimeScene,
      inventoryName
    ).getAllItems();
    for (const name in allItems) {
      const item = allItems[name];
      const serializedItem = variable.getChild(name);
      serializedItem.getChild('count').setNumber(item.count);
      serializedItem.getChild('maxCount').setNumber(item.maxCount);
      serializedItem
        .getChild('unlimited')
        .setNumber(item.unlimited ? 'true' : 'false');
      serializedItem
        .getChild('equipped')
        .setNumber(item.equipped ? 'true' : 'false');
    }
  };
  gdjs.evtTools.inventory.unserializeFromVariable = function (
    runtimeScene,
    inventoryName,
    variable
  ) {
    const inventory = InventoryManager.get(runtimeScene, inventoryName);
    inventory.clear();
    const children = variable.getAllChildren();
    for (const name in children) {
      const serializedItem = children[name];
      inventory.setMaximum(
        name,
        serializedItem.getChild('maxCount').getAsNumber()
      );
      inventory.setUnlimited(
        name,
        serializedItem.getChild('unlimited').getAsString() == 'true'
      );
      inventory.setCount(name, serializedItem.getChild('count').getAsNumber());
      inventory.equip(
        name,
        serializedItem.getChild('equipped').getAsString() == 'true'
      );
    }
  };
}
