/**

GDevelop - Inventory Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"
#include "InventoryTools.h"
#include "GDCore/Tools/Version.h"

#include <iostream>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("Inventory",
                              _("Inventory"),
                              _("Provides action and condition to store an inventory with items in memory."),
                              "Florian Rival",
                              "Open source (MIT License)");

        #if defined(GD_IDE_ONLY)
        AddAction("Add",
                       _("Add an item"),
                       _("Add an item in an inventory."),
                       _("Add a _PARAM2_ to inventory _PARAM1_"),
                       _("Inventories"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .SetFunctionName("InventoryTools::Add").SetIncludeFile("Inventory/InventoryTools.h");

        AddAction("Remove",
                       _("Remove an item"),
                       _("Remove an item from an inventory."),
                       _("Remove a _PARAM2_ from inventory _PARAM1_"),
                       _("Inventories"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .SetFunctionName("InventoryTools::Remove").SetIncludeFile("Inventory/InventoryTools.h");

        AddCondition("Count",
                       _("Item count"),
                       _("Compare the number of an item in an inventory."),
                       _("Count of _PARAM2_ in _PARAM1_ is _PARAM3__PARAM4_"),
                       _("Inventories"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Count"))
            .SetFunctionName("InventoryTools::Count").SetIncludeFile("Inventory/InventoryTools.h")
            .SetManipulatedType("number");

        AddCondition("Has",
                       _("Has an item"),
                       _("Check that there is at least one of the specified item in the inventory."),
                       _("Inventory _PARAM1_ contains a _PARAM2_"),
                       _("Inventories"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .SetFunctionName("InventoryTools::Has").SetIncludeFile("Inventory/InventoryTools.h");

        AddAction("SetMaximum",
                       _("Set a maximum count for an item"),
                       _("Set the maximum number that can be added in the inventory for the specified item. By default, there is an unlimited number allowed for each item."),
                       _("Set the maximum count for _PARAM2_ in inventory _PARAM1_ to _PARAM3_"),
                       _("Inventories"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .AddParameter("expression", _("Maximum count"))
            .SetFunctionName("InventoryTools::SetMaximum").SetIncludeFile("Inventory/InventoryTools.h");

        AddAction("SetUnlimited",
                       _("Set unlimited count for an item"),
                       _("Allow an unlimited amount of an object to be in an inventory. This is the case by default for each item."),
                       _("Allow an unlimited count of _PARAM2_ in inventory _PARAM1_: _PARAM3_"),
                       _("Inventories"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .AddParameter("yesorno", _("Allow an unlimited amount?"))
            .SetFunctionName("InventoryTools::SetUnlimited").SetIncludeFile("Inventory/InventoryTools.h");

        AddCondition("IsFull",
                       _("Item full"),
                       _("Check if an item has reached the maximum number allowed in the inventory."),
                       _("Inventory _PARAM1_ is full of _PARAM2_"),
                       _("Inventories"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .SetFunctionName("InventoryTools::Has").SetIncludeFile("Inventory/InventoryTools.h");

        AddAction("Equip",
                       _("Equip an item"),
                       _("Mark an item as being equiped. If the item count is 0 it won't be marked as equiped."),
                       _("Set _PARAM2_ as equiped in inventory _PARAM1_: _PARAM3_"),
                       _("Inventories"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .AddParameter("yesorno", _("Equip?"))
            .SetFunctionName("InventoryTools::Equip").SetIncludeFile("Inventory/InventoryTools.h");

        AddCondition("IsEquipped",
                       _("Item equiped"),
                       _("Check if an item is equiped."),
                       _("_PARAM2_ is equipped in inventory _PARAM1_"),
                       _("Inventories"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .SetFunctionName("InventoryTools::IsEquipped").SetIncludeFile("Inventory/InventoryTools.h");

        AddAction("SerializeToVariable",
                       _("Save an inventory in a variable"),
                       _("Save all the items of the inventory in a variable, so that it can be restored later."),
                       _("Save inventory _PARAM1_ in variable _PARAM2_"),
                       _("Inventories/Variables"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("scenevar", _("Scene variable"))
            .SetFunctionName("InventoryTools::SerializeToVariable").SetIncludeFile("Inventory/InventoryTools.h");

        AddAction("UnserializeFromVariable",
                       _("Load an inventory from a variable"),
                       _("Load the content of the inventory from a variable."),
                       _("Load inventory _PARAM1_ from variable _PARAM2_"),
                       _("Inventories/Variables"),
                       "CppPlatform/Extensions/Inventoryicon24.png",
                       "CppPlatform/Extensions/Inventoryicon16.png")

            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Inventory name"))
            .AddParameter("scenevar", _("Scene variable"))
            .SetFunctionName("InventoryTools::UnserializeFromVariable").SetIncludeFile("Inventory/InventoryTools.h");

        AddExpression("Count", _("Item count"), _("Get the number of an item in the inventory"), _("Inventory"), "CppPlatform/Extensions/Inventoryicon16.png")
            .AddCodeOnlyParameter("currentScene", _(""))
            .AddParameter("string", _("Inventory name"))
            .AddParameter("string", _("Item name"))
            .SetFunctionName("InventoryTools::Count").SetIncludeFile("Inventory/InventoryTools.h");

        #endif

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };

    virtual void SceneLoaded(RuntimeScene & scene) override
    {
        #if defined(GD_IDE_ONLY)
        InventoryTools::ClearAll(scene);
        #endif
    }
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
