/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2015 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Florian Rival ( Minor changes and adaptations )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "PanelSpriteObject.h"


void DeclarePanelSpriteObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("PanelSpriteObject",
        GD_T("Panel Sprite (9-patch) Object"),
        GD_T("Extension allowing to use panel sprite (\"9-patch\") objects."),
        "Victor Levasseur and Florian Rival",
        "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject("PanelSprite",
        GD_T("Panel Sprite (\"9-patch\")"),
        GD_T("An image with edges and corners that are stretched separately from the fill."),
        "CppPlatform/Extensions/PanelSpriteIcon.png",
        &CreatePanelSpriteObject);

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");

    obj.AddAction("Width",
                   GD_T("Width"),
                   GD_T("Modify the width of a Panel Sprite."),
                   GD_T("Do _PARAM1__PARAM2_ to the width of _PARAM0_"),
                   GD_T("Size and angle"),
                   "res/actions/scaleWidth24.png",
                   "res/actions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"), "PanelSprite", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetWidth").SetManipulatedType("number").SetAssociatedGetter("GetWidth").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");

    obj.AddCondition("Width",
                   GD_T("Width"),
                   GD_T("Test the width of a Panel Sprite."),
                   GD_T("The width of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Size and angle"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"), "PanelSprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .codeExtraInformation.SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


    obj.AddAction("Height",
                   GD_T("Height"),
                   GD_T("Modify the height of a Panel Sprite."),
                   GD_T("Do _PARAM1__PARAM2_ to the height of _PARAM0_"),
                   GD_T("Size and angle"),
                   "res/actions/scaleHeight24.png",
                   "res/actions/scaleHeight.png")
        .AddParameter("object", GD_T("Object"), "PanelSprite", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetHeight").SetManipulatedType("number").SetAssociatedGetter("GetHeight").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


    obj.AddCondition("Height",
                   GD_T("Height"),
                   GD_T("Test the height of a Panel Sprite."),
                   GD_T("The height of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Size and angle"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")
        .AddParameter("object", GD_T("Object"), "PanelSprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .codeExtraInformation.SetFunctionName("SetHeight").SetManipulatedType("number").SetAssociatedGetter("GetHeight").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


    obj.AddAction("Angle",
                   GD_T("Angle"),
                   GD_T("Modify the angle of a Panel Sprite."),
                   GD_T("Do _PARAM1__PARAM2_ to the angle of _PARAM0_"),
                   GD_T("Size and angle"),
                   "res/actions/rotate24.png",
                   "res/actions/rotate.png")
        .SetHidden() //Deprecated
        .AddParameter("object", GD_T("Object"), "PanelSprite", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");

    obj.AddCondition("Angle",
                   GD_T("Angle"),
                   GD_T("Test the angle of a Panel Sprite."),
                   GD_T("The angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Size and angle"),
                   "res/conditions/rotate24.png",
                   "res/conditions/rotate.png")
        .SetHidden() //Deprecated
        .AddParameter("object", GD_T("Object"), "PanelSprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .codeExtraInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


    obj.AddAction("Image",
                   GD_T("Image name"),
                   GD_T("Change the image of a Panel Sprite."),
                   GD_T("Set image _PARAM1_ on _PARAM0_"),
                   GD_T("Image"),
                   "res/imageicon24.png",
                   "res/imageicon.png")
        .AddParameter("object", GD_T("Object"), "PanelSprite", false)
        .AddParameter("string", GD_T("Image name"))
        .AddCodeOnlyParameter("currentScene", "0")
        .codeExtraInformation.SetFunctionName("ChangeAndReloadImage").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");
    #endif
}

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
        DeclarePanelSpriteObjectExtension(*this);
        AddRuntimeObject(GetObjectMetadata("PanelSpriteObject::PanelSprite"),
            "RuntimePanelSpriteObject", CreateRuntimePanelSpriteObject);

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
#endif
