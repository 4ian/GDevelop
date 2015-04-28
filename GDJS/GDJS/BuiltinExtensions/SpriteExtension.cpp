/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDJS/BuiltinExtensions/SpriteExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

SpriteExtension::SpriteExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsSpriteExtension(*this);

    SetExtensionInformation("Sprite",
                          GD_T("Sprite"),
                          GD_T("Extension for adding animated objects in the scene, which can contain animations with directions within each."),
                          "Florian Rival",
                          "Open source (MIT License)");

    std::map<std::string, gd::InstructionMetadata > & spriteActions = GetAllActionsForObject("Sprite");
    std::map<std::string, gd::InstructionMetadata > & spriteConditions = GetAllConditionsForObject("Sprite");
    std::map<std::string, gd::ExpressionMetadata > & spriteExpressions = GetAllExpressionsForObject("Sprite");
    spriteActions["ChangeBlendMode"].SetFunctionName("setBlendMode").SetIncludeFile("spriteruntimeobject.js");
    spriteActions["Opacity"].SetFunctionName("setOpacity").SetGetter("getOpacity").SetIncludeFile("spriteruntimeobject.js");
    spriteConditions["BlendMode"].SetFunctionName("getBlendMode").SetIncludeFile("spriteruntimeobject.js");
    spriteConditions["Opacity"].SetFunctionName("getOpacity").SetIncludeFile("spriteruntimeobject.js");

    spriteActions["ChangeAnimation"].SetFunctionName("setAnimation").SetGetter("getAnimation");
    spriteActions["ChangeDirection"].SetFunctionName("setDirectionOrAngle").SetGetter("getDirectionOrAngle");
    spriteActions["ChangeSprite"].SetFunctionName("setAnimationFrame").SetGetter("getAnimationFrame");
    spriteConditions["Animation"].SetFunctionName("getAnimation");
    spriteConditions["Direction"].SetFunctionName("getDirectionOrAngle");
    spriteConditions["Sprite"].SetFunctionName("getAnimationFrame");
    spriteConditions["AnimationEnded"].SetFunctionName("hasAnimationEnded");
    spriteActions["PauseAnimation"].SetFunctionName("pauseAnimation");
    spriteActions["PlayAnimation"].SetFunctionName("playAnimation");
    spriteConditions["AnimStopped"].SetFunctionName("animationPaused");
    spriteActions["ChangeAnimationSpeedScale"].SetFunctionName("setAnimationSpeedScale").SetGetter("getAnimationSpeedScale").SetManipulatedType("number").SetIncludeFile("spriteruntimeobject.js");


    spriteActions["ChangeScaleWidth"].SetFunctionName("setScaleX").SetGetter("getScaleX");
    spriteActions["ChangeScaleHeight"].SetFunctionName("setScaleY").SetGetter("getScaleY");
    spriteActions["ChangeScale"].SetFunctionName("setScale").SetManipulatedType("number").SetGetter("getScale");
    spriteConditions["ScaleWidth"].SetFunctionName("getScaleX");
    spriteConditions["ScaleHeight"].SetFunctionName("getScaleY");
    spriteActions["TourneVersPos"].SetFunctionName("rotateTowardPosition");
    spriteActions["TourneVers"].SetFunctionName("turnTowardObject");
    spriteActions["ChangeColor"].SetFunctionName("setColor");
    spriteActions["FlipX"].SetFunctionName("flipX");
    spriteActions["FlipY"].SetFunctionName("flipY");
    spriteConditions["FlippedX"].SetFunctionName("isFlippedX");
    spriteConditions["FlippedY"].SetFunctionName("isFlippedY");

    GetAllConditions()["Collision"]
        .AddCodeOnlyParameter("currentScene", "") //We need an extra parameter pointing to the scene.
        .SetFunctionName("gdjs.evtTools.object.hitBoxesCollisionTest"); //No pixel perfect collision for now on the JS platform.

    spriteExpressions["X"].SetFunctionName("getPointX");
    spriteExpressions["Y"].SetFunctionName("getPointY");
    spriteExpressions["PointX"].SetFunctionName("getPointX");
    spriteExpressions["PointY"].SetFunctionName("getPointY");
    spriteExpressions["Direc"].SetFunctionName("getDirectionOrAngle"); //Deprecated
    spriteExpressions["Direction"].SetFunctionName("getDirectionOrAngle");
    spriteExpressions["Anim"].SetFunctionName("getAnimation"); //Deprecated
    spriteExpressions["Animation"].SetFunctionName("getAnimation");
    spriteExpressions["Sprite"].SetFunctionName("getAnimationFrame");
    spriteExpressions["AnimationSpeedScale"].SetFunctionName("getAnimationSpeedScale");
    spriteExpressions["ScaleX"].SetFunctionName("getScaleX");
    spriteExpressions["ScaleY"].SetFunctionName("getScaleY");


    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
/*
    //Objects instructions:
    {
        obj.AddAction("CopyImageOnImageOfSprite",
                       GD_T("Copy an image on the current one of an object"),
                       GD_T("Copy an image on the current image of an object.\nNote that the source image must be preferably kept loaded in memory."),
                       GD_T("Copy image _PARAM2_ on the current of _PARAM0_ at _PARAM3_;_PARAM4_"),
                       GD_T("Effects"),
                       "res/copy24.png",
                       "res/copyicon.png")

            .AddParameter("object", GD_T("Object"), "Sprite", false)
            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", GD_T("Name of the source image"), "",false)
            .AddParameter("expression", GD_T("X position"), "",false)
            .AddParameter("expression", GD_T("Y position"), "",false)
            .AddParameter("yesorno", GD_T("Should the copy take in account the source transparency\?"), "",false)
            .SetFunctionName("CopyImageOnImageOfCurrentSprite").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");



        obj.AddAction("CreateMaskFromColorOnActualImage", //Actual is indeed a mistake : Current should have been chosen.
                       GD_T("Make a color of the image of an object transparent"),
                       GD_T("Make a color of the image of an object transparent."),
                       GD_T("Make color _PARAM1_ of the current image of _PARAM0_ transparent"),
                       GD_T("Effects"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png")

            .AddParameter("object", GD_T("Object"), "Sprite", false)
            .AddParameter("color", GD_T("Color to make transparent"), "",false)
            .SetFunctionName("MakeColorTransparent").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    }

*/
}

}
