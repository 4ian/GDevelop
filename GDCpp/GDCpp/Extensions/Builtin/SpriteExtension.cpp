/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCpp/Extensions/Builtin/SpriteExtension.h"
#include "GDCpp/Runtime/RuntimeSpriteObject.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteExtension.cpp"
#endif

SpriteExtension::SpriteExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsSpriteExtension(*this);

    gd::ObjectMetadata & obj = GetObjectMetadata("Sprite");
    AddRuntimeObject<gd::SpriteObject, RuntimeSpriteObject>(obj, "RuntimeSpriteObject");

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");

    auto & objectActions = GetAllActionsForObject("Sprite");
    auto & objectConditions = GetAllConditionsForObject("Sprite");
    auto & objectExpressions = GetAllExpressionsForObject("Sprite");
    auto & objectStrExpressions = GetAllStrExpressionsForObject("Sprite");

    objectActions["Opacity"].SetFunctionName("SetOpacity").SetGetter("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["ChangeAnimation"].SetFunctionName("SetCurrentAnimation").SetGetter("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["SetAnimationName"].SetFunctionName("SetCurrentAnimation").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["ChangeDirection"].SetFunctionName("SetDirection").SetGetter("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["ChangeSprite"].SetFunctionName("SetSprite").SetGetter("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["PauseAnimation"].SetFunctionName("StopAnimation").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["PlayAnimation"].SetFunctionName("PlayAnimation").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["ChangeAnimationSpeedScale"].SetFunctionName("SetAnimationSpeedScale").SetGetter("GetAnimationSpeedScale").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["TourneVersPos"].SetFunctionName("RotateTowardPosition").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["ChangeScale"].SetFunctionName("ChangeScale").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["ChangeScaleWidth"].SetFunctionName("SetScaleX").SetGetter("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["ChangeScaleHeight"].SetFunctionName("SetScaleY").SetGetter("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");

    objectConditions["Animation"].SetFunctionName("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["AnimationName"].SetFunctionName("IsCurrentAnimationName").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["Direction"].SetFunctionName("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["Sprite"].SetFunctionName("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["AnimStopped"].SetFunctionName("IsAnimationStopped").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["AnimationEnded"].SetFunctionName("AnimationEnded").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["ScaleWidth"].SetFunctionName("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["ScaleHeight"].SetFunctionName("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["Opacity"].SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["BlendMode"].SetFunctionName("GetBlendMode").SetManipulatedType("number").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");

    objectActions["CopyImageOnImageOfSprite"].SetFunctionName("CopyImageOnImageOfCurrentSprite").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["CreateMaskFromColorOnActualImage"].SetFunctionName("MakeColorTransparent").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["ChangeColor"].SetFunctionName("SetColor").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["ChangeBlendMode"].SetFunctionName("SetBlendMode").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");

    objectActions["FlipX"].SetFunctionName("FlipX").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectActions["FlipY"].SetFunctionName("FlipY").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["FlippedX"].SetFunctionName("IsFlippedX").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectConditions["FlippedY"].SetFunctionName("IsFlippedY").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");

    objectActions["TourneVers"].SetFunctionName("TurnTowardObject").SetIncludeFile("GDCpp/Extensions/Builtin/SpriteTools.h");

    objectExpressions["X"].SetFunctionName("GetPointX").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["Y"].SetFunctionName("GetPointY").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["PointX"].SetFunctionName("GetPointX").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["PointY"].SetFunctionName("GetPointY").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["Direc"].SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["Direction"].SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["Anim"].SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["Animation"].SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectStrExpressions["AnimationName"].SetFunctionName("GetCurrentAnimationName").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["Sprite"].SetFunctionName("GetSpriteNb").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["AnimationSpeedScale"].SetFunctionName("GetAnimationSpeedScale").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["ScaleX"].SetFunctionName("GetScaleX").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
    objectExpressions["ScaleY"].SetFunctionName("GetScaleY").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");

    GetAllConditions()["Collision"].SetFunctionName("SpriteCollision").SetIncludeFile("GDCpp/Extensions/Builtin/SpriteTools.h");
    #endif
}
