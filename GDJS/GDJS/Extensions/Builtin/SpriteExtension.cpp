/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/SpriteExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

SpriteExtension::SpriteExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsSpriteExtension(*this);

  auto& spriteActions = GetAllActionsForObject("Sprite");
  auto& spriteConditions = GetAllConditionsForObject("Sprite");
  auto& spriteExpressions = GetAllExpressionsForObject("Sprite");
  auto& spriteStrExpressions = GetAllStrExpressionsForObject("Sprite");
  spriteActions["ChangeBlendMode"]
      .SetFunctionName("setBlendMode")
      .SetIncludeFile("spriteruntimeobject.js");
  spriteActions["Opacity"]
      .SetFunctionName("setOpacity")
      .SetGetter("getOpacity")
      .SetIncludeFile("spriteruntimeobject.js");
  spriteConditions["BlendMode"]
      .SetFunctionName("getBlendMode")
      .SetIncludeFile("spriteruntimeobject.js");
  spriteConditions["Opacity"]
      .SetFunctionName("getOpacity")
      .SetIncludeFile("spriteruntimeobject.js");

  spriteActions["ChangeAnimation"]
      .SetFunctionName("setAnimation")
      .SetGetter("getAnimation");
  spriteActions["SetAnimationName"].SetFunctionName("setAnimationName");
  spriteActions["ChangeDirection"]
      .SetFunctionName("setDirectionOrAngle")
      .SetGetter("getDirectionOrAngle");
  spriteActions["ChangeSprite"]
      .SetFunctionName("setAnimationFrame")
      .SetGetter("getAnimationFrame");
  spriteConditions["Animation"].SetFunctionName("getAnimation");
  spriteConditions["AnimationName"].SetFunctionName("isCurrentAnimationName");
  spriteConditions["Direction"].SetFunctionName("getDirectionOrAngle");
  spriteConditions["Sprite"].SetFunctionName("getAnimationFrame");
  spriteConditions["AnimationEnded"].SetFunctionName("hasAnimationEnded");
  spriteActions["PauseAnimation"].SetFunctionName("pauseAnimation");
  spriteActions["PlayAnimation"].SetFunctionName("playAnimation");
  spriteConditions["AnimStopped"].SetFunctionName("animationPaused");
  spriteActions["ChangeAnimationSpeedScale"]
      .SetFunctionName("setAnimationSpeedScale")
      .SetGetter("getAnimationSpeedScale")
      .SetManipulatedType("number")
      .SetIncludeFile("spriteruntimeobject.js");

  spriteActions["ChangeScaleWidth"]
      .SetFunctionName("setScaleX")
      .SetGetter("getScaleX");
  spriteActions["ChangeScaleHeight"]
      .SetFunctionName("setScaleY")
      .SetGetter("getScaleY");
  spriteActions["ChangeScale"]
      .SetFunctionName("setScale")
      .SetManipulatedType("number")
      .SetGetter("getScale");
  spriteConditions["ScaleWidth"].SetFunctionName("getScaleX");
  spriteConditions["ScaleHeight"].SetFunctionName("getScaleY");
  spriteActions["ChangeWidth"]
      .SetFunctionName("setWidth")
      .SetGetter("getWidth");
  spriteActions["ChangeHeight"]
      .SetFunctionName("setHeight")
      .SetGetter("getHeight");
  spriteActions["TourneVersPos"].SetFunctionName("rotateTowardPosition");
  spriteActions["TourneVers"].SetFunctionName("turnTowardObject");
  spriteActions["ChangeColor"].SetFunctionName("setColor");
  spriteActions["FlipX"].SetFunctionName("flipX");
  spriteActions["FlipY"].SetFunctionName("flipY");
  spriteConditions["FlippedX"].SetFunctionName("isFlippedX");
  spriteConditions["FlippedY"].SetFunctionName("isFlippedY");

  GetAllConditions()["Collision"]
      .AddCodeOnlyParameter(
          "currentScene",
          "")  // We need an extra parameter pointing to the scene.
      .AddParameter("yesorno",
                    _("Consider objects touching each other, but not "
                      "overlapping, as in collision (default: no)"))
      .SetHidden()
      .SetFunctionName(
          "gdjs.evtTools.object.hitBoxesCollisionTest");  // No pixel perfect
                                                          // collision for now
                                                          // on the JS platform.

  spriteExpressions["X"].SetFunctionName("getPointX");
  spriteExpressions["Y"].SetFunctionName("getPointY");
  spriteExpressions["PointX"].SetFunctionName("getPointX");
  spriteExpressions["PointY"].SetFunctionName("getPointY");
  spriteExpressions["Direc"].SetFunctionName(
      "getDirectionOrAngle");  // Deprecated
  spriteExpressions["Direction"].SetFunctionName("getDirectionOrAngle");
  spriteExpressions["Anim"].SetFunctionName("getAnimation");  // Deprecated
  spriteExpressions["Animation"].SetFunctionName("getAnimation");
  spriteStrExpressions["AnimationName"].SetFunctionName("getAnimationName");
  spriteExpressions["Sprite"].SetFunctionName("getAnimationFrame");
  spriteExpressions["AnimationSpeedScale"].SetFunctionName(
      "getAnimationSpeedScale");
  spriteExpressions["ScaleX"].SetFunctionName("getScaleX");
  spriteExpressions["ScaleY"].SetFunctionName("getScaleY");
  spriteExpressions["Opacity"].SetFunctionName("getOpacity");

  StripUnimplementedInstructionsAndExpressions();  // Unimplemented things are
                                                   // listed here:
  /*
      //Objects instructions:
      {
          obj.AddAction("CopyImageOnImageOfSprite",
                         _("Copy an image on the current one of an object"),
                         _("Copy an image on the current image of an
     object.\nNote that the source image must be preferably kept loaded in
     memory."),
                         _("Copy image _PARAM2_ on the current of _PARAM0_ at
     _PARAM3_;_PARAM4_"),
                         _("Effects"),
                         "res/copy24.png",
                         "res/copyicon.png")

              .AddParameter("object", _("Object"), "Sprite")
              .AddCodeOnlyParameter("currentScene", "")
              .AddParameter("string", _("Name of the source image"))
              .AddParameter("expression", _("X position"))
              .AddParameter("expression", _("Y position"))
              .AddParameter("yesorno", _("Should the copy take in account the
     source transparency\?"))
              .SetFunctionName("CopyImageOnImageOfCurrentSprite").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");



          obj.AddAction("CreateMaskFromColorOnActualImage", //Actual is indeed a
     mistake : Current should have been chosen.
                         _("Make a color of the image of an object
     transparent"),
                         _("Make a color of the image of an object
     transparent."),
                         _("Make color _PARAM1_ of the current image of _PARAM0_
     transparent"),
                         _("Effects"),
                         "res/actions/opacity24.png",
                         "res/actions/opacity.png")

              .AddParameter("object", _("Object"), "Sprite")
              .AddParameter("color", _("Color to make transparent"))
              .SetFunctionName("MakeColorTransparent").SetIncludeFile("GDCpp/Runtime/RuntimeSpriteObject.h");
      }

  */
}

}  // namespace gdjs
