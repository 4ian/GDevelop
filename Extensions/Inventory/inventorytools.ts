namespace gdjs {
  export class InventoryManager {
    static get(runtimeScene, name) {
      const game = runtimeScene.getGame();
      if (!game.inventories) {
        game.inventories = {};
      }
      let inventory = game.inventories[name];
      if (!inventory) {
        inventory = game.inventories[name] = new gdjs.Inventory();
      }
      return inventory;
    }
  }

  export namespace evtTools {
    export namespace inventory {
      export const add = function (runtimeScene, inventoryName, name) {
        return InventoryManager.get(runtimeScene, inventoryName).add(name);
      };
      export const remove = function (runtimeScene, inventoryName, name) {
        return InventoryManager.get(runtimeScene, inventoryName).remove(name);
      };
      export const count = function (runtimeScene, inventoryName, name) {
        return InventoryManager.get(runtimeScene, inventoryName).count(name);
      };
      export const has = function (runtimeScene, inventoryName, name) {
        return InventoryManager.get(runtimeScene, inventoryName).has(name);
      };
      export const setMaximum = function (
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
      export const setUnlimited = function (
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
      export const isFull = function (runtimeScene, inventoryName, name) {
        return InventoryManager.get(runtimeScene, inventoryName).isFull(name);
      };
      export const equip = function (runtimeScene, inventoryName, name, equip) {
        return InventoryManager.get(runtimeScene, inventoryName).equip(
          name,
          equip
        );
      };
      export const isEquipped = function (runtimeScene, inventoryName, name) {
        return InventoryManager.get(runtimeScene, inventoryName).isEquipped(
          name
        );
      };
      export const serializeToVariable = function (
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
      export const unserializeFromVariable = function (
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
          inventory.setCount(
            name,
            serializedItem.getChild('count').getAsNumber()
          );
          inventory.equip(
            name,
            serializedItem.getChild('equipped').getAsString() == 'true'
          );
        }
      };
    }
  }
}
