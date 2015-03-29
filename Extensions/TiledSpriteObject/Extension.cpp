/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2015 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "TiledSpriteObject.h"
#include <iostream>


void DeclareTiledSpriteObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("TiledSpriteObject",
                              GD_T("Tiled Sprite Object"),
                              GD_T("Extension allowing to use tiled sprite objects."),
                              "Victor Levasseur and Florian Rival",
                              "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject("TiledSprite",
               GD_T("Tiled Sprite"),
               GD_T("Displays an image repeated over an area"),
               "CppPlatform/Extensions/TiledSpriteIcon.png",
               &CreateTiledSpriteObject);

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddAction("Width",
                   GD_T("Width"),
                   GD_T("Modify the width of a Tiled Sprite."),
                   GD_T("Do _PARAM1__PARAM2_ to the width of _PARAM0_"),
                   GD_T("Size and angle"),
                   "res/actions/scaleWidth24.png",
                   "res/actions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetWidth").SetManipulatedType("number").SetAssociatedGetter("GetWidth").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddCondition("Width",
                   GD_T("Width"),
                   GD_T("Test the width of a Tiled Sprite."),
                   GD_T("The width of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Size and angle"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddAction("Height",
                   GD_T("Height"),
                   GD_T("Modify the height of a Tiled Sprite."),
                   GD_T("Do _PARAM1__PARAM2_ to the height of _PARAM0_"),
                   GD_T("Size and angle"),
                   "res/actions/scaleHeight24.png",
                   "res/actions/scaleHeight.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .codeExtraInformation.SetFunctionName("SetHeight").SetManipulatedType("number").SetAssociatedGetter("GetHeight").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("Height",
                   GD_T("Height"),
                   GD_T("Test the height of a Tiled Sprite."),
                   GD_T("The height of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Size and angle"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("GetHeight").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddAction("Angle",
                   GD_T("Angle"),
                   GD_T("Modify the angle of a Tiled Sprite."),
                   GD_T("Do _PARAM1__PARAM2_ to the angle of _PARAM0_"),
                   GD_T("Size and angle"),
                   "res/actions/rotate24.png",
                   "res/actions/rotate.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("Angle",
                   GD_T("Angle"),
                   GD_T("Test the angle of a Tiled Sprite."),
                   GD_T("The angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Size and angle"),
                   "res/conditions/rotate24.png",
                   "res/conditions/rotate.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .SetHidden() //Now available for all objects
        .codeExtraInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddAction("XOffset",
                   GD_T("Image X Offset"),
                   GD_T("Modify the offset used on the X axis when displaying the image."),
                   GD_T("Do _PARAM1__PARAM2_ to the X offset of _PARAM0_"),
                   GD_T("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("SetXOffset").SetManipulatedType("number").SetAssociatedGetter("GetXOffset").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("XOffset",
                   GD_T("Image X Offset"),
                   GD_T("Test the offset used on the X axis when displaying the image."),
                   GD_T("The X offset of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("GetXOffset").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddAction("YOffset",
                   GD_T("Image Y Offset"),
                   GD_T("Modify the offset used on the Y axis when displaying the image."),
                   GD_T("Do _PARAM1__PARAM2_ to the Y offset of _PARAM0_"),
                   GD_T("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("SetYOffset").SetManipulatedType("number").SetAssociatedGetter("GetYOffset").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("YOffset",
                   GD_T("Image Y Offset"),
                   GD_T("Test the offset used on the Y axis when displaying the image."),
                   GD_T("The Y offset of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .MarkAsAdvanced()
        .codeExtraInformation.SetFunctionName("GetYOffset").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");
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
        DeclareTiledSpriteObjectExtension(*this);
        AddRuntimeObject(GetObjectMetadata("TiledSpriteObject::TiledSprite"),
            "RuntimeTiledSpriteObject", CreateRuntimeTiledSpriteObject);

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
