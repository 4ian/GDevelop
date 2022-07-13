/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <iostream>

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "TiledSpriteObject.h"

void DeclareTiledSpriteObjectExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "TiledSpriteObject",
          _("Tiled Sprite Object"),
          "Displays an image in a repeating pattern over an area. Useful for "
          "making backgrounds, including background that are scrolling when "
          "the camera moves. This is more performant than using multiple "
          "Sprite objects.",
          "Victor Levasseur and Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/tiled_sprite");

  gd::ObjectMetadata& obj =
      extension
          .AddObject<TiledSpriteObject>(
              "TiledSprite",
              _("Tiled Sprite"),
              _("Displays an image repeated over an area."),
              "CppPlatform/Extensions/TiledSpriteIcon.png")
          .SetCategoryFullName(_("General"));

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

  obj.AddAction(
         "SetOpacity",
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
                _("Size"),
                "res/actions/scaleWidth24.png",
                "res/actions/scaleWidth.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetWidth")
      .SetGetter("GetWidth");

  obj.AddCondition("Width",
                   _("Width"),
                   _("Test the width of a Tiled Sprite."),
                   _("the width"),
                   _("Size"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetWidth");

  obj.AddAction("Height",
                _("Height"),
                _("Modify the height of a Tiled Sprite."),
                _("the height"),
                _("Size"),
                "res/actions/scaleHeight24.png",
                "res/actions/scaleHeight.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetHeight")
      .SetGetter("GetHeight");

  obj.AddCondition("Height",
                   _("Height"),
                   _("Test the height of a Tiled Sprite."),
                   _("the height"),
                   _("Size"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetHeight");

  obj.AddAction("SetSize",
                _("Size"),
                _("Modify the size of a Tiled Sprite."),
                _("Change the size of _PARAM0_: set to _PARAM1_x_PARAM2_"),
                _("Size"),
                "res/actions/scale24.png",
                "res/actions/scale.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .AddParameter("expression", _("Width"))
      .AddParameter("expression", _("Height"))
      .SetFunctionName("SetSize");

  // Deprecated: now available for all objects.
  obj.AddAction("Angle",
                _("Angle"),
                _("Modify the angle of a Tiled Sprite."),
                _("the angle"),
                _("Size"),
                "res/actions/rotate24.png",
                "res/actions/rotate.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number")
      .SetHidden();

  // Deprecated: now available for all objects.
  obj.AddCondition("Angle",
                   "Angle",
                   "Test the angle of a Tiled Sprite.",
                   "the angle",
                   _("Size"),
                   "res/conditions/rotate24.png",
                   "res/conditions/rotate.png")

      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number")
      .SetHidden();

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
      .SetGetter("GetXOffset");

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
      .SetFunctionName("GetXOffset");

  obj.AddAction(
         "YOffset",
         _("Image Y Offset"),
         _("Modify the offset used on the Y axis when displaying the image."),
         _("the Y offset"),
         _("Image offset"),
         "res/conditions/scaleHeight24.png",
         "res/conditions/scaleHeight.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("SetYOffset")
      .SetGetter("GetYOffset");

  obj.AddCondition(
         "YOffset",
         _("Image Y Offset"),
         _("Test the offset used on the Y axis when displaying the image."),
         _("the Y offset"),
         _("Image offset"),
         "res/conditions/scaleHeight24.png",
         "res/conditions/scaleHeight.png")
      .AddParameter("object", _("Object"), "TiledSprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetYOffset");
}
