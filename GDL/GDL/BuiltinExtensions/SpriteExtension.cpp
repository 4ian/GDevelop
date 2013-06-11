/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/SpriteExtension.h"
#include "GDL/SpriteObject.h"

SpriteExtension::SpriteExtension()
{
    SetExtensionInformation("Sprite",
                          _("Sprite"),
                          _("Extension for adding animated objects in the scene, which can contain animations with directions within each."),
                          "Compil Games",
                          "Freeware");

    //Declaration of all objects available
    {
        gd::ObjectMetadata & obj = AddObject("Sprite",
                   _("Sprite"),
                   _("Animated object which can be used most element of a game"),
                   "CppPlatform/Extensions/spriteicon.png",
                   &CreateSpriteObject,
                   &DestroySpriteObject);

        AddRuntimeObject(obj, "RuntimeSpriteObject", &CreateRuntimeSpriteObject, &DestroyRuntimeSpriteObject);

        #if defined(GD_IDE_ONLY)
        obj.SetIncludeFile("GDL/SpriteObject.h");

        obj.AddAction("Opacity",
                       _("Change object's opacity"),
                       _("Change the opacity of an object."),
                       _("Do _PARAM1__PARAM2_ to the opacity of _PARAM0_"),
                       _("Visibility"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("operator", _("Modification's sign"), "",false)
            .AddParameter("expression", _("Value"), "",false)
            .codeExtraInformation.SetFunctionName("SetOpacity").SetAssociatedGetter("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("ChangeAnimation",
                       _("Change the animation"),
                       _("Modify the current animation of the object."),
                       _("Do _PARAM1__PARAM2_ to the number of current animation of _PARAM0_"),
                       _("Animations and images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("operator", _("Modification's sign"), "",false)
            .AddParameter("expression", _("Value"), "",false)
            .codeExtraInformation.SetFunctionName("SetCurrentAnimation").SetAssociatedGetter("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("ChangeDirection",
                       _("Change the direction"),
                       _("Change the direction of the object.\nIf the object is set to automatically rotate, the direction is its angle.\nIf the object is in 8 directions mode, the valid directions are 0..7"),
                       _("Do _PARAM1__PARAM2_ to the direction of _PARAM0_"),
                       _("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("operator", _("Modification's sign"), "",false)
            .AddParameter("expression", _("Value"), "",false)
            .codeExtraInformation.SetFunctionName("SetDirection").SetAssociatedGetter("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("ChangeSprite",
                       _("Current frame"),
                       _("Modify the current frame of the object"),
                       _("Do _PARAM1__PARAM2_ to animation frame of _PARAM0_"),
                       _("Animations and images"),
                       "res/actions/sprite24.png",
                       "res/actions/sprite.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("operator", _("Modification's sign"), "",false)
            .AddParameter("expression", _("Value"), "",false)
            .codeExtraInformation.SetFunctionName("SetSprite").SetAssociatedGetter("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("PauseAnimation",
                       _("Pause the animation"),
                       _("Pause the current animation of the object"),
                       _("Pause the current animation of _PARAM0_"),
                       _("Animations and images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("StopAnimation").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("PlayAnimation",
                       _("Play the animation"),
                       _("Play the current animation of the object"),
                       _("Play the current animation of _PARAM0_"),
                       _("Animations and images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("PlayAnimation").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("TourneVersPos",
                       _("Rotate an object toward a position"),
                       _("Rotate an object towards a position."),
                       _("Rotate _PARAM0_ towards _PARAM1_;_PARAM2_"),
                       _("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png")

            .AddParameter("object", _("Object to be rotated"), "Sprite", false)
            .AddParameter("expression", _("X position"), "",false)
            .AddParameter("expression", _("Y position"), "",false)
            .codeExtraInformation.SetFunctionName("TurnTowardPosition").SetIncludeFile("GDL/SpriteObject.h");



        obj.AddAction("ChangeScale",
                       _("Modify the scale of an object"),
                       _("Modify the scale of the specified object."),
                       _("Do _PARAM1__PARAM2_ to the scale of _PARAM0_"),
                       _("Size"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("operator", _("Modification's sign"), "",false)
            .AddParameter("expression", _("Value"), "",false)
            .codeExtraInformation.SetFunctionName("ChangeScale").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("ChangeScaleWidth",
                       _("Modify the scale on X axis"),
                       _("Modify the scale of the width of an object."),
                       _("Do _PARAM1__PARAM2_ to the width's scale of _PARAM0_"),
                       _("Size"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("operator", _("Modification's sign"), "",false)
            .AddParameter("expression", _("Value"), "",false)
            .codeExtraInformation.SetFunctionName("SetScaleX").SetAssociatedGetter("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("ChangeScaleHeight",
                       _("Modify the scale on Y axis"),
                       _("Modify the scale of the height of an object."),
                       _("Do _PARAM1__PARAM2_ to the height's scale of _PARAM0_"),
                       _("Size"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("operator", _("Modification's sign"), "",false)
            .AddParameter("expression", _("Value"), "",false)
            .codeExtraInformation.SetFunctionName("SetScaleY").SetAssociatedGetter("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddCondition("Animation",
                       _("Current animation"),
                       _("Test the number of the current animation of the object."),
                       _("The number of the current animation of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Animations and images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("relationalOperator", _("Sign of the test"), "",false)
            .AddParameter("expression", _("Number to test"), "",false)
            .codeExtraInformation.SetFunctionName("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddCondition("Direction",
                       _("Current direction"),
                       _("Test the direction of the object"),
                       _("The direction of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Direction"),
                       "res/conditions/direction24.png",
                       "res/conditions/direction.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("relationalOperator", _("Sign of the test"), "",false)
            .AddParameter("expression", _("Direction to test"), "",false)
            .codeExtraInformation.SetFunctionName("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddCondition("Sprite",
                       _("Current frame"),
                       _("Test the number of the current animation frame."),
                       _("The animation frame of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Animations and images"),
                       "res/conditions/sprite24.png",
                       "res/conditions/sprite.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("relationalOperator", _("Sign of the test"), "",false)
            .AddParameter("expression", _("Animation frame to test"), "",false)
            .codeExtraInformation.SetFunctionName("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddCondition("AnimStopped",
                       _("Animation is paused"),
                       _("Test if the animation of an object is paused"),
                       _("The animation of _PARAM0_ is paused"),
                       _("Animations and images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("IsAnimationStopped").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddCondition("AnimationEnded",
                       _("Animation finished"),
                       _("Check if the animation being played by the Sprite object is finished."),
                       _("The animation of _PARAM0_ is finished"),
                       _("Animations and images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("AnimationEnded").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddCondition("ScaleWidth",
                       _("Scale of the width of an object"),
                       _("Test the scale of the width of an object."),
                       _("The width's scale of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Size"),
                       "res/conditions/scaleWidth24.png",
                       "res/conditions/scaleWidth.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("relationalOperator", _("Sign of the test"), "",false)
            .AddParameter("expression", _("Value to test"), "",false)
            .codeExtraInformation.SetFunctionName("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddCondition("ScaleHeight",
                       _("Scale of the height of an object"),
                       _("Test the scale of the height of an object."),
                       _("The height's scale of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Size"),
                       "res/conditions/scaleHeight24.png",
                       "res/conditions/scaleHeight.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("relationalOperator", _("Sign of the test"), "",false)
            .AddParameter("expression", _("Value to test"), "",false)
            .codeExtraInformation.SetFunctionName("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddCondition("Opacity",
                       _("Opacity"),
                       _("Test the opacity of an object"),
                       _("The opacity of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Visibility"),
                       "res/conditions/opacity24.png",
                       "res/conditions/opacity.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("relationalOperator", _("Sign of the test"), "",false)
            .AddParameter("expression", _("Value to test"), "",false)
            .codeExtraInformation.SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddCondition("BlendMode",
                       _("Blend mode"),
                       _("Compare the number of the blend mode currently used by an object"),
                       _("The number of the current blend mode of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Effects"),
                       "res/conditions/opacity24.png",
                       "res/conditions/opacity.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("relationalOperator", _("Sign of the test"), "",false)
            .AddParameter("expression", _("Value to test  ( 0 : Alpha, 1 : Add, 2 : Multiply, 3 : None )"), "",false)
            .codeExtraInformation.SetFunctionName("GetBlendMode").SetManipulatedType("number").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddAction("CopyImageOnImageOfSprite",
                       _("Copy an image on the current one of an object"),
                       _("Copy an image on the current image of an object.\nNote that the source image must be preferably kept loaded in memory."),
                       _("Copy image _PARAM2_ on the current of _PARAM0_ at _PARAM3_;_PARAM4_"),
                       _("Effects"),
                       "res/copy24.png",
                       "res/copyicon.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Name of the source image"), "",false)
            .AddParameter("expression", _("X position"), "",false)
            .AddParameter("expression", _("Y position"), "",false)
            .AddParameter("yesorno", _("Should the copy take in account the source transparency\?"), "",false)
            .codeExtraInformation.SetFunctionName("CopyImageOnImageOfCurrentSprite").SetIncludeFile("GDL/SpriteObject.h");



        obj.AddAction("CreateMaskFromColorOnActualImage", //Actual is indeed a mistake : Current should have been chosen.
                       _("Make a color of the image of an object transparent"),
                       _("Make a color of the image of an object transparent."),
                       _("Make color _PARAM1_ of the current image of _PARAM0_ transparent"),
                       _("Effects"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("color", _("Color to make transparent"), "",false)
            .codeExtraInformation.SetFunctionName("MakeColorTransparent").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("ChangeColor",
                       _("Change the global color"),
                       _("Change the global color of an object. The default color is white."),
                       _("Change color of _PARAM0_ to _PARAM1_"),
                       _("Effects"),
                       "res/actions/color24.png",
                       "res/actions/color.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("color", _("Color"), "",false)
            .codeExtraInformation.SetFunctionName("SetColor").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("ChangeBlendMode",
                       _("Change Blend mode"),
                       _("Change the number of the blend mode of an object.\nThe default blend mode is 0 ( Alpha )."),
                       _("Change Blend mode of _PARAM0_ to _PARAM1_"),
                       _("Effects"),
                       "res/actions/color24.png",
                       "res/actions/color.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("expression", _("Mode ( 0 : Alpha, 1 : Add, 2 : Multiply, 3 : None )"), "",false)
            .codeExtraInformation.SetFunctionName("SetBlendMode").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("FlipX",
                       _("Flip the object horizontally"),
                       _("Flip the object horizontally"),
                       _("Flip horizontally _PARAM0_ : _PARAM1_"),
                       _("Effects"),
                       "res/actions/flipX24.png",
                       "res/actions/flipX.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("yesorno", _("Activate flipping"), "",false)
            .codeExtraInformation.SetFunctionName("FlipX").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("FlipY",
                       _("Flip the object vertically"),
                       _("Flip the object vertically"),
                       _("Flip vertically _PARAM0_ : _PARAM1_"),
                       _("Effects"),
                       "res/actions/flipY24.png",
                       "res/actions/flipY.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("yesorno", _("Activate flipping"), "",false)
            .codeExtraInformation.SetFunctionName("FlipY").SetIncludeFile("GDL/SpriteObject.h");


        obj.AddAction("TourneVers",
                       _("Rotate an object toward another"),
                       _("Rotate an object towards another."),
                       _("Rotate _PARAM0_ towards _PARAM1_"),
                       _("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png")

            .AddParameter("object", _("Object to be rotated"), "Sprite", false)
            .AddParameter("objectPtr", _("Rotate toward this object"))
            .codeExtraInformation.SetFunctionName("TurnTowardObject").SetIncludeFile("GDL/BuiltinExtensions/SpriteTools.h");


        obj.AddCondition("SourisSurObjet",
                       _("The cursor is on an object"),
                       _("Test if the cursor is over a Sprite object. The test is accurate by default (check that the cursor is not on a transparent pixel)."),
                       _("The cursor is on _PARAM0_"),
                       _("Mouse"),
                       "res/conditions/surObjet24.png",
                       "res/conditions/surObjet.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("yesorno", _("Precise test ( yes by default )"), "", true).SetDefaultValue("yes")
            .codeExtraInformation.SetFunctionName("CursorOnObject").SetIncludeFile("GDL/BuiltinExtensions/SpriteTools.h");

        obj.AddExpression("X", _("X position of a point"), _("X position of a point"), _("Position"), "res/actions/position.png")
            .SetHidden()
            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("", _("Name of the point"), "", true)
            .codeExtraInformation.SetFunctionName("GetPointX").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("Y", _("Y position of a point"), _("Y position of a point"), _("Position"), "res/actions/position.png")
            .SetHidden()
            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("", _("Name of the point"), "", true)
            .codeExtraInformation.SetFunctionName("GetPointY").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("PointX", _("X position of a point"), _("X position of a point"), _("Position"), "res/actions/position.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("", _("Name of the point"), "",false)
            .codeExtraInformation.SetFunctionName("GetPointX").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("PointY", _("Y position of a point"), _("Y position of a point"), _("Position"), "res/actions/position.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("", _("Name of the point"), "",false)
            .codeExtraInformation.SetFunctionName("GetPointY").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("Direc", _("Direction"), _("Direction of the object"), _("Direction"), "res/actions/direction.png")
            .SetHidden()
            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("Direction", _("Direction"), _("Direction of the object"), _("Direction"), "res/actions/direction.png")
            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("Anim", _("Animation"), _("Animation of the object"), _("Animations and images"), "res/actions/animation.png")
            .SetHidden()
            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("Animation", _("Animation"), _("Animation of the object"), _("Animations and images"), "res/actions/animation.png")
            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("Sprite", _("Image"), _("Animation frame of the object"), _("Animations and images"), "res/actions/sprite.png")
            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("GetSpriteNb").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("ScaleX", _("Scale of the width of an object"), _("Scale of the width of an object"), _("Size"), "res/actions/scaleWidth.png")
            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("GetScaleX").SetIncludeFile("GDL/SpriteObject.h");

        obj.AddExpression("ScaleY", _("Scale of the height of an object"), _("Scale of the height of an object"), _("Size"), "res/actions/scaleHeight.png")
            .AddParameter("object", _("Object"), "Sprite", false)
            .codeExtraInformation.SetFunctionName("GetScaleY").SetIncludeFile("GDL/SpriteObject.h");
        #endif

    }

    #if defined(GD_IDE_ONLY)
    //Declaration of all conditions available
    AddCondition("EstTourne",
                      _("An object is turned toward another"),
                      _("Test if an object is turned toward another"),
                      _("_PARAM0_ is rotated towards _PARAM1_"),
                      _("Direction"),
                      "res/conditions/estTourne24.png",
                      "res/conditions/estTourne.png")
        .AddParameter("objectList", _("Name of the object"), "Sprite", false)
        .AddParameter("objectList", _("Name of the second object"))
        .AddParameter("expression", _("Angle of tolerance (0: minimum tolerance)"), "",false)
        .AddCodeOnlyParameter("conditionInverted", "")
        .codeExtraInformation.SetFunctionName("SpriteTurnedToward").SetIncludeFile("GDL/BuiltinExtensions/SpriteTools.h");

    AddCondition("Collision",
                      _("Collision ( Pixel perfect )"),
                      _("The condition is true if there is a collision between the two objects.\nThe test is pixel-perfect."),
                      _("_PARAM0_ is in collision with _PARAM1_"),
                      _("Collision"),
                      "res/conditions/collision24.png",
                      "res/conditions/collision.png")
        .AddParameter("objectList", _("Object 1"), "Sprite", false)
        .AddParameter("objectList", _("Object 2"), "Sprite", false)
        .AddCodeOnlyParameter("conditionInverted", "")
        .codeExtraInformation.SetFunctionName("SpriteCollision").SetIncludeFile("GDL/BuiltinExtensions/SpriteTools.h");
    #endif
}

