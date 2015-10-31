/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCpp/Extensions/Builtin/SpriteExtension.h"
#include "GDCpp/RuntimeSpriteObject.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteExtension.cpp"
#endif

SpriteExtension::SpriteExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsSpriteExtension(*this);

    gd::ObjectMetadata & obj = GetObjectMetadata("Sprite");
    AddRuntimeObject(obj, "RuntimeSpriteObject", &CreateRuntimeSpriteObject);

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    std::map<gd::String, gd::InstructionMetadata > & objectActions = GetAllActionsForObject("Sprite");
    std::map<gd::String, gd::InstructionMetadata > & objectConditions = GetAllConditionsForObject("Sprite");
    std::map<gd::String, gd::ExpressionMetadata > & objectExpressions = GetAllExpressionsForObject("Sprite");

    objectActions["Opacity"].SetFunctionName("SetOpacity").SetGetter("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeAnimation"].SetFunctionName("SetCurrentAnimation").SetGetter("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeDirection"].SetFunctionName("SetDirection").SetGetter("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeSprite"].SetFunctionName("SetSprite").SetGetter("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["PauseAnimation"].SetFunctionName("StopAnimation").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["PlayAnimation"].SetFunctionName("PlayAnimation").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeAnimationSpeedScale"].SetFunctionName("SetAnimationSpeedScale").SetGetter("GetAnimationSpeedScale").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["TourneVersPos"].SetFunctionName("RotateTowardPosition").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeScale"].SetFunctionName("ChangeScale").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeScaleWidth"].SetFunctionName("SetScaleX").SetGetter("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeScaleHeight"].SetFunctionName("SetScaleY").SetGetter("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    objectConditions["Animation"].SetFunctionName("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["Direction"].SetFunctionName("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["Sprite"].SetFunctionName("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["AnimStopped"].SetFunctionName("IsAnimationStopped").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["AnimationEnded"].SetFunctionName("AnimationEnded").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["ScaleWidth"].SetFunctionName("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["ScaleHeight"].SetFunctionName("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["Opacity"].SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["BlendMode"].SetFunctionName("GetBlendMode").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    objectActions["CopyImageOnImageOfSprite"].SetFunctionName("CopyImageOnImageOfCurrentSprite").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["CreateMaskFromColorOnActualImage"].SetFunctionName("MakeColorTransparent").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeColor"].SetFunctionName("SetColor").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeBlendMode"].SetFunctionName("SetBlendMode").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    objectActions["FlipX"].SetFunctionName("FlipX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["FlipY"].SetFunctionName("FlipY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["FlippedX"].SetFunctionName("IsFlippedX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["FlippedY"].SetFunctionName("IsFlippedY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    objectActions["TourneVers"].SetFunctionName("TurnTowardObject").SetIncludeFile("GDCpp/Extensions/Builtin/SpriteTools.h");

    objectExpressions["X"].SetFunctionName("GetPointX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Y"].SetFunctionName("GetPointY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["PointX"].SetFunctionName("GetPointX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["PointY"].SetFunctionName("GetPointY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Direc"].SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Direction"].SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Anim"].SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Animation"].SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Sprite"].SetFunctionName("GetSpriteNb").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["AnimationSpeedScale"].SetFunctionName("GetAnimationSpeedScale").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["ScaleX"].SetFunctionName("GetScaleX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["ScaleY"].SetFunctionName("GetScaleY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    GetAllConditions()["Collision"].SetFunctionName("SpriteCollision").SetIncludeFile("GDCpp/Extensions/Builtin/SpriteTools.h");
    #endif
}
