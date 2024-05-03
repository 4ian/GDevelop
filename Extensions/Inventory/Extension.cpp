/**

GDevelop - Inventory Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include <iostream>

void DeclareInventoryExtension(gd::PlatformExtension& extension) {
  extension.SetExtensionInformation(
      "Inventory",
      _("Inventories"),
      _("Provides actions and conditions to add an inventory to your game, "
        "with items in memory."),
      "Florian Rival",
      "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/inventory")
      .SetCategory("Game mechanic");
    extension
      .AddInstructionOrExpressionGroupMetadata(_("Inventories"))
      .SetIcon("CppPlatform/Extensions/Inventoryicon.png");

  extension
      .AddAction("Add",
                 _("Add an item"),
                 _("Add an item in an inventory."),
                 _("Add a _PARAM2_ to inventory _PARAM1_"),
                 "",
                 "CppPlatform/Extensions/Inventoryicon.png",
                 "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .SetFunctionName("InventoryTools::Add");

  extension
      .AddAction("Remove",
                 _("Remove an item"),
                 _("Remove an item from an inventory."),
                 _("Remove a _PARAM2_ from inventory _PARAM1_"),
                 "",
                 "CppPlatform/Extensions/Inventoryicon.png",
                 "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .SetFunctionName("InventoryTools::Remove");

  extension
      .AddCondition("Count",
                    _("Item count"),
                    _("Compare the number of an item in an inventory."),
                    _("the count of _PARAM2_ in _PARAM1_"),
                    "",
                    "CppPlatform/Extensions/Inventoryicon.png",
                    "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions())
      .SetFunctionName("InventoryTools::Count");

  extension
      .AddCondition("Has",
                    _("Has an item"),
                    _("Check if at least one of the specified items is in the "
                      "inventory."),
                    _("Inventory _PARAM1_ contains a _PARAM2_"),
                    "",
                    "CppPlatform/Extensions/Inventoryicon.png",
                    "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .SetFunctionName("InventoryTools::Has");

  extension
      .AddAction("SetMaximum",
                 _("Set a maximum count for an item"),
                 _("Set the maximum number of the specified item that can be "
                   "added in the inventory. By default, the number allowed for "
                   "each item is unlimited."),
                 _("Set the maximum count for _PARAM2_ in inventory _PARAM1_ "
                   "to _PARAM3_"),
                 "",
                 "CppPlatform/Extensions/Inventoryicon.png",
                 "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .AddParameter("expression", _("Maximum count"))
      .SetFunctionName("InventoryTools::SetMaximum");

  extension
      .AddAction("SetUnlimited",
                 _("Set unlimited count for an item"),
                 _("Allow an unlimited amount of an object to be in an "
                   "inventory. This is the case by default for each item."),
                 _("Allow an unlimited count of _PARAM2_ in inventory "
                   "_PARAM1_: _PARAM3_"),
                 "",
                 "CppPlatform/Extensions/Inventoryicon.png",
                 "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .AddParameter("yesorno", _("Allow an unlimited amount?"))
      .SetFunctionName("InventoryTools::SetUnlimited");

  extension
      .AddCondition("IsFull",
                    _("Item full"),
                    _("Check if an item has reached its maximum number allowed "
                      "in the inventory."),
                    _("Inventory _PARAM1_ is full of _PARAM2_"),
                    "",
                    "CppPlatform/Extensions/Inventoryicon.png",
                    "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .SetFunctionName("InventoryTools::Has");

  extension
      .AddAction("Equip",
                 _("Equip an item"),
                 _("Mark an item as being equipped. If the item count is 0, it "
                   "won't be marked as equipped."),
                 _("Set _PARAM2_ as equipped in inventory _PARAM1_: _PARAM3_"),
                 "",
                 "CppPlatform/Extensions/Inventoryicon.png",
                 "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .AddParameter("yesorno", _("Equip?"))
      .SetFunctionName("InventoryTools::Equip");

  extension
      .AddCondition("IsEquipped",
                    _("Item equipped"),
                    _("Check if an item is equipped."),
                    _("_PARAM2_ is equipped in inventory _PARAM1_"),
                    "",
                    "CppPlatform/Extensions/Inventoryicon.png",
                    "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .SetFunctionName("InventoryTools::IsEquipped");

  extension
      .AddAction("SerializeToVariable",
                 _("Save an inventory in a scene variable"),
                 _("Save all the items of the inventory in a scene variable, so that "
                   "it can be restored later."),
                 _("Save inventory _PARAM1_ in variable _PARAM2_"),
                 _("Variables"),
                 "CppPlatform/Extensions/Inventoryicon.png",
                 "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("scenevar", _("Scene variable"))
      .SetFunctionName("InventoryTools::SerializeToVariable");

  extension
      .AddAction("UnserializeFromVariable",
                 _("Load an inventory from a scene variable"),
                 _("Load the content of the inventory from a scene variable."),
                 _("Load inventory _PARAM1_ from variable _PARAM2_"),
                 _("Variables"),
                 "CppPlatform/Extensions/Inventoryicon.png",
                 "CppPlatform/Extensions/Inventoryicon.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("scenevar", _("Scene variable"))
      .SetFunctionName("InventoryTools::UnserializeFromVariable");

  extension
      .AddExpression("Count",
                     _("Item count"),
                     _("Get the number of an item in the inventory"),
                     "",
                     "CppPlatform/Extensions/Inventoryicon.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Inventory name"))
      .AddParameter("string", _("Item name"))
      .SetFunctionName("InventoryTools::Count");

  extension
	  .AddExpression("Maximum",
		  _("Item maximum"),
		  _("Get the maximum of an item in the inventory, or 0 if it is unlimited"),
		  "",
		  "CppPlatform/Extensions/Inventoryicon.png")
	  .AddCodeOnlyParameter("currentScene", "")
	  .AddParameter("string", _("Inventory name"))
	  .AddParameter("string", _("Item name"))
	  .SetFunctionName("InventoryTools::Maximum");
}
