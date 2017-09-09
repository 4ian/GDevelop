/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "TiledSpriteObject.h"
#include <iostream>


void DeclareTiledSpriteObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("TiledSpriteObject",
                              _("Tiled Sprite Object"),
                              _("This Extension enables the use of Tiled Sprite Objects."),
                              "Victor Levasseur and Florian Rival",
                              "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject<TiledSpriteObject>(
               "TiledSprite",
               _("Tiled Sprite"),
               _("Displays an image repeated over an area"),
               "CppPlatform/Extensions/TiledSpriteIcon.png");

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddAction("Width",
                   _("Width"),
                   _("Modify the width of a Tiled Sprite."),
                   _("Do _PARAM1__PARAM2_ to the width of _PARAM0_"),
                   _("Size and angle"),
                   "res/actions/scaleWidth24.png",
                   "res/actions/scaleWidth.png")

        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetFunctionName("SetWidth").SetManipulatedType("number").SetGetter("GetWidth").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddCondition("Width",
                   _("Width"),
                   _("Test the width of a Tiled Sprite."),
                   _("The width of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size and angle"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddAction("Height",
                   _("Height"),
                   _("Modify the height of a Tiled Sprite."),
                   _("Do _PARAM1__PARAM2_ to the height of _PARAM0_"),
                   _("Size and angle"),
                   "res/actions/scaleHeight24.png",
                   "res/actions/scaleHeight.png")

        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetFunctionName("SetHeight").SetManipulatedType("number").SetGetter("GetHeight").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("Height",
                   _("Height"),
                   _("Test the height of a Tiled Sprite."),
                   _("The height of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size and angle"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")
        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetFunctionName("GetHeight").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddAction("Angle",
                   _("Angle"),
                   _("Modify the angle of a Tiled Sprite."),
                   _("Do _PARAM1__PARAM2_ to the angle of _PARAM0_"),
                   _("Size and angle"),
                   "res/actions/rotate24.png",
                   "res/actions/rotate.png")

        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("SetAngle").SetManipulatedType("number").SetGetter("GetAngle").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("Angle",
                   _("Angle"),
                   _("Test the angle of a Tiled Sprite."),
                   _("The angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size and angle"),
                   "res/conditions/rotate24.png",
                   "res/conditions/rotate.png")

        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .SetHidden() //Now available for all objects
        .SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddAction("XOffset",
                   _("Image X Offset"),
                   _("Modify the offset used on the X axis when displaying the image."),
                   _("Do _PARAM1__PARAM2_ to the X offset of _PARAM0_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("SetXOffset").SetManipulatedType("number").SetGetter("GetXOffset").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("XOffset",
                   _("Image X Offset"),
                   _("Test the offset used on the X axis when displaying the image."),
                   _("The X offset of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetFunctionName("GetXOffset").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

    obj.AddAction("YOffset",
                   _("Image Y Offset"),
                   _("Modify the offset used on the Y axis when displaying the image."),
                   _("Do _PARAM1__PARAM2_ to the Y offset of _PARAM0_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("SetYOffset").SetManipulatedType("number").SetGetter("GetYOffset").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");


    obj.AddCondition("YOffset",
                   _("Image Y Offset"),
                   _("Test the offset used on the Y axis when displaying the image."),
                   _("The Y offset of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Image offset"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
        .AddParameter("object", _("Object"), "TiledSprite")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetFunctionName("GetYOffset").SetManipulatedType("number").SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");
    #endif
}

/**
 * \brief This class declares information about the extension.
 */
class TiledSpriteObjectCppExtension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    TiledSpriteObjectCppExtension()
    {
        DeclareTiledSpriteObjectExtension(*this);
        AddRuntimeObject<TiledSpriteObject, RuntimeTiledSpriteObject>(
            GetObjectMetadata("TiledSpriteObject::TiledSprite"),
            "RuntimeTiledSpriteObject");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(ANDROID)
extern "C" ExtensionBase * CreateGDCppTiledSpriteObjectExtension() {
    return new TiledSpriteObjectCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new TiledSpriteObjectCppExtension;
}
#endif
