/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)

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
 * Florian Rival ( Minor changes, added offsets, HTML5 port )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "TiledSpriteObject.h"
#include <boost/version.hpp>

void DeclareTiledSpriteObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("TiledSpriteObject",
                              _("Tiled Sprite Object"),
                              _("Extension allowing to use tiled sprite objects."),
                              "Victor Levasseur and Florian Rival",
                              "zlib/libpng License (Open Source)");

    gd::ObjectMetadata & obj = extension.AddObject("TiledSprite",
               _("Tiled Sprite"),
               _("Displays an image repeated over an area"),
               "CppPlatform/Extensions/TiledSpriteIcon.png",
               &CreateTiledSpriteObject,
               &DestroyTiledSpriteObject);

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddAction("Width",
                   _("Width"),
                   _("Modify the width of a Tiled Sprite."),
                   _("Do _PARAM1__PARAM2_ to the width of _PARAM0_"),
                   _("Size and angle"),
                   "res/actions/scaleWidth24.png",
                   "res/actions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetWidth").SetManipulatedType("number").SetAssociatedGetter("GetWidth").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddCondition("Width",
                   _("Width"),
                   _("Test the width of a Tiled Sprite."),
                   _("The width of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size and angle"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddAction("Height",
                   _("Height"),
                   _("Modify the height of a Tiled Sprite."),
                   _("Do _PARAM1__PARAM2_ to the height of _PARAM0_"),
                   _("Size and angle"),
                   "res/actions/scaleHeight24.png",
                   "res/actions/scaleHeight.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetHeight").SetManipulatedType("number").SetAssociatedGetter("GetHeight").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("Height",
                   _("Height"),
                   _("Test the height of a Tiled Sprite."),
                   _("The height of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size and angle"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetFunctionName("GetHeight").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddAction("Angle",
                   _("Angle"),
                   _("Modify the angle of a Tiled Sprite."),
                   _("Do _PARAM1__PARAM2_ to the angle of _PARAM0_"),
                   _("Size and angle"),
                   "res/actions/rotate24.png",
                   "res/actions/rotate.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("Angle",
                   _("Angle"),
                   _("Test the angle of a Tiled Sprite."),
                   _("The angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size and angle"),
                   "res/conditions/rotate24.png",
                   "res/conditions/rotate.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddAction("XOffset",
                   _("Image X Offset"),
                   _("Modify the offset used on the X axis when displaying the image."),
                   _("Do _PARAM1__PARAM2_ to the X offset of _PARAM0_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetXOffset").SetManipulatedType("number").SetAssociatedGetter("GetXOffset").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("XOffset",
                   _("Image X Offset"),
                   _("Test the offset used on the X axis when displaying the image."),
                   _("The X offset of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetFunctionName("GetXOffset").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddAction("YOffset",
                   _("Image Y Offset"),
                   _("Modify the offset used on the Y axis when displaying the image."),
                   _("Do _PARAM1__PARAM2_ to the Y offset of _PARAM0_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetYOffset").SetManipulatedType("number").SetAssociatedGetter("GetYOffset").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("YOffset",
                   _("Image Y Offset"),
                   _("Test the offset used on the Y axis when displaying the image."),
                   _("The Y offset of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
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
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        DeclareTiledSpriteObjectExtension(*this);
        AddRuntimeObject(GetObjectMetadata("TiledSpriteObject::RuntimeTiledSpriteObject"),
            "RuntimeTiledSpriteObject", CreateRuntimeTiledSpriteObject, DestroyRuntimeTiledSpriteObject);

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

#if !defined(EMSCRIPTEN)
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
#endif