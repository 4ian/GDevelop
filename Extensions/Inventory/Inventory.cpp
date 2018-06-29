#include "Inventory.h"
#include "GDCore/String.h"

bool Inventory::Has(const gd::String& itemName) {
  return items.find(itemName) != items.end() && items[itemName].count > 0;
}

size_t Inventory::Count(const gd::String& itemName) {
  if (items.find(itemName) == items.end()) return 0;

  return items[itemName].count;
}

bool Inventory::Add(const gd::String& itemName) {
  if (items.find(itemName) == items.end()) {
    MakeItemEntry(itemName);
  }

  auto& item = items[itemName];
  if (item.unlimited || item.count < item.maxCount) {
    item.count++;

    return true;
  }

  return false;
}

bool Inventory::SetCount(const gd::String& itemName, size_t count) {
  if (items.find(itemName) == items.end()) {
    MakeItemEntry(itemName);
  }

  auto& item = items[itemName];
  size_t newCount = item.unlimited ? count : std::min(count, item.maxCount);
  item.count = newCount;

  return item.unlimited || count <= item.maxCount;
}

bool Inventory::IsFull(const gd::String& itemName) {
  if (items.find(itemName) == items.end()) return false;

  auto& item = items[itemName];
  return !item.unlimited && item.count >= item.maxCount;
}

bool Inventory::Remove(const gd::String& itemName) {
  if (items.find(itemName) == items.end()) return false;

  auto& item = items[itemName];
  if (item.count > 0) {
    item.count--;

    if (item.count == 0) {
      item.equipped = false;
    }
    return true;
  }

  return false;
}

void Inventory::SetMaximum(const gd::String& itemName, size_t maxCount) {
  if (items.find(itemName) == items.end()) {
    MakeItemEntry(itemName);
  }

  items[itemName].maxCount = maxCount;
  items[itemName].unlimited = false;
}

void Inventory::SetUnlimited(const gd::String& itemName, bool enable) {
  if (items.find(itemName) == items.end()) {
    MakeItemEntry(itemName);
  }

  items[itemName].unlimited = enable;
}

void Inventory::MakeItemEntry(const gd::String& itemName) {
  Item item;
  items[itemName] = item;
}

bool Inventory::Equip(const gd::String& itemName, bool equip) {
  if (items.find(itemName) == items.end()) {
    return false;
  }

  auto& item = items[itemName];
  if (!equip) {
    item.equipped = false;
    return true;
  } else if (item.count > 0) {
    item.equipped = true;
    return true;
  }

  return false;
}

bool Inventory::IsEquipped(const gd::String& itemName) {
  if (items.find(itemName) == items.end()) {
    return false;
  }

  return items[itemName].equipped;
}

void Inventory::Clear() { items.clear(); }
