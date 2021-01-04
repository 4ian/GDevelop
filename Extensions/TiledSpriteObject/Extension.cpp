/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include <iostream>
#include "TiledSpriteObject.h"

void DeclareTiledSpriteObjectExtension(gd::PlatformExtension& extension) {
  extension.SetExtensionInformation(
      "TiledSpriteObject",
      _("Tiled Sprite Object"),
      _("This Extension enables the use of Tiled Sprite Objects."),
      "Victor Levasseur and Florian Rival",
      "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/tiled_sprite");

  gd::ObjectMetadata& obj = extension.AddObject<TiledSpriteObject>(
      "TiledSprite",
      _("Tiled Sprite"),
      _("Displays an image repeated over an area"),
      "CppPlatform/Extensions/TiledSpriteIcon.png");

#if defined(GD_IDE_ONLY)
  obj.SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddCondition("Opacity",
                   _("Opacity"),
                   _("Compare the opacity of a Tiled Sprite, between 0 (fully "
                     "transparent) to 255 (opaque)."),
                   _("the opacity"),
                   _("Visibility"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetOpacity",
                _("Change Tiled Sprite opacity"),
                _("Change the opacity of a Tiled Sprite. 0 is fully transparent, 255 "
                  "is opaque (default)."),
                _("the opacity"),
                _("Visibility"),
                "res/actions/opacity24.png",
                "res/actions/opacity.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("Opacity",
                    _("Opacity"),
                    _("Opacity"),
                    _("Visibility"),
                    "res/actions/opacity.png")
      .AddParameter("object", _("Object"), "TiledSprite");

  obj.AddAction(
         "SetColor",
         _("Tint color"),
         _("Change the tint of a Tiled Sprite. The default color is white."),
         _("Change tint of _PARAM0_ to _PARAM1_"),
         _("Effects"),
         "res/actions/color24.png",
         "res/actions/color.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .AddParameter("color", _("Tint"));

  obj.AddAction("Width",
                _("Width"),
                _("Modify the width of a Tiled Sprite."),
                _("the width"),
                _("Size and angle"),
                "res/actions/scaleWidth24.png",
                "res/actions/scaleWidth.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetWidth")
      .SetGetter("GetWidth")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddCondition("Width",
                   _("Width"),
                   _("Test the width of a Tiled Sprite."),
                   _("the width"),
                   _("Size and angle"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetWidth")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddAction("Height",
                _("Height"),
                _("Modify the height of a Tiled Sprite."),
                _("the height"),
                _("Size and angle"),
                "res/actions/scaleHeight24.png",
                "res/actions/scaleHeight.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetHeight")
      .SetGetter("GetHeight")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddCondition("Height",
                   _("Height"),
                   _("Test the height of a Tiled Sprite."),
                   _("the height"),
                   _("Size and angle"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetHeight")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddAction("Angle",
                _("Angle"),
                _("Modify the angle of a Tiled Sprite."),
                _("the angle"),
                _("Size and angle"),
                "res/actions/rotate24.png",
                "res/actions/rotate.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("SetAngle")
      .SetGetter("GetAngle")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddCondition("Angle",
                   _("Angle"),
                   _("Test the angle of a Tiled Sprite."),
                   _("the angle"),
                   _("Size and angle"),
                   "res/conditions/rotate24.png",
                   "res/conditions/rotate.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number")
      .SetHidden()  // Now available for all objects
      .SetFunctionName("GetAngle")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddAction(
         "XOffset",
         _("Image X Offset"),
         _("Modify the offset used on the X axis when displaying the image."),
         _("the X offset"),
         _("Image offset"),
         "res/conditions/scaleWidth24.png",
         "res/conditions/scaleWidth.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("SetXOffset")
      .SetGetter("GetXOffset")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddCondition(
         "XOffset",
         _("Image X Offset"),
         _("Test the offset used on the X axis when displaying the image."),
         _("the X offset"),
         _("Image offset"),
         "res/conditions/scaleWidth24.png",
         "res/conditions/scaleWidth.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetXOffset")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddAction(
         "YOffset",
         _("Image Y Offset"),
         _("Modify the offset used on the Y axis when displaying the image."),
         _("the Y offset"),
         _("Image offset"),
         "res/conditions/scaleWidth24.png",
         "res/conditions/scaleWidth.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("SetYOffset")
      .SetGetter("GetYOffset")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");

  obj.AddCondition(
         "YOffset",
         _("Image Y Offset"),
         _("Test the offset used on the Y axis when displaying the image."),
         _("the Y offset"),
         _("Image offset"),
         "res/conditions/scaleWidth24.png",
         "res/conditions/scaleWidth.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetYOffset")
      .SetIncludeFile("TiledSpriteObject/TiledSpriteObject.h");
#endif
}

/**
 * \brief This class declares information about the extension.
 */
class TiledSpriteObjectCppExtension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  TiledSpriteObjectCppExtension() {
    DeclareTiledSpriteObjectExtension(*this);
    AddRuntimeObject<TiledSpriteObject, RuntimeTiledSpriteObject>(
        GetObjectMetadata("TiledSpriteObject::TiledSprite"),
        "RuntimeTiledSpriteObject");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(ANDROID)
extern "C" ExtensionBase* CreateGDCppTiledSpriteObjectExtension() {
  return new TiledSpriteObjectCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new TiledSpriteObjectCppExtension;
}
#endif
