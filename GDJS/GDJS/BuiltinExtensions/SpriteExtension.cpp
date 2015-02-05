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
                          _("Sprite"),
                          _("Extension for adding animated objects in the scene, which can contain animations with directions within each."),
                          "Florian Rival",
                          "Open source (MIT License)");

    std::map<std::string, gd::InstructionMetadata > & spriteActions = GetAllActionsForObject("Sprite");
    std::map<std::string, gd::InstructionMetadata > & spriteConditions = GetAllConditionsForObject("Sprite");
    std::map<std::string, gd::ExpressionMetadata > & spriteExpressions = GetAllExpressionsForObject("Sprite");
    spriteActions["ChangeBlendMode"].codeExtraInformation.
        SetFunctionName("setBlendMode").SetIncludeFile("spriteruntimeobject.js");
    spriteActions["Opacity"].codeExtraInformation.
        SetFunctionName("setOpacity").SetAssociatedGetter("getOpacity").SetIncludeFile("spriteruntimeobject.js");
    spriteConditions["BlendMode"].codeExtraInformation.
        SetFunctionName("getBlendMode").SetIncludeFile("spriteruntimeobject.js");
    spriteConditions["Opacity"].codeExtraInformation.
        SetFunctionName("getOpacity").SetIncludeFile("spriteruntimeobject.js");

    spriteActions["ChangeAnimation"].codeExtraInformation.
        SetFunctionName("setAnimation").SetAssociatedGetter("getAnimation");
    spriteActions["ChangeDirection"].codeExtraInformation.
        SetFunctionName("setDirectionOrAngle").SetAssociatedGetter("getDirectionOrAngle");
    spriteActions["ChangeSprite"].codeExtraInformation.
        SetFunctionName("setAnimationFrame").SetAssociatedGetter("getAnimationFrame");
    spriteConditions["Animation"].codeExtraInformation.
        SetFunctionName("getAnimation");
    spriteConditions["Direction"].codeExtraInformation.
        SetFunctionName("getDirectionOrAngle");
    spriteConditions["Sprite"].codeExtraInformation.
        SetFunctionName("getAnimationFrame");
    spriteConditions["AnimationEnded"].codeExtraInformation.
        SetFunctionName("hasAnimationEnded");
    spriteActions["PauseAnimation"].codeExtraInformation.
        SetFunctionName("pauseAnimation");
    spriteActions["PlayAnimation"].codeExtraInformation.
        SetFunctionName("playAnimation");
    spriteConditions["AnimStopped"].codeExtraInformation.
        SetFunctionName("animationPaused");

    spriteActions["ChangeScaleWidth"].codeExtraInformation.
        SetFunctionName("setScaleX").SetAssociatedGetter("getScaleX");
    spriteActions["ChangeScaleHeight"].codeExtraInformation.
        SetFunctionName("setScaleY").SetAssociatedGetter("getScaleY");
    spriteActions["ChangeScale"].codeExtraInformation.
        SetFunctionName("setScale").SetManipulatedType("number").SetAssociatedGetter("getScale");
    spriteConditions["ScaleWidth"].codeExtraInformation
        .SetFunctionName("getScaleX");
    spriteConditions["ScaleHeight"].codeExtraInformation
        .SetFunctionName("getScaleY");
    spriteActions["TourneVersPos"].codeExtraInformation.
        SetFunctionName("rotateTowardPosition");
    spriteActions["TourneVers"].codeExtraInformation.
        SetFunctionName("turnTowardObject");
    spriteActions["ChangeColor"].codeExtraInformation.
        SetFunctionName("setColor");
    spriteActions["FlipX"].codeExtraInformation.
        SetFunctionName("flipX");
    spriteActions["FlipY"].codeExtraInformation.
        SetFunctionName("flipY");
    spriteConditions["FlippedX"].codeExtraInformation.
        SetFunctionName("isFlippedX");
    spriteConditions["FlippedY"].codeExtraInformation.
        SetFunctionName("isFlippedY");

    spriteConditions["SourisSurObjet"].codeExtraInformation.
        SetFunctionName("cursorOnObject");

    GetAllConditions()["Collision"]
        .AddCodeOnlyParameter("currentScene", "") //We need an extra parameter pointing to the scene.
        .codeExtraInformation //No pixel perfect collision for now on the JS platform.
        .SetFunctionName("gdjs.evtTools.object.hitBoxesCollisionTest");

    spriteExpressions["X"].codeExtraInformation.
        SetFunctionName("getPointX");
    spriteExpressions["Y"].codeExtraInformation.
        SetFunctionName("getPointY");
    spriteExpressions["PointX"].codeExtraInformation.
        SetFunctionName("getPointX");
    spriteExpressions["PointY"].codeExtraInformation.
        SetFunctionName("getPointY");
    spriteExpressions["Direc"].codeExtraInformation. //Deprecated
        SetFunctionName("getDirectionOrAngle");
    spriteExpressions["Direction"].codeExtraInformation.
        SetFunctionName("getDirectionOrAngle");
    spriteExpressions["Anim"].codeExtraInformation.  //Deprecated
        SetFunctionName("getAnimation");
    spriteExpressions["Animation"].codeExtraInformation.
        SetFunctionName("getAnimation");
    spriteExpressions["Sprite"].codeExtraInformation.
        SetFunctionName("getAnimationFrame");
    spriteExpressions["ScaleX"].codeExtraInformation.
        SetFunctionName("getScaleX");
    spriteExpressions["ScaleY"].codeExtraInformation.
        SetFunctionName("getScaleY");


    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
/*
    //Objects instructions:
    {
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
            .codeExtraInformation.SetFunctionName("CopyImageOnImageOfCurrentSprite").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");



        obj.AddAction("CreateMaskFromColorOnActualImage", //Actual is indeed a mistake : Current should have been chosen.
                       _("Make a color of the image of an object transparent"),
                       _("Make a color of the image of an object transparent."),
                       _("Make color _PARAM1_ of the current image of _PARAM0_ transparent"),
                       _("Effects"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("color", _("Color to make transparent"), "",false)
            .codeExtraInformation.SetFunctionName("MakeColorTransparent").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    }

*/
}

}
