/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the GNU Lesser General Public
 * LicenFse.
 */
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsSpriteExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("Sprite",
                               _("Sprite"),
                               _("Sprite are animated object which can be used "
                                 "for most elements of a game."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/sprite");

  gd::ObjectMetadata& obj = extension.AddObject<SpriteObject>(
      "Sprite",
      _("Sprite"),
      _("Animated object which can be used for most elements of a game"),
      "CppPlatform/Extensions/spriteicon.png");

#if defined(GD_IDE_ONLY)
  obj.AddAction("Opacity",
                _("Change sprite opacity"),
                _("Change the opacity of a Sprite. 0 is fully transparent, 255 "
                  "is opaque (default)."),
                _("the opacity"),
                _("Visibility"),
                "res/actions/opacity24.png",
                "res/actions/opacity.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsSimple();

  obj.AddAction("ChangeAnimation",
                _("Change the animation"),
                _("Change the animation of the object, using the animation "
                  "number in the animations list."),
                _("the number of the animation"),
                _("Animations and images"),
                "res/actions/animation24.png",
                "res/actions/animation.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsSimple();

  obj.AddAction("SetAnimationName",
                _("Change the animation (by name)"),
                _("Change the animation of the object, using the name of the "
                  "animation."),
                _("Set animation of _PARAM0_ to _PARAM1_"),
                _("Animations and images"),
                "res/actions/animation24.png",
                "res/actions/animation.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectAnimationName", _("Animation name"))
      .MarkAsAdvanced();

  obj.AddAction(
         "ChangeDirection",
         _("Change the direction"),
         _("Change the direction of the object.\nIf the object is set to "
           "automatically rotate, the direction is its angle.\nIf the object "
           "is in 8 directions mode, the valid directions are 0..7"),
         _("the direction"),
         _("Direction"),
         "res/actions/direction24.png",
         "res/actions/direction.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddAction("ChangeSprite",
                _("Current frame"),
                _("Modify the current frame of the object"),
                _("the animation frame"),
                _("Animations and images"),
                "res/actions/sprite24.png",
                "res/actions/sprite.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddAction("PauseAnimation",
                _("Pause the animation"),
                _("Pause the animation of the object"),
                _("Pause the animation of _PARAM0_"),
                _("Animations and images"),
                "res/actions/animation24.png",
                "res/actions/animation.png")

      .AddParameter("object", _("Object"), "Sprite")
      .MarkAsSimple();

  obj.AddAction("PlayAnimation",
                _("Play the animation"),
                _("Play the animation of the object"),
                _("Play the animation of _PARAM0_"),
                _("Animations and images"),
                "res/actions/animation24.png",
                "res/actions/animation.png")

      .AddParameter("object", _("Object"), "Sprite")
      .MarkAsSimple();

  obj.AddAction(
         "ChangeAnimationSpeedScale",
         _("Animation speed scale"),
         _("Modify the animation speed scale (1 = the default speed, >1 = "
           "faster and <1 = slower)."),
         _("the animation speed scale"),
         _("Animations and images"),
         "res/actions/animation24.png",
         "res/actions/animation.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsSimple();

  obj.AddAction("TourneVersPos",
                "Rotate an object toward a position",
                "Rotate an object towards a position.",
                "Rotate _PARAM0_ towards _PARAM1_;_PARAM2_",
                _("Direction"),
                "res/actions/direction24.png",
                "res/actions/direction.png")

      .AddParameter("object", _("Object to be rotated"), "Sprite")
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .AddParameter("expression", _("Angular speed (degrees per second)"))
      .SetDefaultValue("0")
      .AddCodeOnlyParameter("currentScene", "")
      .SetHidden();  // Deprecated

  obj.AddAction("ChangeScale",
                _("Scale"),
                _("Modify the scale of the specified object."),
                _("the scale"),
                _("Size"),
                "res/actions/scale24.png",
                "res/actions/scale.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddAction("ChangeScaleWidth",
                _("Scale on X axis"),
                _("Modify the scale of the width of an object."),
                _("the width's scale"),
                _("Size"),
                "res/actions/scale24.png",
                "res/actions/scale.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddAction("ChangeScaleHeight",
                _("Scale on Y axis"),
                _("Modify the scale of the height of an object."),
                _("the height's scale"),
                _("Size"),
                "res/actions/scale24.png",
                "res/actions/scale.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddAction("ChangeWidth",
                _("Width"),
                _("Change the width of a Sprite object."),
                _("the width"),
                _("Size"),
                "res/actions/scale24.png",
                "res/actions/scale.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddAction("ChangeHeight",
                _("Height"),
                _("Change the height of a Sprite object."),
                _("the height"),
                _("Size"),
                "res/actions/scale24.png",
                "res/actions/scale.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddCondition(
         "Animation",
         _("Current animation"),
         _("Compare the number of the animation played by the object."),
         _("the number of the animation"),
         _("Animations and images"),
         "res/conditions/animation24.png",
         "res/conditions/animation.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddCondition("AnimationName",
                   _("Current animation name"),
                   _("Check the animation by played by the object."),
                   _("The animation of _PARAM0_ is _PARAM1_"),
                   _("Animations and images"),
                   "res/conditions/animation24.png",
                   "res/conditions/animation.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectAnimationName", _("Animation name"))
      .MarkAsAdvanced();

  obj.AddCondition(
         "Direction",
         _("Current direction"),
         _("Compare the direction of the object. If 8 direction mode is "
           "activated for the sprite, the value taken for direction will be "
           "from 0 to 7. Otherwise, the direction is in degrees."),
         _("the direction"),
         _("Direction"),
         "res/conditions/direction24.png",
         "res/conditions/direction.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddCondition("Sprite",
                   _("Current frame"),
                   _("Compare the index of the current frame in the animation "
                     "displayed by the specified object. The first frame in an "
                     "animation starts at index 0."),
                   _("the animation frame"),
                   _("Animations and images"),
                   "res/conditions/sprite24.png",
                   "res/conditions/sprite.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddCondition("AnimStopped",
                   _("Animation paused"),
                   _("Check if the animation of an object is paused."),
                   _("The animation of _PARAM0_ is paused"),
                   _("Animations and images"),
                   "res/conditions/animation24.png",
                   "res/conditions/animation.png")

      .AddParameter("object", _("Object"), "Sprite")
      .MarkAsSimple();

  obj.AddCondition("AnimationEnded",
                   _("Animation finished"),
                   _("Check if the animation being played by the Sprite object "
                     "is finished."),
                   _("The animation of _PARAM0_ is finished"),
                   _("Animations and images"),
                   "res/conditions/animation24.png",
                   "res/conditions/animation.png")

      .AddParameter("object", _("Object"), "Sprite")
      .MarkAsSimple();

  obj.AddCondition("ScaleWidth",
                   _("Scale on X axis"),
                   _("Compare the scale of the width of an object."),
                   _("the width's scale"),
                   _("Size"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddCondition("ScaleHeight",
                   _("Scale on Y axis"),
                   _("Compare the scale of the height of an object."),
                   _("the height's scale"),
                   _("Size"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddCondition("Opacity",
                   _("Opacity"),
                   _("Compare the opacity of a Sprite, between 0 (fully "
                     "transparent) to 255 (opaque)."),
                   _("the opacity"),
                   _("Visibility"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsSimple();

  obj.AddCondition(
         "BlendMode",
         _("Blend mode"),
         _("Compare the number of the blend mode currently used by an object"),
         _("the number of the current blend mode"),
         _("Effects"),
         "res/conditions/opacity24.png",
         "res/conditions/opacity.png")

      .AddParameter("object", _("Object"), "Sprite")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced();

  obj.AddAction("CopyImageOnImageOfSprite",
                _("Copy an image on the current one of an object"),
                _("Copy an image on the current image of an object.\nNote that "
                  "the source image must be preferably kept loaded in memory."),
                _("Copy image _PARAM2_ on the current of _PARAM0_ at "
                  "_PARAM3_;_PARAM4_"),
                _("Effects"),
                "res/copy24.png",
                "res/copyicon.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Name of the source image"))
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .AddParameter(
          "yesorno",
          _("Should the copy take in account the source transparency\?"));

  obj.AddAction(
         "CreateMaskFromColorOnActualImage",  // Actual is indeed a mistake :
                                              // Current should have been
                                              // chosen.
         _("Make a color of the image of an object transparent"),
         _("Make a color of the image of an object transparent."),
         _("Make color _PARAM1_ of the current image of _PARAM0_ transparent"),
         _("Effects"),
         "res/actions/opacity24.png",
         "res/actions/opacity.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("color", _("Color to make transparent"));

  obj.AddAction("ChangeColor",
                _("Tint color"),
                _("Change the tint of an object. The default color is white."),
                _("Change tint of _PARAM0_ to _PARAM1_"),
                _("Effects"),
                "res/actions/color24.png",
                "res/actions/color.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("color", _("Tint"));

  obj.AddAction("ChangeBlendMode",
                _("Blend mode"),
                _("Change the number of the blend mode of an object.\nThe "
                  "default blend mode is 0 (Normal)."),
                _("Change Blend mode of _PARAM0_ to _PARAM1_"),
                _("Effects"),
                "res/actions/color24.png",
                "res/actions/color.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("expression",
                    _("Mode (0: Normal, 1: Add, 2: Multiply, 3: Screen)"))
      .MarkAsSimple();

  obj.AddAction("FlipX",
                _("Flip the object horizontally"),
                _("Flip the object horizontally"),
                _("Flip horizontally _PARAM0_ : _PARAM1_"),
                _("Effects"),
                "res/actions/flipX24.png",
                "res/actions/flipX.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("yesorno", _("Activate flipping"))
      .MarkAsSimple();

  obj.AddAction("FlipY",
                _("Flip the object vertically"),
                _("Flip the object vertically"),
                _("Flip vertically _PARAM0_ : _PARAM1_"),
                _("Effects"),
                "res/actions/flipY24.png",
                "res/actions/flipY.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("yesorno", _("Activate flipping"))
      .MarkAsSimple();

  obj.AddCondition("FlippedX",
                   _("Horizontally flipped"),
                   _("Check if the object is horizontally flipped"),
                   _("_PARAM0_ is horizontally flipped"),
                   _("Effects"),
                   "res/actions/flipX24.png",
                   "res/actions/flipX.png")

      .AddParameter("object", _("Object"), "Sprite");

  obj.AddCondition("FlippedY",
                   _("Vertically flipped"),
                   _("Check if the object is vertically flipped"),
                   _("_PARAM0_ is vertically flipped"),
                   _("Effects"),
                   "res/actions/flipY24.png",
                   "res/actions/flipY.png")

      .AddParameter("object", _("Object"), "Sprite");

  obj.AddAction("TourneVers",
                "Rotate an object toward another",
                "Rotate an object towards another.",
                "Rotate _PARAM0_ towards _PARAM1_",
                _("Direction"),
                "res/actions/direction24.png",
                "res/actions/direction.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectPtr", "Rotate toward this object")
      .AddCodeOnlyParameter("currentScene", "")
      .SetHidden();  // Deprecated

  obj.AddExpression("X",
                    _("X position of a point"),
                    _("X position of a point"),
                    _("Position"),
                    "res/actions/position.png")
      .SetHidden()
      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectPointName", _("Name of the point"), "", true);

  obj.AddExpression("Y",
                    _("Y position of a point"),
                    _("Y position of a point"),
                    _("Position"),
                    "res/actions/position.png")
      .SetHidden()
      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectPointName", _("Name of the point"), "", true);

  obj.AddExpression("PointX",
                    _("X position of a point"),
                    _("X position of a point"),
                    _("Position"),
                    "res/actions/position.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectPointName", _("Name of the point"));

  obj.AddExpression("PointY",
                    _("Y position of a point"),
                    _("Y position of a point"),
                    _("Position"),
                    "res/actions/position.png")

      .AddParameter("object", _("Object"), "Sprite")
      .AddParameter("objectPointName", _("Name of the point"));

  obj.AddExpression("Direc",
                    _("Direction"),
                    _("Direction of the object"),
                    _("Direction"),
                    "res/actions/direction.png")
      .SetHidden()
      .AddParameter("object", _("Object"), "Sprite");

  obj.AddExpression("Direction",
                    _("Direction"),
                    _("Direction of the object"),
                    _("Direction"),
                    "res/actions/direction.png")
      .AddParameter("object", _("Object"), "Sprite");

  obj.AddExpression("Anim",
                    _("Animation"),
                    _("Animation of the object"),
                    _("Animations and images"),
                    "res/actions/animation.png")
      .SetHidden()
      .AddParameter("object", _("Object"), "Sprite");

  obj.AddExpression("Animation",
                    _("Animation"),
                    _("Animation of the object"),
                    _("Animations and images"),
                    "res/actions/animation.png")
      .AddParameter("object", _("Object"), "Sprite");

  obj.AddStrExpression("AnimationName",
                       _("Animation name"),
                       _("Name of the animation of the object"),
                       _("Animations and images"),
                       "res/actions/animation.png")
      .AddParameter("object", _("Object"), "Sprite");

  obj.AddExpression("Sprite",
                    _("Image"),
                    _("Animation frame of the object"),
                    _("Animations and images"),
                    "res/actions/sprite.png")
      .AddParameter("object", _("Object"), "Sprite");

  obj.AddExpression("AnimationSpeedScale",
                    _("Animation speed scale"),
                    _("Animation speed scale"),
                    _("Animations and images"),
                    "res/actions/animation.png")
      .AddParameter("object", _("Object"), "Sprite");

  obj.AddExpression("ScaleX",
                    _("Scale of the width of an object"),
                    _("Scale of the width of an object"),
                    _("Size"),
                    "res/actions/scaleWidth.png")
      .AddParameter("object", _("Object"), "Sprite");

  obj.AddExpression("ScaleY",
                    _("Scale of the height of an object"),
                    _("Scale of the height of an object"),
                    _("Size"),
                    "res/actions/scaleHeight.png")
      .AddParameter("object", _("Object"), "Sprite");

  obj.AddExpression("Opacity",
                    _("Opacity"),
                    _("Opacity"),
                    _("Opacity"),
                    "res/actions/opacity.png")
      .AddParameter("object", _("Object"), "Sprite");

  extension
      .AddCondition("Collision",
                    _("Collision (Pixel perfect)"),
                    _("The condition is true if there is a collision between "
                      "the two objects.\nThe test is pixel-perfect."),
                    _("_PARAM0_ is in collision with _PARAM1_ (pixel perfect)"),
                    _("Collision"),
                    "res/conditions/collision24.png",
                    "res/conditions/collision.png")
      .AddParameter("objectList", _("Object 1"), "Sprite")
      .AddParameter("objectList", _("Object 2"), "Sprite")
      .AddCodeOnlyParameter("conditionInverted", "");
#endif
}

}  // namespace gd
