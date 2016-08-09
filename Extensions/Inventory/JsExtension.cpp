/**

GDevelop - Inventory Extension
Copyright (c) 2008-2013  Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Version.h"

#include <iostream>
#include "GDCore/Tools/Localization.h"

/**
 * \brief This class declares information about the JS extension.
 */
class JsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    JsExtension()
    {
        SetExtensionInformation("Inventory",
	        _("Inventory"),
	        _("Provides action and condition to store an inventory with items in memory."),
	        "Florian Rival",
	        "Open source (MIT License)");

        CloneExtension("GDevelop C++ platform", "Inventory");

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
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new JsExtension;
}
#endif
