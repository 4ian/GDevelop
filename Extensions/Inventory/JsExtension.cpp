/**

GDevelop - Inventory Extension
Copyright (c) 2008-2013  Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"


#include <iostream>
#include "GDCore/Tools/Localization.h"

void DeclareInventoryExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class InventoryJsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    InventoryJsExtension()
    {
        DeclareInventoryExtension(*this);

		GetAllActions()["Inventory::Add"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.add");
		GetAllActions()["Inventory::Remove"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.remove");
		GetAllActions()["Inventory::SetMaximum"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.setMaximum");
		GetAllActions()["Inventory::SetUnlimited"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.setUnlimited");
		GetAllActions()["Inventory::Equip"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.equip");

		GetAllActions()["Inventory::SerializeToVariable"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.serializeToVariable");
		GetAllActions()["Inventory::UnserializeFromVariable"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.unserializeFromVariable");

		GetAllConditions()["Inventory::Count"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.count");
		GetAllConditions()["Inventory::Has"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.has");
		GetAllConditions()["Inventory::IsFull"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.isFull");
		GetAllConditions()["Inventory::IsEquipped"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.isEquipped");

		GetAllExpressions()["Inventory::Count"].codeExtraInformation
			.SetIncludeFile("Inventory/inventory.js")
			.AddIncludeFile("Inventory/inventorytools.js")
			.SetFunctionName("gdjs.evtTools.inventory.count");

        StripUnimplementedInstructionsAndExpressions();
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSInventoryExtension() {
    return new InventoryJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new InventoryJsExtension;
}
#endif
#endif
