/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/SpriteExtension.h"
#include "GDL/SpriteObject.h"

SpriteExtension::SpriteExtension()
{
    DECLARE_THE_EXTENSION("Sprite",
                          _("Sprite"),
                          _("Extension for adding animated objects in the scene, which can contain animations with directions within each."),
                          "Compil Games",
                          "Freeware")

    //Declaration of all objects available
    DECLARE_OBJECT("Sprite",
                   _("Sprite"),
                   _("Animated object, composed of animations and directions containing images."),
                   "Extensions/spriteicon.png",
                   &CreateSpriteObject,
                   &DestroySpriteObject,
                   "SpriteObject");
        #if defined(GD_IDE_ONLY)

        objInfos.SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_OBJECT_ACTION("Opacity",
                       _("Change object's opacity"),
                       _("Change the opacity of an object."),
                       _("Do _PARAM2__PARAM1_ to the opacity of _PARAM0_"),
                       _("Visibility"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value"), "",false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("SetOpacity").SetAssociatedGetter("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeAnimation",
                       _("Change the animation"),
                       _("Modify the current animation of the object."),
                       _("Do _PARAM2__PARAM1_ to the number of current animation of _PARAM0_"),
                       _("Animations and images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value"), "",false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("SetCurrentAnimation").SetAssociatedGetter("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeDirection",
                       _("Change the direction"),
                       _("Change the direction of the object.\nIf the object is set to automatically rotate, the direction is its angle.\nIf the object is in 8 directions mode, the valid directions are 0..7"),
                       _("Do _PARAM2__PARAM1_ to the direction of _PARAM0_"),
                       _("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value"), "",false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("SetDirection").SetAssociatedGetter("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeSprite",
                       _("Current frame"),
                       _("Modify the current frame of the object"),
                       _("Do _PARAM2__PARAM1_ to animation frame of _PARAM0_"),
                       _("Animations and images"),
                       "res/actions/sprite24.png",
                       "res/actions/sprite.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value"), "",false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("SetSprite").SetAssociatedGetter("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("PauseAnimation",
                       _("Pause the animation"),
                       _("Pause the current animation of the object"),
                       _("Pause the current animation of _PARAM0_"),
                       _("Animations and images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);


            instrInfo.cppCallingInformation.SetFunctionName("StopAnimation").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("PlayAnimation",
                       _("Play the animation"),
                       _("Play the current animation of the object"),
                       _("Play the current animation of _PARAM0_"),
                       _("Animations and images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);


            instrInfo.cppCallingInformation.SetFunctionName("PlayAnimation").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("TourneVersPos",
                       _("Rotate an object toward a position"),
                       _("Rotate an object towards a position."),
                       _("Rotate _PARAM0_ towards _PARAM1_;_PARAM2_"),
                       _("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png");

            instrInfo.AddParameter("object", _("Object to be rotated"), "Sprite", false);
            instrInfo.AddParameter("expression", _("X position"), "",false);
            instrInfo.AddParameter("expression", _("Y position"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("TurnTowardPosition").SetIncludeFile("GDL/SpriteObject.h");


        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeScale",
                       _("Modify the scale of an object"),
                       _("Modify the scale of the specified object."),
                       _("Do _PARAM2__PARAM1_ to the scale of _PARAM0_"),
                       _("Size"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value"), "",false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("ChangeScale").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeScaleWidth",
                       _("Modify the scale on X axis"),
                       _("Modify the scale of the width of an object."),
                       _("Do _PARAM2__PARAM1_ to the width's scale of _PARAM0_"),
                       _("Size"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value"), "",false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("SetScaleX").SetAssociatedGetter("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeScaleHeight",
                       _("Modify the scale on Y axis"),
                       _("Modify the scale of the height of an object."),
                       _("Do _PARAM2__PARAM1_ to the height's scale of _PARAM0_"),
                       _("Size"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value"), "",false);
            instrInfo.AddParameter("operator", _("Modification's sign"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("SetScaleY").SetAssociatedGetter("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_CONDITION("Animation",
                       _("Current animation"),
                       _("Test the number of the current animation of the object."),
                       _("The number of the current animation of _PARAM0_ is _PARAM2__PARAM1_"),
                       _("Animations and images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Number to test"), "",false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Direction",
                       _("Current direction"),
                       _("Test the direction of the object"),
                       _("The direction of _PARAM0_ is _PARAM2__PARAM1_"),
                       _("Direction"),
                       "res/conditions/direction24.png",
                       "res/conditions/direction.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Direction to test"), "",false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Sprite",
                       _("Current frame"),
                       _("Test the number of the current animation frame."),
                       _("The animation frame of _PARAM0_ is _PARAM2__PARAM1_"),
                       _("Animations and images"),
                       "res/conditions/sprite24.png",
                       "res/conditions/sprite.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Animation frame to test"), "",false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("AnimStopped",
                       _("Animation is paused"),
                       _("Test if the animation of an object is paused"),
                       _("The animation of _PARAM0_ is paused"),
                       _("Animations and images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);

            instrInfo.cppCallingInformation.SetFunctionName("IsAnimationStopped").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("AnimationEnded",
                       _("Animation finished"),
                       _("Check if the animation being played by the Sprite object is finished."),
                       _("The animation of _PARAM0_ is finished"),
                       _("Animations and images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);

            instrInfo.cppCallingInformation.SetFunctionName("AnimationEnded").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("ScaleWidth",
                       _("Scale of the width of an object"),
                       _("Test the scale of the width of an object."),
                       _("The width's scale of _PARAM0_ is _PARAM2__PARAM1_"),
                       _("Size"),
                       "res/conditions/scaleWidth24.png",
                       "res/conditions/scaleWidth.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value to test"), "",false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("ScaleHeight",
                       _("Scale of the height of an object"),
                       _("Test the scale of the height of an object."),
                       _("The height's scale of _PARAM0_ is _PARAM2__PARAM1_"),
                       _("Size"),
                       "res/conditions/scaleHeight24.png",
                       "res/conditions/scaleHeight.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value to test"), "",false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Opacity",
                       _("Opacity"),
                       _("Test the opacity of an object"),
                       _("The opacity of _PARAM0_ is _PARAM2__PARAM1_"),
                       _("Visibility"),
                       "res/conditions/opacity24.png",
                       "res/conditions/opacity.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value to test"), "",false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("BlendMode",
                       _("Blend mode"),
                       _("Compare the number of the blend mode currently used by an object"),
                       _("The number of the current blend mode of _PARAM0_ is _PARAM2__PARAM1_"),
                       _("Effects"),
                       "res/conditions/opacity24.png",
                       "res/conditions/opacity.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Value to test  ( 0 : Alpha, 1 : Add, 2 : Multiply, 3 : None )"), "",false);
            instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("GetBlendMode").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("CopyImageOnImageOfSprite",
                       _("Copy an image on the current one of an object"),
                       _("Copy an image on the current image of an object.\nNote that the source image must be preferably kept loaded in memory."),
                       _("Copy image _PARAM2_ on the current of _PARAM0_ at _PARAM3_;_PARAM4_"),
                       _("Effects"),
                       "res/copy24.png",
                       "res/copyicon.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddCodeOnlyParameter("currentScene", "");
            instrInfo.AddParameter("string", _("Name of the source image"), "",false);
            instrInfo.AddParameter("expression", _("X position"), "",false);
            instrInfo.AddParameter("expression", _("Y position"), "",false);
            instrInfo.AddParameter("yesorno", _("Should the copy take in account the source transparency\?"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("CopyImageOnImageOfCurrentSprite").SetIncludeFile("GDL/SpriteObject.h");


        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("CreateMaskFromColorOnActualImage", //Actual is indeed a mistake : Current should have been chosen.
                       _("Make a color of the image of an object transparent"),
                       _("Make a color of the image of an object transparent."),
                       _("Make color _PARAM1_ of the current image of _PARAM0_ transparent"),
                       _("Effects"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("color", _("Color to make transparent"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("MakeColorTransparent").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeColor",
                       _("Change the global color"),
                       _("Change the global color of an object. The default color is white."),
                       _("Change color of _PARAM0_ to _PARAM1_"),
                       _("Effects"),
                       "res/actions/color24.png",
                       "res/actions/color.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("color", _("Color"), "",false);

            instrInfo.cppCallingInformation.SetFunctionName("SetColor").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeBlendMode",
                       _("Change Blend mode"),
                       _("Change the number of the blend mode of an object.\nThe default blend mode is 0 ( Alpha )."),
                       _("Change Blend mode of _PARAM0_ to _PARAM1_"),
                       _("Effects"),
                       "res/actions/color24.png",
                       "res/actions/color.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("expression", _("Mode ( 0 : Alpha, 1 : Add, 2 : Multiply, 3 : None )"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("SetBlendMode").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("FlipX",
                       _("Flip the object horizontally"),
                       _("Flip the object horizontally"),
                       _("Flip horizontally _PARAM0_ : _PARAM1_"),
                       _("Effects"),
                       "res/actions/flipX24.png",
                       "res/actions/flipX.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("yesorno", _("Activate flipping"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("FlipX").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("FlipY",
                       _("Flip the object vertically"),
                       _("Flip the object vertically"),
                       _("Flip vertically _PARAM0_ : _PARAM1_"),
                       _("Effects"),
                       "res/actions/flipY24.png",
                       "res/actions/flipY.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("yesorno", _("Activate flipping"), "",false);


            instrInfo.cppCallingInformation.SetFunctionName("FlipY").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("TourneVers",
                       _("Rotate an object toward another"),
                       _("Rotate an object towards another."),
                       _("Rotate _PARAM0_ towards _PARAM1_"),
                       _("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png");

            instrInfo.AddParameter("object", _("Object to be rotated"), "Sprite", false);
            instrInfo.AddParameter("object", _("Rotate toward this object"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("TurnTowardObject").SetIncludeFile("GDL/BuiltinExtensions/SpriteTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_CONDITION("SourisSurObjet",
                       _("The cursor is on an object"),
                       _("Test if the cursor is over a Sprite object. The test is accurate by default (check that the cursor is not on a transparent pixel)."),
                       _("The cursor is on _PARAM0_"),
                       _("Mouse"),
                       "res/conditions/surObjet24.png",
                       "res/conditions/surObjet.png");

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddCodeOnlyParameter("currentScene", "");
            instrInfo.AddParameter("yesorno", _("Precise test ( yes by default )"), "", true).SetDefaultValue("yes");

            instrInfo.cppCallingInformation.SetFunctionName("CursorOnObject").SetIncludeFile("GDL/BuiltinExtensions/SpriteTools.h");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_EXPRESSION("X", _("X position of a point"), _("X position of a point"), _("Position"), "res/actions/position.png")

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("", _("Name of the point"), "", true);

            instrInfo.cppCallingInformation.SetFunctionName("GetPointX").SetIncludeFile("GDL/SpriteObject.h");
            instrInfo.SetHidden();

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Y", _("Y position of a point"), _("Y position of a point"), _("Position"), "res/actions/position.png")

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("", _("Name of the point"), "", true);

            instrInfo.cppCallingInformation.SetFunctionName("GetPointY").SetIncludeFile("GDL/SpriteObject.h");
            instrInfo.SetHidden();

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("PointX", _("X position of a point"), _("X position of a point"), _("Position"), "res/actions/position.png")

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("", _("Name of the point"), "",false);

            instrInfo.cppCallingInformation.SetFunctionName("GetPointX").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("PointY", _("Y position of a point"), _("Y position of a point"), _("Position"), "res/actions/position.png")

            instrInfo.AddParameter("object", _("Object"), "Sprite", false);
            instrInfo.AddParameter("", _("Name of the point"), "",false);

            instrInfo.cppCallingInformation.SetFunctionName("GetPointY").SetIncludeFile("GDL/SpriteObject.h");

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Direc", _("Direction"), _("Direction of the object"), _("Direction"), "res/actions/direction.png")
            instrInfo.AddParameter("object", _("Object"), "Sprite", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDL/SpriteObject.h");
            instrInfo.SetHidden();
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Direction", _("Direction"), _("Direction of the object"), _("Direction"), "res/actions/direction.png")
            instrInfo.AddParameter("object", _("Object"), "Sprite", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDL/SpriteObject.h");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Anim", _("Animation"), _("Animation of the object"), _("Animations and images"), "res/actions/animation.png")
            instrInfo.AddParameter("object", _("Object"), "Sprite", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDL/SpriteObject.h");
            instrInfo.SetHidden();
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Animation", _("Animation"), _("Animation of the object"), _("Animations and images"), "res/actions/animation.png")
            instrInfo.AddParameter("object", _("Object"), "Sprite", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDL/SpriteObject.h");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Sprite", _("Image"), _("Animation frame of the object"), _("Animations and images"), "res/actions/sprite.png")
            instrInfo.AddParameter("object", _("Object"), "Sprite", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetSpriteNb").SetIncludeFile("GDL/SpriteObject.h");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ScaleX", _("Scale of the width of an object"), _("Scale of the width of an object"), _("Size"), "res/actions/scaleWidth.png")
            instrInfo.AddParameter("object", _("Object"), "Sprite", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetScaleX").SetIncludeFile("GDL/SpriteObject.h");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ScaleY", _("Scale of the height of an object"), _("Scale of the height of an object"), _("Size"), "res/actions/scaleHeight.png")
            instrInfo.AddParameter("object", _("Object"), "Sprite", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetScaleY").SetIncludeFile("GDL/SpriteObject.h");
        DECLARE_END_OBJECT_EXPRESSION()
        #endif

    DECLARE_END_OBJECT()

    #if defined(GD_IDE_ONLY)

    //Declaration of all conditions available

    DECLARE_CONDITION("EstTourne",
                      _("An object is turned toward another"),
                      _("Test if an object is turned toward another"),
                      _("_PARAM0_ is rotated towards _PARAM1_"),
                      _("Direction"),
                      "res/conditions/estTourne24.png",
                      "res/conditions/estTourne.png");

        instrInfo.AddParameter("object", _("Name of the object"), "Sprite", false);
        instrInfo.AddParameter("object", _("Name of the second object"), "", false);
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");
        instrInfo.AddParameter("expression", _("Angle of tolerance (0: minimum tolerance)"), "",false);
        instrInfo.AddCodeOnlyParameter("conditionInverted", "");

        instrInfo.cppCallingInformation.SetFunctionName("SpriteTurnedToward").SetIncludeFile("GDL/BuiltinExtensions/SpriteTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("Collision",
                      _("Collision ( Pixel perfect )"),
                      _("The condition is true if there is a collision between the two objects.\nThe test is pixel-perfect."),
                      _("_PARAM0_ is in collision with _PARAM1_"),
                      _("Collision"),
                      "res/conditions/collision24.png",
                      "res/conditions/collision.png");

        instrInfo.AddParameter("object", _("Object 1"), "Sprite", false);
        instrInfo.AddParameter("object", _("Object 2"), "Sprite", false);
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");
        instrInfo.AddCodeOnlyParameter("conditionInverted", "");

        instrInfo.cppCallingInformation.SetFunctionName("SpriteCollision").SetIncludeFile("GDL/BuiltinExtensions/SpriteTools.h");

    DECLARE_END_CONDITION()

    #endif
}

