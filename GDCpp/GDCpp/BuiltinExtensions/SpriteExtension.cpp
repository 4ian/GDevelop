/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCpp/BuiltinExtensions/SpriteExtension.h"
#include "GDCpp/RuntimeSpriteObject.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/SpriteExtension/SpriteExtension.cpp"
#endif

SpriteExtension::SpriteExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsSpriteExtension(*this);

    gd::ObjectMetadata & obj = GetObjectMetadata("Sprite");
    AddRuntimeObject(obj, "RuntimeSpriteObject", &CreateRuntimeSpriteObject, &DestroyRuntimeSpriteObject);

    #if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    std::map<std::string, gd::InstructionMetadata > & objectActions = GetAllActionsForObject("Sprite");
    std::map<std::string, gd::InstructionMetadata > & objectConditions = GetAllConditionsForObject("Sprite");
    std::map<std::string, gd::ExpressionMetadata > & objectExpressions = GetAllExpressionsForObject("Sprite");
    std::map<std::string, gd::StrExpressionMetadata > & objectStrExpressions = GetAllStrExpressionsForObject("Sprite");

    objectActions["Opacity"].codeExtraInformation.SetFunctionName("SetOpacity").SetAssociatedGetter("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeAnimation"].codeExtraInformation.SetFunctionName("SetCurrentAnimation").SetAssociatedGetter("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeDirection"].codeExtraInformation.SetFunctionName("SetDirection").SetAssociatedGetter("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeSprite"].codeExtraInformation.SetFunctionName("SetSprite").SetAssociatedGetter("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["PauseAnimation"].codeExtraInformation.SetFunctionName("StopAnimation").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["PlayAnimation"].codeExtraInformation.SetFunctionName("PlayAnimation").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["TourneVersPos"].codeExtraInformation.SetFunctionName("TurnTowardPosition").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeScale"].codeExtraInformation.SetFunctionName("ChangeScale").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeScaleWidth"].codeExtraInformation.SetFunctionName("SetScaleX").SetAssociatedGetter("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeScaleHeight"].codeExtraInformation.SetFunctionName("SetScaleY").SetAssociatedGetter("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    objectConditions["Animation"].codeExtraInformation.SetFunctionName("GetCurrentAnimation").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["Direction"].codeExtraInformation.SetFunctionName("GetCurrentDirectionOrAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["Sprite"].codeExtraInformation.SetFunctionName("GetSpriteNb").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["AnimStopped"].codeExtraInformation.SetFunctionName("IsAnimationStopped").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["AnimationEnded"].codeExtraInformation.SetFunctionName("AnimationEnded").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["ScaleWidth"].codeExtraInformation.SetFunctionName("GetScaleX").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["ScaleHeight"].codeExtraInformation.SetFunctionName("GetScaleY").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["Opacity"].codeExtraInformation.SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["BlendMode"].codeExtraInformation.SetFunctionName("GetBlendMode").SetManipulatedType("number").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    objectActions["CopyImageOnImageOfSprite"].codeExtraInformation.SetFunctionName("CopyImageOnImageOfCurrentSprite").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["CreateMaskFromColorOnActualImage"].codeExtraInformation.SetFunctionName("MakeColorTransparent").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeColor"].codeExtraInformation.SetFunctionName("SetColor").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["ChangeBlendMode"].codeExtraInformation.SetFunctionName("SetBlendMode").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    objectActions["FlipX"].codeExtraInformation.SetFunctionName("FlipX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectActions["FlipY"].codeExtraInformation.SetFunctionName("FlipY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["FlippedX"].codeExtraInformation.SetFunctionName("IsFlippedX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectConditions["FlippedY"].codeExtraInformation.SetFunctionName("IsFlippedY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    objectActions["TourneVers"].codeExtraInformation.SetFunctionName("TurnTowardObject").SetIncludeFile("GDCpp/BuiltinExtensions/SpriteTools.h");

    objectConditions["SourisSurObjet"].codeExtraInformation.SetFunctionName("CursorOnObject").SetIncludeFile("GDCpp/BuiltinExtensions/SpriteTools.h");

    objectExpressions["X"].codeExtraInformation.SetFunctionName("GetPointX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Y"].codeExtraInformation.SetFunctionName("GetPointY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["PointX"].codeExtraInformation.SetFunctionName("GetPointX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["PointY"].codeExtraInformation.SetFunctionName("GetPointY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Direc"].codeExtraInformation.SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Direction"].codeExtraInformation.SetFunctionName("GetCurrentDirectionOrAngle").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Anim"].codeExtraInformation.SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Animation"].codeExtraInformation.SetFunctionName("GetCurrentAnimation").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["Sprite"].codeExtraInformation.SetFunctionName("GetSpriteNb").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["ScaleX"].codeExtraInformation.SetFunctionName("GetScaleX").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");
    objectExpressions["ScaleY"].codeExtraInformation.SetFunctionName("GetScaleY").SetIncludeFile("GDCpp/RuntimeSpriteObject.h");

    GetAllConditions()["Collision"].codeExtraInformation.SetFunctionName("SpriteCollision").SetIncludeFile("GDCpp/BuiltinExtensions/SpriteTools.h");
    #endif
}

