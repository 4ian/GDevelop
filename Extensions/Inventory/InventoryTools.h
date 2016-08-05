#pragma once
#include "GDCpp/Runtime/RuntimeScene.h"
#include "Inventory.h"

class GD_EXTENSION_API InventoryTools {
public:
	static bool Add(RuntimeScene & scene, const gd::String & inventoryName,
		const gd::String & itemName) {
		return Get(scene, inventoryName).Add(itemName);
	}

	static size_t Count(RuntimeScene & scene, const gd::String & inventoryName,
		const gd::String & itemName) {
		return Get(scene, inventoryName).Count(itemName);
	}

	static bool Remove(RuntimeScene & scene, const gd::String & inventoryName,
		const gd::String & itemName) {
		return Get(scene, inventoryName).Remove(itemName);
	}

	static bool Has(RuntimeScene & scene, const gd::String & inventoryName,
		const gd::String & itemName) {
		return Get(scene, inventoryName).Has(itemName);
	}

	static void SetMaximum(RuntimeScene & scene, const gd::String & inventoryName,
		const gd::String & itemName, size_t maxCount) {
		return Get(scene, inventoryName).SetMaximum(itemName, maxCount);
	}

	static void SetUnlimited(RuntimeScene & scene, const gd::String & inventoryName,
		const gd::String & itemName, bool enable) {
		return Get(scene, inventoryName).SetUnlimited(itemName, enable);
	}

	static bool Equip(RuntimeScene & scene, const gd::String & inventoryName,
		const gd::String & itemName, bool equip) {
		return Get(scene, inventoryName).Equip(itemName, equip);
	}

	static bool IsEquipped(RuntimeScene & scene, const gd::String & inventoryName,
		const gd::String & itemName) {
		return Get(scene, inventoryName).IsEquipped(itemName);
	}

	static bool ClearAll(RuntimeScene & scene) {
		std::map<gd::String, Inventory> clearedInventories;
		inventories[scene.game] = clearedInventories;
	}

private:
	static Inventory & Get(RuntimeScene & scene, const gd::String & name) {
		return inventories[scene.game][name];
	}

	static std::map<RuntimeGame *, std::map<gd::String, Inventory>> inventories;

	InventoryTools() {};
};
