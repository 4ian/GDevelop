#pragma once
#include <map>
#include "GDCore/String.h"

class GD_EXTENSION_API Inventory {
public:
	Inventory() {};
	virtual ~Inventory() {};

	bool Has(const gd::String & itemName);
	size_t Count(const gd::String & itemName);
	bool Add(const gd::String & itemName);
	bool IsFull(const gd::String & itemName);
	bool Remove(const gd::String & itemName);
	void SetMaximum(const gd::String & itemName, size_t maxCount);
	void SetUnlimited(const gd::String & itemName, bool enable = true);
	bool Equip(const gd::String & itemName, bool equip = true);
	bool IsEquipped(const gd::String & itemName);

private:
	void MakeItemEntry(const gd::String & itemName);
	
	class Item {
	public:
		bool unlimited = true;
		size_t count = 0;
		size_t maxCount = 0;
		bool equipped = false;
	};

	std::map<gd::String, Item> items;
};
