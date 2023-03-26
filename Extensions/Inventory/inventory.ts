namespace gdjs {
  export class Inventory {
    _items: any = {};

    constructor() {
      return this;
    }

    clear() {
      this._items = {};
    }

    has(itemName): boolean {
      return (
        this._items.hasOwnProperty(itemName) && this._items[itemName].count > 0
      );
    }

    count(itemName) {
      if (!this._items.hasOwnProperty(itemName)) {
        return 0;
      }
      return this._items[itemName].count;
    }

    maximum(itemName) {
      if (!this._items.hasOwnProperty(itemName)) {
        return 0;
      }
      return this._items[itemName].maxCount;
    }

    add(itemName) {
      if (!this._items.hasOwnProperty(itemName)) {
        this._makeItemEntry(itemName);
      }
      const item = this._items[itemName];
      if (item.unlimited || item.count < item.maxCount) {
        item.count++;
        return true;
      }
      return false;
    }

    setCount(itemName, count): void {
      if (!this._items.hasOwnProperty(itemName)) {
        this._makeItemEntry(itemName);
      }
      const item = this._items[itemName];
      const newCount = item.unlimited ? count : Math.min(count, item.maxCount);
      item.count = newCount;
      return item.unlimited || count <= item.maxCount;
    }

    isFull(itemName): boolean {
      if (!this._items.hasOwnProperty(itemName)) {
        return false;
      }
      const item = this._items[itemName];
      return !item.unlimited && item.count >= item.maxCount;
    }

    remove(itemName) {
      if (!this._items.hasOwnProperty(itemName)) {
        return false;
      }
      const item = this._items[itemName];
      if (item.count > 0) {
        item.count--;
        if (item.count === 0) {
          item.equipped = false;
        }
        return true;
      }
      return false;
    }

    setMaximum(itemName, maxCount): void {
      if (!this._items.hasOwnProperty(itemName)) {
        this._makeItemEntry(itemName);
      }
      this._items[itemName].maxCount = maxCount;
      this._items[itemName].unlimited = false;
    }

    setUnlimited(itemName, enable): void {
      if (!this._items.hasOwnProperty(itemName)) {
        this._makeItemEntry(itemName);
      }
      this._items[itemName].maxCount = 0;
      this._items[itemName].unlimited = enable;
    }

    _makeItemEntry(itemName) {
      this._items[itemName] = {
        count: 0,
        maxCount: 0,
        unlimited: true,
        equipped: false,
      };
    }

    equip(itemName, equip) {
      if (!this._items.hasOwnProperty(itemName)) {
        return false;
      }
      const item = this._items[itemName];
      if (!equip) {
        item.equipped = false;
        return true;
      } else {
        if (item.count > 0) {
          item.equipped = true;
          return true;
        }
      }
      return false;
    }

    isEquipped(itemName): boolean {
      if (!this._items.hasOwnProperty(itemName)) {
        return false;
      }
      return this._items[itemName].equipped;
    }

    getAllItems() {
      return this._items;
    }
  }
}
