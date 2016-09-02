function Inventory() {
	this._items = {};

	return this;
}

Inventory.prototype.clear = function() {
	this._items = {};
}

Inventory.prototype.has = function(itemName) {
	return this._items.hasOwnProperty(itemName) && this._items[itemName].count > 0;
}

Inventory.prototype.count = function(itemName) {
	if (!this._items.hasOwnProperty(itemName)) return 0;

	return this._items[itemName].count;
}

Inventory.prototype.add = function(itemName) {
	if (!this._items.hasOwnProperty(itemName)) {
		this._makeItemEntry(itemName);
	}

	var item = this._items[itemName];
	if (item.unlimited || item.count < item.maxCount) {
		item.count++;
		return true;
	}

	return false;
}

Inventory.prototype.setCount = function(itemName, count) {
	if (!this._items.hasOwnProperty(itemName)) {
		this._makeItemEntry(itemName);
	}

	var item = this._items[itemName];
	var newCount = item.unlimited ? count : Math.min(count, item.maxCount);
	item.count = newCount;

	return item.unlimited || count <= item.maxCount;
}

Inventory.prototype.isFull = function(itemName) {
	if (!this._items.hasOwnProperty(itemName)) return false;

	var item = this._items[itemName];
	return !item.unlimited && item.count >= item.maxCount;
}

Inventory.prototype.remove = function(itemName) {
	if (!this._items.hasOwnProperty(itemName)) return false;

	var item = this._items[itemName];
	if (item.count > 0) {
		item.count--;

		if (item.count === 0) {
			item.equipped = false;
		}
		return true;
	}

	return false;
}

Inventory.prototype.setMaximum = function(itemName, maxCount) {
	if (!this._items.hasOwnProperty(itemName)) {
		this._makeItemEntry(itemName);
	}

	this._items[itemName].maxCount = maxCount;
	this._items[itemName].unlimited = false;
}

Inventory.prototype.setUnlimited = function(itemName, enable) {
	if (!this._items.hasOwnProperty(itemName)) {
		this._makeItemEntry(itemName);
	}

	this._items[itemName].unlimited = enable;
}

Inventory.prototype._makeItemEntry = function(itemName) {
	this._items[itemName] = {
		count: 0,
		maxCount: 0,
		unlimited: true,
		equipped: false,
	};
}

Inventory.prototype.equip = function(itemName, equip) {
	if (!this._items.hasOwnProperty(itemName)) {
		return false;
	}

	var item = this._items[itemName];
	if (!equip) {
		item.equipped = false;
		return true;
	} else if (item.count > 0) {
		item.equipped = true;
		return true;
	}

	return false;
}

Inventory.prototype.isEquipped = function(itemName) {
	if (!this._items.hasOwnProperty(itemName)) {
		return false;
	}

	return this._items[itemName].equipped;
}

Inventory.prototype.getAllItems = function() {
	return this._items;
}
