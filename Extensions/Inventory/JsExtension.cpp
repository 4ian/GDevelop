/**

GDevelop - Inventory Extension
Copyright (c) 2008-2013  Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include <iostream>
#include "GDCore/Tools/Localization.h"

void DeclareInventoryExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class InventoryJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  InventoryJsExtension() {
    DeclareInventoryExtension(*this);

    GetAllActions()["Inventory::Add"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.add");
    GetAllActions()["Inventory::Remove"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.remove");
    GetAllActions()["Inventory::SetMaximum"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.setMaximum");
    GetAllActions()["Inventory::SetUnlimited"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.setUnlimited");
    GetAllActions()["Inventory::Equip"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.equip");

    GetAllActions()["Inventory::SerializeToVariable"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.serializeToVariable");
    GetAllActions()["Inventory::UnserializeFromVariable"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.unserializeFromVariable");

    GetAllConditions()["Inventory::Count"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.count");
    GetAllConditions()["Inventory::Has"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.has");
    GetAllConditions()["Inventory::IsFull"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.isFull");
    GetAllConditions()["Inventory::IsEquipped"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.isEquipped");

    GetAllExpressions()["Inventory::Count"]
        .SetIncludeFile("Extensions/Inventory/inventory.js")
        .AddIncludeFile("Extensions/Inventory/inventorytools.js")
        .SetFunctionName("gdjs.evtTools.inventory.count");
	GetAllExpressions()["Inventory::Maximum"]
		.SetIncludeFile("Extensions/Inventory/inventory.js")
		.AddIncludeFile("Extensions/Inventory/inventorytools.js")
		.SetFunctionName("gdjs.evtTools.inventory.maximum");

    StripUnimplementedInstructionsAndExpressions();
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSInventoryExtension() {
  return new InventoryJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new InventoryJsExtension;
}
#endif
#endif
