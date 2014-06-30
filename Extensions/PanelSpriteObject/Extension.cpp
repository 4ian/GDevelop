/**

Game Develop - Panel Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
/**
 * Contributors to the extension:
 * Florian Rival ( Minor changes and adaptations )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "PanelSpriteObject.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("PanelSpriteObject",
                              _("Panel Sprite Object"),
                              _("Extension allowing to use panel sprite objects."),
                              "Victor Levasseur",
                              "zlib/libpng License (Open Source)");

        {
            gd::ObjectMetadata & obj = AddObject("PanelSprite",
                       _("Panel Sprite"),
                       _("Object displaying a panel sprite."),
                       "CppPlatform/Extensions/PanelSpriteIcon.png",
                       &CreatePanelSpriteObject,
                       &DestroyPanelSpriteObject);

            AddRuntimeObject(obj, "RuntimePanelSpriteObject", CreateRuntimePanelSpriteObject, DestroyRuntimePanelSpriteObject);
            #if defined(GD_IDE_ONLY)

            obj.SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");

            obj.AddAction("Width",
                           _("Width"),
                           _("Modify the width of a Panel Sprite."),
                           _("Do _PARAM1__PARAM2_ to the width of _PARAM0_"),
                           _("Size and angle"),
                           "res/actions/scaleWidth24.png",
                           "res/actions/scaleWidth.png")
                .AddParameter("object", _("Object"), "PanelSprite", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetWidth").SetManipulatedType("number").SetAssociatedGetter("GetWidth").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");

            obj.AddCondition("Width",
                           _("Width"),
                           _("Test the width of a Panel Sprite."),
                           _("The width of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Size and angle"),
                           "res/conditions/scaleWidth24.png",
                           "res/conditions/scaleWidth.png")
                .AddParameter("object", _("Object"), "PanelSprite", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


            obj.AddAction("Height",
                           _("Height"),
                           _("Modify the height of a Panel Sprite."),
                           _("Do _PARAM1__PARAM2_ to the height of _PARAM0_"),
                           _("Size and angle"),
                           "res/actions/scaleHeight24.png",
                           "res/actions/scaleHeight.png")
                .AddParameter("object", _("Object"), "PanelSprite", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetHeight").SetManipulatedType("number").SetAssociatedGetter("GetHeight").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


            obj.AddCondition("Height",
                           _("Height"),
                           _("Test the height of a Panel Sprite."),
                           _("The height of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Size and angle"),
                           "res/conditions/scaleHeight24.png",
                           "res/conditions/scaleHeight.png")
                .AddParameter("object", _("Object"), "PanelSprite", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("SetHeight").SetManipulatedType("number").SetAssociatedGetter("GetHeight").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


            obj.AddAction("Angle",
                           _("Angle"),
                           _("Modify the angle of a Panel Sprite."),
                           _("Do _PARAM1__PARAM2_ to the angle of _PARAM0_"),
                           _("Size and angle"),
                           "res/actions/rotate24.png",
                           "res/actions/rotate.png")
                .AddParameter("object", _("Object"), "PanelSprite", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


            obj.AddCondition("Angle",
                           _("Angle"),
                           _("Test the angle of a Panel Sprite."),
                           _("The angle of _PARAM0_ is _PARAM1__PARAM2_"),
                           _("Size and angle"),
                           "res/conditions/rotate24.png",
                           "res/conditions/rotate.png")
                .AddParameter("object", _("Object"), "PanelSprite", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value to test"))
                .codeExtraInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


            obj.AddAction("Image",
                           _("Image name"),
                           _("Change the image of a Panel Sprite."),
                           _("Set image _PARAM1_ on _PARAM0_"),
                           _("Image"),
                           "res/imageicon24.png",
                           "res/imageicon.png")
                .AddParameter("object", _("Object"), "PanelSprite", false)
                .AddParameter("string", _("Image name"))
                .AddCodeOnlyParameter("currentScene", "0")
                .codeExtraInformation.SetFunctionName("ChangeAndReloadImage").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");
            #endif

        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

