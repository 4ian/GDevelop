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
  spriteConditions["AnimationEnded"].SetFunctionName("hasAnimationEndedLegacy");
  spriteConditions["AnimationEnded2"].SetFunctionName("hasAnimationEnded2");
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
      .SetGetter("getScaleMean");
  spriteConditions["ScaleWidth"].SetFunctionName("getScaleX");
  spriteConditions["ScaleHeight"].SetFunctionName("getScaleY");
  spriteActions["ChangeWidth"]
      .SetFunctionName("setWidth")
      .SetGetter("getWidth");
  spriteConditions["Width"].SetFunctionName("getWidth");
  spriteActions["ChangeHeight"]
      .SetFunctionName("setHeight")
      .SetGetter("getHeight");
  spriteConditions["Height"].SetFunctionName("getHeight");
  spriteActions["SetSize"].SetFunctionName("setSize");
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
  spriteExpressions["AnimationFrameCount"].SetFunctionName("getAnimationFrameCount");
  spriteExpressions["AnimationSpeedScale"].SetFunctionName(
      "getAnimationSpeedScale");
  spriteExpressions["ScaleX"].SetFunctionName("getScaleX");
  spriteExpressions["ScaleY"].SetFunctionName("getScaleY");
  spriteExpressions["Opacity"].SetFunctionName("getOpacity");
}

}  // namespace gdjs
