namespace gdjs {
  export interface RuntimeGame {
    inventories: { [name: string]: gdjs.Inventory };
  }
  export class InventoryManager {
    static get(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      name: string
    ): gdjs.Inventory {
      const game = instanceContainer.getGame();
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
      export const add = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string
      ) {
        return InventoryManager.get(instanceContainer, inventoryName).add(name);
      };

      export const remove = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string
      ) {
        return InventoryManager.get(instanceContainer, inventoryName).remove(
          name
        );
      };

      export const count = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string
      ) {
        return InventoryManager.get(instanceContainer, inventoryName).count(
          name
        );
      };

      export const maximum = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string
      ) {
        return InventoryManager.get(instanceContainer, inventoryName).maximum(
          name
        );
      };

      export const has = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string
      ) {
        return InventoryManager.get(instanceContainer, inventoryName).has(name);
      };

      export const setMaximum = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string,
        maxCount: number
      ) {
        return InventoryManager.get(
          instanceContainer,
          inventoryName
        ).setMaximum(name, maxCount);
      };

      export const setUnlimited = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string,
        enable: boolean
      ) {
        return InventoryManager.get(
          instanceContainer,
          inventoryName
        ).setUnlimited(name, enable);
      };

      export const isFull = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string
      ) {
        return InventoryManager.get(instanceContainer, inventoryName).isFull(
          name
        );
      };

      export const equip = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string,
        equip: boolean
      ) {
        return InventoryManager.get(instanceContainer, inventoryName).equip(
          name,
          equip
        );
      };

      export const isEquipped = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        name: string
      ) {
        return InventoryManager.get(
          instanceContainer,
          inventoryName
        ).isEquipped(name);
      };

      export const serializeToVariable = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        variable: gdjs.Variable
      ) {
        const allItems = gdjs.InventoryManager.get(
          instanceContainer,
          inventoryName
        ).getAllItems();
        for (const name in allItems) {
          const item = allItems[name];
          const serializedItem = variable.getChild(name);
          serializedItem.getChild('count').setNumber(item.count);
          serializedItem.getChild('maxCount').setNumber(item.maxCount);
          serializedItem.getChild('unlimited').setBoolean(item.unlimited);
          serializedItem.getChild('equipped').setBoolean(item.equipped);
        }
      };

      export const unserializeFromVariable = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        inventoryName: string,
        variable: gdjs.Variable
      ) {
        const inventory = gdjs.InventoryManager.get(
          instanceContainer,
          inventoryName
        );
        inventory.clear();

        const children = variable.getAllChildren();
        for (const name in children) {
          const serializedItem = children[name];
          inventory.setCount(
            name,
            serializedItem.getChild('count').getAsNumber()
          );
          inventory.setMaximum(
            name,
            serializedItem.getChild('maxCount').getAsNumber()
          );
          inventory.setUnlimited(
            name,
            serializedItem.getChild('unlimited').getAsBoolean()
          );
          inventory.equip(
            name,
            serializedItem.getChild('equipped').getAsBoolean()
          );
        }
      };
    }
  }
}
