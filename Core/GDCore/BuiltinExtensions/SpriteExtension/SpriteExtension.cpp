/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public LicenFse.
 */
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/SpriteObject.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsSpriteExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("Sprite",
                          GD_T("Sprite"),
                          GD_T("Extension for adding animated objects in the scene, which can contain animations with directions within each."),
                          "Florian Rival",
                          "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject("Sprite",
               GD_T("Sprite"),
               GD_T("Animated object which can be used for most elements of a game"),
               "CppPlatform/Extensions/spriteicon.png",
               &CreateSpriteObject);

    #if defined(GD_IDE_ONLY)
    obj.AddAction("Opacity",
                   GD_T("Change object's opacity"),
                   GD_T("Change the opacity of an object."),
                   GD_T("Do _PARAM1__PARAM2_ to the opacity of _PARAM0_"),
                   GD_T("Visibility"),
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .MarkAsSimple()
        .SetManipulatedType("number");

    obj.AddAction("ChangeAnimation",
                   GD_T("Change the animation"),
                   GD_T("Modify the current animation of the object."),
                   GD_T("Do _PARAM1__PARAM2_ to the number of current animation of _PARAM0_"),
                   GD_T("Animations and images"),
                   "res/actions/animation24.png",
                   "res/actions/animation.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .MarkAsSimple()
        .SetManipulatedType("number");

    obj.AddAction("ChangeDirection",
                   GD_T("Change the direction"),
                   GD_T("Change the direction of the object.\nIf the object is set to automatically rotate, the direction is its angle.\nIf the object is in 8 directions mode, the valid directions are 0..7"),
                   GD_T("Do _PARAM1__PARAM2_ to the direction of _PARAM0_"),
                   GD_T("Direction"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");


    obj.AddAction("ChangeSprite",
                   GD_T("Current frame"),
                   GD_T("Modify the current frame of the object"),
                   GD_T("Do _PARAM1__PARAM2_ to animation frame of _PARAM0_"),
                   GD_T("Animations and images"),
                   "res/actions/sprite24.png",
                   "res/actions/sprite.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddAction("PauseAnimation",
                   GD_T("Pause the animation"),
                   GD_T("Pause the current animation of the object"),
                   GD_T("Pause the current animation of _PARAM0_"),
                   GD_T("Animations and images"),
                   "res/actions/animation24.png",
                   "res/actions/animation.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .MarkAsSimple();


    obj.AddAction("PlayAnimation",
                   GD_T("Play the animation"),
                   GD_T("Play the current animation of the object"),
                   GD_T("Play the current animation of _PARAM0_"),
                   GD_T("Animations and images"),
                   "res/actions/animation24.png",
                   "res/actions/animation.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .MarkAsSimple();

    obj.AddAction("ChangeAnimationSpeedScale",
                   _("Animation speed scale"),
                   _("Modify the animation speed scale (1 = the default speed, >1 = faster and <1 = slower)."),
                   _("Do _PARAM1__PARAM2_ to the animation speed scale of _PARAM0_"),
                   _("Animations and images"),
                   "res/actions/animation24.png",
                   "res/actions/animation.png")

        .AddParameter("object", _("Object"), "Sprite", false)
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .MarkAsSimple()
        .SetManipulatedType("number");

    obj.AddAction("TourneVersPos",
                   GD_T("Rotate an object toward a position"),
                   GD_T("Rotate an object towards a position."),
                   GD_T("Rotate _PARAM0_ towards _PARAM1_;_PARAM2_"),
                   GD_T("Direction"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", GD_T("Object to be rotated"), "Sprite", false)
        .AddParameter("expression", GD_T("X position"), "",false)
        .AddParameter("expression", GD_T("Y position"), "",false)
        .AddParameter("expression", GD_T("Angular speed (degrees per second)"), "",false).SetDefaultValue("0")
        .AddCodeOnlyParameter("currentScene", "")
        .SetHidden(); //Deprecated


    obj.AddAction("ChangeScale",
                   GD_T("Scale"),
                   GD_T("Modify the scale of the specified object."),
                   GD_T("Do _PARAM1__PARAM2_ to the scale of _PARAM0_"),
                   GD_T("Size"),
                   "res/actions/scale24.png",
                   "res/actions/scale.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .MarkAsAdvanced();


    obj.AddAction("ChangeScaleWidth",
                   GD_T("Scale on X axis"),
                   GD_T("Modify the scale of the width of an object."),
                   GD_T("Do _PARAM1__PARAM2_ to the width's scale of _PARAM0_"),
                   GD_T("Size"),
                   "res/actions/scale24.png",
                   "res/actions/scale.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");


    obj.AddAction("ChangeScaleHeight",
                   GD_T("Scale on Y axis"),
                   GD_T("Modify the scale of the height of an object."),
                   GD_T("Do _PARAM1__PARAM2_ to the height's scale of _PARAM0_"),
                   GD_T("Size"),
                   "res/actions/scale24.png",
                   "res/actions/scale.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");


    obj.AddCondition("Animation",
                   GD_T("Current animation"),
                   GD_T("Test the number of the current animation of the object."),
                   GD_T("The number of the current animation of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Animations and images"),
                   "res/conditions/animation24.png",
                   "res/conditions/animation.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Number to test"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("Direction",
                   GD_T("Current direction"),
                   GD_T("Compare the direction of the object. If 8 direction mode is activated for the sprite, the value taken for direction will be from 0 to 7. Otherwise, the direction is in degrees."),
                   GD_T("Direction of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Direction"),
                   "res/conditions/direction24.png",
                   "res/conditions/direction.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Direction to test"), "",false)
        .SetManipulatedType("number");

    obj.AddCondition("Sprite",
                   GD_T("Current frame"),
                   GD_T("Test the number of the current animation frame."),
                   GD_T("The animation frame of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Animations and images"),
                   "res/conditions/sprite24.png",
                   "res/conditions/sprite.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Animation frame to test"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("AnimStopped",
                   GD_T("Animation paused"),
                   GD_T("Test if the animation of an object is paused"),
                   GD_T("The animation of _PARAM0_ is paused"),
                   GD_T("Animations and images"),
                   "res/conditions/animation24.png",
                   "res/conditions/animation.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .MarkAsSimple();

    obj.AddCondition("AnimationEnded",
                   GD_T("Animation finished"),
                   GD_T("Check if the animation being played by the Sprite object is finished."),
                   GD_T("The animation of _PARAM0_ is finished"),
                   GD_T("Animations and images"),
                   "res/conditions/animation24.png",
                   "res/conditions/animation.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .MarkAsSimple();

    obj.AddCondition("ScaleWidth",
                   GD_T("Scale on X axis"),
                   GD_T("Compare the scale of the width of an object."),
                   GD_T("The width's scale of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Size"),
                   "res/conditions/scaleWidth24.png",
                   "res/conditions/scaleWidth.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("ScaleHeight",
                   GD_T("Scale on Y axis"),
                   GD_T("Compare the scale of the height of an object."),
                   GD_T("The height's scale of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Size"),
                   "res/conditions/scaleHeight24.png",
                   "res/conditions/scaleHeight.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddCondition("Opacity",
                   GD_T("Opacity"),
                   GD_T("Compare the opacity of an object, between 0 (fully transparent) to 255 (opaque)"),
                   GD_T("The opacity of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Visibility"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .MarkAsSimple()
        .SetManipulatedType("number");

    obj.AddCondition("BlendMode",
                   GD_T("Blend mode"),
                   GD_T("Compare the number of the blend mode currently used by an object"),
                   GD_T("The number of the current blend mode of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Effects"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test  ( 0 : Alpha, 1 : Add, 2 : Multiply, 3 : None )"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    obj.AddAction("CopyImageOnImageOfSprite",
                   GD_T("Copy an image on the current one of an object"),
                   GD_T("Copy an image on the current image of an object.\nNote that the source image must be preferably kept loaded in memory."),
                   GD_T("Copy image _PARAM2_ on the current of _PARAM0_ at _PARAM3_;_PARAM4_"),
                   GD_T("Effects"),
                   "res/copy24.png",
                   "res/copyicon.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Name of the source image"), "",false).CantUseUtf8()
        .AddParameter("expression", GD_T("X position"), "",false)
        .AddParameter("expression", GD_T("Y position"), "",false)
        .AddParameter("yesorno", GD_T("Should the copy take in account the source transparency\?"), "",false);

    obj.AddAction("CreateMaskFromColorOnActualImage", //Actual is indeed a mistake : Current should have been chosen.
                   GD_T("Make a color of the image of an object transparent"),
                   GD_T("Make a color of the image of an object transparent."),
                   GD_T("Make color _PARAM1_ of the current image of _PARAM0_ transparent"),
                   GD_T("Effects"),
                   "res/actions/opacity24.png",
                   "res/actions/opacity.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("color", GD_T("Color to make transparent"), "",false);


    obj.AddAction("ChangeColor",
                   GD_T("Global color"),
                   GD_T("Change the global color of an object. The default color is white."),
                   GD_T("Change color of _PARAM0_ to _PARAM1_"),
                   GD_T("Effects"),
                   "res/actions/color24.png",
                   "res/actions/color.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("color", GD_T("Color"), "",false);


    obj.AddAction("ChangeBlendMode",
                   GD_T("Blend mode"),
                   GD_T("Change the number of the blend mode of an object.\nThe default blend mode is 0 (Alpha)."),
                   GD_T("Change Blend mode of _PARAM0_ to _PARAM1_"),
                   GD_T("Effects"),
                   "res/actions/color24.png",
                   "res/actions/color.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("expression", GD_T("Mode (0 : Alpha, 1 : Add, 2 : Multiply, 3 : None)"), "",false)
        .MarkAsSimple();


    obj.AddAction("FlipX",
                   GD_T("Flip the object horizontally"),
                   GD_T("Flip the object horizontally"),
                   GD_T("Flip horizontally _PARAM0_ : _PARAM1_"),
                   GD_T("Effects"),
                   "res/actions/flipX24.png",
                   "res/actions/flipX.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("yesorno", GD_T("Activate flipping"), "",false)
        .MarkAsSimple();


    obj.AddAction("FlipY",
                   GD_T("Flip the object vertically"),
                   GD_T("Flip the object vertically"),
                   GD_T("Flip vertically _PARAM0_ : _PARAM1_"),
                   GD_T("Effects"),
                   "res/actions/flipY24.png",
                   "res/actions/flipY.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("yesorno", GD_T("Activate flipping"), "",false)
        .MarkAsSimple();

    obj.AddCondition("FlippedX",
                   GD_T("Horizontally flipped"),
                   GD_T("Return true if the object is horizontally flipped"),
                   GD_T("_PARAM0_ is horizontally flipped"),
                   GD_T("Effects"),
                   "res/actions/flipX24.png",
                   "res/actions/flipX.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false);

    obj.AddCondition("FlippedY",
                   GD_T("Vertically flipped"),
                   GD_T("Return true if the object is vertically flipped"),
                   GD_T("_PARAM0_ is vertically flipped"),
                   GD_T("Effects"),
                   "res/actions/flipY24.png",
                   "res/actions/flipY.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false);

    obj.AddAction("TourneVers",
                   GD_T("Rotate an object toward another"),
                   GD_T("Rotate an object towards another."),
                   GD_T("Rotate _PARAM0_ towards _PARAM1_"),
                   GD_T("Direction"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png")

        .AddParameter("object", GD_T("Object to be rotated"), "Sprite", false)
        .AddParameter("objectPtr", GD_T("Rotate toward this object"))
        .AddCodeOnlyParameter("currentScene", "")
        .SetHidden(); //Deprecated

    obj.AddExpression("X", GD_T("X position of a point"), GD_T("X position of a point"), GD_T("Position"), "res/actions/position.png")
        .SetHidden()
        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("", GD_T("Name of the point"), "", true).CantUseUtf8();

    obj.AddExpression("Y", GD_T("Y position of a point"), GD_T("Y position of a point"), GD_T("Position"), "res/actions/position.png")
        .SetHidden()
        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("", GD_T("Name of the point"), "", true).CantUseUtf8();

    obj.AddExpression("PointX", GD_T("X position of a point"), GD_T("X position of a point"), GD_T("Position"), "res/actions/position.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("", GD_T("Name of the point"), "",false).CantUseUtf8();

    obj.AddExpression("PointY", GD_T("Y position of a point"), GD_T("Y position of a point"), GD_T("Position"), "res/actions/position.png")

        .AddParameter("object", GD_T("Object"), "Sprite", false)
        .AddParameter("", GD_T("Name of the point"), "",false).CantUseUtf8();

    obj.AddExpression("Direc", GD_T("Direction"), GD_T("Direction of the object"), GD_T("Direction"), "res/actions/direction.png")
        .SetHidden()
        .AddParameter("object", GD_T("Object"), "Sprite", false);

    obj.AddExpression("Direction", GD_T("Direction"), GD_T("Direction of the object"), GD_T("Direction"), "res/actions/direction.png")
        .AddParameter("object", GD_T("Object"), "Sprite", false);

    obj.AddExpression("Anim", GD_T("Animation"), GD_T("Animation of the object"), GD_T("Animations and images"), "res/actions/animation.png")
        .SetHidden()
        .AddParameter("object", GD_T("Object"), "Sprite", false);

    obj.AddExpression("Animation", GD_T("Animation"), GD_T("Animation of the object"), GD_T("Animations and images"), "res/actions/animation.png")
        .AddParameter("object", GD_T("Object"), "Sprite", false);

    obj.AddExpression("Sprite", GD_T("Image"), GD_T("Animation frame of the object"), GD_T("Animations and images"), "res/actions/sprite.png")
        .AddParameter("object", GD_T("Object"), "Sprite", false);

    obj.AddExpression("AnimationSpeedScale", GD_T("Animation speed scale"), GD_T("Animation speed scale"), GD_T("Animations and images"), "res/actions/animation.png")
        .AddParameter("object", GD_T("Object"), "Sprite", false);

    obj.AddExpression("ScaleX", GD_T("Scale of the width of an object"), GD_T("Scale of the width of an object"), GD_T("Size"), "res/actions/scaleWidth.png")
        .AddParameter("object", GD_T("Object"), "Sprite", false);

    obj.AddExpression("ScaleY", GD_T("Scale of the height of an object"), GD_T("Scale of the height of an object"), GD_T("Size"), "res/actions/scaleHeight.png")
        .AddParameter("object", GD_T("Object"), "Sprite", false);

    extension.AddCondition("Collision",
                      GD_T("Collision (Pixel perfect)"),
                      GD_T("The condition is true if there is a collision between the two objects.\nThe test is pixel-perfect."),
                      GD_T("_PARAM0_ is in collision with _PARAM1_ (pixel perfect)"),
                      GD_T("Collision"),
                      "res/conditions/collision24.png",
                      "res/conditions/collision.png")
        .AddParameter("objectList", GD_T("Object 1"), "Sprite", false)
        .AddParameter("objectList", GD_T("Object 2"), "Sprite", false)
        .AddCodeOnlyParameter("conditionInverted", "");
    #endif
}

}
