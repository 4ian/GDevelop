/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Florian Rival ( Minor changes and adaptations )
 */

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "PanelSpriteObject.h"

void DeclarePanelSpriteObjectExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "PanelSpriteObject",
          _("Panel Sprite (9-patch) Object"),
          "Panel Sprite, also called 9-patch, is an object showing an image "
          "that can be resized by stretching or repeating the edges and "
          "corners as well as the filling.",
          "Victor Levasseur and Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/panel_sprite");

  gd::ObjectMetadata& obj =
      extension
          .AddObject<PanelSpriteObject>(
              "PanelSprite",
              _("Panel Sprite (\"9-patch\")"),
              _("An image with edges and corners that are stretched separately "
                "from "
                "the full image."),
              "CppPlatform/Extensions/PanelSpriteIcon.png")
          .SetCategoryFullName(_("General"));

  obj.AddCondition("Opacity",
                   _("Opacity"),
                   _("Compare the opacity of a Panel Sprite, between 0 (fully "
                     "transparent) to 255 (opaque)."),
                   _("the opacity"),
                   _("Visibility"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

      .AddParameter("object", _("Object"), "PanelSprite")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "SetOpacity",
         _("Change Panel Sprite opacity"),
         _("Change the opacity of a Panel Sprite. 0 is fully transparent, 255 "
           "is opaque (default)."),
         _("the opacity"),
         _("Visibility"),
         "res/actions/opacity24.png",
         "res/actions/opacity.png")

      .AddParameter("object", _("Object"), "PanelSprite")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("Opacity",
                    _("Opacity"),
                    _("Opacity"),
                    _("Visibility"),
                    "res/actions/opacity.png")
      .AddParameter("object", _("Panel Sprite"), "PanelSprite");

  obj.AddAction(
         "SetColor",
         _("Tint color"),
         _("Change the tint of a Panel Sprite. The default color is white."),
         _("Change tint of _PARAM0_ to _PARAM1_"),
         _("Effects"),
         "res/actions/color24.png",
         "res/actions/color.png")

      .AddParameter("object", _("Object"), "PanelSprite")
      .AddParameter("color", _("Tint"));

  obj.AddAction("Width",
                _("Width"),
                _("Modify the width of a Panel Sprite."),
                _("the width"),
                _("Size and angle"),
                "res/actions/scaleWidth24_black.png",
                "res/actions/scaleWidth.png")

      .AddParameter("object", _("Object"), "PanelSprite")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetWidth")
      .SetGetter("GetWidth");

  obj.AddCondition("Width",
                   _("Width"),
                   _("Check the width of a Panel Sprite."),
                   _("the width"),
                   _("Size and angle"),
                   "res/conditions/scaleWidth24_black.png",
                   "res/conditions/scaleWidth.png")

      .AddParameter("object", _("Object"), "PanelSprite")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetWidth");

  obj.AddAction("Height",
                _("Height"),
                _("Modify the height of a Panel Sprite."),
                _("the height"),
                _("Size and angle"),
                "res/actions/scaleHeight24_black.png",
                "res/actions/scaleHeight.png")

      .AddParameter("object", _("Object"), "PanelSprite")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetHeight")
      .SetGetter("GetHeight");

  obj.AddCondition("Height",
                   _("Height"),
                   _("Check the height of a Panel Sprite."),
                   _("the height"),
                   _("Size and angle"),
                   "res/conditions/scaleHeight24_black.png",
                   "res/conditions/scaleHeight.png")

      .AddParameter("object", _("Object"), "PanelSprite")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("SetHeight")
      .SetGetter("GetHeight");

  obj.AddAction("Angle",
                "Angle",
                "Modify the angle of a Panel Sprite.",
                "the angle",
                _("Size and angle"),
                "res/actions/rotate24_black.png",
                "res/actions/rotate.png")

      .SetHidden()  // Deprecated
      .AddParameter("object", _("Object"), "PanelSprite")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetAngle")
      .SetGetter("GetAngle");

  obj.AddCondition("Angle",
                   "Angle",
                   "Check the angle of a Panel Sprite.",
                   "the angle",
                   _("Size and angle"),
                   "res/conditions/rotate24_black.png",
                   "res/conditions/rotate.png")

      .SetHidden()  // Deprecated
      .AddParameter("object", _("Object"), "PanelSprite")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("SetAngle")
      .SetGetter("GetAngle");

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
      .SetFunctionName("ChangeAndReloadImage");
}
