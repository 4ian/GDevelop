
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"

#include "SkeletonObject.h"

#include <iostream>

void DeclareSkeletonObjectExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class SkeletonObjectJsExtension : public gd::PlatformExtension {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  SkeletonObjectJsExtension() {
    DeclareSkeletonObjectExtension(*this);

    GetObjectMetadata("SkeletonObject::Skeleton")
        .SetIncludeFile("Extensions/SkeletonObject/Isk-tools.js")
        .AddIncludeFile("Extensions/SkeletonObject/Hskmanager.js")
        .AddIncludeFile("Extensions/SkeletonObject/Gskeletonruntimeobject.js")
        .AddIncludeFile("Extensions/SkeletonObject/Fskanimation.js")
        .AddIncludeFile("Extensions/SkeletonObject/Eskarmature.js")
        .AddIncludeFile("Extensions/SkeletonObject/Dskslot.js")
        .AddIncludeFile("Extensions/SkeletonObject/Cskbone.js")
        .AddIncludeFile(
            "Extensions/SkeletonObject/"
            "Bskeletonruntimeobject-cocos-renderer.js")
        .AddIncludeFile(
            "Extensions/SkeletonObject/Bskeletonruntimeobject-pixi-renderer.js")
        .AddIncludeFile("Extensions/SkeletonObject/Ask.js");

    auto& actions = GetAllActionsForObject("SkeletonObject::Skeleton");
    auto& conditions = GetAllConditionsForObject("SkeletonObject::Skeleton");
    auto& expressions = GetAllExpressionsForObject("SkeletonObject::Skeleton");
    auto& strExpressions =
        GetAllStrExpressionsForObject("SkeletonObject::Skeleton");

    // Object instructions
    conditions["SkeletonObject::ScaleX"].SetFunctionName("getScaleX");
    actions["SkeletonObject::SetScaleX"]
        .SetFunctionName("setScaleX")
        .SetGetter("getScaleX");
    expressions["ScaleX"].SetFunctionName("getScaleX");

    conditions["SkeletonObject::ScaleY"].SetFunctionName("getScaleY");
    actions["SkeletonObject::SetScaleY"]
        .SetFunctionName("setScaleY")
        .SetGetter("getScaleY");
    expressions["ScaleY"].SetFunctionName("getScaleY");

    conditions["SkeletonObject::Width"].SetFunctionName("getWidth");
    actions["SkeletonObject::SetWidth"]
        .SetFunctionName("setWidth")
        .SetGetter("getWidth");
    expressions["Width"].SetFunctionName("getWidth");

    conditions["SkeletonObject::Height"].SetFunctionName("getHeight");
    actions["SkeletonObject::SetHeight"]
        .SetFunctionName("setHeight")
        .SetGetter("getHeight");
    expressions["Height"].SetFunctionName("getHeight");

    actions["SkeletonObject::SetDefaultHitbox"].SetFunctionName(
        "setDefaultHitbox");

    // Animation instructions
    conditions["SkeletonObject::AnimationPaused"].SetFunctionName(
        "isAnimationPaused");
    actions["SkeletonObject::PauseAnimation"].SetFunctionName(
        "setAnimationPaused");
    actions["SkeletonObject::UnpauseAnimation"].SetFunctionName(
        "setAnimationPaused");

    conditions["SkeletonObject::AnimationFinished"].SetFunctionName(
        "isAnimationFinished");

    conditions["SkeletonObject::AnimationTime"].SetFunctionName(
        "getAnimationTime");
    actions["SkeletonObject::SetAnimationTime"]
        .SetFunctionName("setAnimationTime")
        .SetGetter("getAnimationTime");
    expressions["AnimationTime"].SetFunctionName("getAnimationTime");
    expressions["AnimationTimeLength"].SetFunctionName(
        "getAnimationTimeLength");

    conditions["SkeletonObject::AnimationFrame"].SetFunctionName(
        "getAnimationFrame");
    actions["SkeletonObject::SetAnimationFrame"]
        .SetFunctionName("setAnimationFrame")
        .SetGetter("getAnimationFrame");
    expressions["AnimationFrame"].SetFunctionName("getAnimationFrame");
    expressions["AnimationFrameLength"].SetFunctionName(
        "getAnimationFrameLength");

    conditions["SkeletonObject::AnimationIndex"].SetFunctionName(
        "getAnimationIndex");
    actions["SkeletonObject::SetAnimationIndex"]
        .SetFunctionName("setAnimationIndex")
        .SetGetter("getAnimationIndex");
    expressions["AnimationIndex"].SetFunctionName("getAnimationIndex");

    conditions["SkeletonObject::AnimationName"].SetFunctionName(
        "getAnimationName");
    actions["SkeletonObject::SetAnimationName"]
        .SetFunctionName("setAnimationName")
        .SetGetter("getAnimationName");
    strExpressions["AnimationName"].SetFunctionName("getAnimationName");

    conditions["SkeletonObject::AnimationSmooth"].SetFunctionName(
        "isAnimationSmooth");
    actions["SkeletonObject::SetAnimationSmooth"].SetFunctionName(
        "setAnimationSmooth");

    conditions["SkeletonObject::AnimationTimeScale"].SetFunctionName(
        "getAnimationTimeScale");
    actions["SkeletonObject::SetAnimationTimeScale"]
        .SetFunctionName("setAnimationTimeScale")
        .SetGetter("getAnimationTimeScale");
    expressions["AnimationTimeScale"].SetFunctionName("getAnimationTimeScale");

    actions["SkeletonObject::ResetAnimation"].SetFunctionName("resetAnimation");

    // Bone instructions
    conditions["SkeletonObject::BonePositionX"].SetFunctionName("getBoneX");
    actions["SkeletonObject::SetBonePositionX"]
        .SetFunctionName("setBoneX")
        .SetGetter("getBoneX");
    expressions["BonePositionX"].SetFunctionName("getBoneX");

    conditions["SkeletonObject::BonePositionY"].SetFunctionName("getBoneY");
    actions["SkeletonObject::SetBonePositionY"]
        .SetFunctionName("setBoneY")
        .SetGetter("getBoneY");
    expressions["BonePositionY"].SetFunctionName("getBoneY");

    conditions["SkeletonObject::BoneAngle"].SetFunctionName("getBoneAngle");
    actions["SkeletonObject::SetBoneAngle"]
        .SetFunctionName("setBoneAngle")
        .SetGetter("getBoneAngle");
    expressions["BoneAngle"].SetFunctionName("getBoneAngle");

    conditions["SkeletonObject::BoneScaleX"].SetFunctionName("getBoneScaleX");
    actions["SkeletonObject::SetBoneScaleX"]
        .SetFunctionName("setBoneScaleX")
        .SetGetter("getBoneScaleX");
    expressions["BoneScaleX"].SetFunctionName("getBoneScaleX");

    conditions["SkeletonObject::BoneScaleY"].SetFunctionName("getBoneScaleY");
    actions["SkeletonObject::SetBoneScaleY"]
        .SetFunctionName("setBoneScaleY")
        .SetGetter("getBoneScaleY");
    expressions["BoneScaleY"].SetFunctionName("getBoneScaleY");

    actions["SkeletonObject::ResetBone"].SetFunctionName("resetBone");

    // Slot instructions
    actions["SkeletonObject::SetSlotColor"].SetFunctionName("setSlotColor");

    conditions["SkeletonObject::SlotVisible"].SetFunctionName("isSlotVisible");
    actions["SkeletonObject::ShowSlot"].SetFunctionName("setSlotVisible");
    actions["SkeletonObject::HideSlot"].SetFunctionName("setSlotVisible");

    conditions["SkeletonObject::SlotZOrder"].SetFunctionName("getSlotZOrder");
    actions["SkeletonObject::SetSlotZOrder"]
        .SetFunctionName("setSlotZOrder")
        .SetGetter("getSlotZOrder");
    expressions["SlotZOrder"].SetFunctionName("getSlotZOrder");

    conditions["SkeletonObject::PointInsideSlot"].SetFunctionName(
        "isPointInsideSlot");

    // Extension instructions
    GetAllConditions()["SkeletonObject::SlotCollidesWithObject"]
        .SetFunctionName("gdjs.sk.slotObjectCollision");
    GetAllConditions()["SkeletonObject::SlotCollidesWithSlot"].SetFunctionName(
        "gdjs.sk.slotSlotCollision");
    GetAllConditions()["SkeletonObject::RaycastSlot"].SetFunctionName(
        "gdjs.sk.raycastSlot");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSSkeletonObjectExtension() {
  return new SkeletonObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new SkeletonObjectJsExtension;
}
#endif
#endif
