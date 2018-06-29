#pragma once
#include "GDCpp/Runtime/RuntimeScene.h"
#include "Inventory.h"

class GD_EXTENSION_API InventoryTools {
 public:
  static bool Add(RuntimeScene &scene,
                  const gd::String &inventoryName,
                  const gd::String &itemName) {
    return Get(scene, inventoryName).Add(itemName);
  }

  static size_t Count(RuntimeScene &scene,
                      const gd::String &inventoryName,
                      const gd::String &itemName) {
    return Get(scene, inventoryName).Count(itemName);
  }

  static bool Remove(RuntimeScene &scene,
                     const gd::String &inventoryName,
                     const gd::String &itemName) {
    return Get(scene, inventoryName).Remove(itemName);
  }

  static bool Has(RuntimeScene &scene,
                  const gd::String &inventoryName,
                  const gd::String &itemName) {
    return Get(scene, inventoryName).Has(itemName);
  }

  static void SetMaximum(RuntimeScene &scene,
                         const gd::String &inventoryName,
                         const gd::String &itemName,
                         size_t maxCount) {
    return Get(scene, inventoryName).SetMaximum(itemName, maxCount);
  }

  static void SetUnlimited(RuntimeScene &scene,
                           const gd::String &inventoryName,
                           const gd::String &itemName,
                           bool enable) {
    return Get(scene, inventoryName).SetUnlimited(itemName, enable);
  }

  static bool Equip(RuntimeScene &scene,
                    const gd::String &inventoryName,
                    const gd::String &itemName,
                    bool equip) {
    return Get(scene, inventoryName).Equip(itemName, equip);
  }

  static bool IsEquipped(RuntimeScene &scene,
                         const gd::String &inventoryName,
                         const gd::String &itemName) {
    return Get(scene, inventoryName).IsEquipped(itemName);
  }

  static void SerializeToVariable(RuntimeScene &scene,
                                  const gd::String &inventoryName,
                                  gd::Variable &variable) {
    auto &allItems = Get(scene, inventoryName).GetAllItems();
    for (auto &it : allItems) {
      Inventory::Item item = it.second;
      gd::Variable &serializedItem = variable.GetChild(it.first);
      serializedItem.GetChild("count").SetValue(item.count);
      serializedItem.GetChild("maxCount").SetValue(item.maxCount);
      serializedItem.GetChild("unlimited")
          .SetString(item.unlimited ? "true" : "false");
      serializedItem.GetChild("equipped")
          .SetString(item.equipped ? "true" : "false");
    }
  }

  static void UnserializeFromVariable(RuntimeScene &scene,
                                      const gd::String &inventoryName,
                                      const gd::Variable &variable) {
    Inventory &inventory = Get(scene, inventoryName);
    inventory.Clear();

    for (auto &child : variable.GetAllChildren()) {
      const gd::String &name = child.first;
      const auto &serializedItem = child.second;
      inventory.SetMaximum(name,
                           serializedItem->GetChild("maxCount").GetValue());
      inventory.SetUnlimited(
          name, serializedItem->GetChild("unlimited").GetString() == "true");
      inventory.SetCount(name, serializedItem->GetChild("count").GetValue());
      inventory.Equip(
          name, serializedItem->GetChild("equipped").GetString() == "true");
    }
  }

  static void ClearAll(RuntimeScene &scene) {
    std::map<gd::String, Inventory> clearedInventories;
    inventories[scene.game] = clearedInventories;
  }

 private:
  static Inventory &Get(RuntimeScene &scene, const gd::String &name) {
    return inventories[scene.game][name];
  }

  static std::map<RuntimeGame *, std::map<gd::String, Inventory>> inventories;

  InventoryTools(){};
};
