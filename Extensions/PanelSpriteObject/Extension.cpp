/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Florian Rival ( Minor changes and adaptations )
 */

#include "GDCpp/Extensions/ExtensionBase.h"

#include "PanelSpriteObject.h"


void DeclarePanelSpriteObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("PanelSpriteObject",
        _("Panel Sprite (9-patch) Object"),
        _("This Extension enables the use of Panel Sprite (\"9-patch\") Objects."),
        "Victor Levasseur and Florian Rival",
        "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject<PanelSpriteObject>(
        "PanelSprite",
        _("Panel Sprite (\"9-patch\")"),
        _("An image with edges and corners that are stretched separately from the full image."),
        "CppPlatform/Extensions/PanelSpriteIcon.png");

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");

    obj.AddAction("Width",
                   _("Width"),
                   _("Modify the width of a Panel Sprite."),
                   _("Do _PARAM1__PARAM2_ to the width of _PARAM0_"),
                   _("Size and angle"),
                   "res/actions/scaleWidth24.png",
                   "res/actions/scaleWidth.png")

        .AddParameter("object", _("Object"), "PanelSprite")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetFunctionName("SetWidth").SetManipulatedType("number").SetGetter("GetWidth").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");

    obj.AddCondition("Width",
                   _("Width"),
                   _("Check the width of a Panel Sprite."),
                   _("The width of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size and angle"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")

        .AddParameter("object", _("Object"), "PanelSprite")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


    obj.AddAction("Height",
                   _("Height"),
                   _("Modify the height of a Panel Sprite."),
                   _("Do _PARAM1__PARAM2_ to the height of _PARAM0_"),
                   _("Size and angle"),
                   "res/actions/scaleHeight24.png",
                   "res/actions/scaleHeight.png")

        .AddParameter("object", _("Object"), "PanelSprite")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetFunctionName("SetHeight").SetManipulatedType("number").SetGetter("GetHeight").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


    obj.AddCondition("Height",
                   _("Height"),
                   _("Check the height of a Panel Sprite."),
                   _("The height of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size and angle"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")

        .AddParameter("object", _("Object"), "PanelSprite")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .SetFunctionName("SetHeight").SetManipulatedType("number").SetGetter("GetHeight").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


    obj.AddAction("Angle",
                   _("Angle"),
                   _("Modify the angle of a Panel Sprite."),
                   _("Do _PARAM1__PARAM2_ to the angle of _PARAM0_"),
                   _("Size and angle"),
                   "res/actions/rotate24.png",
                   "res/actions/rotate.png")

        .SetHidden() //Deprecated
        .AddParameter("object", _("Object"), "PanelSprite")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetFunctionName("SetAngle").SetManipulatedType("number").SetGetter("GetAngle").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


    obj.AddCondition("Angle",
                   _("Angle"),
                   _("Check the angle of a Panel Sprite."),
                   _("The angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Size and angle"),
                   "res/conditions/rotate24.png",
                   "res/conditions/rotate.png")

        .SetHidden() //Deprecated
        .AddParameter("object", _("Object"), "PanelSprite")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .SetFunctionName("SetAngle").SetManipulatedType("number").SetGetter("GetAngle").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");


    obj.AddAction("Image",
                   _("Image name"),
                   _("Change the image of a Panel Sprite."),
                   _("Set image _PARAM1_ on _PARAM0_"),
                   _("Image"),
                   "res/imageicon24.png",
                   "res/imageicon.png")
        .AddParameter("object", _("Object"), "PanelSprite")
        .AddParameter("string", _("Image name"))
        .AddCodeOnlyParameter("currentScene", "0")
        .SetFunctionName("ChangeAndReloadImage").SetIncludeFile("PanelSpriteObject/PanelSpriteObject.h");
    #endif
}

/**
 * \brief This class declares information about the extension.
 */
class PanelSpriteObjectCppExtension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    PanelSpriteObjectCppExtension()
    {
        DeclarePanelSpriteObjectExtension(*this);
        AddRuntimeObject<PanelSpriteObject, RuntimePanelSpriteObject>(
            GetObjectMetadata("PanelSpriteObject::PanelSprite"),
            "RuntimePanelSpriteObject");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(ANDROID)
extern "C" ExtensionBase * CreateGDCppPanelSpriteObjectExtension() {
    return new PanelSpriteObjectCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new PanelSpriteObjectCppExtension;
}
#endif
